from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Category, Product, ProductImage, Component,
    Prebuilt, PrebuiltImage, OnlyOnePC, OnlyOnePCImage,
    Review, ContactMessage, SiteConfig, Order, OrderItem,
)

admin.site.site_header = 'INSHOP BUILDER Admin'
admin.site.site_title = 'INSHOP Admin'
admin.site.index_title = 'Gestion INSHOP BUILDER'


import csv
import io
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponse

class ImportExportMixin:
    actions = ['export_as_csv']
    # Set to 'products', 'prebuilts', or 'onlyonepcs' on subclasses to enable XLS import
    xls_import_model_type = None

    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields if not field.many_to_many and not field.one_to_many]

        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename={meta.model_name}_export.csv'
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = []
            for field in field_names:
                val = getattr(obj, field)
                if val is None:
                    row.append('')
                else:
                    row.append(str(val))
            writer.writerow(row)
        return response

    export_as_csv.short_description = "Exporter la sélection en CSV"

    def get_urls(self):
        urls = super().get_urls()
        app = self.model._meta.app_label
        model = self.model._meta.model_name
        custom_urls = [
            path('import-csv/', self.admin_site.admin_view(self.import_csv_view), name=f'{app}_{model}_import_csv'),
        ]
        if self.xls_import_model_type:
            custom_urls.append(
                path('import-xls/', self.admin_site.admin_view(self.import_xls_view), name=f'{app}_{model}_import_xls'),
            )
            custom_urls.append(
                path('import-xls/template/', self.admin_site.admin_view(self.import_xls_template_view), name=f'{app}_{model}_import_xls_template'),
            )
        return custom_urls + urls

    def import_csv_view(self, request):
        if request.method == "POST":
            csv_file = request.FILES.get("csv_file")
            if not csv_file or not csv_file.name.endswith('.csv'):
                messages.error(request, "Veuillez téléverser un fichier CSV valide.")
                return redirect("..")

            try:
                file_data = csv_file.read().decode("utf-8-sig", errors="ignore")
                io_string = io.StringIO(file_data)
                reader = csv.reader(io_string)

                headers = next(reader)
                headers = [h.strip().lower() for h in headers]

                success_count = 0
                error_count = 0

                for row in reader:
                    if not row:
                        continue
                    row_data = dict(zip(headers, row))

                    try:
                        obj_id = row_data.get('id')
                        field_values = {}
                        for field in self.model._meta.fields:
                            field_name = field.name
                            if field_name == 'id' or field.many_to_many or field.one_to_many:
                                continue

                            if field_name in row_data:
                                val = row_data[field_name].strip()
                                if field.is_relation and field.related_model:
                                    if val:
                                        if field.related_model.__name__ == 'Category':
                                            rel_obj = field.related_model.objects.filter(code=val).first() or \
                                                      field.related_model.objects.filter(name=val).first() or \
                                                      field.related_model.objects.filter(id=int(val) if val.isdigit() else None).first()
                                        else:
                                            rel_obj = field.related_model.objects.filter(id=int(val) if val.isdigit() else None).first()
                                        field_values[field_name] = rel_obj
                                    else:
                                        field_values[field_name] = None
                                elif field.get_internal_type() == 'BooleanField':
                                    field_values[field_name] = val.lower() in ('true', '1', 'yes', 'o', 'oui')
                                elif field.get_internal_type() in ('IntegerField', 'FloatField', 'DecimalField'):
                                    field_values[field_name] = val if val else 0
                                else:
                                    field_values[field_name] = val

                        if obj_id and obj_id.isdigit():
                            self.model.objects.update_or_create(id=int(obj_id), defaults=field_values)
                        else:
                            name_val = row_data.get('name')
                            if name_val:
                                self.model.objects.update_or_create(name=name_val, defaults=field_values)
                            else:
                                self.model.objects.create(**field_values)

                        success_count += 1
                    except Exception as row_err:
                        error_count += 1
                        continue

                messages.success(request, f"Importation réussie : {success_count} enregistrements importés. {error_count} erreurs.")
            except Exception as e:
                messages.error(request, f"Erreur lors du traitement du fichier : {str(e)}")

            return redirect("..")

        context = {
            **self.admin_site.each_context(request),
            'title': f"Importer des {self.model._meta.verbose_name_plural}",
            'opts': self.model._meta,
        }
        return render(request, "admin/import_csv.html", context)

    def import_xls_view(self, request):
        from . import importers

        result = None
        if request.method == "POST":
            xls_file = request.FILES.get("xls_file")
            if not xls_file or not xls_file.name.lower().endswith(('.xls', '.xlsx')):
                messages.error(request, "Veuillez téléverser un fichier .xls ou .xlsx valide.")
            else:
                try:
                    file_bytes = xls_file.read()
                    fn_map = {
                        'products': importers.import_products,
                        'prebuilts': importers.import_prebuilts,
                        'onlyonepcs': importers.import_onlyonepcs,
                    }
                    result = fn_map[self.xls_import_model_type](file_bytes)
                    if result['errors']:
                        messages.warning(
                            request,
                            f"{result['created']} créé(s), {result['updated']} mis à jour. "
                            f"{len(result['errors'])} erreur(s) — voir les détails ci-dessous.",
                        )
                    else:
                        messages.success(
                            request,
                            f"Import XLS réussi : {result['created']} créé(s), {result['updated']} mis à jour.",
                        )
                except Exception as exc:
                    messages.error(request, f"Erreur lors du traitement : {exc}")

        context = {
            **self.admin_site.each_context(request),
            'title': f"Importer des {self.model._meta.verbose_name_plural} via XLS",
            'opts': self.model._meta,
            'model_type': self.xls_import_model_type,
            'result': result,
        }
        return render(request, "admin/import_xls.html", context)

    def import_xls_template_view(self, request):
        from . import importers

        xlsx_bytes = importers.generate_template(self.xls_import_model_type)
        resp = HttpResponse(
            xlsx_bytes,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        resp['Content-Disposition'] = f'attachment; filename="template_{self.xls_import_model_type}.xlsx"'
        return resp


# ── User ──────────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations client', {'fields': ('phone', 'street')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'phone', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')


# ── Category ──────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(ImportExportMixin, admin.ModelAdmin):
    list_display = ('code', 'name', 'type', 'peri_group', 'icon', 'sequence', 'active')
    list_editable = ('sequence', 'active')
    list_filter = ('type', 'active')
    search_fields = ('name', 'code')
    ordering = ('sequence', 'id')


# ── Product ───────────────────────────────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class CPUSpecsFieldset:
    pass


@admin.register(Product)
class ProductAdmin(ImportExportMixin, admin.ModelAdmin):
    xls_import_model_type = 'products'
    change_list_template = 'admin/change_list_xls.html'
    inlines = [ProductImageInline]
    list_display = ('name', 'brand', 'category', 'price', 'stock_status', 'is_only_one', 'rating', 'active')
    list_editable = ('price', 'stock_status', 'active')
    list_filter = ('category__type', 'category', 'stock_status', 'is_only_one', 'active')
    search_fields = ('name', 'brand', 'tags')
    ordering = ('name',)
    readonly_fields = ('specs', 'rating', 'review_count')

    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'brand', 'price', 'category', 'stock_status', 'tags', 'is_only_one', 'active', 'image', 'description')
        }),
        ('Stats', {
            'fields': ('rating', 'review_count', 'specs'),
            'classes': ('collapse',),
        }),
        ('Specs CPU', {
            'fields': ('spec_cpu_socket', 'spec_cpu_cores', 'spec_cpu_threads',
                       'spec_cpu_base_ghz', 'spec_cpu_boost_ghz', 'spec_cpu_tdp', 'spec_cpu_cache'),
            'classes': ('collapse',),
        }),
        ('Specs Carte mère', {
            'fields': ('spec_mb_socket', 'spec_mb_form_factor', 'spec_mb_ram_type',
                       'spec_mb_ram_slots', 'spec_mb_m2_slots', 'spec_mb_pcie_slots', 'spec_mb_chipset'),
            'classes': ('collapse',),
        }),
        ('Specs RAM', {
            'fields': ('spec_ram_type', 'spec_ram_capacity', 'spec_ram_speed',
                       'spec_ram_modules', 'spec_ram_timing'),
            'classes': ('collapse',),
        }),
        ('Specs GPU', {
            'fields': ('spec_gpu_vram', 'spec_gpu_mem_type', 'spec_gpu_tdp',
                       'spec_gpu_length_mm', 'spec_gpu_architecture', 'spec_gpu_outputs'),
            'classes': ('collapse',),
        }),
        ('Specs PSU', {
            'fields': ('spec_psu_wattage', 'spec_psu_efficiency', 'spec_psu_modular'),
            'classes': ('collapse',),
        }),
        ('Specs Boîtier', {
            'fields': ('spec_case_atx', 'spec_case_matx', 'spec_case_itx', 'spec_case_eatx',
                       'spec_case_max_gpu_mm', 'spec_case_max_cooler_mm',
                       'spec_case_drive_bays', 'spec_case_fans_included'),
            'classes': ('collapse',),
        }),
        ('Specs Refroidissement', {
            'fields': ('spec_cool_type', 'spec_cool_tdp_rating', 'spec_cool_height_mm',
                       'spec_cool_radiator_mm', 'spec_cool_sock_am5', 'spec_cool_sock_am4',
                       'spec_cool_sock_lga1700', 'spec_cool_sock_lga1200'),
            'classes': ('collapse',),
        }),
        ('Specs Stockage', {
            'fields': ('spec_stor_type', 'spec_stor_capacity', 'spec_stor_read', 'spec_stor_write'),
            'classes': ('collapse',),
        }),
        ('Specs PC Portable', {
            'fields': ('spec_laptop_cpu', 'spec_laptop_gpu', 'spec_laptop_ram',
                       'spec_laptop_storage', 'spec_laptop_display', 'spec_laptop_battery',
                       'spec_laptop_os', 'spec_laptop_weight'),
            'classes': ('collapse',),
        }),
    )

@admin.register(Component)
class ComponentAdmin(ImportExportMixin, admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ('name', 'brand', 'category', 'price', 'stock_status', 'active')
    list_editable = ('price', 'stock_status', 'active')
    list_filter = ('category', 'brand', 'stock_status', 'active')
    search_fields = ('name', 'brand', 'description')
    ordering = ('category', 'name')
    
    # Menu simplifié pour les composants
    fieldsets = (
        ('📱 Essentiel', {
            'fields': ('name', 'brand', 'category', 'price', 'stock_status', 'active', 'image', 'description')
        }),
        ('⚙️ Caractéristiques techniques', {
            'description': "Remplissez uniquement les champs correspondant au type de composant sélectionné.",
            'fields': (
                # CPU
                'spec_cpu_socket', 'spec_cpu_cores', 'spec_cpu_threads', 'spec_cpu_tdp',
                # Motherboard
                'spec_mb_socket', 'spec_mb_form_factor', 'spec_mb_ram_type',
                # RAM
                'spec_ram_type', 'spec_ram_capacity', 'spec_ram_speed',
                # GPU
                'spec_gpu_vram', 'spec_gpu_tdp', 'spec_gpu_length_mm',
                # PSU
                'spec_psu_wattage', 'spec_psu_efficiency',
                # Storage
                'spec_stor_type', 'spec_stor_capacity',
                # Case
                'spec_case_atx', 'spec_case_matx', 'spec_case_itx',
            )
        }),
        ('📁 Tags & Autres', {
            'fields': ('tags', 'is_only_one'),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        # On filtre pour ne montrer que les produits de type 'component'
        return super().get_queryset(request).filter(category__type='component')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # On restreint la sélection aux catégories de type 'component'
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.filter(type='component')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# ── Prebuilt ──────────────────────────────────────────────────────────────────

class PrebuiltImageInline(admin.TabularInline):
    model = PrebuiltImage
    extra = 1


@admin.register(Prebuilt)
class PrebuiltAdmin(ImportExportMixin, admin.ModelAdmin):
    xls_import_model_type = 'prebuilts'
    change_list_template = 'admin/change_list_xls.html'
    inlines = [PrebuiltImageInline]
    list_display = ('name', 'tier', 'price', 'brand', 'stock_status', 'rating', 'active')
    list_editable = ('price', 'stock_status', 'active')
    list_filter = ('stock_status', 'active', 'brand')
    search_fields = ('name', 'tier', 'badge', 'cpu', 'gpu')
    ordering = ('price',)
    readonly_fields = ('specs',)

    fieldsets = (
        ('Informations', {
            'fields': ('name', 'tier', 'badge', 'tag_line', 'price', 'brand',
                       'stock_status', 'rating', 'review_count', 'gaming_perf', 'workflow', 'image', 'active')
        }),
        ('Composants (affichage)', {
            'fields': ('cpu', 'gpu', 'ram', 'storage', 'psu', 'case_name', 'cooling'),
        }),
        ('Specs techniques', {
            'fields': ('tech_cpu_socket', 'tech_ram_type', 'tech_ram_capacity', 'tech_ram_speed',
                       'tech_storage_type', 'tech_storage_capacity', 'tech_gpu_vram',
                       'tech_psu_wattage', 'tech_psu_efficiency'),
            'classes': ('collapse',),
        }),
        ('JSON généré', {
            'fields': ('specs',),
            'classes': ('collapse',),
        }),
    )


# ── Only One PC ───────────────────────────────────────────────────────────────

class OnlyOnePCImageInline(admin.TabularInline):
    model = OnlyOnePCImage
    extra = 1


@admin.register(OnlyOnePC)
class OnlyOnePCAdmin(ImportExportMixin, admin.ModelAdmin):
    xls_import_model_type = 'onlyonepcs'
    change_list_template = 'admin/change_list_xls.html'
    inlines = [OnlyOnePCImageInline]
    list_display = ('name', 'price', 'stock_status', 'rating', 'active')
    list_editable = ('price', 'stock_status', 'active')
    list_filter = ('stock_status', 'active')
    search_fields = ('name', 'badge', 'cpu', 'gpu')
    ordering = ('price',)
    readonly_fields = ('specs',)

    fieldsets = (
        ('Informations', {
            'fields': ('name', 'badge', 'tag_line', 'price', 'stock_status',
                       'rating', 'review_count', 'image', 'active')
        }),
        ('Composants', {
            'fields': ('cpu', 'gpu', 'ram', 'storage', 'psu', 'case_name', 'cooling'),
        }),
        ('Specs techniques', {
            'fields': ('tech_cpu_socket', 'tech_ram_type', 'tech_ram_capacity', 'tech_ram_speed',
                       'tech_storage_type', 'tech_storage_capacity', 'tech_gpu_vram',
                       'tech_psu_wattage', 'tech_psu_efficiency'),
            'classes': ('collapse',),
        }),
    )


# ── Reviews ───────────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'date')
    list_filter = ('rating',)
    search_fields = ('product__name', 'user__email', 'comment')
    ordering = ('-date',)
    readonly_fields = ('date',)


# ── Contact ───────────────────────────────────────────────────────────────────

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'state', 'created_at')
    list_editable = ('state',)
    list_filter = ('state',)
    search_fields = ('name', 'email', 'subject', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


# ── Site Config ───────────────────────────────────────────────────────────────

@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Général', {'fields': ('name', 'hero_title', 'hero_subtitle')}),
        ('Contact', {'fields': ('contact_email', 'contact_phone', 'contact_address', 'contact_opening_hours')}),
        ('Localisation carte', {'fields': ('map_lat', 'map_lng')}),
        ('Réseaux sociaux', {'fields': ('social_facebook', 'social_twitter', 'social_instagram', 'social_linkedin')}),
    )

    def has_add_permission(self, request):
        return not SiteConfig.objects.exists()


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_template_id', 'price', 'subtotal')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('name', 'user', 'state', 'delivery_status', 'total', 'created_at', 'confirmed_at')
    list_filter = ('state', 'delivery_status')
    search_fields = ('user__email', 'shipping_name', 'shipping_email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'confirmed_at', 'total', 'name')

    fieldsets = (
        ('Commande', {
            'fields': ('name', 'user', 'state', 'delivery_status', 'total', 'created_at', 'confirmed_at')
        }),
        ('Livraison', {
            'fields': ('shipping_name', 'shipping_email', 'shipping_phone',
                       'shipping_address', 'shipping_city', 'shipping_zip'),
        }),
    )

    actions = ['mark_preparing', 'mark_shipped', 'mark_delivered']

    @admin.action(description='Marquer En préparation')
    def mark_preparing(self, request, queryset):
        queryset.update(delivery_status='preparing')

    @admin.action(description='Marquer Expédiée')
    def mark_shipped(self, request, queryset):
        queryset.update(delivery_status='shipped')

    @admin.action(description='Marquer Livrée')
    def mark_delivered(self, request, queryset):
        queryset.update(delivery_status='delivered')
