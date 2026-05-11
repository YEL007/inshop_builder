"""Pre-migration 17.0.1.0.4 — Add structured spec columns to product.template"""
import logging
_logger = logging.getLogger(__name__)

COLUMNS = {
    # CPU
    'spec_cpu_socket':    'VARCHAR',
    'spec_cpu_cores':     'INTEGER DEFAULT 0',
    'spec_cpu_threads':   'INTEGER DEFAULT 0',
    'spec_cpu_base_ghz':  'VARCHAR',
    'spec_cpu_boost_ghz': 'VARCHAR',
    'spec_cpu_tdp':       'INTEGER DEFAULT 0',
    'spec_cpu_cache':     'VARCHAR',
    # Motherboard
    'spec_mb_socket':      'VARCHAR',
    'spec_mb_form_factor': 'VARCHAR',
    'spec_mb_ram_type':    'VARCHAR',
    'spec_mb_ram_slots':   'INTEGER DEFAULT 0',
    'spec_mb_m2_slots':    'INTEGER DEFAULT 0',
    'spec_mb_pcie_slots':  'INTEGER DEFAULT 0',
    'spec_mb_chipset':     'VARCHAR',
    # RAM
    'spec_ram_type':     'VARCHAR',
    'spec_ram_capacity': 'VARCHAR',
    'spec_ram_speed':    'INTEGER DEFAULT 0',
    'spec_ram_modules':  'INTEGER DEFAULT 0',
    'spec_ram_timing':   'VARCHAR',
    # GPU
    'spec_gpu_vram':         'VARCHAR',
    'spec_gpu_mem_type':     'VARCHAR',
    'spec_gpu_tdp':          'INTEGER DEFAULT 0',
    'spec_gpu_length_mm':    'INTEGER DEFAULT 0',
    'spec_gpu_architecture': 'VARCHAR',
    'spec_gpu_outputs':      'VARCHAR',
    # PSU
    'spec_psu_wattage':    'INTEGER DEFAULT 0',
    'spec_psu_efficiency': 'VARCHAR',
    'spec_psu_modular':    'VARCHAR',
    # Case
    'spec_case_atx':            'BOOLEAN DEFAULT TRUE',
    'spec_case_matx':           'BOOLEAN DEFAULT TRUE',
    'spec_case_itx':            'BOOLEAN DEFAULT TRUE',
    'spec_case_eatx':           'BOOLEAN DEFAULT FALSE',
    'spec_case_max_gpu_mm':     'INTEGER DEFAULT 0',
    'spec_case_max_cooler_mm':  'INTEGER DEFAULT 0',
    'spec_case_drive_bays':     'INTEGER DEFAULT 0',
    'spec_case_fans_included':  'INTEGER DEFAULT 0',
    # Cooling
    'spec_cool_type':          'VARCHAR',
    'spec_cool_tdp_rating':    'INTEGER DEFAULT 0',
    'spec_cool_height_mm':     'INTEGER DEFAULT 0',
    'spec_cool_radiator_mm':   'INTEGER DEFAULT 0',
    'spec_cool_sock_am5':      'BOOLEAN DEFAULT FALSE',
    'spec_cool_sock_am4':      'BOOLEAN DEFAULT FALSE',
    'spec_cool_sock_lga1700':  'BOOLEAN DEFAULT FALSE',
    'spec_cool_sock_lga1200':  'BOOLEAN DEFAULT FALSE',
    # Storage
    'spec_stor_type':     'VARCHAR',
    'spec_stor_capacity': 'VARCHAR',
    'spec_stor_read':     'VARCHAR',
    'spec_stor_write':    'VARCHAR',
    # Laptop
    'spec_laptop_cpu':     'VARCHAR',
    'spec_laptop_gpu':     'VARCHAR',
    'spec_laptop_ram':     'VARCHAR',
    'spec_laptop_storage': 'VARCHAR',
    'spec_laptop_display': 'VARCHAR',
    'spec_laptop_battery': 'VARCHAR',
    'spec_laptop_os':      'VARCHAR',
    'spec_laptop_weight':  'VARCHAR',
}


def migrate(cr, version):
    cr.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'product_template'
    """)
    existing = {row[0] for row in cr.fetchall()}

    for col, col_type in COLUMNS.items():
        if col not in existing:
            cr.execute(f'ALTER TABLE product_template ADD COLUMN {col} {col_type}')
            _logger.info('PC Builder migration: added product_template.%s', col)
        else:
            _logger.info('PC Builder migration: %s already exists, skipping', col)
