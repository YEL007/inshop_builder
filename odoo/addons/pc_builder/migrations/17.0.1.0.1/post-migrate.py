"""
Post-migration script: strip backend access (group_user) from portal users.

Users created via the frontend register API before this fix had both
group_portal AND group_user, granting them full Odoo backend access.
This migration removes group_user from those users.
"""
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    if not version:
        return

    _logger.info('PC Builder migration: checking portal users with backend access…')

    # Find portal users who also have group_user (but are not admin)
    cr.execute("""
        SELECT u.id, u.login
          FROM res_users u
         WHERE u.id != 2
           AND u.active = True
           AND EXISTS (
               SELECT 1 FROM res_groups_users_rel r1
               JOIN ir_model_data d1 ON d1.res_id = r1.gid
                    AND d1.model = 'res.groups'
                    AND d1.module = 'base'
                    AND d1.name = 'group_portal'
               WHERE r1.uid = u.id
           )
           AND EXISTS (
               SELECT 1 FROM res_groups_users_rel r2
               JOIN ir_model_data d2 ON d2.res_id = r2.gid
                    AND d2.model = 'res.groups'
                    AND d2.module = 'base'
                    AND d2.name = 'group_user'
               WHERE r2.uid = u.id
           )
    """)
    bad_users = cr.fetchall()

    if not bad_users:
        _logger.info('PC Builder migration: no portal users with backend access found.')
        return

    _logger.warning(
        'PC Builder migration: revoking backend access from %d portal users: %s',
        len(bad_users),
        [u[1] for u in bad_users],
    )

    bad_uids = [u[0] for u in bad_users]

    # Get group_user id
    cr.execute("""
        SELECT res_id FROM ir_model_data
        WHERE module = 'base' AND name = 'group_user' AND model = 'res.groups'
    """)
    group_user_id = cr.fetchone()[0]

    # Remove group_user from these users
    cr.execute("""
        DELETE FROM res_groups_users_rel
        WHERE uid = ANY(%s) AND gid = %s
    """, (bad_uids, group_user_id))

    _logger.info('PC Builder migration: backend access revoked for %d portal users.', len(bad_uids))
