from django.core.management.base import BaseCommand
from api.models import Category


CATEGORIES = [
    # ── Composants internes ───────────────────────────────────────────────────
    { 'sequence': 10,  'name': 'Processeurs',      'code': 'cpu',         'type': 'component',  'peri_group': '',      'icon': 'cpu'     },
    { 'sequence': 20,  'name': 'Cartes graphiques', 'code': 'gpu',         'type': 'component',  'peri_group': '',      'icon': 'gpu'     },
    { 'sequence': 30,  'name': 'Cartes mères',      'code': 'motherboard', 'type': 'component',  'peri_group': '',      'icon': 'board'   },
    { 'sequence': 40,  'name': 'Mémoire RAM',       'code': 'ram',         'type': 'component',  'peri_group': '',      'icon': 'memory'  },
    { 'sequence': 50,  'name': 'Stockage',           'code': 'storage',     'type': 'component',  'peri_group': '',      'icon': 'ssd'     },
    { 'sequence': 60,  'name': 'Alimentations',      'code': 'psu',         'type': 'component',  'peri_group': '',      'icon': 'psu'     },
    { 'sequence': 70,  'name': 'Boîtiers',           'code': 'case',        'type': 'component',  'peri_group': '',      'icon': 'case'    },
    { 'sequence': 80,  'name': 'Refroidissement',    'code': 'cooling',     'type': 'component',  'peri_group': '',      'icon': 'fan'     },
    # ── Périphériques ─────────────────────────────────────────────────────────
    { 'sequence': 110, 'name': 'Écrans',             'code': 'monitor',     'type': 'peripheral', 'peri_group': 'output','icon': 'monitor' },
    { 'sequence': 120, 'name': 'Claviers',            'code': 'keyboard',    'type': 'peripheral', 'peri_group': 'input', 'icon': 'keyboard'},
    { 'sequence': 130, 'name': 'Souris',              'code': 'mouse',       'type': 'peripheral', 'peri_group': 'input', 'icon': 'mouse'   },
    { 'sequence': 140, 'name': 'Casques & Micros',    'code': 'headset',     'type': 'peripheral', 'peri_group': 'mixed', 'icon': 'head'    },
    { 'sequence': 150, 'name': 'Webcams',             'code': 'webcam',      'type': 'peripheral', 'peri_group': 'output','icon': 'eye'     },
    { 'sequence': 160, 'name': 'Manettes',            'code': 'controller',  'type': 'peripheral', 'peri_group': 'input', 'icon': 'star'    },
    { 'sequence': 170, 'name': 'Tapis de souris',     'code': 'mousepad',    'type': 'peripheral', 'peri_group': 'input', 'icon': 'grid'    },
    { 'sequence': 180, 'name': 'Enceintes',           'code': 'speaker',     'type': 'peripheral', 'peri_group': 'output','icon': 'bell'    },
    { 'sequence': 181, 'name': 'Microphones',         'code': 'microphone',  'type': 'peripheral', 'peri_group': 'input', 'icon': 'mic'     },
    { 'sequence': 182, 'name': 'Clés USB',            'code': 'usb',         'type': 'peripheral', 'peri_group': 'mixed', 'icon': 'usb'     },
    { 'sequence': 183, 'name': 'Disques Externes',    'code': 'external_hdd','type': 'peripheral', 'peri_group': 'mixed', 'icon': 'hard-drive'},
    { 'sequence': 184, 'name': 'Réseau & Wi-Fi',      'code': 'network',     'type': 'peripheral', 'peri_group': 'mixed', 'icon': 'wifi'    },
    # ── Ordinateurs portables ─────────────────────────────────────────────────
    { 'sequence': 210, 'name': 'Portables Gaming',   'code': 'laptop-gaming','type': 'laptop',    'peri_group': '',      'icon': 'laptop'  },
    { 'sequence': 220, 'name': 'Portables Pro',       'code': 'laptop-pro',  'type': 'laptop',    'peri_group': '',      'icon': 'laptop'  },
    { 'sequence': 230, 'name': 'Portables Étudiant',  'code': 'laptop-student','type': 'laptop',  'peri_group': '',      'icon': 'laptop'  },
]


class Command(BaseCommand):
    help = 'Crée les catégories par défaut du site INSHOP BUILDER (idempotent)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset', action='store_true',
            help='Réinitialise les catégories existantes (met à jour nom/icône/sequence)',
        )

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for cat_data in CATEGORIES:
            obj, was_created = Category.objects.get_or_create(
                code=cat_data['code'],
                defaults={
                    'name':       cat_data['name'],
                    'sequence':   cat_data['sequence'],
                    'type':       cat_data['type'],
                    'peri_group': cat_data['peri_group'],
                    'icon':       cat_data['icon'],
                    'active':     True,
                },
            )
            if was_created:
                created += 1
            elif options['reset']:
                obj.name       = cat_data['name']
                obj.sequence   = cat_data['sequence']
                obj.type       = cat_data['type']
                obj.peri_group = cat_data['peri_group']
                obj.icon       = cat_data['icon']
                obj.save()
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'seed_categories: {created} créée(s), {updated} mise(s) à jour — total {Category.objects.count()} catégories.'
        ))
