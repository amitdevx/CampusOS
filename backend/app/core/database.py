import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Fetch database URL from environment variable (Render sets this)
# Fallback to local SQLite if not found
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./campusos.db"
)

# Render / Supabase requires postgresql:// instead of postgres://
# For SQLAlchemy with psycopg2, we need postgresql+psycopg2://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# FIX: Render free tier does not support IPv6.
# Supabase direct connection (db.*.supabase.co:5432) is IPv6-only.
# We automatically rewrite it to the IPv4 connection pooler (aws-0-[region].pooler.supabase.com:6543)
if "db.wqtphprgstseajqtkygk.supabase.co" in SQLALCHEMY_DATABASE_URL and "5432" in SQLALCHEMY_DATABASE_URL:
    # Pooler requires project ref in the username: postgres.wqtphprgstseajqtkygk
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgresql+psycopg2://postgres:", 
        "postgresql+psycopg2://postgres.wqtphprgstseajqtkygk:"
    )
    # Switch to the Tokyo IPv4 pooler address
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "db.wqtphprgstseajqtkygk.supabase.co:5432",
        "aws-0-ap-northeast-1.pooler.supabase.com:6543"
    )

# Check if using SQLite to add specific args
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Add connect args for pooler (Supabase Pooler requires statement cache disabled for PgBouncer in transaction mode, 
    # but works fine with default if session mode. We'll add pool_pre_ping to handle drops)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
