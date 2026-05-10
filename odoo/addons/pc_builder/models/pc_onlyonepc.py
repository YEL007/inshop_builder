import json
from odoo import models, fields


class PcOnlyOnePcImage(models.Model):
    _name = 'pc.onlyonepc.image'
    _description = 'Only One PC Extra Image'

    name = fields.Char("Name", required=True)
    image_1920 = fields.Image("Image", max_width=1920, max_height=1920, required=True)
    onlyone_id = fields.Many2one('pc.onlyonepc', "Only One PC", index=True, ondelete='cascade')

class PcOnlyOnePc(models.Model):
    _name = 'pc.onlyonepc'
    _inherit = ['image.mixin']
    _description = 'Only One PC Configuration'
    _order = 'price asc'

    name = fields.Char('Name', required=True)
    price = fields.Float('Price', required=True)
    tier = fields.Char('Tier', help='Budget / Mid-Range / High-End / Flagship')
    badge = fields.Char('Badge')
    tag_line = fields.Char('Tag Line')
    rating = fields.Float('Rating', digits=(3, 1), default=4.5)
    review_count = fields.Integer('Reviews', default=0)
    active = fields.Boolean('Active', default=True)

    stock_status = fields.Selection([
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    ], string='Stock Status', default='in_stock')
    brand = fields.Char('Brand', default='Only One')
    extra_image_ids = fields.One2many('pc.onlyonepc.image', 'onlyone_id', string='Extra Images')

    # Component descriptions (text, not FK — matches frontend data structure)
    cpu = fields.Char('CPU')
    gpu = fields.Char('GPU')
    ram = fields.Char('RAM')
    storage = fields.Char('Storage')
    psu = fields.Char('PSU')
    case = fields.Char('Case')
    cooling = fields.Char('Cooling')

    gaming_perf = fields.Char('Gaming Performance', help='e.g. 1440p Ultra')
    workflow = fields.Char('Workflow', help='e.g. Video editing & streaming')
    pc_specs = fields.Text('Spécifications supplémentaires (JSON)', default='{}',
                           help='Champs additionnels au format JSON. Ex: {"pcie": "5.0", "wifi": "Wi-Fi 7"}')

    def to_dict(self):
        self.ensure_one()
        tags = [t.strip().lower().replace(' ', '-') for t in (self.badge or '').split(',')] if self.badge else []
        images = []
        if self.image_1920:
            images.append(f'/web/image/pc.onlyonepc/{self.id}/image_1920')
        for img in self.extra_image_ids:
            if img.image_1920:
                images.append(f'/web/image/pc.onlyonepc.image/{img.id}/image_1920')

        base_specs = {k: v for k, v in {
            'cpu': self.cpu,
            'gpu': self.gpu,
            'ram': self.ram,
            'storage': self.storage,
            'psu': self.psu,
            'case': self.case,
            'cooling': self.cooling,
        }.items() if v}
        try:
            extra_specs = json.loads(self.pc_specs or '{}') or {}
        except (ValueError, TypeError):
            extra_specs = {}
        merged_specs = {**base_specs, **extra_specs}

        return {
            'id': f'opc-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'price': self.price,
            'category': 'onlyonepc',
            'tier': self.tier or '',
            'badge': self.badge or '',
            'tag': self.tag_line or '',
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'brand': self.brand or 'Only One',
            'tags': tags,
            'images': images,
            'specs': merged_specs,
            'cpu': self.cpu or '',
            'gpu': self.gpu or '',
            'ram': self.ram or '',
            'storage': self.storage or '',
            'psu': self.psu or '',
            'case': self.case or '',
            'cooling': self.cooling or '',
            'gaming': self.gaming_perf or '',
            'workflow': self.workflow or '',
        }
