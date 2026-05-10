from odoo import models, fields


class PcSaleOrder(models.Model):
    _inherit = 'sale.order'

    pc_delivery_status = fields.Selection([
        ('processing', 'Reçue / En traitement'),
        ('preparing',  'En préparation'),
        ('shipped',    'Expédiée'),
        ('delivered',  'Livrée'),
    ], string='Statut livraison', default='processing', tracking=True, copy=False)

    def action_set_preparing(self):
        for order in self:
            order.write({'pc_delivery_status': 'preparing'})

    def action_set_shipped(self):
        for order in self:
            order.write({'pc_delivery_status': 'shipped'})

    def action_set_delivered(self):
        for order in self:
            order.write({'pc_delivery_status': 'delivered'})
            if order.state == 'sale':
                order.sudo().action_done()
