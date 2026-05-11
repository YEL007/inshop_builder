import json
from odoo import models, fields, api

from .pc_product import SOCKET_LIST, RAM_TYPE_LIST, STORAGE_TYPE_LIST, EFFICIENCY_LIST

class PcOnlyOnePCImage(models.Model):
    _name = 'pc.onlyonepc.image'
    _description = 'Only One PC Extra Image'

    name = fields.Char("Name", required=True)
    image_1920 = fields.Image("Image", max_width=1920, max_height=1920, required=True)
    onlyone_id = fields.Many2one('pc.onlyonepc', "Only One PC", index=True, ondelete='cascade')

class PcOnlyOnePC(models.Model):
    _name = 'pc.onlyonepc'
    _inherit = ['image.mixin']
    _description = 'Only One PC Configuration'
    _order = 'price asc'

    name = fields.Char('Name', required=True)
    price = fields.Float('Price', required=True)
    badge = fields.Char('Badge', help='e.g. Creator Edition, Gaming Beast')
    tag_line = fields.Char('Tag Line')
    rating = fields.Float('Rating', digits=(3, 1), default=4.8)
    review_count = fields.Integer('Reviews', default=0)
    active = fields.Boolean('Active', default=True)

    stock_status = fields.Selection([
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    ], string='Stock Status', default='in_stock')

    extra_image_ids = fields.One2many('pc.onlyonepc.image', 'onlyone_id', string='Extra Images')

    # Descriptions commerciales
    cpu = fields.Char('CPU')
    gpu = fields.Char('GPU')
    ram = fields.Char('RAM')
    storage = fields.Char('Storage')
    psu = fields.Char('PSU')
    case = fields.Char('Case')
    cooling = fields.Char('Cooling')

    # Données techniques
    tech_cpu_socket = fields.Selection(SOCKET_LIST, string='Socket CPU')
    tech_ram_type = fields.Selection(RAM_TYPE_LIST, string='Type RAM')
    tech_ram_capacity = fields.Char('Capacité RAM', help='Ex: 32GB (2x16GB)')
    tech_ram_speed = fields.Integer('Fréquence RAM (MHz)')
    tech_storage_type = fields.Selection(STORAGE_TYPE_LIST, string='Type Stockage')
    tech_storage_capacity = fields.Char('Capacité Stockage', help='Ex: 1TB NVMe')
    tech_gpu_vram = fields.Char('VRAM GPU', help='Ex: 12GB GDDR6X')
    tech_psu_wattage = fields.Integer('Puissance PSU (W)')
    tech_psu_efficiency = fields.Selection(EFFICIENCY_LIST, string='Efficacité PSU')

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
            specs = {k: v for k, v in specs.items() if v}
            p.pc_specs = json.dumps(specs, ensure_ascii=False)

    def to_dict(self):
        self.ensure_one()
        tags = [t.strip().lower().replace(' ', '-') for t in (self.badge or '').split(',')] if self.badge else []
        
        images = [f'/web/image/pc.onlyonepc/{self.id}/image_1920'] if self.image_1920 else []
        for img in self.extra_image_ids:
            if img.image_1920:
                images.append(f'/web/image/pc.onlyonepc.image/{img.id}/image_1920')

        try:
            specs = json.loads(self.pc_specs or '{}')
        except:
            specs = {}

        return {
            'id': f'one-{self.id}',
            'odoo_id': self.id,
            'name': self.name,
            'price': self.price,
            'category': 'onlyone',
            'badge': self.badge or '',
            'tag': self.tag_line or '',
            'rating': self.rating,
            'reviews': self.review_count,
            'stock': self.stock_status or 'in_stock',
            'tags': tags,
            'image': images[0] if images else None,
            'images': images,
            'specs': specs,
        }
