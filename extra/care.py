
import requests
from bs4 import BeautifulSoup

URL = "https://www.carebangladesh.org/consultancy" 

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

res = requests.get(URL, headers=headers, timeout=30)
res.raise_for_status()

soup = BeautifulSoup(res.text, "lxml")

# Target the active tab
project_tab = soup.select_one("div#project1.tab-pane.show.active")

if not project_tab:
    raise RuntimeError("Project tab not found")

tenders = []

# Each tender card
for card in project_tab.select("div.col-md-3"):
    # Deadline
    deadline_tag = card.select_one("p i")
    deadline = deadline_tag.get_text(strip=True) if deadline_tag else None

    # Title (second <p>)
    p_tags = card.find_all("p")
    title = p_tags[1].get_text(strip=True) if len(p_tags) > 1 else None

    # Download link
    a_tag = card.select_one("a.default-btn")
    download_url = a_tag["href"] if a_tag else None

    tenders.append({
        "deadline": deadline,
        "title": title,
        "download_url": download_url,
    })

# Output
for t in tenders:
    print("-" * 60)
    print(f"Deadline : {t['deadline']}")
    print(f"Title    : {t['title']}")
    print(f"Download : {t['download_url']}")

print(f"\nTotal tenders found: {len(tenders)}")
