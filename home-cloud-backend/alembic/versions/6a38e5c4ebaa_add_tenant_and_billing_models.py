"""Add tenant and billing models

Revision ID: 6a38e5c4ebaa
Revises: 6dec92308518
Create Date: 2026-05-03 11:48:32.696889

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a38e5c4ebaa'
down_revision: Union[str, Sequence[str], None] = '6dec92308518'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('tenants',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('owner_user_id', sa.Integer(), nullable=True),
    sa.Column('company_name', sa.String(), nullable=True),
    sa.Column('subscription_plan', sa.String(), nullable=True),
    sa.Column('payment_status', sa.String(), nullable=True),
    sa.Column('stripe_customer_id', sa.String(), nullable=True),
    sa.Column('onboarding_complete', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], name=op.f('fk_tenants_owner_user_id_users')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tenants'))
    )
    op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)

    with op.batch_alter_table('monitors', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tenant_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('check_types', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('alert_policy', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('retry_policy', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('active_status', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('expected_status', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('expected_keyword', sa.String(), nullable=True))
        batch_op.create_foreign_key(batch_op.f('fk_monitors_tenant_id_tenants'), 'tenants', ['tenant_id'], ['id'])

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tenant_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(batch_op.f('fk_users_tenant_id_tenants'), 'tenants', ['tenant_id'], ['id'])

    op.create_table('billing',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('tenant_id', sa.Integer(), nullable=True),
    sa.Column('subscription_id', sa.String(), nullable=True),
    sa.Column('amount', sa.Float(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('renewal_date', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], name=op.f('fk_billing_tenant_id_tenants')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_billing'))
    )
    op.create_index(op.f('ix_billing_id'), 'billing', ['id'], unique=False)
    op.create_index(op.f('ix_billing_subscription_id'), 'billing', ['subscription_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_billing_subscription_id'), table_name='billing')
    op.drop_index(op.f('ix_billing_id'), table_name='billing')
    op.drop_table('billing')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_users_tenant_id_tenants'), type_='foreignkey')
        batch_op.drop_column('tenant_id')

    with op.batch_alter_table('monitors', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_monitors_tenant_id_tenants'), type_='foreignkey')
        batch_op.drop_column('expected_keyword')
        batch_op.drop_column('expected_status')
        batch_op.drop_column('active_status')
        batch_op.drop_column('retry_policy')
        batch_op.drop_column('alert_policy')
        batch_op.drop_column('check_types')
        batch_op.drop_column('tenant_id')

    op.drop_index(op.f('ix_tenants_id'), table_name='tenants')
    op.drop_table('tenants')
