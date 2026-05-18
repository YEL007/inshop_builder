from rest_framework import serializers
from .models import User, Category, Product, ProductImage, Prebuilt, PrebuiltImage, OnlyOnePC, OnlyOnePCImage, Review, ContactMessage, SiteConfig, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'street', 'is_staff', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    extra_images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class PrebuiltImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrebuiltImage
        fields = '__all__'

class PrebuiltSerializer(serializers.ModelSerializer):
    extra_images = PrebuiltImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Prebuilt
        fields = '__all__'

class OnlyOnePCImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlyOnePCImage
        fields = '__all__'

class OnlyOnePCSerializer(serializers.ModelSerializer):
    extra_images = OnlyOnePCImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = OnlyOnePC
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_display_name = serializers.ReadOnlyField(source='user.get_display_name')
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = Review
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.ReadOnlyField(source='user.get_display_name')
    name = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = '__all__'
