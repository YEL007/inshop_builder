from odoo import models, fields


class PcPrebuilt(models.Model):
    _name = 'pc.prebuilt'
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

    def to_dict(self):
        self.ensure_one()
        components = [c for c in [self.cpu, self.gpu, self.ram, self.storage, self.psu, self.case, self.cooling] if c]
        tags = [t.strip().lower().replace(' ', '-') for t in (self.badge or '').split(',')] if self.badge else []
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
            'stock': 'in_stock',
            'tags': tags,
            'images': [],
            'specs': {
                'cpu': self.cpu or '',
                'gpu': self.gpu or '',
                'ram': self.ram or '',
                'storage': self.storage or '',
                'psu': self.psu or '',
            },
            'components': components,
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
