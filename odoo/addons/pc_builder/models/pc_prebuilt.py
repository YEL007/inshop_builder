import json
from odoo import models, fields, api

from .pc_product import SOCKET_LIST, RAM_TYPE_LIST, STORAGE_TYPE_LIST, EFFICIENCY_LIST

class PcPrebuiltImage(models.Model):
    _name = 'pc.prebuilt.image'
    _description = 'Pre-built PC Extra Image'

    name = fields.Char("Name", required=True)
    image_1920 = fields.Image("Image", max_width=1920, max_height=1920, required=True)
    prebuilt_id = fields.Many2one('pc.prebuilt', "Pre-built PC", index=True, ondelete='cascade')

class PcPrebuilt(models.Model):
    _name = 'pc.prebuilt'
    _inherit = ['image.mixin']
    _description = 'Pre-built PC Configuration'
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
    brand = fields.Char('Brand', default='INSHOP')
    extra_image_ids = fields.One2many('pc.prebuilt.image', 'prebuilt_id', string='Extra Images')

    # Descriptions commerciales
    cpu = fields.Char('CPU (Nom)')
    gpu = fields.Char('GPU (Nom)')
    ram = fields.Char('RAM (Nom)')
    storage = fields.Char('Storage (Nom)')
    psu = fields.Char('PSU (Nom)')
    case = fields.Char('Case (Nom)')
    cooling = fields.Char('Cooling (Nom)')

    # Données techniques de compatibilité (Génèrent le JSON)
    tech_cpu_socket = fields.Selection(SOCKET_LIST, string='Socket CPU')
    tech_ram_type = fields.Selection(RAM_TYPE_LIST, string='Type RAM')
    tech_ram_capacity = fields.Char('Capacité RAM', help='Ex: 32GB (2x16GB)')
    tech_ram_speed = fields.Integer('Fréquence RAM (MHz)')
    tech_storage_type = fields.Selection(STORAGE_TYPE_LIST, string='Type Stockage')
    tech_storage_capacity = fields.Char('Capacité Stockage', help='Ex: 1TB NVMe')
    tech_gpu_vram = fields.Char('VRAM GPU', help='Ex: 12GB GDDR6X')
    tech_psu_wattage = fields.Integer('Puissance PSU (W)')
    tech_psu_efficiency = fields.Selection(EFFICIENCY_LIST, string='Efficacité PSU')

    gaming_perf = fields.Char('Gaming Performance', help='e.g. 1440p Ultra')
    workflow = fields.Char('Workflow', help='e.g. Video editing & streaming')
    
    pc_specs = fields.Text('Specs (JSON)', compute='_compute_pc_specs', store=True, readonly=False)

    @api.depends('cpu', 'gpu', 'ram', 'storage', 'psu', 'case', 'cooling', 
                 'tech_cpu_socket', 'tech_ram_type', 'tech_ram_capacity', 'tech_ram_speed',
                 'tech_storage_type', 'tech_storage_capacity', 'tech_gpu_vram',
                 'tech_psu_wattage', 'tech_psu_efficiency')
    def _compute_pc_specs(self):
        for p in self:
            specs = {
                'cpu': p.cpu, 'gpu': p.gpu, 'ram': p.ram, 
                'storage': p.storage, 'psu': p.psu, 'case': p.case, 'cooling': p.cooling,
                'socket': p.tech_cpu_socket,
                'ramType': p.tech_ram_type,
                'ramCapacity': p.tech_ram_capacity,
                'ramSpeed': p.tech_ram_speed,
                'storageType': p.tech_storage_type,
                'storageCapacity': p.tech_storage_capacity,
                'gpuVram': p.tech_gpu_vram,
                'wattage': p.tech_psu_wattage,
                'efficiency': p.tech_psu_efficiency,
            }
            # On retire les clés vides
            specs = {k: v for k, v in specs.items() if v}
            p.pc_specs = json.dumps(specs, ensure_ascii=False)

    def to_dict(self):
        self.ensure_one()
        tags = [t.strip().lower().replace(' ', '-') for t in (self.badge or '').split(',')] if self.badge else []
        images = [f'/web/image/pc.prebuilt/{self.id}/image_1920'] if self.image_1920 else []
        for img in self.extra_image_ids:
            if img.image_1920:
                images.append(f'/web/image/pc.prebuilt.image/{img.id}/image_1920')

        try:
            specs = json.loads(self.pc_specs or '{}')
        except:
            specs = {}

        return {
            'id': f'pre-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'price': self.price,
            'category': 'prebuilt',
            'tier': self.tier or '',
            'badge': self.badge or '',
            'tag': self.tag_line or '',
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'brand': self.brand or 'INSHOP',
            'tags': tags,
            'images': images,
            'specs': specs,
            'gaming': self.gaming_perf or '',
            'workflow': self.workflow or '',
        }
