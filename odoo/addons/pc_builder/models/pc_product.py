import json
from odoo import models, fields, api


class PcCategory(models.Model):
    _name = 'pc.category'
    _description = 'PC Category'
    _order = 'sequence, id'

    sequence = fields.Integer(string="Sequence", default=10)
    name = fields.Char('Nom', required=True, translate=True)
    code = fields.Char('Code', required=True, help='Ex: keyboard, cpu, gpu')
    type = fields.Selection([
        ('component', 'Composant interne'),
        ('peripheral', 'Périphérique'),
        ('laptop', 'Ordinateur portable'),
        ('other', 'Autre')
    ], string='Type', default='peripheral', required=True)
    
    peri_group = fields.Selection([
        ('input', 'Entrée (Input)'),
        ('output', 'Sortie (Output)'),
        ('mixed', 'E/S (Entrée/Sortie)'),
    ], string='Groupe de périphériques', help='Seulement pour les périphériques')
    
    icon = fields.Char('Icône', help='Emoji ou code icône (ex: ⌨️, 🖱️)')
    sequence = fields.Integer('Séquence', default=10)
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'Le code de la catégorie doit être unique !')
    ]

    def name_get(self):
        result = []
        for rec in self:
            name = f"[{rec.code}] {rec.name}" if rec.code else rec.name
            result.append((rec.id, name))
        return result


SOCKET_LIST = [
    ('AM5', 'AM5 (AMD Ryzen 7000+)'),
    ('AM4', 'AM4 (AMD Ryzen 3000/5000)'),
    ('LGA1700', 'LGA1700 (Intel 12th/13th/14th Gen)'),
    ('LGA1200', 'LGA1200 (Intel 10th/11th Gen)'),
    ('LGA1151', 'LGA1151 (Intel 8th/9th Gen)'),
    ('TR5', 'TR5 (AMD Threadripper 7000)'),
    ('TRX40', 'TRX40 (AMD Threadripper 3000)'),
]

RAM_TYPE_LIST = [
    ('DDR5', 'DDR5'),
    ('DDR4', 'DDR4'),
    ('DDR3', 'DDR3'),
    ('LPDDR5', 'LPDDR5'),
    ('LPDDR4', 'LPDDR4'),
]

FORM_FACTOR_LIST = [
    ('ATX',   'ATX'),
    ('mATX',  'Micro-ATX (mATX)'),
    ('ITX',   'Mini-ITX (ITX)'),
    ('E-ATX', 'Extended ATX (E-ATX)'),
]

STORAGE_TYPE_LIST = [
    ('NVMe', 'NVMe M.2'),
    ('SATA', 'SATA SSD'),
    ('HDD',  'HDD (Disque dur)'),
    ('SATA M.2', 'SATA M.2'),
]

MODULAR_LIST = [
    ('Fully Modular',   'Totalement modulaire'),
    ('Semi-Modular',    'Semi-modulaire'),
    ('Non-Modular',     'Non modulaire'),
]

EFFICIENCY_LIST = [
    ('80+ Titanium', '80+ Titanium'),
    ('80+ Platinum', '80+ Platinum'),
    ('80+ Gold',     '80+ Gold'),
    ('80+ Silver',   '80+ Silver'),
    ('80+ Bronze',   '80+ Bronze'),
    ('80+',          '80+'),
]

COOLING_TYPE_LIST = [
    ('Air',     'Refroidissement à air'),
    ('AIO 120', 'Watercooling AIO 120mm'),
    ('AIO 240', 'Watercooling AIO 240mm'),
    ('AIO 280', 'Watercooling AIO 280mm'),
    ('AIO 360', 'Watercooling AIO 360mm'),
    ('Custom',  'Watercooling custom'),
]

GPU_ARCH_LIST = [
    ('Ada Lovelace',  'NVIDIA Ada Lovelace (RTX 40xx)'),
    ('Ampere',        'NVIDIA Ampere (RTX 30xx)'),
    ('Turing',        'NVIDIA Turing (RTX 20xx)'),
    ('RDNA 4',        'AMD RDNA 4 (RX 9000)'),
    ('RDNA 3',        'AMD RDNA 3 (RX 7000)'),
    ('RDNA 2',        'AMD RDNA 2 (RX 6000)'),
    ('Arc Battlemage','Intel Arc Battlemage'),
    ('Arc Alchemist', 'Intel Arc Alchemist'),
]


class PcProductImage(models.Model):
    _name = 'pc.product.image'
    _description = 'Extra Product Image'

    name = fields.Char("Name", required=True)
    image_1920 = fields.Image("Image", max_width=1920, max_height=1920, required=True)
    product_tmpl_id = fields.Many2one('product.template', "Product", index=True, ondelete='cascade')


class PcProductTemplate(models.Model):
    _inherit = 'product.template'

    type = fields.Selection(selection_add=[('consu', 'Consumable')], default='consu')

    pc_category_id = fields.Many2one('pc.category', string='Catégorie PC', index=True)
    pc_category = fields.Char(related='pc_category_id.code', store=True, readonly=True, string='Code Catégorie')
    pc_brand = fields.Char('Marque')
    pc_is_only_one = fields.Boolean('Composant Only One PC', default=False)
    pc_tags = fields.Char('Tags', help='Tags séparés par des virgules, ex: gaming,bestseller')
    pc_stock_status = fields.Selection(
        [('in_stock', 'En stock'), ('low_stock', 'Stock limité'), ('out_of_stock', 'Rupture de stock')],
        string='État du stock', default='in_stock',
    )
    pc_review_ids = fields.One2many('pc.review', 'product_id', string='Avis clients')
    pc_extra_image_ids = fields.One2many('pc.product.image', 'product_tmpl_id', string='Images supplémentaires')
    pc_rating = fields.Float('Note', digits=(3, 1), compute='_compute_rating', store=True)
    pc_review_count = fields.Integer('Avis', compute='_compute_rating', store=True)

    # ── Champ JSON calculé automatiquement ─────────────────────────────────
    pc_specs = fields.Text('Specs (JSON)', compute='_compute_pc_specs', store=True, readonly=False,
                           help='Généré automatiquement depuis les champs de specs ci-dessous.')

    # ── CPU ─────────────────────────────────────────────────────────────────
    spec_cpu_socket    = fields.Selection(SOCKET_LIST,  string='Socket CPU')
    spec_cpu_cores     = fields.Integer('Nombre de cœurs')
    spec_cpu_threads   = fields.Integer('Nombre de threads')
    spec_cpu_base_ghz  = fields.Char('Fréquence de base', help='Ex: 3.8GHz')
    spec_cpu_boost_ghz = fields.Char('Fréquence boost',  help='Ex: 5.6GHz')
    spec_cpu_tdp       = fields.Integer('TDP (W)')
    spec_cpu_cache     = fields.Char('Cache L3', help='Ex: 32MB')

    # ── Carte mère ───────────────────────────────────────────────────────────
    spec_mb_socket      = fields.Selection(SOCKET_LIST,       string='Socket carte mère')
    spec_mb_form_factor = fields.Selection(FORM_FACTOR_LIST,  string='Format')
    spec_mb_ram_type    = fields.Selection(RAM_TYPE_LIST,     string='Type RAM supporté')
    spec_mb_ram_slots   = fields.Integer('Slots RAM')
    spec_mb_m2_slots    = fields.Integer('Slots M.2')
    spec_mb_pcie_slots  = fields.Integer('Slots PCIe x16')
    spec_mb_chipset     = fields.Char('Chipset', help='Ex: Z790, B650, X670E')

    # ── RAM ──────────────────────────────────────────────────────────────────
    spec_ram_type     = fields.Selection(RAM_TYPE_LIST, string='Type DDR')
    spec_ram_capacity = fields.Char('Capacité totale', help='Ex: 32GB, 64GB')
    spec_ram_speed    = fields.Integer('Fréquence (MHz)', help='Ex: 6000')
    spec_ram_modules  = fields.Integer('Nombre de barrettes', help='Ex: 2 (kit 2x16GB)')
    spec_ram_timing   = fields.Char('Timing', help='Ex: CL30')

    # ── GPU ──────────────────────────────────────────────────────────────────
    spec_gpu_vram        = fields.Char('VRAM', help='Ex: 16GB, 24GB')
    spec_gpu_mem_type    = fields.Char('Type mémoire GPU', help='Ex: GDDR6X, GDDR7')
    spec_gpu_tdp         = fields.Integer('TDP GPU (W)')
    spec_gpu_length_mm   = fields.Integer('Longueur (mm)')
    spec_gpu_architecture= fields.Selection(GPU_ARCH_LIST, string='Architecture')
    spec_gpu_outputs     = fields.Char('Sorties vidéo', help='Ex: 3x DisplayPort 1.4, 1x HDMI 2.1')

    # ── PSU ──────────────────────────────────────────────────────────────────
    spec_psu_wattage    = fields.Integer('Puissance (W)')
    spec_psu_efficiency = fields.Selection(EFFICIENCY_LIST, string='Certification')
    spec_psu_modular    = fields.Selection(MODULAR_LIST,    string='Modularité')

    # ── Boîtier ──────────────────────────────────────────────────────────────
    spec_case_atx   = fields.Boolean('Supporte ATX',       default=True)
    spec_case_matx  = fields.Boolean('Supporte Micro-ATX', default=True)
    spec_case_itx   = fields.Boolean('Supporte Mini-ITX',  default=True)
    spec_case_eatx  = fields.Boolean('Supporte E-ATX',     default=False)
    spec_case_max_gpu_mm    = fields.Integer('Longueur GPU max (mm)')
    spec_case_max_cooler_mm = fields.Integer('Hauteur ventirad max (mm)')
    spec_case_drive_bays    = fields.Integer('Baies de stockage 3.5"')
    spec_case_fans_included = fields.Integer('Ventilateurs inclus')

    # ── Refroidissement ───────────────────────────────────────────────────────
    spec_cool_type       = fields.Selection(COOLING_TYPE_LIST, string='Type de refroidissement')
    spec_cool_tdp_rating = fields.Integer('TDP supporté (W)')
    spec_cool_height_mm  = fields.Integer('Hauteur ventirad (mm)', help='Pour les refroidisseurs à air')
    spec_cool_radiator_mm= fields.Integer('Taille radiateur (mm)', help='Pour les AIO')
    spec_cool_sock_am5   = fields.Boolean('Socket AM5')
    spec_cool_sock_am4   = fields.Boolean('Socket AM4')
    spec_cool_sock_lga1700 = fields.Boolean('Socket LGA1700')
    spec_cool_sock_lga1200 = fields.Boolean('Socket LGA1200')

    # ── Stockage ─────────────────────────────────────────────────────────────
    spec_stor_type     = fields.Selection(STORAGE_TYPE_LIST, string='Type de stockage')
    spec_stor_capacity = fields.Char('Capacité', help='Ex: 1TB, 2TB, 4TB')
    spec_stor_read     = fields.Char('Vitesse lecture séq.', help='Ex: 7400MB/s')
    spec_stor_write    = fields.Char('Vitesse écriture séq.', help='Ex: 6900MB/s')

    # ── PC Portable (informationnel) ──────────────────────────────────────────
    spec_laptop_cpu     = fields.Char('Processeur', help='Ex: Intel Core i7-13700H')
    spec_laptop_gpu     = fields.Char('Carte graphique', help='Ex: RTX 4060 Laptop')
    spec_laptop_ram     = fields.Char('Mémoire RAM', help='Ex: 16GB DDR5')
    spec_laptop_storage = fields.Char('Stockage', help='Ex: 512GB NVMe SSD')
    spec_laptop_display = fields.Char('Écran', help='Ex: 15.6" FHD 144Hz')
    spec_laptop_battery = fields.Char('Batterie', help='Ex: 72Wh')
    spec_laptop_os      = fields.Char('Système d\'exploitation', help='Ex: Windows 11')
    spec_laptop_weight  = fields.Char('Poids', help='Ex: 2.1 kg')

    @api.depends('pc_review_ids.rating')
    def _compute_rating(self):
        for product in self:
            reviews = product.pc_review_ids
            product.pc_review_count = len(reviews)
            product.pc_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0

    # ── Génération automatique du JSON ───────────────────────────────────────
    @api.depends(
        'pc_category_id',
        'spec_cpu_socket', 'spec_cpu_cores', 'spec_cpu_threads',
        'spec_cpu_base_ghz', 'spec_cpu_boost_ghz', 'spec_cpu_tdp', 'spec_cpu_cache',
        'spec_mb_socket', 'spec_mb_form_factor', 'spec_mb_ram_type',
        'spec_mb_ram_slots', 'spec_mb_m2_slots', 'spec_mb_chipset', 'spec_mb_pcie_slots',
        'spec_ram_type', 'spec_ram_capacity', 'spec_ram_speed', 'spec_ram_modules', 'spec_ram_timing',
        'spec_gpu_vram', 'spec_gpu_mem_type', 'spec_gpu_tdp', 'spec_gpu_length_mm',
        'spec_gpu_architecture', 'spec_gpu_outputs',
        'spec_psu_wattage', 'spec_psu_efficiency', 'spec_psu_modular',
        'spec_case_atx', 'spec_case_matx', 'spec_case_itx', 'spec_case_eatx',
        'spec_case_max_gpu_mm', 'spec_case_max_cooler_mm',
        'spec_case_drive_bays', 'spec_case_fans_included',
        'spec_cool_type', 'spec_cool_tdp_rating', 'spec_cool_height_mm',
        'spec_cool_radiator_mm', 'spec_cool_sock_am5', 'spec_cool_sock_am4',
        'spec_cool_sock_lga1700', 'spec_cool_sock_lga1200',
        'spec_stor_type', 'spec_stor_capacity', 'spec_stor_read', 'spec_stor_write',
        'spec_laptop_cpu', 'spec_laptop_gpu', 'spec_laptop_ram', 'spec_laptop_storage',
        'spec_laptop_display', 'spec_laptop_battery', 'spec_laptop_os', 'spec_laptop_weight',
    )
    def _compute_pc_specs(self):
        for p in self:
            cat = p.pc_category
            specs = {}

            if cat == 'cpu':
                if p.spec_cpu_socket:    specs['socket']     = p.spec_cpu_socket
                if p.spec_cpu_cores:     specs['cores']      = p.spec_cpu_cores
                if p.spec_cpu_threads:   specs['threads']    = p.spec_cpu_threads
                if p.spec_cpu_base_ghz:  specs['baseClock']  = p.spec_cpu_base_ghz
                if p.spec_cpu_boost_ghz: specs['boostClock'] = p.spec_cpu_boost_ghz
                if p.spec_cpu_tdp:       specs['tdp']        = p.spec_cpu_tdp
                if p.spec_cpu_cache:     specs['cache']      = p.spec_cpu_cache

            elif cat == 'motherboard':
                if p.spec_mb_socket:       specs['socket']      = p.spec_mb_socket
                if p.spec_mb_form_factor:  specs['formFactor']  = p.spec_mb_form_factor
                if p.spec_mb_ram_type:     specs['ramType']     = p.spec_mb_ram_type
                if p.spec_mb_ram_slots:    specs['ramSlots']    = p.spec_mb_ram_slots
                if p.spec_mb_m2_slots is not None: specs['m2Slots'] = p.spec_mb_m2_slots
                if p.spec_mb_pcie_slots:   specs['pcieSlots']   = p.spec_mb_pcie_slots
                if p.spec_mb_chipset:      specs['chipset']     = p.spec_mb_chipset

            elif cat == 'ram':
                if p.spec_ram_type:     specs['type']     = p.spec_ram_type
                if p.spec_ram_capacity: specs['capacity'] = p.spec_ram_capacity
                if p.spec_ram_speed:    specs['speed']    = p.spec_ram_speed
                if p.spec_ram_modules:  specs['modules']  = p.spec_ram_modules
                if p.spec_ram_timing:   specs['timing']   = p.spec_ram_timing

            elif cat == 'gpu':
                if p.spec_gpu_vram:          specs['vram']         = p.spec_gpu_vram
                if p.spec_gpu_mem_type:      specs['memType']      = p.spec_gpu_mem_type
                if p.spec_gpu_tdp:           specs['tdp']          = p.spec_gpu_tdp
                if p.spec_gpu_length_mm:     specs['length']       = p.spec_gpu_length_mm
                if p.spec_gpu_architecture:  specs['architecture'] = p.spec_gpu_architecture
                if p.spec_gpu_outputs:       specs['outputs']      = p.spec_gpu_outputs

            elif cat == 'psu':
                if p.spec_psu_wattage:    specs['wattage']    = p.spec_psu_wattage
                if p.spec_psu_efficiency: specs['efficiency'] = p.spec_psu_efficiency
                if p.spec_psu_modular:    specs['modular']    = p.spec_psu_modular

            elif cat == 'case':
                form_factors = []
                if p.spec_case_atx:  form_factors.append('ATX')
                if p.spec_case_matx: form_factors.append('mATX')
                if p.spec_case_itx:  form_factors.append('ITX')
                if p.spec_case_eatx: form_factors.append('E-ATX')
                if form_factors:              specs['formFactors']    = form_factors
                if p.spec_case_max_gpu_mm:    specs['maxGpuLength']   = p.spec_case_max_gpu_mm
                if p.spec_case_max_cooler_mm: specs['maxCoolerHeight']= p.spec_case_max_cooler_mm
                if p.spec_case_drive_bays:    specs['driveBays']      = p.spec_case_drive_bays
                if p.spec_case_fans_included: specs['fansIncluded']   = p.spec_case_fans_included

            elif cat == 'cooling':
                sockets = []
                if p.spec_cool_sock_am5:    sockets.append('AM5')
                if p.spec_cool_sock_am4:    sockets.append('AM4')
                if p.spec_cool_sock_lga1700: sockets.append('LGA1700')
                if p.spec_cool_sock_lga1200: sockets.append('LGA1200')
                if sockets:                    specs['sockets']    = sockets
                if p.spec_cool_type:           specs['type']       = p.spec_cool_type
                if p.spec_cool_tdp_rating:     specs['tdpRating']  = p.spec_cool_tdp_rating
                if p.spec_cool_height_mm:      specs['height']     = p.spec_cool_height_mm
                if p.spec_cool_radiator_mm:    specs['radiator']   = p.spec_cool_radiator_mm

            elif cat == 'storage':
                if p.spec_stor_type:     specs['type']     = p.spec_stor_type
                if p.spec_stor_capacity: specs['capacity'] = p.spec_stor_capacity
                if p.spec_stor_read:     specs['read']     = p.spec_stor_read
                if p.spec_stor_write:    specs['write']    = p.spec_stor_write

            elif cat == 'laptop':
                if p.spec_laptop_cpu:     specs['processor'] = p.spec_laptop_cpu
                if p.spec_laptop_gpu:     specs['gpu']       = p.spec_laptop_gpu
                if p.spec_laptop_ram:     specs['ram']       = p.spec_laptop_ram
                if p.spec_laptop_storage: specs['storage']   = p.spec_laptop_storage
                if p.spec_laptop_display: specs['display']   = p.spec_laptop_display
                if p.spec_laptop_battery: specs['battery']   = p.spec_laptop_battery
                if p.spec_laptop_os:      specs['os']        = p.spec_laptop_os
                if p.spec_laptop_weight:  specs['weight']    = p.spec_laptop_weight

            p.pc_specs = json.dumps(specs, ensure_ascii=False) if specs else '{}'

    # ── Serialisation ────────────────────────────────────────────────────────
    def to_pc_dict(self):
        self.ensure_one()
        try:
            specs = json.loads(self.pc_specs or '{}')
        except (json.JSONDecodeError, TypeError):
            specs = {}

        tags = [t.strip() for t in (self.pc_tags or '').split(',') if t.strip()]

        images = []
        if self.image_1920:
            images.append(f'/web/image/product.template/{self.id}/image_1920')
        if hasattr(self, 'product_template_image_ids'):
            for extra in self.product_template_image_ids:
                if extra.image_1920:
                    images.append(f'/web/image/product.image/{extra.id}/image_1920')
        if self.pc_extra_image_ids:
            for extra in self.pc_extra_image_ids:
                if extra.image_1920:
                    images.append(f'/web/image/pc.product.image/{extra.id}/image_1920')

        return {
            'id': f'{self.pc_category}-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'brand': self.pc_brand or '',
            'price': self.list_price,
            'category': self.pc_category,
            'rating': self.pc_rating,
            'reviews': self.pc_review_count,
            'stock': self.pc_stock_status or 'in_stock',
            'tags': tags,
            'specs': specs,
            'image': images[0] if images else None,
            'images': images,
            'is_only_one': self.pc_is_only_one,
        }

    @api.model
    def get_catalog(self):
        # Component categories are those with type 'component'
        products = self.search([
            ('pc_category_id.type', '=', 'component'),
            ('active', '=', True),
            ('pc_is_only_one', '=', False),
        ])
        catalog = {}
        for p in products:
            cat = p.pc_category or 'other'
            catalog.setdefault(cat, [])
            catalog[cat].append(p.to_pc_dict())
        return catalog

    @api.model
    def get_only_one_catalog(self):
        products = self.search([
            ('pc_category_id.type', '=', 'component'),
            ('active', '=', True),
            ('pc_is_only_one', '=', True),
        ])
        catalog = {}
        for p in products:
            cat = p.pc_category or 'other'
            catalog.setdefault(cat, [])
            catalog[cat].append(p.to_pc_dict())
        return catalog

    @api.model
    def get_laptops(self):
        products = self.search([('pc_category_id.type', '=', 'laptop'), ('active', '=', True)])
        return [p.to_pc_dict() for p in products]

    @api.model
    def get_peripherals(self):
        products = self.search([
            ('pc_category_id.type', '=', 'peripheral'),
            ('active', '=', True),
        ])
        peripherals = {}
        for p in products:
            cat = p.pc_category or 'other'
            peripherals.setdefault(cat, [])
            peripherals[cat].append(p.to_pc_dict())
        return peripherals
