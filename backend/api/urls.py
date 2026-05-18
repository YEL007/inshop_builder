from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin/users', views.UserViewSet)
router.register(r'admin/categories', views.CategoryViewSet)
router.register(r'admin/products', views.ProductViewSet, basename='product')
router.register(r'admin/product-images', views.ProductImageViewSet, basename='product-image')
router.register(r'admin/prebuilts', views.PrebuiltViewSet)
router.register(r'admin/prebuilt-images', views.PrebuiltImageViewSet, basename='prebuilt-image')
router.register(r'admin/onlyonepcs', views.OnlyOnePCViewSet)
router.register(r'admin/onlyone-images', views.OnlyOnePCImageViewSet, basename='onlyone-image')
router.register(r'admin/reviews', views.ReviewViewSet)
router.register(r'admin/messages', views.ContactMessageViewSet)
router.register(r'admin/siteconfig', views.SiteConfigViewSet)
router.register(r'admin/orders_crud', views.OrderViewSet) # avoid conflict with existing 'orders' path

urlpatterns = [
    path('', include(router.urls)),
    # Config & Categories
    path('config', views.get_config),
    path('categories', views.get_categories),

    # Catalog
    path('catalog', views.get_catalog),
    path('onlyone_catalog', views.get_onlyone_catalog),
    path('products', views.get_products),
    path('products/<str:category>', views.get_products_by_category),
    path('product/<int:product_id>', views.get_product),
    path('product/<int:product_id>/related', views.get_related),
    path('laptops', views.get_laptops),
    path('peripherals', views.get_peripherals),

    # Pre-builts & Only One
    path('prebuilts', views.get_prebuilts),
    path('onlyonepcs', views.get_onlyonepcs),

    # Authentication
    path('auth/login', views.login_view),
    path('auth/register', views.register_view),
    path('auth/logout', views.logout_view),
    path('auth/me', views.me_view),
    path('auth/update', views.update_profile),
    path('auth/reset-password-request', views.password_reset_request),
    path('auth/reset-password-confirm', views.password_reset_confirm),

    # Reviews
    path('reviews/<str:product_id>', views.get_reviews),
    path('review', views.submit_review),

    # Cart
    path('cart', views.get_cart),
    path('cart/add', views.cart_add),
    path('cart/remove', views.cart_remove),
    path('cart/sync', views.cart_sync),

    # Orders
    path('order/confirm', views.confirm_order),
    path('orders', views.get_orders),
    path('order/<int:order_id>/delivery/next', views.order_delivery_next),

    # Dashboard
    path('dashboard', views.dashboard_me),

    # Admin
    path('admin/dashboard', views.dashboard_admin),
    path('admin/orders', views.admin_orders),
    path('admin/order/<int:order_id>/delivery/next', views.admin_order_delivery_next),

    # XLS Import
    path('admin/import/<str:model_type>', views.import_xls),
    path('admin/import/<str:model_type>/template', views.import_template),

    # Contact
    path('contact/submit', views.submit_contact),
]
