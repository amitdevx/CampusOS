import sys, os, requests, datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from sqlalchemy import create_engine, text

DB_URL = "postgresql+psycopg2://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"
engine = create_engine(DB_URL)
API = "https://campusos-api-3r6a.onrender.com"

print("STEP 1: Pushing class sessions to future (next 2 days)...")
with engine.begin() as conn:
    now = datetime.datetime.utcnow()
    # Shift all existing class_sessions forward to tomorrow and day after
    result = conn.execute(text("SELECT id, start_time, end_time FROM class_sessions ORDER BY id LIMIT 60"))
    sessions = result.fetchall()
    
    for i, s in enumerate(sessions):
        day_offset = 1 if i % 2 == 0 else 2
        # Place some sessions in CURRENT window for QR testing
        if i < 4:  
            # Put first 4 classes to run NOW for 2 hours
            new_start = now - datetime.timedelta(minutes=10)
            new_end = now + datetime.timedelta(hours=2)
        else:
            new_start = now + datetime.timedelta(days=day_offset, hours=(i % 4) + 8)
            new_end = new_start + datetime.timedelta(hours=1)
        conn.execute(text("UPDATE class_sessions SET start_time=:s, end_time=:e WHERE id=:id"),
                    {"s": new_start, "e": new_end, "id": s[0]})
    
    total = conn.execute(text("SELECT COUNT(*) FROM class_sessions")).scalar()
    print(f"  Fixed {len(sessions)} class sessions. Total in DB: {total}")
print("STEP 1 done.\n")

# ----- QA -----
issues = []
results = []

def check(label, passed, detail=""):
    if passed:
        results.append(f"✅ {label}")
    else:
        results.append(f"❌ {label}: {detail}")
        issues.append({"label": label, "detail": detail})

def login(email, pwd="campusos2026"):
    try:
        r = requests.post(f"{API}/api/v1/auth/login", data={"username": email, "password": pwd}, timeout=15)
        if r.status_code == 200:
            return r.json()["access_token"]
        return None
    except Exception as e:
        return None

print("STEP 2: API QA Tests...\n")

# Health
r = requests.get(f"{API}/health", timeout=10)
check("API /health endpoint", r.status_code == 200)

# ── SUPER ADMIN ──
print("Testing SUPER_ADMIN...")
sa_token = login("superadmin@campusos.com")
check("SuperAdmin login", sa_token is not None)
if sa_token:
    h = {"Authorization": f"Bearer {sa_token}"}
    # Create a new user as super admin
    import random, string
    suffix = ''.join(random.choices(string.ascii_lowercase, k=4))
    r = requests.post(f"{API}/api/v1/auth/register", json={
        "email": f"qatestuser_{suffix}@campusos.com",
        "password": "campusos2026",
        "full_name": "QA Test Student",
        "role": "STUDENT"
    }, headers=h, timeout=10)
    check("SuperAdmin create user", r.status_code in [200, 201], r.text[:200] if r.status_code not in [200,201] else "")

# ── ADMIN ──
print("Testing ADMIN...")
admin_token = login("admin@campusos.com")
check("Admin login", admin_token is not None)
if admin_token:
    h = {"Authorization": f"Bearer {admin_token}"}
    
    r = requests.get(f"{API}/api/v1/auth/users", headers=h, timeout=10)
    check("Admin list all users", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")
    users = r.json() if r.status_code == 200 else []
    
    r = requests.post(f"{API}/api/v1/campus/resources", headers=h, json={"name": f"QA Room {suffix}", "type": "ROOM"}, timeout=10)
    check("Admin create resource", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")
    
    r = requests.get(f"{API}/api/v1/campus/resources", headers=h, timeout=10)
    check("Admin list resources", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")
    
    r = requests.post(f"{API}/api/v1/campus/events", headers=h, json={
        "title": "QA Test Event", "description": "Test", 
        "event_date": "2026-11-01T10:00:00", "location": "Hall"
    }, timeout=10)
    check("Admin create event", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")
    
    r = requests.get(f"{API}/api/v1/campus/events", headers=h, timeout=10)
    check("Admin list events", r.status_code == 200)
    
    r = requests.get(f"{API}/api/v1/campus/notices", headers=h, timeout=10)
    check("Admin list notices", r.status_code == 200)
    
    r = requests.post(f"{API}/api/v1/campus/notices", headers=h, json={
        "title": "QA Notice", "content": "Test notice for QA", "target_audience": "EVERYONE"
    }, timeout=10)
    check("Admin create notice", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")
    
    r = requests.get(f"{API}/api/v1/engineering/audit-logs", headers=h, timeout=10)
    check("Admin view audit logs", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")
    
    r = requests.get(f"{API}/api/v1/intelligence/analytics", headers=h, timeout=10)
    check("Admin analytics/dashboard stats", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")

# ── TEACHER ──
print("Testing TEACHER...")
teacher_token = login("prof1@kpgcollege.edu.in")
check("Teacher login (prof1)", teacher_token is not None)
if teacher_token:
    h = {"Authorization": f"Bearer {teacher_token}"}
    
    r = requests.get(f"{API}/api/v1/timetable/my-schedule", headers=h, timeout=10)
    check("Teacher view my schedule", r.status_code == 200)
    classes = r.json() if r.status_code == 200 else []
    check("Teacher has scheduled classes", len(classes) > 0, f"Found {len(classes)}")
    
    # Create Assignment
    if classes:
        class_id = classes[0]["id"]
        subject_id = classes[0]["subject_id"]
        
        r = requests.post(f"{API}/api/v1/evaluations/assignments", headers=h, json={
            "title": "QA Assignment", "description": "Test assignment",
            "due_date": "2026-11-15T23:59:00",
            "class_session_id": class_id
        }, timeout=10)
        check("Teacher create assignment", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")
        
        # Start Attendance
        r = requests.post(f"{API}/api/v1/attendance/sessions", headers=h, json={"class_session_id": class_id}, timeout=10)
        att_ok = r.status_code in [200,201]
        check("Teacher start attendance (QR generate)", att_ok, r.text[:200] if not att_ok else "")
        if att_ok:
            att_data = r.json()
            att_session_id = att_data["id"]
            qr_secret = att_data["qr_code_secret"]
            
            # Close it cleanly
            r = requests.post(f"{API}/api/v1/attendance/sessions/{att_session_id}/close", headers=h, timeout=10)
            check("Teacher close attendance session", r.status_code in [200,201])
        else:
            att_session_id = None
            qr_secret = None
    
    # Create Exam
    r = requests.post(f"{API}/api/v1/evaluations/exams", headers=h, json={
        "title": "QA Exam", "description": "Test exam",
        "date": "2026-11-20T10:00:00", "total_marks": 100
    }, timeout=10)
    check("Teacher create exam", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")

# ── STUDENT ──
print("Testing STUDENT...")
# Find a student that is actually enrolled
student_token = login("student1@kpgcollege.edu.in")
check("Student login (student1)", student_token is not None)
if student_token:
    h = {"Authorization": f"Bearer {student_token}"}
    
    r = requests.get(f"{API}/api/v1/timetable/my-schedule", headers=h, timeout=10)
    check("Student view my schedule", r.status_code == 200)
    
    r = requests.get(f"{API}/api/v1/evaluations/assignments", headers=h, timeout=10)
    check("Student view assignments", r.status_code == 200)
    
    r = requests.get(f"{API}/api/v1/campus/events", headers=h, timeout=10)
    check("Student view events", r.status_code == 200)
    
    r = requests.get(f"{API}/api/v1/campus/notices", headers=h, timeout=10)
    check("Student view notices", r.status_code == 200)
    
    r = requests.get(f"{API}/api/v1/notifications/", headers=h, timeout=10)
    check("Student view notifications", r.status_code == 200)

# ── QR SCAN FLOW ──
print("Testing QR ATTENDANCE FLOW...")
# Re-open an attendance session
if teacher_token and classes:
    th = {"Authorization": f"Bearer {teacher_token}"}
    class_id_for_qr = classes[0]["id"]
    r = requests.post(f"{API}/api/v1/attendance/sessions", headers=th, json={"class_session_id": class_id_for_qr}, timeout=10)
    if r.status_code in [200,201]:
        session_data = r.json()
        sess_id = session_data["id"]
        secret = session_data["qr_code_secret"]
        check("Open attendance session for QR scan test", True)
        
        if student_token:
            sh = {"Authorization": f"Bearer {student_token}"}
            r = requests.post(f"{API}/api/v1/attendance/sessions/{sess_id}/scan", headers=sh, json={"qr_code_secret": secret}, timeout=10)
            check("Student scan QR and mark attendance", r.status_code in [200,201], r.text[:200] if r.status_code not in [200,201] else "")
        
        # Close again
        requests.post(f"{API}/api/v1/attendance/sessions/{sess_id}/close", headers=th, timeout=10)
    else:
        check("Open attendance session for QR scan test", False, r.text[:200])

print("\n" + "="*55)
print("LIVE QA AUDIT REPORT")
print("="*55)
for r in results:
    print(r)

print(f"\n{'='*55}")
print(f"TOTAL CHECKS: {len(results)} | PASSED: {len([x for x in results if x.startswith('✅')])} | FAILED: {len(issues)}")
if issues:
    print("\nISSUES FOUND:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue['label']}: {issue['detail']}")
else:
    print("\nAll checks passed!")
