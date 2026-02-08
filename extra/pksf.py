
import requests
from bs4 import BeautifulSoup

URL = "https://pksf.org.bd/category/tender/"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

res = requests.get(URL, headers=headers, timeout=30)
res.raise_for_status()

soup = BeautifulSoup(res.text, "lxml")

main = soup.select_one("#main-content")
posts = main.select(".wgl_col-4.item")

results = []

for post in posts:
    # Date
    date_tag = post.select_one(".post_date")
    date = date_tag.get_text(strip=True) if date_tag else None

    # Title + link
    title_tag = post.select_one("h3.blog-post_title a")
    title = title_tag.get_text(strip=True) if title_tag else None
    link = title_tag["href"] if title_tag else None

    # Views
    views_tag = post.select_one(".post_views .described")
    views = views_tag.get_text(strip=True) if views_tag else None

    # Likes
    likes_tag = post.select_one(".sl-count")
    likes = likes_tag.get_text(strip=True) if likes_tag else None

    # Author (optional)
    author_tag = post.select_one(".post_author a")
    author = author_tag.get_text(strip=True) if author_tag else None

    results.append({
        "date": date,
        "title": title,
        "link": link,
        "views": views,
        "likes": likes,
        "author": author,
    })

# Print results
for r in results:
    print("-" * 80)
    for k, v in r.items():
        print(f"{k.capitalize():<8}: {v}")

print(f"\nTotal tenders found: {len(results)}")
