from playwright.sync_api import sync_playwright
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
BULLETIN_URL = os.getenv("BULLETIN_URL", "https://www.kmit.in/bulletinboard1.php")

def fetch_bulletins():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto(BULLETIN_URL, timeout=60000)
                page.wait_for_load_state("networkidle", timeout=30000)
            except Exception as e:
                browser.close()
                return {"error": f"Failed to load bulletin page: {str(e)}"}

            try:
                page.wait_for_selector("table.table-bordered", timeout=15000)
            except:
                try:
                    page.wait_for_selector("table", timeout=10000)
                except:
                    browser.close()
                    return {"error": "Bulletin table not found"}

            rows = page.query_selector_all("table tbody tr")
            bulletins = []

            current_year = datetime.now().year
            for row in rows:
                columns = row.query_selector_all("td")
                if len(columns) >= 2:
                    date_text = columns[0].inner_text().strip()
                    details_text = columns[1].inner_text().strip()

                    try:
                        date_obj = datetime.strptime(date_text, "%d-%m-%Y")
                        if date_obj.year >= current_year - 1:  # Include last year
                            title = details_text.split("Title :")[-1].strip()
                            bulletins.append({
                                "date": date_obj.strftime("%d-%m-%Y"),
                                "title": title
                            })
                    except ValueError:
                        continue

            browser.close()
            return {"status": "success", "bulletins": bulletins}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    result = fetch_bulletins()
    if "error" in result:
        print(f"ERROR: {result['error']}")
    else:
        for bulletin in result["bulletins"]:
            print(f"{bulletin['date']} → Title: {bulletin['title']}")