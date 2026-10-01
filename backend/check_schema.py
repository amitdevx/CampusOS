import psycopg2

DATABASE_URL = "postgresql://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()
cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'class_sessions';")
print(cursor.fetchall())
cursor.close()
conn.close()
