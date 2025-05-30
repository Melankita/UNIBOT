from playwright.sync_api import sync_playwright
import time
import re
import sys
import json

def fetch_attendance_details(mobile_number, password):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=150)
        page = browser.new_page()

        # Step 1: Login
        page.goto("http://kmit-netra.teleuniv.in/")
        page.fill("input#login_mobilenumber", mobile_number)
        page.fill("input#login_password", password)
        page.click("button.btn-signin")
        page.wait_for_load_state("networkidle")

        # Step 2: Attendance page
        page.goto("http://kmit-netra.teleuniv.in/student/attendance")
        page.wait_for_load_state("networkidle")
        page.click("text=Overall")
        time.sleep(3)

        # Step 3: Process subject attendance
        subjects = page.query_selector_all("table tbody tr")
        attendance_data = []

        for row in subjects:
            cols = row.query_selector_all("td")
            if len(cols) >= 3:
                subject = cols[0].inner_text().strip()
                theory_svg = cols[1].query_selector("svg")
                practical_svg = cols[2].query_selector("svg")

                if subject.endswith("LAB") and practical_svg:
                    percent = extract_svg_percentage(practical_svg)
                elif theory_svg:
                    percent = extract_svg_percentage(theory_svg)
                else:
                    percent = None

                if percent is not None:
                    attendance_data.append({
                        "subject": subject,
                        "attendance_percentage": round(percent, 2)
                    })

        overall_percentage = extract_overall_horizontal_bar(page)

        browser.close()
        return attendance_data, overall_percentage

def extract_svg_percentage(svg_element):
    try:
        circles = svg_element.query_selector_all("circle.ant-progress-circle-path")
        for c in circles:
            style = c.get_attribute("style") or ""
            opacity = c.get_attribute("opacity") or ""

            if "opacity: 1" in style or opacity.strip() == "1":
                dasharray_match = re.search(r"stroke-dasharray:\s*([\d.]+)px", style)
                dashoffset_match = re.search(r"stroke-dashoffset:\s*([\d.]+)", style)

                if dasharray_match and dashoffset_match:
                    dasharray = float(dasharray_match.group(1))
                    dashoffset = float(dashoffset_match.group(1))
                    return 100 * (1 - dashoffset / dasharray)
        return None
    except Exception as e:
        return None

def extract_overall_horizontal_bar(page):
    try:
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)

        overall_text = page.locator("text=Overall").nth(-1)
        bar_container = overall_text.locator("xpath=following::div[contains(@style, 'width')]").first

        style_attr = bar_container.get_attribute("style")
        if style_attr:
            match = re.search(r'width:\s*([\d.]+)%', style_attr)
            if match:
                return round(float(match.group(1)), 2)
    except Exception:
        pass
    return None

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python attendance_worker.py <mobile_number> <password>")
        sys.exit(1)

    mobile = sys.argv[1]
    pwd = sys.argv[2]
    try:
        data, overall = fetch_attendance_details(mobile, pwd)
        result = {
            "subjects": data,
            "overall_attendance": overall
        }
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
