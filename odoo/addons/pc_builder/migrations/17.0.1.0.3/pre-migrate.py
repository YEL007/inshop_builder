"""
Pre-migration: add pc_specs TEXT column to pc_prebuilt and pc_onlyonepc tables.
Runs before the ORM updates the schema so existing records keep their data.
"""
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    for table in ('pc_prebuilt', 'pc_onlyonepc'):
        cr.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = %s AND column_name = 'pc_specs'",
            (table,)
        )
        if not cr.fetchone():
            cr.execute(f"ALTER TABLE {table} ADD COLUMN pc_specs TEXT DEFAULT '{{}}'")
            _logger.info('PC Builder migration: added pc_specs column to %s', table)
        else:
            _logger.info('PC Builder migration: pc_specs already exists on %s, skipping', table)
