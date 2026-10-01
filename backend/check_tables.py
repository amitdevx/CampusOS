import psycopg2

DATABASE_URL = "postgresql://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
for row in cursor.fetchall():
    print(row[0])
cursor.close()
conn.close()
