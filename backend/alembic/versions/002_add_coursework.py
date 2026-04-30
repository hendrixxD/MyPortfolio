"""Add coursework table

Revision ID: 002
Revises: 001
Create Date: 2026-01-21

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Coursework table
    op.create_table(
        'coursework',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('course_code', sa.String(50), nullable=True),
        sa.Column('course_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('institution', sa.String(255), nullable=False),
        sa.Column('department', sa.String(255), nullable=True),
        sa.Column('semester', sa.String(50), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('credits', sa.Integer(), nullable=True),
        sa.Column('grade', sa.String(10), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('instructor', sa.String(255), nullable=True),
        sa.Column('topics_covered', sa.Text(), nullable=True),
        sa.Column('skills_gained', sa.Text(), nullable=True),
        sa.Column('syllabus_url', sa.String(500), nullable=True),
        sa.Column('certificate_url', sa.String(500), nullable=True),
        sa.Column('is_highlighted', sa.Boolean(), default=False),
        sa.Column('display_order', sa.Integer(), default=0),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_coursework_id', 'coursework', ['id'])
    op.create_index('ix_coursework_category', 'coursework', ['category'])
    op.create_index('ix_coursework_institution', 'coursework', ['institution'])


def downgrade() -> None:
    op.drop_index('ix_coursework_institution', 'coursework')
    op.drop_index('ix_coursework_category', 'coursework')
    op.drop_index('ix_coursework_id', 'coursework')
    op.drop_table('coursework')
