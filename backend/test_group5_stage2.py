import requests
import json
import uuid

API_URL = "http://127.0.2.2:8000"

def get_token(email, password):
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": email, "password": password})
    return r.json().get("access_token")

def run_tests():
    print("--- Running Stage 2 End-to-End Tests ---")
    
    teacher_token = get_token("teacher@campusos.com", "campusos2026")
    student_token = get_token("student@campusos.com", "campusos2026")
    admin_token = get_token("admin@campusos.com", "campusos2026")
    super_token = get_token("superadmin@campusos.com", "campusos2026")
    
    assert teacher_token and student_token and admin_token, "Failed to get tokens"
    print("1. Authentication (All Roles): PASS")
    
    # Unauthorized Access Test (Student trying to access users)
    r = requests.get(f"{API_URL}/api/v1/users", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 403, f"Expected 403, got {r.status_code}"
    print("2. Authorization Strictness (Student -> Admin Route): PASS (403)")
    
    # QR Attendance Test
    # Teacher needs their class_session_id. Let's get the timetable
    r = requests.get(f"{API_URL}/api/v1/timetable/my-schedule", headers={"Authorization": f"Bearer {teacher_token}"})
    print(r.status_code, r.text)
    timetable = r.json()
    if not isinstance(timetable, list) or not timetable:
        print("No timetable found for teacher, skipping QR test")
    else:
        class_session_id = timetable[0]["id"]
        # Teacher starts session
        session_data = {"class_session_id": class_session_id, "duration_minutes": 60}
        r = requests.post(f"{API_URL}/api/v1/attendance/sessions", json=session_data, headers={"Authorization": f"Bearer {teacher_token}"})
        assert r.status_code == 200, f"Failed to start session {r.text}"
        session = r.json()
        qr_secret = session["qr_code_secret"]
        session_id = session["id"]
        print(f"Teacher created QR Session: {session_id}")
        
        # Student scans QR
        scan_data = {"session_id": session_id, "qr_code_secret": qr_secret}
        r = requests.post(f"{API_URL}/api/v1/attendance/sessions/{session_id}/scan", json=scan_data, headers={"Authorization": f"Bearer {student_token}"})
        assert r.status_code == 200, f"Student scan failed {r.text}"
        print("Student successfully scanned QR: PASS")
        
        # Student scans again (Duplicate)
        r = requests.post(f"{API_URL}/api/v1/attendance/sessions/{session_id}/scan", json=scan_data, headers={"Authorization": f"Bearer {student_token}"})
        assert r.status_code == 400 and "already recorded" in r.text, "Duplicate scan should fail"
        print("Duplicate QR scan prevention: PASS")

run_tests()

def run_booking_tests():
    print("--- Running Resource Booking Tests ---")
    teacher_token = get_token("teacher@campusos.com", "campusos2026")
    student_token = get_token("student@campusos.com", "campusos2026")
    admin_token = get_token("admin@campusos.com", "campusos2026")
    
    # Get resources
    r = requests.get(f"{API_URL}/api/v1/campus/resources", headers={"Authorization": f"Bearer {student_token}"})
    if r.status_code != 200 or not r.json():
        print("No resources found")
        return
    resource_id = r.json()[0]["id"]
    
    book_data = {
        "resource_id": resource_id,
        "start_time": "2026-12-01T10:00:00Z",
        "end_time": "2026-12-01T11:00:00Z"
    }
    
    # 1. Student Requests Booking
    r = requests.post(f"{API_URL}/api/v1/campus/bookings", json=book_data, headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    booking = r.json()
    assert booking["status"] == "PENDING"
    print("Student Booking (PENDING): PASS")
    
    # 2. Teacher Requests Overlapping Booking
    r = requests.post(f"{API_URL}/api/v1/campus/bookings", json=book_data, headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 200
    teacher_booking = r.json()
    assert teacher_booking["status"] == "APPROVED"
    print("Teacher Overlapping Booking (AUTO-APPROVED): PASS")
    
    # 3. Admin tries to approve student booking (Conflict)
    r = requests.put(f"{API_URL}/api/v1/campus/bookings/{booking['id']}/status?status=APPROVED", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 400
    print("Admin Conflict Rejection (400): PASS")

run_booking_tests()
