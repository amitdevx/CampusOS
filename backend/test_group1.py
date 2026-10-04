import requests
import json
import datetime

API_URL = "http://localhost:8000"

def run_tests():
    print("Testing Group 1: Security and Data Integrity")
    # 1. Login as SUPER_ADMIN
    print("Logging in as Super Admin...")
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": "superadmin@campusos.com", "password": "campusos2026"})
    sa_token = r.json()["access_token"]
    sa_headers = {"Authorization": f"Bearer {sa_token}"}
    
    # 2. Login as ADMIN
    print("Logging in as Admin...")
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": "admin@campusos.com", "password": "campusos2026"})
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 3. Create a test student
    print("Creating a test user...")
    import random
    rand_id = random.randint(1000, 9999)
    test_user_payload = {
        "email": f"testdeactivate{rand_id}@campusos.com",
        "password": "password123",
        "full_name": "Test Deactivate",
        "role": "STUDENT"
    }
    r = requests.post(f"{API_URL}/api/v1/auth/register", json=test_user_payload, headers=sa_headers)
    if r.status_code == 400: # Already exists
        r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": test_user_payload["email"], "password": "password123"})
        test_user_id = requests.get(f"{API_URL}/api/v1/auth/me", headers={"Authorization": f"Bearer {r.json()['access_token']}"}).json()["id"]
    else:
        test_user_id = r.json()["id"]
        
    # 4. Test Role Update (Super Admin vs Admin)
    print("Testing Role Update API...")
    r = requests.put(f"{API_URL}/api/v1/users/{test_user_id}/role", json={"role": "TEACHER"}, headers=admin_headers)
    assert r.status_code == 403, f"Admin should not be able to update role! Got {r.status_code}"
    
    r = requests.put(f"{API_URL}/api/v1/users/{test_user_id}/role", json={"role": "TEACHER"}, headers=sa_headers)
    assert r.status_code == 200, f"Super Admin should be able to update role! Got {r.status_code}"
    print("✓ Role Update Authorization Validated")
    
    # 5. Test Soft Deletion
    print("Testing Soft Delete API...")
    r = requests.delete(f"{API_URL}/api/v1/users/{test_user_id}", headers=sa_headers)
    assert r.status_code == 200, f"Failed to delete user: {r.text}"
    assert r.json()["role"] == "DEACTIVATED", "Role should be DEACTIVATED"
    
    # Try logging in as deactivated user
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": test_user_payload["email"], "password": "password123"})
    assert r.status_code == 403, f"Deactivated user should not be able to log in! Got {r.status_code}"
    print("✓ Soft Delete & Login Block Validated")
    
    print("\nAll Group 1 Tests Passed Successfully!")

if __name__ == "__main__":
    run_tests()
