from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re
import sys
import json

def extract_results_from_cmm_html(html):
    soup = BeautifulSoup(html, "html.parser")

    backlog_el = soup.find("span", id="backlogs")
    total_backlogs = backlog_el.text.strip() if backlog_el else "N/A"

    results_by_semester = {}

    for year_block in soup.select("div.year"):
        semester_titles = year_block.find_all("h2")

        for title in semester_titles:
            semester_name = title.text.strip()
            subjects = []
            sgpa = "N/A"
            credits_acquired = "N/A"

            table = title.find_next("table")
            if table:
                tbody = table.find("tbody")
                if tbody:
                    for row in tbody.find_all("tr"):
                        cols = row.find_all("td")
                        if len(cols) == 5:
                            subjects.append({
                                "subject": cols[1].text.strip(),
                                "grade_points": cols[2].text.strip(),
                                "grade": cols[3].text.strip(),
                                "credits": cols[4].text.strip()
                            })

                tfoot = table.find("tfoot")
                if tfoot:
                    sgpa_td = tfoot.find_all("td")[-1]
                    sgpa = sgpa_td.text.strip() if sgpa_td else "N/A"
                    credits_el = tfoot.select_one("span.creditsacquired")
                    credits_acquired = credits_el.text.strip() if credits_el else "N/A"

            results_by_semester[semester_name] = {
                "subjects": subjects,
                "SGPA": sgpa,
                "Credits Acquired": credits_acquired
            }

    return total_backlogs, results_by_semester

def fetch_and_parse_results(mobile_number, password):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_default_timeout(40000)

        page.goto("http://kmit-netra.teleuniv.in/")
        page.fill("input#login_mobilenumber", mobile_number)
        page.fill("input#login_password", password)
        page.click("button.btn-signin")
        page.wait_for_timeout(8000)

        page.goto("http://kmit-netra.teleuniv.in/student/results")
        page.wait_for_timeout(5000)

        page.click("text=EXTERNALS")
        page.wait_for_timeout(4000)

        try:
            iframe = next((f for f in page.frames if "externalmarks_app.php" in f.url), None)
            if not iframe:
                raise ValueError("Could not find iframe containing results")

            cmm_div = iframe.locator("div.cmm")
            cmm_div.wait_for(timeout=20000)
            html = cmm_div.inner_html()

            browser.close()
            return extract_results_from_cmm_html(html)

        except Exception as e:
            browser.close()
            return "N/A", {}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python result_worker.py <mobile_number> <password>")
        sys.exit(1)

    mobile = sys.argv[1]
    pwd = sys.argv[2]

    try:
        backlogs, results_by_semester = fetch_and_parse_results(mobile, pwd)
        result = {
            "total_backlogs": backlogs,
            "results": results_by_semester
        }
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
