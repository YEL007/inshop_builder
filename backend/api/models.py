from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# ── Choice lists (mirrored from Odoo) ───────────────────────────────────────

SOCKET_CHOICES = [
    ('AM5', 'AM5 (AMD Ryzen 7000+)'),
    ('AM4', 'AM4 (AMD Ryzen 3000/5000)'),
    ('LGA1700', 'LGA1700 (Intel 12th/13th/14th Gen)'),
    ('LGA1200', 'LGA1200 (Intel 10th/11th Gen)'),
    ('LGA1151', 'LGA1151 (Intel 8th/9th Gen)'),
    ('TR5', 'TR5 (AMD Threadripper 7000)'),
    ('TRX40', 'TRX40 (AMD Threadripper 3000)'),
]

RAM_TYPE_CHOICES = [
    ('DDR5', 'DDR5'), ('DDR4', 'DDR4'), ('DDR3', 'DDR3'),
    ('LPDDR5', 'LPDDR5'), ('LPDDR4', 'LPDDR4'),
]

FORM_FACTOR_CHOICES = [
    ('ATX', 'ATX'), ('mATX', 'Micro-ATX (mATX)'),
    ('ITX', 'Mini-ITX (ITX)'), ('E-ATX', 'Extended ATX (E-ATX)'),
]

STORAGE_TYPE_CHOICES = [
    ('NVMe', 'NVMe M.2'), ('SATA', 'SATA SSD'),
    ('HDD', 'HDD (Disque dur)'), ('SATA M.2', 'SATA M.2'),
]

MODULAR_CHOICES = [
    ('Fully Modular', 'Totalement modulaire'),
    ('Semi-Modular', 'Semi-modulaire'),
    ('Non-Modular', 'Non modulaire'),
]

EFFICIENCY_CHOICES = [
    ('80+ Titanium', '80+ Titanium'), ('80+ Platinum', '80+ Platinum'),
    ('80+ Gold', '80+ Gold'), ('80+ Silver', '80+ Silver'),
    ('80+ Bronze', '80+ Bronze'), ('80+', '80+'),
]

COOLING_TYPE_CHOICES = [
    ('Air', 'Refroidissement à air'),
    ('AIO 120', 'Watercooling AIO 120mm'), ('AIO 240', 'Watercooling AIO 240mm'),
    ('AIO 280', 'Watercooling AIO 280mm'), ('AIO 360', 'Watercooling AIO 360mm'),
    ('Custom', 'Watercooling custom'),
]

GPU_ARCH_CHOICES = [
    ('Ada Lovelace', 'NVIDIA Ada Lovelace (RTX 40xx)'),
    ('Ampere', 'NVIDIA Ampere (RTX 30xx)'),
    ('Turing', 'NVIDIA Turing (RTX 20xx)'),
    ('RDNA 4', 'AMD RDNA 4 (RX 9000)'),
    ('RDNA 3', 'AMD RDNA 3 (RX 7000)'),
    ('RDNA 2', 'AMD RDNA 2 (RX 6000)'),
    ('Arc Battlemage', 'Intel Arc Battlemage'),
    ('Arc Alchemist', 'Intel Arc Alchemist'),
]

STOCK_CHOICES = [
    ('in_stock', 'En stock'),
    ('low_stock', 'Stock limité'),
    ('out_of_stock', 'Rupture de stock'),
]


# ── User ─────────────────────────────────────────────────────────────────────

class User(AbstractUser):
    phone = models.CharField(max_length=30, blank=True)
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    def get_display_name(self):
        return self.get_full_name() or self.username


# ── Category ─────────────────────────────────────────────────────────────────

class Category(models.Model):
    sequence = models.IntegerField(default=10)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=20, choices=[
        ('component', 'Composant interne'),
        ('peripheral', 'Périphérique'),
        ('laptop', 'Ordinateur portable'),
        ('other', 'Autre'),
    ], default='peripheral')
    peri_group = models.CharField(max_length=20, choices=[
        ('input', 'Entrée (Input)'),
        ('output', 'Sortie (Output)'),
        ('mixed', 'E/S (Entrée/Sortie)'),
    ], blank=True)
    icon = models.CharField(max_length=20, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sequence', 'id']
        verbose_name_plural = 'categories'

    def __str__(self):
        return f'[{self.code}] {self.name}'


# ── Product ──────────────────────────────────────────────────────────────────

class Product(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True, verbose_name="Description détaillée")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products'
    )
    stock_status = models.CharField(max_length=20, choices=STOCK_CHOICES, default='in_stock')
    tags = models.CharField(max_length=255, blank=True, help_text='Comma-separated: gaming,bestseller')
    is_only_one = models.BooleanField(default=False, verbose_name='Only One PC component')
    active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    specs = models.JSONField(default=dict, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.IntegerField(default=0)

    # CPU
    spec_cpu_socket = models.CharField(max_length=20, choices=SOCKET_CHOICES, blank=True)
    spec_cpu_cores = models.IntegerField(null=True, blank=True)
    spec_cpu_threads = models.IntegerField(null=True, blank=True)
    spec_cpu_base_ghz = models.CharField(max_length=20, blank=True)
    spec_cpu_boost_ghz = models.CharField(max_length=20, blank=True)
    spec_cpu_tdp = models.IntegerField(null=True, blank=True)
    spec_cpu_cache = models.CharField(max_length=20, blank=True)

    # Motherboard
    spec_mb_socket = models.CharField(max_length=20, choices=SOCKET_CHOICES, blank=True)
    spec_mb_form_factor = models.CharField(max_length=10, choices=FORM_FACTOR_CHOICES, blank=True)
    spec_mb_ram_type = models.CharField(max_length=10, choices=RAM_TYPE_CHOICES, blank=True)
    spec_mb_ram_slots = models.IntegerField(null=True, blank=True)
    spec_mb_m2_slots = models.IntegerField(null=True, blank=True)
    spec_mb_pcie_slots = models.IntegerField(null=True, blank=True)
    spec_mb_chipset = models.CharField(max_length=30, blank=True)

    # RAM
    spec_ram_type = models.CharField(max_length=10, choices=RAM_TYPE_CHOICES, blank=True)
    spec_ram_capacity = models.CharField(max_length=20, blank=True)
    spec_ram_speed = models.IntegerField(null=True, blank=True)
    spec_ram_modules = models.IntegerField(null=True, blank=True)
    spec_ram_timing = models.CharField(max_length=20, blank=True)

    # GPU
    spec_gpu_vram = models.CharField(max_length=20, blank=True)
    spec_gpu_mem_type = models.CharField(max_length=20, blank=True)
    spec_gpu_tdp = models.IntegerField(null=True, blank=True)
    spec_gpu_length_mm = models.IntegerField(null=True, blank=True)
    spec_gpu_architecture = models.CharField(max_length=30, choices=GPU_ARCH_CHOICES, blank=True)
    spec_gpu_outputs = models.CharField(max_length=100, blank=True)

    # PSU
    spec_psu_wattage = models.IntegerField(null=True, blank=True)
    spec_psu_efficiency = models.CharField(max_length=20, choices=EFFICIENCY_CHOICES, blank=True)
    spec_psu_modular = models.CharField(max_length=20, choices=MODULAR_CHOICES, blank=True)

    # Case
    spec_case_atx = models.BooleanField(default=True)
    spec_case_matx = models.BooleanField(default=True)
    spec_case_itx = models.BooleanField(default=True)
    spec_case_eatx = models.BooleanField(default=False)
    spec_case_max_gpu_mm = models.IntegerField(null=True, blank=True)
    spec_case_max_cooler_mm = models.IntegerField(null=True, blank=True)
    spec_case_drive_bays = models.IntegerField(null=True, blank=True)
    spec_case_fans_included = models.IntegerField(null=True, blank=True)

    # Cooling
    spec_cool_type = models.CharField(max_length=20, choices=COOLING_TYPE_CHOICES, blank=True)
    spec_cool_tdp_rating = models.IntegerField(null=True, blank=True)
    spec_cool_height_mm = models.IntegerField(null=True, blank=True)
    spec_cool_radiator_mm = models.IntegerField(null=True, blank=True)
    spec_cool_sock_am5 = models.BooleanField(default=False)
    spec_cool_sock_am4 = models.BooleanField(default=False)
    spec_cool_sock_lga1700 = models.BooleanField(default=False)
    spec_cool_sock_lga1200 = models.BooleanField(default=False)

    # Storage
    spec_stor_type = models.CharField(max_length=20, choices=STORAGE_TYPE_CHOICES, blank=True)
    spec_stor_capacity = models.CharField(max_length=20, blank=True)
    spec_stor_read = models.CharField(max_length=30, blank=True)
    spec_stor_write = models.CharField(max_length=30, blank=True)

    # Laptop
    spec_laptop_cpu = models.CharField(max_length=255, blank=True)
    spec_laptop_gpu = models.CharField(max_length=255, blank=True)
    spec_laptop_ram = models.CharField(max_length=100, blank=True)
    spec_laptop_storage = models.CharField(max_length=100, blank=True)
    spec_laptop_display = models.CharField(max_length=255, blank=True)
    spec_laptop_battery = models.CharField(max_length=100, blank=True)
    spec_laptop_os = models.CharField(max_length=100, blank=True)
    spec_laptop_weight = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def _compute_specs(self):
        cat = (self.category.code or '').lower() if self.category else ''
        specs = {}

        if cat in ('cpu', 'proc'):
            if self.spec_cpu_socket: specs['socket'] = self.spec_cpu_socket
            if self.spec_cpu_cores: specs['cores'] = self.spec_cpu_cores
            if self.spec_cpu_threads: specs['threads'] = self.spec_cpu_threads
            if self.spec_cpu_base_ghz: specs['baseClock'] = self.spec_cpu_base_ghz
            if self.spec_cpu_boost_ghz: specs['boostClock'] = self.spec_cpu_boost_ghz
            if self.spec_cpu_tdp: specs['tdp'] = self.spec_cpu_tdp
            if self.spec_cpu_cache: specs['cache'] = self.spec_cpu_cache

        elif cat == 'motherboard':
            if self.spec_mb_socket: specs['socket'] = self.spec_mb_socket
            if self.spec_mb_form_factor: specs['formFactor'] = self.spec_mb_form_factor
            if self.spec_mb_ram_type: specs['ramType'] = self.spec_mb_ram_type
            if self.spec_mb_ram_slots: specs['ramSlots'] = self.spec_mb_ram_slots
            if self.spec_mb_m2_slots is not None: specs['m2Slots'] = self.spec_mb_m2_slots
            if self.spec_mb_pcie_slots: specs['pcieSlots'] = self.spec_mb_pcie_slots
            if self.spec_mb_chipset: specs['chipset'] = self.spec_mb_chipset

        elif cat == 'ram':
            if self.spec_ram_type: specs['type'] = self.spec_ram_type
            if self.spec_ram_capacity: specs['capacity'] = self.spec_ram_capacity
            if self.spec_ram_speed: specs['speed'] = self.spec_ram_speed
            if self.spec_ram_modules: specs['modules'] = self.spec_ram_modules
            if self.spec_ram_timing: specs['timing'] = self.spec_ram_timing

        elif cat == 'gpu':
            if self.spec_gpu_vram: specs['vram'] = self.spec_gpu_vram
            if self.spec_gpu_mem_type: specs['memType'] = self.spec_gpu_mem_type
            if self.spec_gpu_tdp: specs['tdp'] = self.spec_gpu_tdp
            if self.spec_gpu_length_mm: specs['length'] = self.spec_gpu_length_mm
            if self.spec_gpu_architecture: specs['architecture'] = self.spec_gpu_architecture
            if self.spec_gpu_outputs: specs['outputs'] = self.spec_gpu_outputs

        elif cat == 'psu':
            if self.spec_psu_wattage: specs['wattage'] = self.spec_psu_wattage
            if self.spec_psu_efficiency: specs['efficiency'] = self.spec_psu_efficiency
            if self.spec_psu_modular: specs['modular'] = self.spec_psu_modular

        elif cat == 'case':
            form_factors = []
            if self.spec_case_atx: form_factors.append('ATX')
            if self.spec_case_matx: form_factors.append('mATX')
            if self.spec_case_itx: form_factors.append('ITX')
            if self.spec_case_eatx: form_factors.append('E-ATX')
            if form_factors: specs['formFactors'] = form_factors
            if self.spec_case_max_gpu_mm: specs['maxGpuLength'] = self.spec_case_max_gpu_mm
            if self.spec_case_max_cooler_mm: specs['maxCoolerHeight'] = self.spec_case_max_cooler_mm
            if self.spec_case_drive_bays: specs['driveBays'] = self.spec_case_drive_bays
            if self.spec_case_fans_included: specs['fansIncluded'] = self.spec_case_fans_included

        elif cat == 'cooling':
            sockets = []
            if self.spec_cool_sock_am5: sockets.append('AM5')
            if self.spec_cool_sock_am4: sockets.append('AM4')
            if self.spec_cool_sock_lga1700: sockets.append('LGA1700')
            if self.spec_cool_sock_lga1200: sockets.append('LGA1200')
            if sockets: specs['sockets'] = sockets
            if self.spec_cool_type: specs['type'] = self.spec_cool_type
            if self.spec_cool_tdp_rating: specs['tdpRating'] = self.spec_cool_tdp_rating
            if self.spec_cool_height_mm: specs['height'] = self.spec_cool_height_mm
            if self.spec_cool_radiator_mm: specs['radiator'] = self.spec_cool_radiator_mm

        elif cat == 'storage':
            if self.spec_stor_type: specs['type'] = self.spec_stor_type
            if self.spec_stor_capacity: specs['capacity'] = self.spec_stor_capacity
            if self.spec_stor_read: specs['read'] = self.spec_stor_read
            if self.spec_stor_write: specs['write'] = self.spec_stor_write

        elif cat == 'laptop':
            if self.spec_laptop_cpu: specs['processor'] = self.spec_laptop_cpu
            if self.spec_laptop_gpu: specs['gpu'] = self.spec_laptop_gpu
            if self.spec_laptop_ram: specs['ram'] = self.spec_laptop_ram
            if self.spec_laptop_storage: specs['storage'] = self.spec_laptop_storage
            if self.spec_laptop_display: specs['display'] = self.spec_laptop_display
            if self.spec_laptop_battery: specs['battery'] = self.spec_laptop_battery
            if self.spec_laptop_os: specs['os'] = self.spec_laptop_os
            if self.spec_laptop_weight: specs['weight'] = self.spec_laptop_weight

        return specs

    def save(self, *args, **kwargs):
        self.specs = self._compute_specs()
        super().save(*args, **kwargs)

    def to_dict(self, request=None):
        cat = self.category.code if self.category else 'other'
        tags = [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else []

        images = []
        if self.image:
            url = request.build_absolute_uri(self.image.url) if request else self.image.url
            images.append(url)
        for extra in self.extra_images.all():
            if extra.image:
                url = request.build_absolute_uri(extra.image.url) if request else extra.image.url
                images.append(url)

        return {
            'id': f'{cat}-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'brand': self.brand or '',
            'price': round(self.price, 2),
            'category': cat,
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'tags': tags,
            'description': self.description or '',
            'specs': self.specs or {},
            'image': images[0] if images else None,
            'images': images,
            'is_only_one': self.is_only_one,
        }


class Component(Product):
    class Meta:
        proxy = True
        verbose_name = 'Composant (Menu Simplifié)'
        verbose_name_plural = 'Composants (Menu Simplifié)'

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='extra_images')
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return self.name


# ── Pre-built PC ──────────────────────────────────────────────────────────────

class Prebuilt(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier = models.CharField(max_length=50, blank=True, help_text='Budget / Mid-Range / High-End / Flagship')
    badge = models.CharField(max_length=100, blank=True)
    tag_line = models.CharField(max_length=255, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    review_count = models.IntegerField(default=0)
    stock_status = models.CharField(max_length=20, choices=STOCK_CHOICES, default='in_stock')
    brand = models.CharField(max_length=100, default='INSHOP')
    image = models.ImageField(upload_to='prebuilts/', blank=True, null=True)
    active = models.BooleanField(default=True)
    gaming_perf = models.CharField(max_length=100, blank=True, help_text='e.g. 1440p Ultra')
    workflow = models.CharField(max_length=100, blank=True, help_text='e.g. Video editing & streaming')
    specs = models.JSONField(default=dict, blank=True)

    cpu = models.CharField(max_length=100, blank=True)
    gpu = models.CharField(max_length=100, blank=True)
    ram = models.CharField(max_length=100, blank=True)
    storage = models.CharField(max_length=100, blank=True)
    psu = models.CharField(max_length=100, blank=True)
    case_name = models.CharField(max_length=100, blank=True, verbose_name='Case')
    cooling = models.CharField(max_length=100, blank=True)

    tech_cpu_socket = models.CharField(max_length=20, choices=SOCKET_CHOICES, blank=True)
    tech_ram_type = models.CharField(max_length=10, choices=RAM_TYPE_CHOICES, blank=True)
    tech_ram_capacity = models.CharField(max_length=30, blank=True)
    tech_ram_speed = models.IntegerField(null=True, blank=True)
    tech_storage_type = models.CharField(max_length=20, choices=STORAGE_TYPE_CHOICES, blank=True)
    tech_storage_capacity = models.CharField(max_length=30, blank=True)
    tech_gpu_vram = models.CharField(max_length=30, blank=True)
    tech_psu_wattage = models.IntegerField(null=True, blank=True)
    tech_psu_efficiency = models.CharField(max_length=20, choices=EFFICIENCY_CHOICES, blank=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return self.name

    def _compute_specs(self):
        raw = {
            'cpu': self.cpu, 'gpu': self.gpu, 'ram': self.ram,
            'storage': self.storage, 'psu': self.psu,
            'case': self.case_name, 'cooling': self.cooling,
            'socket': self.tech_cpu_socket,
            'ramType': self.tech_ram_type,
            'ramCapacity': self.tech_ram_capacity,
            'ramSpeed': self.tech_ram_speed,
            'storageType': self.tech_storage_type,
            'storageCapacity': self.tech_storage_capacity,
            'gpuVram': self.tech_gpu_vram,
            'wattage': self.tech_psu_wattage,
            'efficiency': self.tech_psu_efficiency,
        }
        return {k: v for k, v in raw.items() if v}

    def save(self, *args, **kwargs):
        self.specs = self._compute_specs()
        super().save(*args, **kwargs)

    def to_dict(self, request=None):
        tags = [t.strip().lower().replace(' ', '-') for t in self.badge.split(',') if t.strip()] if self.badge else []
        images = []
        if self.image:
            url = request.build_absolute_uri(self.image.url) if request else self.image.url
            images.append(url)
        for img in self.extra_images.all():
            if img.image:
                url = request.build_absolute_uri(img.image.url) if request else img.image.url
                images.append(url)
        return {
            'id': f'pre-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'price': round(self.price, 2),
            'category': 'prebuilt',
            'tier': self.tier or '',
            'badge': self.badge or '',
            'tag': self.tag_line or '',
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'brand': self.brand or 'INSHOP',
            'tags': tags,
            'image': images[0] if images else None,
            'images': images,
            'specs': self.specs or {},
            'gaming': self.gaming_perf or '',
            'workflow': self.workflow or '',
        }


class PrebuiltImage(models.Model):
    prebuilt = models.ForeignKey(Prebuilt, on_delete=models.CASCADE, related_name='extra_images')
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='prebuilts/')

    def __str__(self):
        return self.name


# ── Only One PC ───────────────────────────────────────────────────────────────

class OnlyOnePC(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    badge = models.CharField(max_length=100, blank=True)
    tag_line = models.CharField(max_length=255, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.8)
    review_count = models.IntegerField(default=0)
    stock_status = models.CharField(max_length=20, choices=STOCK_CHOICES, default='in_stock')
    image = models.ImageField(upload_to='onlyonepcs/', blank=True, null=True)
    active = models.BooleanField(default=True)
    specs = models.JSONField(default=dict, blank=True)

    cpu = models.CharField(max_length=100, blank=True)
    gpu = models.CharField(max_length=100, blank=True)
    ram = models.CharField(max_length=100, blank=True)
    storage = models.CharField(max_length=100, blank=True)
    psu = models.CharField(max_length=100, blank=True)
    case_name = models.CharField(max_length=100, blank=True, verbose_name='Case')
    cooling = models.CharField(max_length=100, blank=True)

    tech_cpu_socket = models.CharField(max_length=20, choices=SOCKET_CHOICES, blank=True)
    tech_ram_type = models.CharField(max_length=10, choices=RAM_TYPE_CHOICES, blank=True)
    tech_ram_capacity = models.CharField(max_length=30, blank=True)
    tech_ram_speed = models.IntegerField(null=True, blank=True)
    tech_storage_type = models.CharField(max_length=20, choices=STORAGE_TYPE_CHOICES, blank=True)
    tech_storage_capacity = models.CharField(max_length=30, blank=True)
    tech_gpu_vram = models.CharField(max_length=30, blank=True)
    tech_psu_wattage = models.IntegerField(null=True, blank=True)
    tech_psu_efficiency = models.CharField(max_length=20, choices=EFFICIENCY_CHOICES, blank=True)

    class Meta:
        ordering = ['price']
        verbose_name = 'Only One PC'
        verbose_name_plural = 'Only One PCs'

    def __str__(self):
        return self.name

    def _compute_specs(self):
        raw = {
            'cpu': self.cpu, 'gpu': self.gpu, 'ram': self.ram,
            'storage': self.storage, 'psu': self.psu,
            'case': self.case_name, 'cooling': self.cooling,
            'socket': self.tech_cpu_socket,
            'ramType': self.tech_ram_type,
            'ramCapacity': self.tech_ram_capacity,
            'ramSpeed': self.tech_ram_speed,
            'storageType': self.tech_storage_type,
            'storageCapacity': self.tech_storage_capacity,
            'gpuVram': self.tech_gpu_vram,
            'wattage': self.tech_psu_wattage,
            'efficiency': self.tech_psu_efficiency,
        }
        return {k: v for k, v in raw.items() if v}

    def save(self, *args, **kwargs):
        self.specs = self._compute_specs()
        super().save(*args, **kwargs)

    def to_dict(self, request=None):
        tags = [t.strip().lower().replace(' ', '-') for t in self.badge.split(',') if t.strip()] if self.badge else []
        images = []
        if self.image:
            url = request.build_absolute_uri(self.image.url) if request else self.image.url
            images.append(url)
        for img in self.extra_images.all():
            if img.image:
                url = request.build_absolute_uri(img.image.url) if request else img.image.url
                images.append(url)
        return {
            'id': f'one-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'price': round(self.price, 2),
            'category': 'onlyone',
            'badge': self.badge or '',
            'tag': self.tag_line or '',
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'tags': tags,
            'image': images[0] if images else None,
            'images': images,
            'specs': self.specs or {},
        }


class OnlyOnePCImage(models.Model):
    onlyone = models.ForeignKey(OnlyOnePC, on_delete=models.CASCADE, related_name='extra_images')
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='onlyonepcs/')

    def __str__(self):
        return self.name


# ── Reviews ───────────────────────────────────────────────────────────────────

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    prebuilt = models.ForeignKey(Prebuilt, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    onlyonepc = models.ForeignKey(OnlyOnePC, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        item = self.product or self.prebuilt or self.onlyonepc
        return f'{self.user} → {item} ({self.rating}/5)'

    def to_dict(self):
        return {
            'id': self.id,
            'user_name': self.user.get_display_name() or 'Anonyme',
            'rating': self.rating,
            'comment': self.comment or '',
            'date': self.date.strftime('%Y-%m-%d') if self.date else '',
        }


@receiver([post_save, post_delete], sender=Review)
def update_product_rating(sender, instance, **kwargs):
    if instance.product:
        product = instance.product
        reviews = list(product.reviews.values_list('rating', flat=True))
        count = len(reviews)
        avg = round(sum(reviews) / count, 1) if count else 0.0
        Product.objects.filter(pk=product.pk).update(rating=avg, review_count=count)
    elif instance.prebuilt:
        prebuilt = instance.prebuilt
        reviews = list(prebuilt.reviews.values_list('rating', flat=True))
        count = len(reviews)
        avg = round(sum(reviews) / count, 1) if count else 0.0
        Prebuilt.objects.filter(pk=prebuilt.pk).update(rating=avg, review_count=count)
    elif instance.onlyonepc:
        onlyonepc = instance.onlyonepc
        reviews = list(onlyonepc.reviews.values_list('rating', flat=True))
        count = len(reviews)
        avg = round(sum(reviews) / count, 1) if count else 0.0
        OnlyOnePC.objects.filter(pk=onlyonepc.pk).update(rating=avg, review_count=count)


# ── Contact ───────────────────────────────────────────────────────────────────

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    state = models.CharField(max_length=20, choices=[
        ('new', 'Nouveau'), ('read', 'Lu'), ('replied', 'Répondu'),
    ], default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.subject or "Sans sujet"}'


# ── Site Configuration ────────────────────────────────────────────────────────

class SiteConfig(models.Model):
    name = models.CharField(max_length=100, default='INSHOP BUILDER')
    contact_email = models.EmailField(blank=True, default='contact@inshop-builder.com')
    contact_phone = models.CharField(max_length=50, blank=True, default='+33 1 23 45 67 89')
    contact_address = models.TextField(blank=True, default='123 Rue de la Technologie, 75000 Paris')
    contact_opening_hours = models.TextField(blank=True, default='Lun-Ven: 9h - 18h\nSam: 10h - 17h')
    social_facebook = models.URLField(blank=True)
    social_twitter = models.URLField(blank=True)
    social_instagram = models.URLField(blank=True)
    social_linkedin = models.URLField(blank=True)
    map_lat = models.FloatField(null=True, blank=True)
    map_lng = models.FloatField(null=True, blank=True)
    hero_title = models.CharField(max_length=255, default='CONSTRUISEZ VOTRE PC DE RÊVE')
    hero_subtitle = models.TextField(
        default='Des composants de haute performance pour une expérience gaming ultime.'
    )

    class Meta:
        verbose_name = 'Site Configuration'

    def __str__(self):
        return self.name

    def to_dict(self):
        return {
            'name': self.name,
            'email': self.contact_email,
            'phone': self.contact_phone,
            'address': self.contact_address,
            'opening_hours': self.contact_opening_hours,
            'lat': self.map_lat,
            'lng': self.map_lng,
            'social': {
                'facebook': self.social_facebook or None,
                'twitter': self.social_twitter or None,
                'instagram': self.social_instagram or None,
                'linkedin': self.social_linkedin or None,
            },
            'hero': {
                'title': self.hero_title,
                'subtitle': self.hero_subtitle,
            },
        }


# ── Orders ────────────────────────────────────────────────────────────────────

class Order(models.Model):
    DELIVERY_CHOICES = [
        ('processing', 'En traitement'),
        ('preparing', 'En préparation'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
    ]
    STATE_CHOICES = [
        ('draft', 'Panier'),
        ('sale', 'Confirmée'),
        ('done', 'Terminée'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    session_key = models.CharField(max_length=40, blank=True)
    state = models.CharField(max_length=10, choices=STATE_CHOICES, default='draft')
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default='processing')
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    shipping_name = models.CharField(max_length=100, blank=True)
    shipping_email = models.EmailField(blank=True)
    shipping_phone = models.CharField(max_length=50, blank=True)
    shipping_address = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_zip = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'SO{self.id:05d} ({self.get_state_display()})'

    @property
    def name(self):
        return f'SO{self.id:05d}'

    def compute_total(self):
        self.total = sum(item.subtotal for item in self.items.all())

    def to_dict(self, full=False, request=None):
        data = {
            'id': self.id,
            'name': self.name,
            'state': self.state,
            'total': round(self.total, 2),
            'pc_delivery_status': self.delivery_status,
            'items': [item.to_dict(request=request) for item in self.items.select_related('product__category').all()],
        }
        if full:
            ts = self.confirmed_at or self.created_at
            data['date'] = ts.isoformat() if ts else None
        return data


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    product_template_id = models.IntegerField(null=True, blank=True)
    qty = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.qty * self.price

    def to_dict(self, request=None):
        img_url = None
        category = 'other'
        if self.product:
            if self.product.image:
                img_url = request.build_absolute_uri(self.product.image.url) if request else self.product.image.url
            if self.product.category:
                category = self.product.category.code

        return {
            'product_id': self.product_template_id or (self.product.id if self.product else None),
            'name': self.product_name,
            'qty': self.qty,
            'price': round(self.price, 2),
            'subtotal': round(self.subtotal, 2),
            'image_url': img_url,
            'category': category,
        }
