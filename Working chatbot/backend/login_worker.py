# login_worker.py
import sys
from playwright.sync_api import sync_playwright

def main():
    if len(sys.argv) < 3:
        print("ERROR: Missing arguments")
        sys.exit(1)

    mobile = sys.argv[1]
    password = sys.argv[2]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Launching browser...")

        try:
            page.goto("http://kmit-netra.teleuniv.in/", timeout=40000)
            print("Page loaded:", page.url)
        except:
            print("ERROR: Failed to load login page.")
            browser.close()
            sys.exit(1)

        try:
            page.wait_for_selector("input#login_mobilenumber", timeout=8000)
        except:
            print("ERROR: Login form did not load.")
            browser.close()
            sys.exit(1)

        page.fill("input#login_mobilenumber", mobile)
        page.fill("input#login_password", password)
        page.click("button.btn-signin")

        # Give it time to redirect
        page.wait_for_timeout(5000)
        final_url = page.url

        print("Final URL:", final_url)

        browser.close()

        if final_url != "http://kmit-netra.teleuniv.in/":
            print("success")
        else:
            print("ERROR: Invalid credentials")

if __name__ == "__main__":
    main()
