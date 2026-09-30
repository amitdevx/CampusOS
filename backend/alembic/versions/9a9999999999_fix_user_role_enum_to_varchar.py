"""Fix user role enum to varchar

Revision ID: 9a9999999999
Revises: 6f809898963e
Create Date: 2026-09-30 21:17:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a9999999999'
down_revision: Union[str, Sequence[str], None] = '6f809898963e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely alter the column type to VARCHAR
    # Using raw SQL because SQLAlchemy's dialect support for altering ENUM to VARCHAR varies
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text")
    # Drop the enum type if it exists to clean up
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")


def downgrade() -> None:
    pass

