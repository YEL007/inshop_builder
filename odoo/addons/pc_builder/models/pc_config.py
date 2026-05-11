from odoo import models, fields, api

class PcConfig(models.Model):
    _name = 'pc.config'
    _description = 'INSHOP PC Configuration'

    name = fields.Char(string='Site Name', default='INSHOP BUILDER')
    
    # Contact Info
    contact_email = fields.Char(string='Contact Email', default='contact@inshop-builder.com')
    contact_phone = fields.Char(string='Contact Phone', default='+33 1 23 45 67 89')
    contact_address = fields.Text(string='Address', default='123 Rue de la Technologie, 75000 Paris')
    contact_opening_hours = fields.Text(string='Opening Hours', default='Lun-Ven: 9h - 18h\nSam: 10h - 17h')
    
    # Social Links
    social_facebook = fields.Char(string='Facebook URL')
    social_twitter = fields.Char(string='Twitter URL')
    social_instagram = fields.Char(string='Instagram URL')
    social_linkedin = fields.Char(string='LinkedIn URL')
    
    # Localisation carte
    map_lat = fields.Float(string='Latitude', digits=(10, 7),
        help='Latitude GPS du magasin. Si vide, la carte géocode l\'adresse automatiquement.')
    map_lng = fields.Float(string='Longitude', digits=(10, 7),
        help='Longitude GPS du magasin. Si vide, la carte géocode l\'adresse automatiquement.')

    # Hero/Banner Global
    hero_title = fields.Char(string='Hero Title', default='CONSTRUISEZ VOTRE PC DE RÊVE')
    hero_subtitle = fields.Text(string='Hero Subtitle', default='Des composants de haute performance pour une expérience gaming ultime.')

    @api.model
    def get_config(self):
        config = self.search([], limit=1)
        if not config:
            config = self.create({})
        return {
            'name': config.name,
            'email': config.contact_email,
            'phone': config.contact_phone,
            'address': config.contact_address,
            'opening_hours': config.contact_opening_hours,
            'lat': config.map_lat or None,
            'lng': config.map_lng or None,
            'social': {
                'facebook': config.social_facebook,
                'twitter': config.social_twitter,
                'instagram': config.social_instagram,
                'linkedin': config.social_linkedin,
            },
            'hero': {
                'title': config.hero_title,
                'subtitle': config.hero_subtitle,
            }
        }
