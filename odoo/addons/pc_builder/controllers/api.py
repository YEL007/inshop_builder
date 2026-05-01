import json
import logging

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError, ValidationError

_logger = logging.getLogger(__name__)

CORS_HEADERS = [
    ('Access-Control-Allow-Origin', '*'),
    ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
    ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
    ('Content-Type', 'application/json'),
]


def json_response(data, status=200):
    return request.make_response(
        json.dumps(data, ensure_ascii=False),
        headers=CORS_HEADERS,
        status=status,
    )


def error_response(message, status=400):
    return json_response({'error': message}, status=status)


class PcBuilderApi(http.Controller):

    # ── Catalog ──────────────────────────────────────────────────────────────

    @http.route('/api/pc/catalog', type='http', auth='public', methods=['GET'], csrf=False)
    def get_catalog(self, **kwargs):
        """Return all PC components grouped by category."""
        try:
            catalog = request.env['product.template'].sudo().get_catalog()
            return json_response({'catalog': catalog})
        except Exception as e:
            _logger.exception('Error in get_catalog')
            return error_response(str(e), 500)

    @http.route('/api/pc/products', type='http', auth='public', methods=['GET'], csrf=False)
    def get_products(self, category=None, page=1, limit=50, **kwargs):
        """Return products, optionally filtered by pc_category."""
        try:
            domain = [('active', '=', True), ('pc_category', '!=', False)]
            if category:
                domain.append(('pc_category', '=', category))

            offset = (int(page) - 1) * int(limit)
            products = request.env['product.template'].sudo().search(
                domain, offset=offset, limit=int(limit)
            )
            total = request.env['product.template'].sudo().search_count(domain)

            return json_response({
                'products': [p.to_pc_dict() for p in products],
                'total': total,
                'page': int(page),
                'limit': int(limit),
            })
        except Exception as e:
            _logger.exception('Error in get_products')
            return error_response(str(e), 500)

    @http.route('/api/pc/products/<string:category>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_products_by_category(self, category, **kwargs):
        """Return products for a specific category."""
        try:
            products = request.env['product.template'].sudo().search([
                ('active', '=', True),
                ('pc_category', '=', category),
            ])
            return json_response({
                'category': category,
                'products': [p.to_pc_dict() for p in products],
            })
        except Exception as e:
            _logger.exception('Error in get_products_by_category')
            return error_response(str(e), 500)

    @http.route('/api/pc/product/<int:product_id>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_product(self, product_id, **kwargs):
        """Return a single product by Odoo ID."""
        try:
            product = request.env['product.template'].sudo().browse(product_id)
            if not product.exists() or not product.pc_category:
                return error_response('Product not found', 404)
            return json_response({'product': product.to_pc_dict()})
        except Exception as e:
            _logger.exception('Error in get_product')
            return error_response(str(e), 500)

    @http.route('/api/pc/peripherals', type='http', auth='public', methods=['GET'], csrf=False)
    def get_peripherals(self, **kwargs):
        """Return peripheral products grouped by category."""
        try:
            peripherals = request.env['product.template'].sudo().get_peripherals()
            return json_response({'peripherals': peripherals})
        except Exception as e:
            _logger.exception('Error in get_peripherals')
            return error_response(str(e), 500)

    # ── Pre-built PCs ────────────────────────────────────────────────────────

    @http.route('/api/pc/prebuilts', type='http', auth='public', methods=['GET'], csrf=False)
    def get_prebuilts(self, **kwargs):
        """Return all active pre-built PC configurations."""
        try:
            prebuilts = request.env['pc.prebuilt'].sudo().search([('active', '=', True)])
            return json_response({'prebuilts': [p.to_dict() for p in prebuilts]})
        except Exception as e:
            _logger.exception('Error in get_prebuilts')
            return error_response(str(e), 500)

    # ── Authentication ───────────────────────────────────────────────────────

    @http.route('/api/pc/auth/login', type='http', auth='public', methods=['POST'], csrf=False)
    def login(self, **kwargs):
        """Authenticate user and return session info."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            login = body.get('login', '').strip()
            password = body.get('password', '')
            db = request.db

            uid = request.session.authenticate(db, login, password)
            if not uid:
                return error_response('Invalid credentials', 401)

            user = request.env['res.users'].sudo().browse(uid)
            return json_response({
                'uid': uid,
                'name': user.name,
                'email': user.email,
                'session_id': request.session.sid,
            })
        except Exception as e:
            _logger.exception('Error in login')
            return error_response(str(e), 500)

    @http.route('/api/pc/auth/register', type='http', auth='public', methods=['POST'], csrf=False)
    def register(self, **kwargs):
        """Create a new portal user."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not name or not email or not password:
                return error_response('name, email, and password are required', 400)

            # Check if email already used
            existing = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
            if existing:
                return error_response('Email already registered', 409)

            # Create portal user
            portal_group = request.env.ref('base.group_portal')
            user = request.env['res.users'].sudo().create({
                'name': name,
                'login': email,
                'email': email,
                'password': password,
                'groups_id': [(6, 0, [portal_group.id])],
            })

            uid = request.session.authenticate(request.db, email, password)
            return json_response({
                'uid': uid,
                'name': user.name,
                'email': user.email,
                'session_id': request.session.sid,
            }, status=201)
        except ValidationError as e:
            return error_response(str(e), 400)
        except Exception as e:
            _logger.exception('Error in register')
            return error_response(str(e), 500)

    @http.route('/api/pc/auth/logout', type='http', auth='public', methods=['POST'], csrf=False)
    def logout(self, **kwargs):
        request.session.logout()
        return json_response({'ok': True})

    @http.route('/api/pc/auth/me', type='http', auth='public', methods=['GET'], csrf=False)
    def me(self, **kwargs):
        """Return current session user info."""
        uid = request.session.uid
        if not uid:
            return json_response({'authenticated': False})
        user = request.env['res.users'].sudo().browse(uid)
        partner = user.partner_id
        return json_response({
            'authenticated': True,
            'uid': uid,
            'name': user.name,
            'email': user.email,
            'phone': partner.phone or '',
            'street': partner.street or '',
        })

    @http.route('/api/pc/auth/update', type='http', auth='user', methods=['POST'], csrf=False)
    def update_profile(self, **kwargs):
        """Update current user partner info."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            data = body.get('data', {})
            
            user = request.env.user
            vals = {}
            if 'name' in data: vals['name'] = data['name']
            if 'phone' in data: vals['phone'] = data['phone']
            if 'street' in data: vals['street'] = data['street']
            
            if vals:
                user.sudo().write({'name': vals.get('name', user.name)})
                user.partner_id.sudo().write(vals)
                
            return json_response({
                'ok': True,
                'user': {
                    'name': user.name,
                    'email': user.email,
                    'phone': user.partner_id.phone or '',
                    'street': user.partner_id.street or '',
                }
            })
        except Exception as e:
            _logger.exception('Error in update_profile')
            return error_response(str(e), 500)

    # ── Reviews ──────────────────────────────────────────────────────────────

    @http.route('/api/pc/reviews/<int:product_id>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_reviews(self, product_id, **kwargs):
        """Return all reviews for a product."""
        try:
            reviews = request.env['pc.review'].sudo().search(
                [('product_id', '=', product_id)], order='date desc'
            )
            return json_response({'reviews': [r.to_dict() for r in reviews]})
        except Exception as e:
            _logger.exception('Error in get_reviews')
            return error_response(str(e), 500)

    @http.route('/api/pc/review', type='http', auth='public', methods=['POST'], csrf=False)
    def submit_review(self, **kwargs):
        """Submit or update a review. Requires authenticated session."""
        try:
            uid = request.session.uid
            if not uid:
                return error_response('Vous devez être connecté pour laisser un avis.', 401)

            body = json.loads(request.httprequest.data or '{}')
            product_id = int(body.get('product_id', 0))
            rating = int(body.get('rating', 0))
            comment = body.get('comment', '').strip()

            if not product_id or not rating:
                return error_response('product_id et rating sont requis.', 400)
            if not (1 <= rating <= 5):
                return error_response('La note doit être entre 1 et 5.', 400)

            Review = request.env['pc.review'].sudo()
            existing = Review.search([('product_id', '=', product_id), ('user_id', '=', uid)], limit=1)

            if existing:
                existing.write({'rating': rating, 'comment': comment})
                review = existing
            else:
                review = Review.create({
                    'product_id': product_id,
                    'user_id': uid,
                    'rating': rating,
                    'comment': comment,
                })

            product = request.env['product.template'].sudo().browse(product_id)
            return json_response({
                'review': review.to_dict(),
                'new_rating': product.pc_rating,
                'new_count': product.pc_review_count,
            })
        except Exception as e:
            _logger.exception('Error in submit_review')
            return error_response(str(e), 500)

    # ── Cart / Orders ────────────────────────────────────────────────────────

    @http.route('/api/pc/cart', type='http', auth='public', methods=['GET'], csrf=False)
    def get_cart(self, **kwargs):
        """Return the current sale order (cart) for this session."""
        try:
            order = self._get_or_create_cart()
            return json_response({'cart': self._serialize_order(order)})
        except Exception as e:
            _logger.exception('Error in get_cart')
            return error_response(str(e), 500)

    @http.route('/api/pc/cart/add', type='http', auth='public', methods=['POST'], csrf=False)
    def cart_add(self, **kwargs):
        """Add or update a product in the cart."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            product_id = int(body.get('product_id', 0))
            qty = int(body.get('qty', 1))

            if not product_id:
                return error_response('product_id required', 400)

            product = request.env['product.product'].sudo().search(
                [('product_tmpl_id', '=', product_id)], limit=1
            )
            if not product:
                return error_response('Product not found', 404)

            order = self._get_or_create_cart()
            existing_line = order.order_line.filtered(
                lambda l: l.product_id.id == product.id
            )
            if existing_line:
                existing_line.sudo().write({'product_uom_qty': existing_line.product_uom_qty + qty})
            else:
                request.env['sale.order.line'].sudo().create({
                    'order_id': order.id,
                    'product_id': product.id,
                    'product_uom_qty': qty,
                    'price_unit': product.list_price,
                })

            return json_response({'cart': self._serialize_order(order)})
        except Exception as e:
            _logger.exception('Error in cart_add')
            return error_response(str(e), 500)

    @http.route('/api/pc/cart/remove', type='http', auth='public', methods=['POST'], csrf=False)
    def cart_remove(self, **kwargs):
        """Remove a line from the cart."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            product_id = int(body.get('product_id', 0))

            order = self._get_or_create_cart()
            line = order.order_line.filtered(
                lambda l: l.product_id.product_tmpl_id.id == product_id
            )
            line.sudo().unlink()

            return json_response({'cart': self._serialize_order(order)})
        except Exception as e:
            _logger.exception('Error in cart_remove')
            return error_response(str(e), 500)

    @http.route('/api/pc/cart/sync', type='http', auth='public', methods=['POST'], csrf=False)
    def cart_sync(self, **kwargs):
        """Overwrite the current cart with the provided items."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            items = body.get('items', [])

            order = self._get_or_create_cart()
            
            # Clear existing lines
            order.order_line.sudo().unlink()
            
            # Add new lines
            for item in items:
                product_id = int(item.get('product_id', 0))
                qty = int(item.get('qty', 1))
                if not product_id:
                    continue
                
                product = request.env['product.product'].sudo().search(
                    [('product_tmpl_id', '=', product_id)], limit=1
                )
                if product:
                    request.env['sale.order.line'].sudo().create({
                        'order_id': order.id,
                        'product_id': product.id,
                        'product_uom_qty': qty,
                        'price_unit': product.list_price,
                    })

            return json_response({'cart': self._serialize_order(order)})
        except Exception as e:
            _logger.exception('Error in cart_sync')
            return error_response(str(e), 500)

    @http.route('/api/pc/order/confirm', type='http', auth='public', methods=['POST'], csrf=False)
    def confirm_order(self, **kwargs):
        """Confirm the current cart as a sale order."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            shipping = body.get('shipping', {})

            order = self._get_or_create_cart()
            if not order.order_line:
                return error_response('Cart is empty', 400)

            # Update shipping address if provided
            if shipping.get('name'):
                partner_vals = {
                    'name': shipping.get('name'),
                    'email': shipping.get('email', ''),
                    'phone': shipping.get('phone', ''),
                    'street': shipping.get('address', ''),
                    'city': shipping.get('city', ''),
                    'zip': shipping.get('zip', ''),
                }
                if order.partner_id.id == request.env.ref('base.public_partner').id:
                    partner = request.env['res.partner'].sudo().create(partner_vals)
                    order.sudo().write({'partner_id': partner.id})
                else:
                    order.partner_id.sudo().write(partner_vals)

            order.sudo().action_confirm()

            # Clear cart from session
            request.session['sale_order_id'] = None

            return json_response({
                'order_id': order.id,
                'order_name': order.name,
                'total': order.amount_total,
            })
        except Exception as e:
            _logger.exception('Error in confirm_order')
            return error_response(str(e), 500)

    @http.route('/api/pc/orders', type='http', auth='public', methods=['GET'], csrf=False)
    def get_orders(self, **kwargs):
        """Return confirmed orders for the logged-in user."""
        try:
            uid = request.session.uid
            if not uid:
                return error_response('Authentication required', 401)

            orders = request.env['sale.order'].sudo().search([
                ('partner_id.user_ids', 'in', [uid]),
                ('state', 'in', ['sale', 'done']),
            ], order='date_order desc')

            return json_response({
                'orders': [self._serialize_order(o, full=True) for o in orders]
            })
        except Exception as e:
            _logger.exception('Error in get_orders')
            return error_response(str(e), 500)

    # ── Internal helpers ─────────────────────────────────────────────────────

    def _get_or_create_cart(self):
        """Get or create a draft sale order tied to this session."""
        order_id = request.session.get('sale_order_id')
        SaleOrder = request.env['sale.order'].sudo()

        if order_id:
            order = SaleOrder.browse(order_id)
            if order.exists() and order.state == 'draft':
                return order

        uid = request.session.uid
        partner = (
            request.env['res.users'].sudo().browse(uid).partner_id
            if uid
            else request.env.ref('base.public_partner')
        )

        order = SaleOrder.create({
            'partner_id': partner.id,
            'state': 'draft',
        })
        request.session['sale_order_id'] = order.id
        return order

    def _serialize_order(self, order, full=False):
        data = {
            'id': order.id,
            'name': order.name,
            'state': order.state,
            'total': order.amount_total,
            'items': [
                {
                    'product_id': line.product_id.product_tmpl_id.id,
                    'name': line.product_id.name,
                    'qty': line.product_uom_qty,
                    'price': line.price_unit,
                    'subtotal': line.price_subtotal,
                }
                for line in order.order_line
            ],
        }
        if full:
            data['date'] = order.date_order.isoformat() if order.date_order else None
        return data
