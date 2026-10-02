"""Add division_id to assignments

Revision ID: ec58ad9b3b24
Revises: 9a9999999999
Create Date: 2026-10-02 12:30:36.577527

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'ec58ad9b3b24'
down_revision: Union[str, Sequence[str], None] = '9a9999999999'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table('assignments') as batch_op:
        batch_op.add_column(sa.Column('division_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_assignments_division', 'divisions', ['division_id'], ['id'])

    with op.batch_alter_table('exams') as batch_op:
        batch_op.add_column(sa.Column('division_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_exams_division', 'divisions', ['division_id'], ['id'])

def downgrade() -> None:
    with op.batch_alter_table('exams') as batch_op:
        batch_op.drop_constraint('fk_exams_division', type_='foreignkey')
        batch_op.drop_column('division_id')

    with op.batch_alter_table('assignments') as batch_op:
        batch_op.drop_constraint('fk_assignments_division', type_='foreignkey')
        batch_op.drop_column('division_id')
