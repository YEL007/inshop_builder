import json
import logging
import os
import secrets

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessDenied, AccessError, ValidationError

_logger = logging.getLogger(__name__)

_ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', 'http://localhost:8080')

# ── Frontend token store ─────────────────────────────────────────────────────
# Maps random token → uid for portal users logged in from the React frontend.
# Completely separate from Odoo's session system so the admin backend is never
# affected by frontend logins.
_PC_TOKENS: dict[str, int] = {}


def _issue_token(uid: int) -> str:
    token = secrets.token_hex(32)
    _PC_TOKENS[token] = uid
    return token


def _revoke_token(token: str) -> None:
    _PC_TOKENS.pop(token, None)


def _uid_from_request() -> int | None:
    """Read the Authorization: Bearer <token> header and return the uid or None."""
    auth = request.httprequest.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth[7:].strip()
        return _PC_TOKENS.get(token)
    return None


def _cors_headers():
    return [
        ('Access-Control-Allow-Origin', _ALLOWED_ORIGIN),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
        ('Content-Type', 'application/json'),
    ]


def json_response(data, status=200):
    return request.make_response(
        json.dumps(data, ensure_ascii=False),
        headers=_cors_headers(),
        status=status,
    )


def error_response(message, status=400):
    return json_response({'error': message}, status=status)


class PcBuilderApi(http.Controller):
    @http.route('/api/pc/config', type='http', auth='public', methods=['GET'], csrf=False)
    def get_config(self, **kwargs):
        """Return site-wide configuration."""
        try:
            config = request.env['pc.config'].sudo().get_config()
            return json_response(config)
        except Exception as e:
            _logger.exception('Error in get_config')
            return error_response(str(e), 500)

    @http.route('/api/pc/categories', type='http', auth='public', methods=['GET'], csrf=False)
    def get_categories(self, **kwargs):
        """Return all PC categories."""
        try:
            categories = request.env['pc.category'].sudo().search([], order='sequence, id')
            res = []
            for cat in categories:
                res.append({
                    'name': cat.name,
                    'code': cat.code,
                    'type': cat.type,
                    'peri_group': cat.peri_group,
                    'icon': cat.icon,
                    'sequence': cat.sequence,
                })
            return json_response({'categories': res})
        except Exception as e:
            _logger.exception('Error in get_categories')
            return error_response(str(e), 500)

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

    @http.route('/api/pc/onlyone_catalog', type='http', auth='public', methods=['GET'], csrf=False)
    def get_onlyone_catalog(self, **kwargs):
        """Return Only One PC components grouped by category."""
        try:
            catalog = request.env['product.template'].sudo().get_only_one_catalog()
            return json_response({'catalog': catalog})
        except Exception as e:
            _logger.exception('Error in get_onlyone_catalog')
            return error_response(str(e), 500)

    @http.route('/api/pc/products', type='http', auth='public', methods=['GET'], csrf=False)
    def get_products(self, category=None, page=1, limit=50, **kwargs):
        """Return products, optionally filtered by pc_category."""
        try:
            domain = [('active', '=', True), ('pc_category_id', '!=', False)]
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

    @http.route('/api/pc/product/<int:product_id>/related', type='http', auth='public', methods=['GET'], csrf=False)
    def get_related(self, product_id, **kwargs):
        """Return up to 4 products from the same category."""
        try:
            product = request.env['product.template'].sudo().browse(product_id)
            if not product.exists() or not product.pc_category:
                return error_response('Product not found', 404)
            related = request.env['product.template'].sudo().search([
                ('active', '=', True),
                ('pc_category', '=', product.pc_category),
                ('id', '!=', product_id),
            ], limit=4)
            return json_response({'related': [p.to_pc_dict() for p in related]})
        except Exception as e:
            _logger.exception('Error in get_related')
            return error_response(str(e), 500)

    @http.route('/api/pc/laptops', type='http', auth='public', methods=['GET'], csrf=False)
    def get_laptops(self, **kwargs):
        """Return all active laptop products."""
        try:
            laptops = request.env['product.template'].sudo().get_laptops()
            return json_response({'laptops': laptops})
        except Exception as e:
            _logger.exception('Error in get_laptops')
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

    # ── Only One PCs ─────────────────────────────────────────────────────────

    @http.route('/api/pc/onlyonepcs', type='http', auth='public', methods=['GET'], csrf=False)
    def get_onlyonepcs(self, **kwargs):
        """Return all active Only One PC configurations."""
        try:
            onlyonepcs = request.env['pc.onlyonepc'].sudo().search([('active', '=', True)])
            return json_response({'onlyonepcs': [p.to_dict() for p in onlyonepcs]})
        except Exception as e:
            _logger.exception('Error in get_onlyonepcs')
            return error_response(str(e), 500)

    # ── Authentication ───────────────────────────────────────────────────────

    @http.route('/api/pc/auth/login', type='http', auth='public', methods=['POST'], csrf=False)
    def login(self, **kwargs):
        """Verify portal-user credentials and issue a frontend token.

        Never calls session.authenticate() — the Odoo admin backend session is
        completely untouched.
        """
        try:
            body = json.loads(request.httprequest.data or '{}')
            login_val = body.get('login', '').strip().lower()
            password = body.get('password', '')

            if not login_val or not password:
                return error_response('Invalid credentials', 401)

            # Search active=any so previously-inactive accounts (pre-activation fix)
            # can still log in once manually activated.
            user = request.env['res.users'].sudo().search(
                [('login', '=', login_val), ('active', 'in', [True, False])], limit=1
            )
            if not user:
                return error_response('Invalid credentials', 401)

            # Activate the user silently if they were left inactive by portal.wizard
            if not user.active:
                user.sudo().write({'active': True})

            try:
                # with_user(user) sets env.user = portal user so _check_credentials
                # reads the correct password hash (it queries by self.env.user.id).
                user.with_user(user)._check_credentials(password, {'interactive': False})
            except AccessDenied:
                return error_response('Invalid credentials', 401)
            except Exception:
                _logger.exception('Unexpected error checking credentials for %s', login_val)
                return error_response('Invalid credentials', 401)

            token = _issue_token(user.id)
            partner = user.partner_id
            return json_response({
                'authenticated': True,
                'token': token,
                'uid': user.id,
                'name': user.name,
                'email': user.email,
                'phone': partner.phone or '',
                'street': partner.street or '',
            })
        except Exception as e:
            _logger.exception('Error in login')
            return error_response(str(e), 500)

    @http.route('/api/pc/auth/register', type='http', auth='public', methods=['POST'], csrf=False)
    def register(self, **kwargs):
        """Create a new portal user (NO backend access).

        Accepts: name, email, password, phone (optional), address (optional).
        Uses Odoo's portal.wizard to guarantee the user is portal-only.
        """
        try:
            body = json.loads(request.httprequest.data or '{}')
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            phone = body.get('phone', '').strip()
            address = body.get('address', '').strip()

            if not name or not email or not password:
                return error_response('name, email, and password are required', 400)

            # Check if email already used
            existing = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
            if existing:
                return error_response('Email already registered', 409)

            # ── Step 1: Create a partner (contact) with full info ─────
            partner_vals = {
                'name': name,
                'email': email,
            }
            if phone:
                partner_vals['phone'] = phone
            if address:
                partner_vals['street'] = address

            partner = request.env['res.partner'].sudo().create(partner_vals)

            # ── Step 2: Use portal.wizard to grant portal access ──────
            # This is Odoo's official mechanism and correctly sets the
            # user as portal-only (group_portal) WITHOUT group_user.
            try:
                wizard = request.env['portal.wizard'].sudo().with_context(
                    active_ids=[partner.id]
                ).create({})
                for line in wizard.user_ids:
                    line.sudo().write({'in_portal': True})
                wizard.sudo().action_apply()
            except Exception as wiz_err:
                _logger.warning('portal.wizard failed (%s), falling back to manual creation', wiz_err)
                # Fallback: create user manually with portal group
                portal_group = request.env.ref('base.group_portal')
                request.env['res.users'].sudo().with_context(no_reset_password=True).create({
                    'name': name,
                    'login': email,
                    'email': email,
                    'password': password,
                    'partner_id': partner.id,
                    'groups_id': [(6, 0, [portal_group.id])],
                })

            # ── Step 3: Retrieve the created user and set password ────
            user = request.env['res.users'].sudo().search(
                [('login', '=', email)], limit=1
            )
            if not user:
                return error_response('User creation failed', 500)

            # Ensure user is active (portal.wizard may create inactive users
            # requiring email confirmation — bypass that for this custom frontend)
            user.sudo().write({'password': password, 'active': True})

            # ── Step 4: Safety net — ensure portal-only access ────────
            # In some Odoo configurations the user may still inherit
            # group_user.  Strip it to guarantee portal-only.
            group_internal = request.env.ref('base.group_user')
            group_portal = request.env.ref('base.group_portal')
            if group_internal in user.groups_id:
                user.sudo().write({
                    'groups_id': [
                        (3, group_internal.id),   # remove internal
                        (4, group_portal.id),      # ensure portal
                    ]
                })

            # ── Step 5: Return without touching the session ───────────
            # Never call session.authenticate() here — it would overwrite
            # the admin cookie (same origin) and disconnect the backend.
            # The frontend calls /api/pc/auth/login separately after this.
            return json_response({
                'created': True,
                'uid': user.id,
                'name': user.name,
                'email': user.email,
            }, status=201)
        except ValidationError as e:
            return error_response(str(e), 400)
        except Exception as e:
            _logger.exception('Error in register')
            return error_response(str(e), 500)

    @http.route('/api/pc/auth/logout', type='http', auth='public', methods=['POST'], csrf=False)
    def logout(self, **kwargs):
        auth = request.httprequest.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            _revoke_token(auth[7:].strip())
        return json_response({'ok': True})

    @http.route('/api/pc/auth/me', type='http', auth='public', methods=['GET'], csrf=False)
    def me(self, **kwargs):
        """Return current frontend-user info from Bearer token."""
        uid = _uid_from_request()
        if not uid:
            return json_response({'authenticated': False})
        user = request.env['res.users'].sudo().browse(uid)
        if not user.exists():
            return json_response({'authenticated': False})
        partner = user.partner_id
        return json_response({
            'authenticated': True,
            'uid': uid,
            'name': user.name,
            'email': user.email,
            'phone': partner.phone or '',
            'street': partner.street or '',
        })

    @http.route('/api/pc/auth/update', type='http', auth='public', methods=['POST'], csrf=False)
    def update_profile(self, **kwargs):
        """Update current user partner info."""
        try:
            uid = _uid_from_request()
            if not uid:
                return error_response('Not authenticated', 401)

            body = json.loads(request.httprequest.data or '{}')
            data = body.get('data', {})

            user = request.env['res.users'].sudo().browse(uid)
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
        """Submit or update a review. Requires frontend token."""
        try:
            uid = _uid_from_request()
            if not uid:
                return error_response('Not authenticated', 401)
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

            # Send confirmation email
            if order.partner_id.email:
                try:
                    request.env['mail.mail'].sudo().create({
                        'subject': f'Confirmation de commande — {order.name}',
                        'email_to': order.partner_id.email,
                        'body_html': (
                            f'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">'
                            f'<h2 style="color:#e8001d;">Commande confirmée ✓</h2>'
                            f'<p>Votre commande <strong>{order.name}</strong> a bien été enregistrée.</p>'
                            f'<p>Montant total : <strong>{order.amount_total:.2f} USD</strong></p>'
                            f'<p>Nous préparons votre commande et vous tiendrons informé.</p>'
                            f'<p style="color:#9f9f9f;">— L\'équipe INSHOP BUILDER</p>'
                            f'</div>'
                        ),
                    }).send()
                except Exception as _mail_err:
                    _logger.warning('Confirmation email failed: %s', _mail_err)

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
            uid = _uid_from_request()
            if not uid:
                return error_response('Not authenticated', 401)
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

        # Prefer the frontend token uid, fall back to public partner.
        uid = _uid_from_request() or request.session.uid
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
            'pc_delivery_status': getattr(order, 'pc_delivery_status', None),
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

    def _get_current_uid(self):
        return request.env.uid if request.env.uid else None

    def _assert_order_belongs_to_user(self, order, uid):
        """
        Ownership check (long-term compatible):
        match how /api/pc/orders filters orders:
        ('partner_id.user_ids', 'in', [uid])
        """
        try:
            return bool(order.partner_id.user_ids and order.partner_id.user_ids.ids and uid in order.partner_id.user_ids.ids)
        except Exception:
            return False

    @http.route('/api/pc/dashboard', type='http', auth='public', methods=['GET'], csrf=False)
    def dashboard_me(self, **kwargs):
        """Return dashboard summary (front-end) for the logged-in user."""
        try:
            uid = _uid_from_request()
            if not uid:
                return error_response('Not authenticated', 401)

            user = request.env['res.users'].sudo().browse(uid)
            orders = request.env['sale.order'].sudo().search([
                ('partner_id.user_ids', 'in', [uid]),
                ('state', 'in', ['sale', 'done']),
            ], order='date_order desc')

            counts = {
                'processing': 0,
                'preparing': 0,
                'shipped': 0,
                'delivered': 0,
            }
            for o in orders:
                status = getattr(o, 'pc_delivery_status', 'processing') or 'processing'
                if status not in counts:
                    counts[status] = 0
                counts[status] += 1

            return json_response({
                'authenticated': True,
                'uid': uid,
                'user': {
                    'name': user.name,
                    'email': user.email,
                },
                'counts': counts,
                'orders': [self._serialize_order(o, full=True) for o in orders],
            })
        except Exception as e:
            _logger.exception('Error in dashboard_me')
            return error_response(str(e), 500)

    @http.route('/api/pc/admin/dashboard', type='http', auth='user', methods=['GET'], csrf=False)
    def dashboard_admin(self, **kwargs):
        """Admin dashboard (front-end) - requires system group."""
        try:
            if not request.env.user.has_group('base.group_system'):
                return error_response('Forbidden', 403)

            orders = request.env['sale.order'].sudo().search([
                ('state', 'in', ['sale', 'done']),
            ])

            counts = {
                'processing': 0,
                'preparing': 0,
                'shipped': 0,
                'delivered': 0,
            }
            for o in orders:
                status = getattr(o, 'pc_delivery_status', 'processing') or 'processing'
                if status not in counts:
                    counts[status] = 0
                counts[status] += 1

            users = request.env['res.users'].sudo().search([
                ('login', '!=', False),
            ], limit=200)

            return json_response({
                'authenticated': True,
                'counts': counts,
                'total_users_sampled': len(users),
                'users': [
                    {'id': u.id, 'name': u.name, 'email': u.email, 'phone': u.phone}
                    for u in users
                ],
                'total_orders': len(orders),
            })
        except Exception as e:
            _logger.exception('Error in dashboard_admin')
            return error_response(str(e), 500)

    @http.route('/api/pc/contact/submit', type='http', auth='public', methods=['POST'], csrf=False)
    def submit_contact(self, **kwargs):
        """Submit a contact form message."""
        try:
            body = json.loads(request.httprequest.data or '{}')
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            subject = body.get('subject', '').strip()
            message = body.get('message', '').strip()

            if not name or not email or not message:
                return error_response('name, email, and message are required', 400)

            msg = request.env['pc.contact.message'].sudo().create({
                'name': name,
                'email': email,
                'subject': subject,
                'message': message,
            })

            return json_response({'ok': True, 'id': msg.id})
        except Exception as e:
            _logger.exception('Error in submit_contact')
            return error_response(str(e), 500)

    @http.route('/api/pc/order/<int:order_id>/delivery/next', type='http', auth='public', methods=['POST'], csrf=False)
    def order_delivery_next(self, order_id, **kwargs):
        """Advance delivery status for a user's own order."""
        try:
            uid = _uid_from_request()
            if not uid:
                return error_response('Not authenticated', 401)

            order = request.env['sale.order'].sudo().browse(order_id)
            if not order.exists():
                return error_response('Order not found', 404)

            if not self._assert_order_belongs_to_user(order, uid):
                return error_response('Forbidden', 403)

            if order.state not in ['sale', 'done']:
                return error_response('Order not confirmed', 400)

            current = getattr(order, 'pc_delivery_status', 'processing') or 'processing'
            next_map = {
                'processing': 'preparing',
                'preparing': 'shipped',
                'shipped': 'delivered',
                'delivered': 'delivered',
            }

            if current == 'delivered':
                return error_response('Order already delivered', 400)

            next_status = next_map.get(current)
            if not next_status or next_status == current:
                return error_response('Invalid delivery transition', 400)

            if next_status == 'preparing':
                order.sudo().action_set_preparing()
            elif next_status == 'shipped':
                order.sudo().action_set_shipped()
            elif next_status == 'delivered':
                order.sudo().action_set_delivered()

            return json_response({'order': self._serialize_order(order.sudo(), full=True)})
        except Exception as e:
            _logger.exception('Error in order_delivery_next')
            return error_response(str(e), 500)

    @http.route('/api/pc/admin/order/<int:order_id>/delivery/next', type='http', auth='user', methods=['POST'], csrf=False)
    def admin_order_delivery_next(self, order_id, **kwargs):
        """Admin: advance delivery status for any order (requires group_system)."""
        try:
            if not request.env.user.has_group('base.group_system'):
                return error_response('Forbidden', 403)

            order = request.env['sale.order'].sudo().browse(order_id)
            if not order.exists():
                return error_response('Order not found', 404)

            if order.state not in ['sale', 'done']:
                return error_response('Order not confirmed', 400)

            current = getattr(order, 'pc_delivery_status', 'processing') or 'processing'
            next_map = {
                'processing': 'preparing',
                'preparing': 'shipped',
                'shipped': 'delivered',
            }

            if current == 'delivered':
                return error_response('Order already delivered', 400)

            next_status = next_map.get(current)
            if not next_status:
                return error_response('Invalid delivery transition', 400)

            if next_status == 'preparing':
                order.sudo().action_set_preparing()
            elif next_status == 'shipped':
                order.sudo().action_set_shipped()
            elif next_status == 'delivered':
                order.sudo().action_set_delivered()

            return json_response({'order': self._serialize_order(order.sudo(), full=True)})
        except Exception as e:
            _logger.exception('Error in admin_order_delivery_next')
            return error_response(str(e), 500)

    @http.route('/api/pc/admin/orders', type='http', auth='user', methods=['GET'], csrf=False)
    def admin_orders(self, **kwargs):
        """Admin: list all confirmed orders with delivery status."""
        try:
            if not request.env.user.has_group('base.group_system'):
                return error_response('Forbidden', 403)

            orders = request.env['sale.order'].sudo().search([
                ('state', 'in', ['sale', 'done']),
            ], order='date_order desc')

            return json_response({
                'orders': [self._serialize_order(o, full=True) for o in orders],
                'total': len(orders),
            })
        except Exception as e:
            _logger.exception('Error in admin_orders')
            return error_response(str(e), 500)
