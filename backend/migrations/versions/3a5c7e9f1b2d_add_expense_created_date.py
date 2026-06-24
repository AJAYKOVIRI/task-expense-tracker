"""Add expense created date

Revision ID: 3a5c7e9f1b2d
Revises: 2f4b6c7d8e9f
Create Date: 2026-06-24 00:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3a5c7e9f1b2d"
down_revision = "2f4b6c7d8e9f"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("expense", schema=None) as batch_op:
        batch_op.add_column(sa.Column("created_date", sa.String(length=50), nullable=True))


def downgrade():
    with op.batch_alter_table("expense", schema=None) as batch_op:
        batch_op.drop_column("created_date")
