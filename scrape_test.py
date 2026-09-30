import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
url = "https://kpgcollegeigatpuri.ac.in/"
try:
    response = requests.get(url, headers=headers, verify=False, timeout=10)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Let's find all links to see the menu structure
    links = soup.find_all('a')
    for link in links:
        text = link.get_text(strip=True)
        href = link.get('href')
        if text and ('course' in text.lower() or 'program' in text.lower() or 'academics' in text.lower() or 'department' in text.lower()):
            print(f"Found: {text} -> {href}")
except Exception as e:
    print("Error:", e)
