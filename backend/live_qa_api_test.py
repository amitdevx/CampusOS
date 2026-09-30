import requests

API_URL = "https://campusos-api-3r6a.onrender.com"
print(f"Testing Live API at {API_URL}...")

def login(email, password="campusos2026"):
    try:
        res = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": email, "password": password}, timeout=15)
        if res.status_code == 200:
            return res.json()["access_token"]
        else:
            print(f"Login failed for {email}: {res.status_code} {res.text}")
            return None
    except Exception as e:
        print(f"Login request failed for {email}: {e}")
        return None

# 1. Login Admin
print("\n--- 1. Testing Admin Capabilities ---")
admin_token = login("admin@campusos.com")
if admin_token:
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test Create Resource
    res = requests.post(f"{API_URL}/api/v1/campus/resources", headers=headers, json={"name": "QA Server", "type": "EQUIPMENT"}, timeout=10)
    if res.status_code in [200, 201]:
        print("✅ Add Resource API works")
    else:
        print(f"❌ Add Resource failed: {res.text}")

    # Test Create Event
    res = requests.post(f"{API_URL}/api/v1/campus/events", headers=headers, json={"title": "QA Check Event", "description": "Testing events", "event_date": "2026-10-15T10:00:00Z", "location": "Main Hall"}, timeout=10)
    if res.status_code in [200, 201]:
        print("✅ Add Event API works")
    else:
        print(f"❌ Add Event failed: {res.text}")
        
    # Get all users
    res = requests.get(f"{API_URL}/api/v1/auth/users", headers=headers, timeout=10)
    users = res.json()
    teachers = [u for u in users if u["role"] == "TEACHER"]
    students = [u for u in users if u["role"] == "STUDENT"]
    print(f"✅ User listing works. Found {len(teachers)} teachers, {len(students)} students.")

# 2. Login Teacher & Test Attendance QR
print("\n--- 2. Testing Teacher Attendance QR Capabilities ---")
if teachers:
    teacher_email = "prof1@kpgcollege.edu.in"
    teacher_token = login(teacher_email)
    t_headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # Get teacher's schedule
    res = requests.get(f"{API_URL}/api/v1/timetable/my-schedule", headers=t_headers, timeout=10)
    classes = res.json()
    if classes:
        print(f"✅ Teacher schedule works. Found {len(classes)} classes.")
        class_id = classes[0]["id"]
        
        # Start Attendance
        res = requests.post(f"{API_URL}/api/v1/attendance/sessions", headers=t_headers, json={"class_session_id": class_id}, timeout=10)
        if res.status_code in [200, 201]:
            session_data = res.json()
            session_id = session_data["id"]
            qr_secret = session_data["qr_code_secret"]
            print(f"✅ Start Attendance Session works (ID: {session_id}, Secret: {qr_secret})")
            
            # 3. Login Student & Scan QR
            print("\n--- 3. Testing Student QR Scanning ---")
            if students:
                student_email = students[0]["email"]
                student_token = login(student_email)
                s_headers = {"Authorization": f"Bearer {student_token}"}
                
                # Scan QR
                res = requests.post(f"{API_URL}/api/v1/attendance/sessions/{session_id}/scan", headers=s_headers, json={"qr_code_secret": qr_secret}, timeout=10)
                if res.status_code in [200, 201]:
                    print("✅ Student QR Scan works (Attendance Marked!)")
                else:
                    print(f"❌ Student QR Scan failed: {res.text}")
            
            # Teacher Closes Attendance
            res = requests.post(f"{API_URL}/api/v1/attendance/sessions/{session_id}/close", headers=t_headers, timeout=10)
            if res.status_code in [200, 201]:
                print("✅ Close Attendance Session works")
            else:
                print(f"❌ Close Attendance failed: {res.text}")
                
        else:
            print(f"❌ Start Attendance failed: {res.text}")
    else:
        print("❌ Teacher schedule empty, cannot test attendance.")
