import requests
import json
import time
from datetime import datetime, timedelta, timezone

API = "https://campusos-api-3r6a.onrender.com"

def get_token(email, pw):
    r = requests.post(f"{API}/api/v1/auth/login", data={"username": email, "password": pw})
    if r.status_code == 200:
        return r.json()["access_token"]
    raise Exception(f"Login failed for {email}: {r.text}")

print("Starting brutal API tests...")

# Get tokens
t_admin = get_token("admin@campusos.com", "campusos2026")
t_student = get_token("student@campusos.com", "campusos2026")
t_faculty = get_token("faculty@campusos.com", "campusos2026")

h_admin = {"Authorization": f"Bearer {t_admin}"}
h_student = {"Authorization": f"Bearer {t_student}"}
h_faculty = {"Authorization": f"Bearer {t_faculty}"}

# 1. Booking overlap
print("Testing booking overlaps...")
res = requests.get(f"{API}/api/v1/campus/resources", headers=h_admin).json()
res_id = res[0]["id"]
now = datetime.now(timezone.utc)
end = now + timedelta(hours=1)
overlap_end = now + timedelta(minutes=30)

# Create first booking
b1 = requests.post(f"{API}/api/v1/campus/bookings", headers=h_faculty, json={
    "resource_id": res_id, "start_time": now.isoformat(), "end_time": end.isoformat()
})
assert b1.status_code == 200, f"Failed to book: {b1.text}"

# Try overlapping booking
b2 = requests.post(f"{API}/api/v1/campus/bookings", headers=h_admin, json={
    "resource_id": res_id, "start_time": now.isoformat(), "end_time": overlap_end.isoformat()
})
assert b2.status_code == 400, f"Overlap did not trigger 400: {b2.status_code} {b2.text}"

# 2. Mark attendance with bad QR
print("Testing bad QR token...")
qr_resp = requests.post(f"{API}/api/v1/attendance/mark/9999", headers=h_student, json={"token": "invalid_jwt_token_for_qr"})
assert qr_resp.status_code in [400, 422, 401, 403, 404], f"Bad QR token didn't fail securely: {qr_resp.status_code}"

# 3. Create event as student
print("Testing student event creation...")
evt_resp = requests.post(f"{API}/api/v1/campus/events", headers=h_student, json={
    "title": "Hacked Event", "description": "Should fail", "event_date": end.isoformat(), "location": "Any"
})
assert evt_resp.status_code == 403, f"Student created an event! {evt_resp.status_code}"

# 4. Notice without title
print("Testing notice without title...")
not_resp = requests.post(f"{API}/api/v1/campus/notices", headers=h_admin, json={
    "content": "No title"
})
assert not_resp.status_code == 422, f"Allowed notice without title! {not_resp.status_code}"

print("All edge cases perfectly secured.")
