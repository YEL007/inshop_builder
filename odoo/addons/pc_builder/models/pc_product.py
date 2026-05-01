import json
from odoo import models, fields, api



PC_CATEGORIES = [
    # ── Composants ──────────────────────────────────────────────────────────
    ('cpu',         'Processeur (CPU)'),
    ('gpu',         'Carte graphique (GPU)'),
    ('motherboard', 'Carte mère'),
    ('ram',         'Mémoire RAM'),
    ('storage',     'Stockage (SSD / HDD)'),
    ('psu',         'Alimentation (PSU)'),
    ('cooling',     'Refroidissement'),
    ('case',        'Boîtier'),
    # ── Périphériques d'entrée ───────────────────────────────────────────
    ('keyboard',    'Clavier'),
    ('mouse',       'Souris'),
    ('microphone',  'Microphone'),
    ('webcam',      'Webcam'),
    # ── Périphériques de sortie ──────────────────────────────────────────
    ('monitor',     'Écran'),
    ('speaker',     'Haut-parleurs'),
    ('headset',     'Casque audio'),
    # ── Périphériques E/S ────────────────────────────────────────────────
    ('usb',          'Clé USB'),
    ('external_hdd', 'Disque dur externe'),
    ('network',      'Carte réseau'),
]

COMPONENT_CATEGORIES = {c[0] for c in PC_CATEGORIES[:8]}
PERIPHERAL_CATEGORIES = {c[0] for c in PC_CATEGORIES[8:]}


class PcProductImage(models.Model):
    _name = 'pc.product.image'
    _description = 'Extra Product Image'

    name = fields.Char("Name", required=True)
    image_1920 = fields.Image("Image", max_width=1920, max_height=1920, required=True)
    product_tmpl_id = fields.Many2one('product.template', "Product", index=True, ondelete='cascade')

class PcProductTemplate(models.Model):
    _inherit = 'product.template'

    type = fields.Selection(selection_add=[('consu', 'Consumable')], default='consu')

    pc_category = fields.Selection(
        PC_CATEGORIES,
        string='PC Category',
        index=True,
    )
    pc_brand = fields.Char('Brand')
    pc_specs = fields.Text(
        'Specs (JSON)',
        default='{}',
        help='Component specifications stored as a JSON object.',
    )
    pc_tags = fields.Char(
        'Tags',
        help='Comma-separated tags, e.g. gaming,bestseller,flagship',
    )
    pc_stock_status = fields.Selection(
        [
            ('in_stock', 'In Stock'),
            ('low_stock', 'Low Stock'),
            ('out_of_stock', 'Out of Stock'),
        ],
        string='Stock Status',
        default='in_stock',
    )
    pc_review_ids = fields.One2many('pc.review', 'product_id', string='Avis clients')
    pc_extra_image_ids = fields.One2many('pc.product.image', 'product_tmpl_id', string='Extra Images')
    pc_rating = fields.Float('Rating', digits=(3, 1), compute='_compute_rating', store=True)
    pc_review_count = fields.Integer('Reviews', compute='_compute_rating', store=True)

    @api.depends('pc_review_ids.rating')
    def _compute_rating(self):
        for product in self:
            reviews = product.pc_review_ids
            product.pc_review_count = len(reviews)
            product.pc_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0

    # ── Serialisation helper ─────────────────────────────────────────────────

    def to_pc_dict(self):
        self.ensure_one()
        try:
            specs = json.loads(self.pc_specs or '{}')
        except (json.JSONDecodeError, TypeError):
            specs = {}

        tags = [t.strip() for t in (self.pc_tags or '').split(',') if t.strip()]

        # Collect all images: main + extra
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
        }

    # ── Computed helpers used by the API controller ──────────────────────────

    @api.model
    def get_catalog(self):
        """Return component products grouped by pc_category."""
        products = self.search([
            ('pc_category', 'in', list(COMPONENT_CATEGORIES)),
            ('active', '=', True),
        ])
        catalog = {}
        for p in products:
            cat = p.pc_category
            catalog.setdefault(cat, [])
            catalog[cat].append(p.to_pc_dict())
        return catalog

    @api.model
    def get_peripherals(self):
        """Return peripheral products grouped by pc_category."""
        products = self.search([
            ('pc_category', 'in', list(PERIPHERAL_CATEGORIES)),
            ('active', '=', True),
        ])
        peripherals = {}
        for p in products:
            cat = p.pc_category
            peripherals.setdefault(cat, [])
            peripherals[cat].append(p.to_pc_dict())
        return peripherals
