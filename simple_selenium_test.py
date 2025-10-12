from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_bot_protection():
    print("Testing Bot Protection with Python Selenium")
    print("=" * 50)
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    
    # Create driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print("Navigating to http://localhost:3000/josh...")
        driver.get("https://www.linkli.cc/josh")
        
        # Wait for page to load
        time.sleep(3)
        
        # Check current URL
        current_url = driver.current_url
        print(f"Current URL: {current_url}")
        
        # Check page title
        page_title = driver.title
        print(f"Page Title: {page_title}")
        
        # Check if we got blocked
        if "This site can't be reached" in page_title or "404" in page_title:
            print("SUCCESS: Bot was blocked!")
            
        # Check if we can see Josh content
        elif "/josh" in current_url:
            try:
                josh_element = driver.find_element(By.TAG_NAME, "h1")
                josh_text = josh_element.text
                print(f"Found Josh element: {josh_text}")
                
                if "josh" in josh_text.lower():
                    print("FAILED: Bot was not blocked - can see Josh content!")
                else:
                    print("SUCCESS: Bot was blocked - no Josh content visible")
                    
            except:
                print("FAILED: Bot was not blocked - page loaded successfully")
        
        # Wait so you can see the result
        print("\nWaiting 5 seconds...")
        time.sleep(5)
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        
    finally:
        print("\nTest complete! Closing browser...")
        driver.quit()

if __name__ == "__main__":
    test_bot_protection()

