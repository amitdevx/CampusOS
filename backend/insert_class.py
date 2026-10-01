import psycopg2
from datetime import datetime, timedelta

DATABASE_URL = "postgresql://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"

def run_updates():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Adding live test classes for today...")
    
    cursor.execute("SELECT id FROM subjects LIMIT 1;")
    subject = cursor.fetchone()
    if not subject:
        print("No subject found")
        return
        
    cursor.execute("SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1;")
    teacher = cursor.fetchone()
    
    cursor.execute("SELECT id FROM divisions LIMIT 1;")
    division = cursor.fetchone()
    
    now = datetime.now()
    start_time = now - timedelta(minutes=30)
    end_time = now + timedelta(minutes=90)
    
    insert_query = """
    INSERT INTO class_sessions (subject_id, teacher_id, division_id, room, start_time, end_time)
    VALUES (%s, %s, %s, 'Live Test Room', %s, %s)
    RETURNING id;
    """
    
    cursor.execute(insert_query, (subject[0], teacher[0], division[0], start_time, end_time))
    class_id = cursor.fetchone()[0]
    print(f"Added test class session (ID: {class_id}) for {start_time} to {end_time}.")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    run_updates()
