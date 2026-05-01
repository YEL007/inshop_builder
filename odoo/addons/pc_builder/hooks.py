import logging

_logger = logging.getLogger(__name__)


def post_init_hook(env):
    """Called once after module installation. Logs confirmation."""
    count_products = env['product.template'].search_count([('pc_category', '!=', False)])
    count_prebuilts = env['pc.prebuilt'].search_count([])
    _logger.info(
        'PC Builder installed: %d products, %d pre-built configurations',
        count_products,
        count_prebuilts,
    )
