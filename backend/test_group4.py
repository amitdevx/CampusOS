import requests

API_URL = "http://127.0.2.2:8000"

def get_token(email, password):
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": email, "password": password})
    if r.status_code != 200:
        print(f"Failed to login {email}: {r.status_code} - {r.text}")
    return r.json().get("access_token")

def test_booking():
    print("Testing Resource Booking...")
    # Admin login
    admin_token = get_token("admin@campusos.com", "campusos2026")
    if not admin_token:
        print("Admin token failed")
        return

    # Student login (assume exists or create)
    student_token = get_token("student@campusos.com", "campusos2026")
    if not student_token:
        print("Student not found, skip.")
        return
        
    print("Tokens retrieved.")
    # Fetch resources
    r = requests.get(f"{API_URL}/api/v1/campus/resources", headers={"Authorization": f"Bearer {student_token}"})
    resources = r.json()
    if not resources:
        print("No resources found")
        return
    resource_id = resources[0]["id"]
    
    # Student books
    print(f"Student booking resource {resource_id}...")
    book_data = {
        "resource_id": resource_id,
        "start_time": "2026-11-01T10:00:00Z",
        "end_time": "2026-11-01T11:00:00Z"
    }
    r = requests.post(f"{API_URL}/api/v1/campus/bookings", json=book_data, headers={"Authorization": f"Bearer {student_token}"})
    if r.status_code != 200:
        print(f"Booking failed! {r.text}")
        return
    booking_id = r.json()["id"]
    status = r.json()["status"]
    print(f"Booking created! Status: {status}")
    assert status == "PENDING"
    
    # Verify my bookings
    r = requests.get(f"{API_URL}/api/v1/campus/my-bookings", headers={"Authorization": f"Bearer {student_token}"})
    print(f"My bookings response: {r.status_code} - {r.text}")
    assert any(b["id"] == booking_id for b in r.json())
    print("My Bookings verified.")
    
    # Teacher books overlapping
    teacher_token = get_token("teacher@campusos.com", "campusos2026")
    print("Teacher books same slot...")
    r = requests.post(f"{API_URL}/api/v1/campus/bookings", json=book_data, headers={"Authorization": f"Bearer {teacher_token}"})
    print(f"Teacher booking status: {r.json().get('status')}")
    
    # Admin approves student booking (should fail if teacher took it, because teacher is auto-approved)
    print("Admin trying to approve student booking...")
    r = requests.put(f"{API_URL}/api/v1/campus/bookings/{booking_id}/status?status=APPROVED", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"Admin approval response: {r.status_code} - {r.text}")
    assert r.status_code == 400
    print("Conflict detection at approval verified!")
    
    print("All Group 4 Tests Passed!")

test_booking()
