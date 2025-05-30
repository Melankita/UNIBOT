from playwright.sync_api import sync_playwright
import sys
import json

def get_timetable(mobile_number, password):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://kmit-netra.teleuniv.in/")

        page.fill("input#login_mobilenumber", mobile_number)
        page.fill("input#login_password", password)
        page.click("button.btn-signin")
        page.wait_for_timeout(4000)

        page.goto("http://kmit-netra.teleuniv.in/student/time-table")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3000)

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        timetable = {}

        for day in days:
            try:
                page.click(f"text={day}")
                page.wait_for_timeout(1000)

                rows = page.locator(f"text={day}").locator("xpath=following::table[1]//tbody/tr")

                schedule = []
                for i in range(rows.count()):
                    row = rows.nth(i)
                    cols = row.locator("td")
                    if cols.count() >= 2:
                        period = cols.nth(0).inner_text().strip()
                        subject = cols.nth(1).inner_text().strip()
                        schedule.append({"period": period, "subject": subject})

                if schedule:
                    timetable[day] = schedule

            except Exception:
                pass

        browser.close()
        return timetable

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python timetable_worker.py <mobile_number> <password>")
        sys.exit(1)

    mobile = sys.argv[1]
    pwd = sys.argv[2]

    try:
        data = get_timetable(mobile, pwd)
        print(json.dumps(data))
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
