"""enable_rls_security

Revision ID: aef1a14e5810
Revises: ec58ad9b3b24
Create Date: 2026-10-06 22:04:19.380455

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aef1a14e5810'
down_revision: Union[str, Sequence[str], None] = 'ec58ad9b3b24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = [
    "departments",
    "courses",
    "events",
    "users",
    "resources",
    "bookings",
    "notices",
    "notifications",
    "class_sessions",
    "audit_logs",
    "assignments",
    "subjects",
    "event_registrations",
    "attendance_sessions",
    "exams",
    "submissions",
    "exam_marks",
    "attendance_records",
    "staff_profiles",
    "batches",
    "student_profiles",
    "divisions",
    "enrollments",
    "alembic_version",
]

def upgrade() -> None:
    # Use dialect-specific execution because SQLite doesn't support RLS
    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        for table in TABLES:
            op.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY')

def downgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name == 'postgresql':
        for table in TABLES:
            op.execute(f'ALTER TABLE public."{table}" DISABLE ROW LEVEL SECURITY')
