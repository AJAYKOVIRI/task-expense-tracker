"""Add task tracking fields

Revision ID: 2f4b6c7d8e9f
Revises: e87031cb32b3
Create Date: 2026-06-23 23:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2f4b6c7d8e9f"
down_revision = "e87031cb32b3"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("task", schema=None) as batch_op:
        batch_op.add_column(sa.Column("estimated_end_date", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("created_date", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("status_notes", sa.String(length=500), nullable=True))


def downgrade():
    with op.batch_alter_table("task", schema=None) as batch_op:
        batch_op.drop_column("status_notes")
        batch_op.drop_column("created_date")
        batch_op.drop_column("estimated_end_date")
