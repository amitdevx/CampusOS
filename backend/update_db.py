import psycopg2
from datetime import datetime, timedelta

DATABASE_URL = "postgresql://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"

def run_updates():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # 1. Update emails
    print("Updating emails...")
    cursor.execute("UPDATE users SET email = REPLACE(email, '@kpgcollege.edu.in', '@gmail.com') WHERE email LIKE '%@kpgcollege.edu.in';")
    print(f"Updated {cursor.rowcount} emails.")
    
    # 2. Add classes for today to timetable
    print("Adding live test classes for today...")
    
    # Get a subject and teacher
    cursor.execute("SELECT id FROM subjects LIMIT 1;")
    subject = cursor.fetchone()
    if not subject:
        print("No subjects found.")
        return
        
    cursor.execute("SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1;")
    teacher = cursor.fetchone()
    if not teacher:
        print("No teachers found.")
        return

    cursor.execute("SELECT id FROM academic_batches LIMIT 1;")
    batch = cursor.fetchone()
    if not batch:
        print("No batches found.")
        return

    now = datetime.now()
    # Add a class covering right now (-1 hour to +1 hour)
    start_time = now - timedelta(minutes=30)
    end_time = now + timedelta(minutes=90)
    
    # We will insert a class into `timetable`
    day_of_week = now.strftime('%A').upper()
    
    insert_query = """
    INSERT INTO timetable (subject_id, teacher_id, batch_id, day_of_week, start_time, end_time, room_number)
    VALUES (%s, %s, %s, %s, %s, %s, 'Live Test Room')
    RETURNING id;
    """
    
    cursor.execute(insert_query, (subject[0], teacher[0], batch[0], day_of_week, start_time.time(), end_time.time()))
    class_id = cursor.fetchone()[0]
    print(f"Added test class (ID: {class_id}) for {day_of_week} from {start_time.strftime('%H:%M')} to {end_time.strftime('%H:%M')}.")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    run_updates()
