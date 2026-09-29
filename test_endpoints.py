import urllib.request
import json

def test_url(url, expected_str=None):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode('utf-8')
            status = response.getcode()
            if status == 200:
                print(f"✅ {url} is UP!")
                if expected_str and expected_str in body:
                    print(f"   -> Expected content found.")
            else:
                print(f"❌ {url} returned status {status}")
    except Exception as e:
        print(f"❌ {url} FAILED: {e}")

print("Testing Live Endpoints...")
test_url("https://campusos-api-3r6a.onrender.com/", "Welcome to CampusOS API")
test_url("https://campusos-api-3r6a.onrender.com/health", "ok")
test_url("https://campus-os-web-wgiw.vercel.app/", "<html")
