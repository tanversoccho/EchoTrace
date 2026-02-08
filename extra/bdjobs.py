import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

URL = "https://bdjobs.com/h/"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

resp = requests.get(URL, headers=headers, timeout=30)
resp.raise_for_status()

soup = BeautifulSoup(resp.text, "lxml")

tenders = []

# each card
for card in soup.select("app-tender-card"):
    # Organization name
    org_div = card.select_one('div[title]')
    organization = org_div.get_text(strip=True) if org_div else None

    # Tender link + title
    a_tag = card.select_one("a[href]")
    title = a_tag.get_text(strip=True) if a_tag else None
    link = urljoin(URL, a_tag["href"]) if a_tag else None

    # Logo
    img = card.select_one("img")
    logo = img["src"] if img else None
    if logo and logo.startswith("//"):
        logo = "https:" + logo

    tenders.append({
        "organization": organization,
        "title": title,
        "link": link,
        "logo": logo,
    })

# Print results
for t in tenders:
    print("-" * 60)
    print(f"Organization : {t['organization']}")
    print(f"Title        : {t['title']}")
    print(f"Link         : {t['link']}")
    print(f"Logo         : {t['logo']}")

print(f"\nTotal tenders scraped: {len(tenders)}")
