import urllib.request
import urllib.error
import json
import sys

# Internal URL inside the container network (localhost:8000)
URL = "http://localhost:8000/api/auth/login/"
PAYLOAD = {
    "username": "admin",
    "password": "password123"
}

print(f"Testing Login API at: {URL}")

try:
    data = json.dumps(PAYLOAD).encode('utf-8')
    req = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        resp_body = response.read().decode('utf-8')
        print("✅ API Login SUCCESS!")
        print("Response:", json.dumps(json.loads(resp_body), indent=2))

except urllib.error.HTTPError as e:
    print(f"❌ API Login FAILED! Status: {e.code}")
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print(f"❌ Connection Error: {e}")

