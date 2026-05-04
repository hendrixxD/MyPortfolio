"""Rename coursework.display_order to order for consistency

Revision ID: 003
Revises: 002
Create Date: 2026-05-01

"""
from typing import Sequence, Union
from alembic import op

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('coursework', 'display_order', new_column_name='order')


def downgrade() -> None:
    op.alter_column('coursework', 'order', new_column_name='display_order')
