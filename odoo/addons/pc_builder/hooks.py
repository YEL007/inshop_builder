import logging

_logger = logging.getLogger(__name__)


def post_init_hook(env):
    """Called once after module installation. Logs confirmation and
    fixes portal users that were incorrectly given backend access."""
    count_products = env['product.template'].search_count([('pc_category', '!=', False)])
    count_prebuilts = env['pc.prebuilt'].search_count([])
    _logger.info(
        'PC Builder installed: %d products, %d pre-built configurations',
        count_products,
        count_prebuilts,
    )

    # ── Fix portal users that were wrongly given internal (group_user) ──
    # Previous registration code used res.users.create() which silently
    # added group_user alongside group_portal, giving portal users
    # full backend access.  This block strips group_user from any user
    # that has BOTH group_portal AND group_user (except admin).
    try:
        group_portal = env.ref('base.group_portal')
        group_internal = env.ref('base.group_user')
        bad_users = env['res.users'].search([
            ('groups_id', 'in', [group_portal.id]),
            ('groups_id', 'in', [group_internal.id]),
            ('id', '!=', 2),  # never touch admin
        ])
        if bad_users:
            _logger.warning(
                'PC Builder: fixing %d portal users with backend access: %s',
                len(bad_users),
                bad_users.mapped('login'),
            )
            bad_users.write({
                'groups_id': [
                    (3, group_internal.id),  # remove internal
                ]
            })
            _logger.info('PC Builder: portal users fixed — backend access revoked.')
    except Exception as e:
        _logger.warning('PC Builder: could not fix portal users: %s', e)

