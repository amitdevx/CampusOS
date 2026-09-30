import requests
from bs4 import BeautifulSoup

url = "https://kpgcollegeigatpuri.ac.in/programmes-offered/"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers, verify=False)
soup = BeautifulSoup(resp.text, 'html.parser')

print("=== Content ===")
for p in soup.find_all(['h1', 'h2', 'h3', 'h4', 'li', 'td', 'th']):
    text = p.get_text(strip=True)
    if text:
        print(text)
