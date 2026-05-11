from odoo import models, fields, api

class PcContactMessage(models.Model):
    _name = 'pc.contact.message'
    _description = 'PC Builder Contact Message'
    _order = 'create_date desc'

    name = fields.Char('Nom complet', required=True)
    email = fields.Char('Email', required=True)
    subject = fields.Char('Sujet')
    message = fields.Text('Message', required=True)
    state = fields.Selection([
        ('new', 'Nouveau'),
        ('read', 'Lu'),
        ('replied', 'Répondu')
    ], string='État', default='new')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'date': self.create_date.isoformat(),
            'state': self.state,
        }
