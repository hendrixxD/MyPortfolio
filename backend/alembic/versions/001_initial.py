"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_superuser', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'])

    # Tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('tag_type', sa.String(20), default='both'),
        sa.Column('color', sa.String(7), default='#6366f1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tags_slug', 'tags', ['slug'], unique=True)
    op.create_index('ix_tags_id', 'tags', ['id'])

    # Articles table
    op.create_table(
        'articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('content_md', sa.Text(), nullable=False),
        sa.Column('cover_image', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('reading_time', sa.Integer(), default=5),
        sa.Column('featured', sa.Boolean(), default=False),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('meta_title', sa.String(255), nullable=True),
        sa.Column('meta_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_articles_slug', 'articles', ['slug'], unique=True)
    op.create_index('ix_articles_id', 'articles', ['id'])

    # Article-Tags association table
    op.create_table(
        'article_tags',
        sa.Column('article_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['article_id'], ['articles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('article_id', 'tag_id')
    )

    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('description_md', sa.Text(), nullable=True),
        sa.Column('cover_image', sa.String(500), nullable=True),
        sa.Column('screenshots', sa.JSON(), default=[]),
        sa.Column('repo_url', sa.String(500), nullable=True),
        sa.Column('live_url', sa.String(500), nullable=True),
        sa.Column('tech_tags', sa.JSON(), default=[]),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('featured', sa.Boolean(), default=False),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('meta_title', sa.String(255), nullable=True),
        sa.Column('meta_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_projects_slug', 'projects', ['slug'], unique=True)
    op.create_index('ix_projects_id', 'projects', ['id'])

    # Project-Tags association table
    op.create_table(
        'project_tags',
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('project_id', 'tag_id')
    )

    # Profile Links table
    op.create_table(
        'profile_links',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(100), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('icon', sa.String(100), nullable=True),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('is_visible', sa.Boolean(), default=True),
        sa.Column('username', sa.String(100), nullable=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Education table
    op.create_table(
        'education',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('school', sa.String(255), nullable=False),
        sa.Column('program', sa.String(255), nullable=False),
        sa.Column('degree', sa.String(100), nullable=True),
        sa.Column('department', sa.String(255), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_current', sa.Boolean(), default=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('achievements', sa.Text(), nullable=True),
        sa.Column('gpa', sa.String(20), nullable=True),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('is_visible', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Experiences table
    op.create_table(
        'experiences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(255), nullable=False),
        sa.Column('organization', sa.String(255), nullable=False),
        sa.Column('org_url', sa.String(500), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('employment_type', sa.String(50), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_current', sa.Boolean(), default=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('bullets', sa.JSON(), default=[]),
        sa.Column('technologies', sa.JSON(), default=[]),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('is_visible', sa.Boolean(), default=True),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('level', sa.String(20), nullable=True),
        sa.Column('level_percent', sa.Integer(), nullable=True),
        sa.Column('icon', sa.String(100), nullable=True),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('is_visible', sa.Boolean(), default=True),
        sa.Column('is_learning', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Publications table
    op.create_table(
        'publications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('authors', sa.JSON(), default=[]),
        sa.Column('venue', sa.String(255), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('abstract', sa.Text(), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('doi', sa.String(100), nullable=True),
        sa.Column('pdf_url', sa.String(500), nullable=True),
        sa.Column('publication_type', sa.String(50), nullable=True),
        sa.Column('order', sa.Integer(), default=0),
        sa.Column('is_visible', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Contact Messages table
    op.create_table(
        'contact_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(500), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), default=False),
        sa.Column('is_replied', sa.Boolean(), default=False),
        sa.Column('is_spam', sa.Boolean(), default=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('contact_messages')
    op.drop_table('publications')
    op.drop_table('skills')
    op.drop_table('experiences')
    op.drop_table('education')
    op.drop_table('profile_links')
    op.drop_table('project_tags')
    op.drop_table('projects')
    op.drop_table('article_tags')
    op.drop_table('articles')
    op.drop_table('tags')
    op.drop_table('users')
