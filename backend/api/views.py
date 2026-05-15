import logging
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import viewsets, permissions
from .models import (
    User, Category, Product, Prebuilt, OnlyOnePC, Component,
    Review, ContactMessage, SiteConfig, Order, OrderItem,
    ProductImage, PrebuiltImage, OnlyOnePCImage,
)
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer,
    ProductImageSerializer, PrebuiltImageSerializer, OnlyOnePCImageSerializer,
    PrebuiltSerializer, OnlyOnePCSerializer, ReviewSerializer,
    ContactMessageSerializer, SiteConfigSerializer, OrderSerializer
)

_logger = logging.getLogger(__name__)


# ── Auth helpers ──────────────────────────────────────────────────────────────

def _get_user(request):
    """Return authenticated user from Bearer JWT, or None."""
    if request.user and request.user.is_authenticated:
        return request.user
    return None


def _user_to_dict(user):
    return {
        'authenticated': True,
        'uid': user.id,
        'username': user.username,
        'name': user.get_display_name(),
        'email': user.email,
        'phone': user.phone or '',
        'street': user.street or '',
        'is_staff': user.is_staff,
    }


# ── Cart helpers ──────────────────────────────────────────────────────────────

def _get_or_create_cart(request, user=None):
    """Get or create a draft Order (cart) tied to this session."""
    order_id = request.session.get('cart_order_id')
    if order_id:
        try:
            return Order.objects.get(id=order_id, state='draft')
        except Order.DoesNotExist:
            pass

    if not request.session.session_key:
        request.session.save()

    order = Order.objects.create(
        user=user,
        session_key=request.session.session_key or '',
        state='draft',
    )
    request.session['cart_order_id'] = order.id
    return order


# ── Site config ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def get_config(request):
    try:
        config = SiteConfig.objects.first()
        if not config:
            config = SiteConfig.objects.create()
        return Response(config.to_dict())
    except Exception as e:
        _logger.exception('Error in get_config')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    try:
        cats = Category.objects.filter(active=True).order_by('sequence', 'id')
        data = [
            {
                'name': c.name,
                'code': c.code,
                'type': c.type,
                'peri_group': c.peri_group or None,
                'icon': c.icon or None,
                'sequence': c.sequence,
            }
            for c in cats
        ]
        return Response({'categories': data})
    except Exception as e:
        _logger.exception('Error in get_categories')
        return Response({'error': str(e)}, status=500)


# ── Catalog ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def get_catalog(request):
    try:
        products = Product.objects.filter(
            active=True,
            is_only_one=False,
            category__type='component',
        ).select_related('category').prefetch_related('extra_images')
        catalog = {}
        for p in products:
            cat = p.category.code if p.category else 'other'
            catalog.setdefault(cat, [])
            catalog[cat].append(p.to_dict(request))
        return Response({'catalog': catalog})
    except Exception as e:
        _logger.exception('Error in get_catalog')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_onlyone_catalog(request):
    try:
        products = Product.objects.filter(
            active=True,
            is_only_one=True,
            category__type='component',
        ).select_related('category').prefetch_related('extra_images')
        catalog = {}
        for p in products:
            cat = p.category.code if p.category else 'other'
            catalog.setdefault(cat, [])
            catalog[cat].append(p.to_dict(request))
        return Response({'catalog': catalog})
    except Exception as e:
        _logger.exception('Error in get_onlyone_catalog')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    try:
        category = request.query_params.get('category')
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 50))

        qs = Product.objects.filter(active=True, category__isnull=False).select_related('category').prefetch_related('extra_images')
        if category:
            qs = qs.filter(category__code=category)

        total = qs.count()
        offset = (page - 1) * limit
        products = qs[offset:offset + limit]

        return Response({
            'products': [p.to_dict(request) for p in products],
            'total': total,
            'page': page,
            'limit': limit,
        })
    except Exception as e:
        _logger.exception('Error in get_products')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products_by_category(request, category):
    try:
        products = Product.objects.filter(
            active=True, category__code=category
        ).select_related('category').prefetch_related('extra_images')
        return Response({
            'category': category,
            'products': [p.to_dict(request) for p in products],
        })
    except Exception as e:
        _logger.exception('Error in get_products_by_category')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, product_id):
    try:
        product = Product.objects.filter(
            id=product_id, active=True
        ).select_related('category').prefetch_related('extra_images').first()
        if not product:
            return Response({'error': 'Product not found'}, status=404)
        return Response({'product': product.to_dict(request)})
    except Exception as e:
        _logger.exception('Error in get_product')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_related(request, product_id):
    try:
        product = Product.objects.filter(id=product_id, active=True).select_related('category').first()
        if not product or not product.category:
            return Response({'error': 'Product not found'}, status=404)
        related = Product.objects.filter(
            active=True,
            category=product.category,
        ).exclude(id=product_id).prefetch_related('extra_images')[:4]
        return Response({'related': [p.to_dict(request) for p in related]})
    except Exception as e:
        _logger.exception('Error in get_related')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_laptops(request):
    try:
        laptops = Product.objects.filter(
            active=True, category__type='laptop'
        ).select_related('category').prefetch_related('extra_images')
        return Response({'laptops': [p.to_dict(request) for p in laptops]})
    except Exception as e:
        _logger.exception('Error in get_laptops')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_peripherals(request):
    try:
        products = Product.objects.filter(
            active=True, category__type='peripheral'
        ).select_related('category').prefetch_related('extra_images')
        peripherals = {}
        for p in products:
            cat = p.category.code if p.category else 'other'
            peripherals.setdefault(cat, [])
            peripherals[cat].append(p.to_dict(request))
        return Response({'peripherals': peripherals})
    except Exception as e:
        _logger.exception('Error in get_peripherals')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_prebuilts(request):
    try:
        prebuilts = Prebuilt.objects.filter(active=True).prefetch_related('extra_images')
        return Response({'prebuilts': [p.to_dict(request) for p in prebuilts]})
    except Exception as e:
        _logger.exception('Error in get_prebuilts')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_onlyonepcs(request):
    try:
        onlyonepcs = OnlyOnePC.objects.filter(active=True).prefetch_related('extra_images')
        return Response({'onlyonepcs': [p.to_dict(request) for p in onlyonepcs]})
    except Exception as e:
        _logger.exception('Error in get_onlyonepcs')
        return Response({'error': str(e)}, status=500)


# ── Authentication ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        login_val = (request.data.get('login') or '').strip().lower()
        password = request.data.get('password') or ''

        if not login_val or not password:
            return Response({'error': 'Invalid credentials'}, status=401)

        user = (
            User.objects.filter(username__iexact=login_val).first()
            or User.objects.filter(email__iexact=login_val).first()
        )

        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=401)

        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        refresh = RefreshToken.for_user(user)
        return Response({
            **_user_to_dict(user),
            'token': str(refresh.access_token),
        })
    except Exception as e:
        _logger.exception('Error in login')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        name = (request.data.get('name') or '').strip()
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password') or ''
        phone = (request.data.get('phone') or '').strip()
        address = (request.data.get('address') or '').strip()

        if not name or not email or not password:
            return Response({'error': 'name, email, and password are required'}, status=400)

        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Invalid email address'}, status=400)

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({'error': e.messages[0]}, status=400)

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=409)

        parts = name.split(' ', 1)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else '',
            phone=phone,
            street=address,
        )

        return Response({
            'created': True,
            'uid': user.id,
            'name': user.get_display_name(),
            'email': user.email,
        }, status=201)
    except Exception as e:
        _logger.exception('Error in register')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([AllowAny])
def me_view(request):
    user = _get_user(request)
    if not user:
        return Response({'authenticated': False})
    return Response(_user_to_dict(user))


@api_view(['POST'])
@permission_classes([AllowAny])
def update_profile(request):
    try:
        user = _get_user(request)
        if not user:
            return Response({'error': 'Not authenticated'}, status=401)

        data = request.data.get('data') or request.data
        if 'name' in data:
            parts = data['name'].split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        if 'phone' in data:
            user.phone = data['phone']
        if 'street' in data:
            user.street = data['street']
        user.save()

        return Response({
            'ok': True,
            'user': {
                'name': user.get_display_name(),
                'email': user.email,
                'phone': user.phone or '',
                'street': user.street or '',
            },
        })
    except Exception as e:
        _logger.exception('Error in update_profile')
        return Response({'error': str(e)}, status=500)


# ── Reviews ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def get_reviews(request, product_id):
    try:
        reviews = Review.objects.filter(product_id=product_id).select_related('user').order_by('-date')
        return Response({'reviews': [r.to_dict() for r in reviews]})
    except Exception as e:
        _logger.exception('Error in get_reviews')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_review(request):
    try:
        user = _get_user(request)
        if not user:
            return Response({'error': 'Not authenticated'}, status=401)

        product_id = int(request.data.get('product_id') or 0)
        rating = int(request.data.get('rating') or 0)
        comment = (request.data.get('comment') or '').strip()

        if not product_id or not rating:
            return Response({'error': 'product_id et rating sont requis.'}, status=400)
        if not (1 <= rating <= 5):
            return Response({'error': 'La note doit être entre 1 et 5.'}, status=400)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found'}, status=404)

        review, created = Review.objects.update_or_create(
            product=product,
            user=user,
            defaults={'rating': rating, 'comment': comment},
        )
        product.refresh_from_db(fields=['rating', 'review_count'])

        return Response({
            'review': review.to_dict(),
            'new_rating': product.rating,
            'new_count': product.review_count,
        })
    except Exception as e:
        _logger.exception('Error in submit_review')
        return Response({'error': str(e)}, status=500)


# ── Cart ──────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart(request):
    try:
        user = _get_user(request)
        order = _get_or_create_cart(request, user)
        return Response({'cart': order.to_dict(request=request)})
    except Exception as e:
        _logger.exception('Error in get_cart')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_add(request):
    try:
        try:
            product_id = int(request.data.get('product_id') or 0)
            qty_raw = request.data.get('qty')
            qty = int(qty_raw) if qty_raw is not None else 1
        except (ValueError, TypeError):
            return Response({'error': 'product_id and qty must be integers'}, status=400)

        if not product_id:
            return Response({'error': 'product_id required'}, status=400)

        if qty < 1:
            return Response({'error': 'qty must be at least 1'}, status=400)

        product = Product.objects.filter(id=product_id, active=True).first()
        if not product:
            return Response({'error': 'Product not found'}, status=404)

        user = _get_user(request)
        order = _get_or_create_cart(request, user)

        item = order.items.filter(product=product).first()
        if item:
            item.qty += qty
            item.save(update_fields=['qty'])
        else:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_template_id=product.id,
                qty=qty,
                price=product.price,
            )

        order.compute_total()
        order.save(update_fields=['total'])
        return Response({'cart': order.to_dict(request=request)})
    except Exception as e:
        _logger.exception('Error in cart_add')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_remove(request):
    try:
        try:
            product_id = int(request.data.get('product_id') or 0)
        except (ValueError, TypeError):
            return Response({'error': 'product_id must be an integer'}, status=400)

        if not product_id:
            return Response({'error': 'product_id required'}, status=400)

        user = _get_user(request)
        order = _get_or_create_cart(request, user)

        deleted, _ = order.items.filter(product_id=product_id).delete()
        if not deleted:
            return Response({'error': 'Product not in cart'}, status=404)

        order.compute_total()
        order.save(update_fields=['total'])
        return Response({'cart': order.to_dict(request=request)})
    except Exception as e:
        _logger.exception('Error in cart_remove')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_sync(request):
    try:
        items = request.data.get('items') or []
        user = _get_user(request)
        order = _get_or_create_cart(request, user)

        order.items.all().delete()

        for item in items:
            try:
                product_id = int(item.get('product_id') or 0)
                qty = int(item.get('qty') or 1)
            except (ValueError, TypeError):
                continue
            if not product_id or qty < 1:
                continue
            product = Product.objects.filter(id=product_id, active=True).first()
            if product:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_template_id=product.id,
                    qty=qty,
                    price=product.price,
                )

        order.compute_total()
        order.save(update_fields=['total'])
        return Response({'cart': order.to_dict(request=request)})
    except Exception as e:
        _logger.exception('Error in cart_sync')
        return Response({'error': str(e)}, status=500)


# ── Orders ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_order(request):
    try:
        user = _get_user(request)
        order = _get_or_create_cart(request, user)

        if not order.items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        order.compute_total()
        if order.total <= 0:
            return Response({'error': 'Invalid cart total'}, status=400)

        shipping = request.data.get('shipping') or {}
        if shipping.get('name'):
            order.shipping_name = shipping.get('name', '')
            order.shipping_email = shipping.get('email', '')
            order.shipping_phone = shipping.get('phone', '')
            order.shipping_address = shipping.get('address', '')
            order.shipping_city = shipping.get('city', '')
            order.shipping_zip = shipping.get('zip', '')

        order.compute_total()
        order.state = 'sale'
        order.confirmed_at = timezone.now()
        if user:
            order.user = user
        order.save()

        request.session['cart_order_id'] = None

        # Send confirmation email
        recipient = order.shipping_email or (user.email if user else None)
        if recipient:
            try:
                send_mail(
                    subject=f'Confirmation de commande — {order.name}',
                    message=(
                        f'Votre commande {order.name} a bien été enregistrée.\n'
                        f'Montant total : {order.total:.2f} USD\n\n'
                        f'— L\'équipe INSHOP BUILDER'
                    ),
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    fail_silently=True,
                )
            except Exception as mail_err:
                _logger.warning('Confirmation email failed: %s', mail_err)

        return Response({
            'order_id': order.id,
            'order_name': order.name,
            'total': order.total,
        })
    except Exception as e:
        _logger.exception('Error in confirm_order')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_orders(request):
    try:
        user = _get_user(request)
        if not user:
            return Response({'error': 'Not authenticated'}, status=401)

        orders = Order.objects.filter(
            user=user,
            state__in=['sale', 'done'],
        ).prefetch_related('items__product').order_by('-created_at')

        return Response({'orders': [o.to_dict(full=True, request=request) for o in orders]})
    except Exception as e:
        _logger.exception('Error in get_orders')
        return Response({'error': str(e)}, status=500)


# ── Delivery ──────────────────────────────────────────────────────────────────

_DELIVERY_NEXT = {
    'processing': 'preparing',
    'preparing': 'shipped',
    'shipped': 'delivered',
}


def _advance_delivery(order):
    current = order.delivery_status or 'processing'
    if current == 'delivered':
        return None, 'Order already delivered'
    next_status = _DELIVERY_NEXT.get(current)
    if not next_status:
        return None, 'Invalid delivery transition'
    order.delivery_status = next_status
    order.save(update_fields=['delivery_status'])
    return order, None


@api_view(['POST'])
@permission_classes([AllowAny])
def order_delivery_next(request, order_id):
    try:
        user = _get_user(request)
        if not user:
            return Response({'error': 'Not authenticated'}, status=401)

        order = Order.objects.filter(id=order_id).prefetch_related('items__product').first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        if order.user_id != user.id:
            return Response({'error': 'Forbidden'}, status=403)

        if order.state not in ['sale', 'done']:
            return Response({'error': 'Order not confirmed'}, status=400)

        order, err = _advance_delivery(order)
        if err:
            return Response({'error': err}, status=400)

        return Response({'order': order.to_dict(full=True, request=request)})
    except Exception as e:
        _logger.exception('Error in order_delivery_next')
        return Response({'error': str(e)}, status=500)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_me(request):
    try:
        user = _get_user(request)
        if not user:
            return Response({'error': 'Not authenticated'}, status=401)

        orders = Order.objects.filter(
            user=user, state__in=['sale', 'done']
        ).prefetch_related('items__product').order_by('-created_at')

        counts = {'processing': 0, 'preparing': 0, 'shipped': 0, 'delivered': 0}
        for o in orders:
            s = o.delivery_status or 'processing'
            counts[s] = counts.get(s, 0) + 1

        return Response({
            'authenticated': True,
            'uid': user.id,
            'user': {'name': user.get_display_name(), 'email': user.email},
            'counts': counts,
            'orders': [o.to_dict(full=True, request=request) for o in orders],
        })
    except Exception as e:
        _logger.exception('Error in dashboard_me')
        return Response({'error': str(e)}, status=500)


# ── Admin ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_admin(request):
    try:
        user = _get_user(request)
        if not user or not user.is_staff:
            return Response({'error': 'Forbidden'}, status=403)

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        confirmed_orders = Order.objects.filter(state__in=['sale', 'done'])
        orders_30d = confirmed_orders.filter(created_at__gte=thirty_days_ago)

        revenue_30d = float(sum(o.total for o in orders_30d))
        orders_count_30d = orders_30d.count()
        active_products = Product.objects.filter(active=True).count()
        total_users = User.objects.count()

        # 14-day daily revenue series
        revenue_series = []
        for i in range(13, -1, -1):
            day_start = now - timedelta(days=i + 1)
            day_end = now - timedelta(days=i)
            day_rev = float(sum(
                o.total for o in orders_30d.filter(created_at__gte=day_start, created_at__lt=day_end)
            ))
            revenue_series.append(day_rev)

        low_stock = list(Product.objects.filter(stock_status='low_stock', active=True).values('id', 'name')[:5])
        unread_contacts = ContactMessage.objects.filter(state='new').count()
        unread_contact_names = list(
            ContactMessage.objects.filter(state='new').values('id', 'name', 'subject')[:5]
        )

        recent_orders = []
        for o in confirmed_orders.order_by('-created_at')[:5]:
            customer = o.shipping_name or (o.user.get_display_name() if o.user else 'Anonyme')
            recent_orders.append({
                'id': o.id,
                'name': o.name,
                'customer': customer,
                'total': o.total,
                'state': o.state,
                'delivery_status': o.delivery_status,
                'created_at': o.created_at.isoformat(),
            })

        return Response({
            'stats': {
                'revenue': {'value': revenue_30d, 'delta': 0, 'label': 'Revenu (30j)'},
                'orders': {'value': orders_count_30d, 'delta': 0, 'label': 'Commandes (30j)'},
                'products': {'value': active_products, 'delta': 0, 'label': 'Produits actifs'},
                'users': {'value': total_users, 'delta': 0, 'label': 'Utilisateurs'},
            },
            'revenue_series': revenue_series,
            'low_stock': low_stock,
            'unread_contacts': unread_contacts,
            'unread_contact_names': unread_contact_names,
            'recent_orders': recent_orders,
        })
    except Exception as e:
        _logger.exception('Error in dashboard_admin')
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_orders(request):
    try:
        user = _get_user(request)
        if not user or not user.is_staff:
            return Response({'error': 'Forbidden'}, status=403)

        orders = Order.objects.filter(
            state__in=['sale', 'done']
        ).prefetch_related('items__product').order_by('-created_at')

        return Response({
            'orders': [o.to_dict(full=True, request=request) for o in orders],
            'total': orders.count(),
        })
    except Exception as e:
        _logger.exception('Error in admin_orders')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_order_delivery_next(request, order_id):
    try:
        user = _get_user(request)
        if not user or not user.is_staff:
            return Response({'error': 'Forbidden'}, status=403)

        order = Order.objects.filter(id=order_id).prefetch_related('items__product').first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        if order.state not in ['sale', 'done']:
            return Response({'error': 'Order not confirmed'}, status=400)

        order, err = _advance_delivery(order)
        if err:
            return Response({'error': err}, status=400)

        return Response({'order': order.to_dict(full=True, request=request)})
    except Exception as e:
        _logger.exception('Error in admin_order_delivery_next')
        return Response({'error': str(e)}, status=500)


# ── Contact ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_contact(request):
    try:
        name = (request.data.get('name') or '').strip()
        email = (request.data.get('email') or '').strip().lower()
        subject = (request.data.get('subject') or '').strip()
        message = (request.data.get('message') or '').strip()

        if not name or not email or not message:
            return Response({'error': 'name, email, and message are required'}, status=400)

        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Invalid email address'}, status=400)

        msg = ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message,
        )
        return Response({'ok': True, 'id': msg.id})
    except Exception as e:
        _logger.exception('Error in submit_contact')
        return Response({'error': str(e)}, status=500)

# ── Admin ViewSets ───────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('sequence', 'id')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.none()  # required by DRF router for basename detection

    def get_queryset(self):
        qs = Product.objects.all().order_by('name')
        category_type = self.request.query_params.get('category_type')
        if category_type:
            qs = qs.filter(category__type=category_type)
        return qs

    def _handle_extra_images(self, product):
        images = self.request.FILES.getlist('extra_images')
        for img in images:
            ProductImage.objects.create(product=product, image=img, name=img.name)

    def perform_create(self, serializer):
        product = serializer.save()
        self._handle_extra_images(product)

    def perform_update(self, serializer):
        product = serializer.save()
        self._handle_extra_images(product)

class PrebuiltViewSet(viewsets.ModelViewSet):
    queryset = Prebuilt.objects.all().order_by('price')
    serializer_class = PrebuiltSerializer
    permission_classes = [permissions.IsAdminUser]

    def _handle_extra_images(self, obj):
        for img in self.request.FILES.getlist('extra_images'):
            PrebuiltImage.objects.create(prebuilt=obj, image=img, name=img.name)

    def perform_create(self, serializer):
        obj = serializer.save()
        self._handle_extra_images(obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._handle_extra_images(obj)

class OnlyOnePCViewSet(viewsets.ModelViewSet):
    queryset = OnlyOnePC.objects.all().order_by('price')
    serializer_class = OnlyOnePCSerializer
    permission_classes = [permissions.IsAdminUser]

    def _handle_extra_images(self, obj):
        for img in self.request.FILES.getlist('extra_images'):
            OnlyOnePCImage.objects.create(onlyone=obj, image=img, name=img.name)

    def perform_create(self, serializer):
        obj = serializer.save()
        self._handle_extra_images(obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._handle_extra_images(obj)

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete']

class PrebuiltImageViewSet(viewsets.ModelViewSet):
    queryset = PrebuiltImage.objects.all()
    serializer_class = PrebuiltImageSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete']

class OnlyOnePCImageViewSet(viewsets.ModelViewSet):
    queryset = OnlyOnePCImage.objects.all()
    serializer_class = OnlyOnePCImageSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete']

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-date')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]

class SiteConfigViewSet(viewsets.ModelViewSet):
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer
    permission_classes = [permissions.IsAdminUser]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(state__in=['sale', 'done']).order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
