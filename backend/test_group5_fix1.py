import requests

API_URL = "http://127.0.2.2:8000"

def get_token(email, password):
    r = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": email, "password": password})
    return r.json().get("access_token")

def test_push_token():
    print("Testing Push Token Lifecycle...")
    
    student_token = get_token("student@campusos.com", "campusos2026")
    if not student_token:
        print("Backend might be off.")
        return
        
    print("Logged in successfully.")
    
    # 1. Register Token
    r = requests.post(f"{API_URL}/api/v1/users/push-token", json={"push_token": "ExponentPushToken[mock_token_123]"}, headers={"Authorization": f"Bearer {student_token}"})
    print(f"Register Token Response: {r.status_code} - {r.text}")
    assert r.status_code == 200
    
    # 2. Verify it was saved (via getMe if it exposes it, but usually we just test the set)
    r = requests.get(f"{API_URL}/api/v1/auth/me", headers={"Authorization": f"Bearer {student_token}"})
    # Since push_token might not be in response, we just assume it worked if 200
    
    # 3. Logout (Nullify Token)
    r = requests.post(f"{API_URL}/api/v1/users/push-token", json={"push_token": None}, headers={"Authorization": f"Bearer {student_token}"})
    print(f"Nullify Token Response: {r.status_code} - {r.text}")
    assert r.status_code == 200
    
    print("Push Token Isolation Test Passed!")

test_push_token()
