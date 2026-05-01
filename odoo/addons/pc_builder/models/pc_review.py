from odoo import models, fields, api
from odoo.exceptions import ValidationError


class PcReview(models.Model):
    _name = 'pc.review'
    _description = 'Product Review'
    _order = 'date desc'

    product_id = fields.Many2one('product.template', required=True, ondelete='cascade', index=True)
    user_id = fields.Many2one('res.users', required=True, ondelete='cascade', index=True)
    user_name = fields.Char(related='user_id.name', store=True)
    rating = fields.Integer(required=True)
    comment = fields.Text()
    date = fields.Datetime(default=fields.Datetime.now, readonly=True)

    _sql_constraints = [
        ('unique_user_product', 'UNIQUE(product_id, user_id)', 'Un seul avis par produit et par utilisateur.'),
    ]

    @api.constrains('rating')
    def _check_rating(self):
        for r in self:
            if not (1 <= r.rating <= 5):
                raise ValidationError('La note doit être entre 1 et 5.')

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'user_name': self.user_name or 'Anonyme',
            'rating': self.rating,
            'comment': self.comment or '',
            'date': self.date.strftime('%Y-%m-%d') if self.date else '',
        }
