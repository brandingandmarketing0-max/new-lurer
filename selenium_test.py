from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def test_bot_protection():
    print("🤖 Testing Bot Protection with Python Selenium")
    print("=" * 50)
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Create driver
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🌐 Navigating to http://localhost:3000/josh...")
        driver.get("http://localhost:3000/josh")
        
        # Wait a moment for page to load
        time.sleep(3)
        
        # Check current URL
        current_url = driver.current_url
        print(f"🔗 Current URL: {current_url}")
        
        # Check page title
        page_title = driver.title
        print(f"📄 Page Title: {page_title}")
        
        # Check if we got blocked (404 error page)
        if "This site can't be reached" in page_title or "404" in page_title:
            print("✅ SUCCESS: Bot was blocked!")
            print("🔒 Selenium got the error page - protection is working!")
            
        # Check if we got redirected to human-check
        elif "/human-check" in current_url:
            print("🔄 Redirected to human-check page")
            print("⏳ Waiting for redirect back to /josh...")
            
            # Wait for redirect back
            WebDriverWait(driver, 10).until(
                lambda d: "/josh" in d.current_url
            )
            
            print("✅ Redirected back to /josh")
            print("❌ FAILED: Bot was not blocked - got through human-check")
            
        # Check if we can see Josh content
        elif "/josh" in current_url:
            try:
                # Look for Josh's name or content
                josh_element = driver.find_element(By.TAG_NAME, "h1")
                josh_text = josh_element.text
                print(f"👤 Found Josh element: {josh_text}")
                
                if "josh" in josh_text.lower():
                    print("❌ FAILED: Bot was not blocked - can see Josh content!")
                else:
                    print("✅ SUCCESS: Bot was blocked - no Josh content visible")
                    
            except:
                print("❌ FAILED: Bot was not blocked - page loaded successfully")
        
        else:
            print(f"❓ Unexpected URL: {current_url}")
        
        # Wait so you can see the result
        print("\n⏳ Waiting 5 seconds so you can see the result...")
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("🔒 This might mean the bot was blocked!")
        
    finally:
        print("\n🎯 Test complete! Closing browser...")
        driver.quit()

if __name__ == "__main__":
    test_bot_protection()
