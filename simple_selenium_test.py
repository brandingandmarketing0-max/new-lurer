from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

def test_bot_protection():
    print("🤖 Testing Bot Protection with Python Selenium")
    print("=" * 60)
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Create driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    # Execute script to hide automation
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        print("📍 Navigating to http://localhost:3000/rachelirl...")
        driver.get("https://www.linkli.cc/josh")
        
        # Wait for page to load
        print("⏳ Waiting for page to load...")
        time.sleep(5)
        
        # Check current URL
        current_url = driver.current_url
        print(f"🔗 Current URL: {current_url}")
        
        # Check page title
        page_title = driver.title
        print(f"📄 Page Title: {page_title}")
        
        # Check if we got redirected to blocked page
        if "/blocked" in current_url:
            print("✅ SUCCESS: Bot was detected and redirected to /blocked!")
            print("🛡️ Bot protection is working correctly!")
            return True
            
        # Check if we can see the main content
        elif "/rachelirl" in current_url:
            print("⚠️ Bot was NOT blocked - checking content visibility...")
            
            # Try to find various elements
            content_found = {}
            
            try:
                # Check for loading screen
                loading_elements = driver.find_elements(By.CSS_SELECTOR, ".animate-spin")
                content_found["loading_screen"] = len(loading_elements) > 0
                print(f"🔄 Loading screen visible: {content_found['loading_screen']}")
                
                # Check for main content elements
                try:
                    h1_elements = driver.find_elements(By.TAG_NAME, "h1")
                    if h1_elements:
                        h1_text = h1_elements[0].text
                        content_found["profile_name"] = h1_text
                        print(f"👤 Profile name found: {h1_text}")
                    else:
                        content_found["profile_name"] = None
                        print("❌ No profile name found")
                except:
                    content_found["profile_name"] = None
                    print("❌ Error finding profile name")
                
                # Check for images
                try:
                    images = driver.find_elements(By.TAG_NAME, "img")
                    content_found["images_count"] = len(images)
                    print(f"🖼️ Images found: {len(images)}")
                    
                    # Check if images have src attributes
                    image_srcs = []
                    for img in images:
                        src = img.get_attribute("src")
                        if src:
                            image_srcs.append(src)
                    content_found["image_sources"] = image_srcs
                    print(f"🔗 Image sources: {len(image_srcs)}")
                    
                except:
                    content_found["images_count"] = 0
                    print("❌ Error finding images")
                
                # Check for buttons
                try:
                    buttons = driver.find_elements(By.TAG_NAME, "button")
                    content_found["buttons_count"] = len(buttons)
                    print(f"🔘 Buttons found: {len(buttons)}")
                    
                    # Check button text
                    button_texts = []
                    for btn in buttons:
                        text = btn.text
                        if text:
                            button_texts.append(text)
                    content_found["button_texts"] = button_texts
                    print(f"📝 Button texts: {button_texts}")
                    
                except:
                    content_found["buttons_count"] = 0
                    print("❌ Error finding buttons")
                
                # Check for cards/content containers
                try:
                    cards = driver.find_elements(By.CSS_SELECTOR, "[class*='Card']")
                    content_found["cards_count"] = len(cards)
                    print(f"🃏 Cards found: {len(cards)}")
                except:
                    content_found["cards_count"] = 0
                    print("❌ Error finding cards")
                
                # Check page source for sensitive content
                page_source = driver.page_source
                sensitive_keywords = ["rachelirl", "exclusive", "subscribe", "premium", "onlyfans"]
                found_keywords = []
                for keyword in sensitive_keywords:
                    if keyword.lower() in page_source.lower():
                        found_keywords.append(keyword)
                
                content_found["sensitive_keywords"] = found_keywords
                print(f"🔍 Sensitive keywords found: {found_keywords}")
                
                # Check if we can interact with elements
                try:
                    clickable_elements = driver.find_elements(By.CSS_SELECTOR, "[onclick], button, [role='button']")
                    content_found["clickable_elements"] = len(clickable_elements)
                    print(f"👆 Clickable elements: {len(clickable_elements)}")
                except:
                    content_found["clickable_elements"] = 0
                    print("❌ Error finding clickable elements")
                
                # Summary
                print("\n" + "="*60)
                print("📊 CONTENT DETECTION SUMMARY:")
                print("="*60)
                
                if content_found.get("profile_name"):
                    print("❌ FAILED: Bot can see profile name!")
                if content_found.get("images_count", 0) > 0:
                    print("❌ FAILED: Bot can see images!")
                if content_found.get("buttons_count", 0) > 0:
                    print("❌ FAILED: Bot can see buttons!")
                if content_found.get("sensitive_keywords"):
                    print(f"❌ FAILED: Bot can see sensitive keywords: {content_found['sensitive_keywords']}")
                
                # Overall assessment
                if any([content_found.get("profile_name"), 
                       content_found.get("images_count", 0) > 0,
                       content_found.get("buttons_count", 0) > 0,
                       content_found.get("sensitive_keywords")]):
                    print("\n🚨 OVERALL RESULT: Bot protection FAILED!")
                    print("   Bot was able to access and scrape content!")
                    return False
                else:
                    print("\n✅ OVERALL RESULT: Bot protection SUCCESS!")
                    print("   Bot was blocked from accessing content!")
                    return True
                    
            except Exception as e:
                print(f"❌ Error during content detection: {str(e)}")
                return False
        
        else:
            print(f"❓ Unexpected URL: {current_url}")
            return False
        
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
        return False
        
    finally:
        print("\n🏁 Test complete! Closing browser...")
        time.sleep(2)  # Give time to see results
        driver.quit()

def test_multiple_pages():
    """Test multiple pages to see if protection is consistent"""
    pages_to_test = ["/rachelirl", "/josh"]
    
    print("🔄 Testing multiple pages for bot protection...")
    print("=" * 60)
    
    results = {}
    
    for page in pages_to_test:
        print(f"\n🧪 Testing page: {page}")
        print("-" * 40)
        
        # Set up Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Create driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        try:
            driver.get(f"http://localhost:3000{page}")
            time.sleep(5)
            
            current_url = driver.current_url
            page_title = driver.title
            
            if "/blocked" in current_url:
                results[page] = "BLOCKED"
                print(f"✅ {page}: Bot was blocked!")
            else:
                results[page] = "NOT_BLOCKED"
                print(f"❌ {page}: Bot was NOT blocked!")
                
        except Exception as e:
            results[page] = f"ERROR: {str(e)}"
            print(f"💥 {page}: Error - {str(e)}")
            
        finally:
            driver.quit()
    
    print("\n" + "="*60)
    print("📊 FINAL RESULTS SUMMARY:")
    print("="*60)
    for page, result in results.items():
        status_emoji = "✅" if result == "BLOCKED" else "❌"
        print(f"{status_emoji} {page}: {result}")
    
    return results

if __name__ == "__main__":
    print("🚀 Starting comprehensive bot protection test...")
    
    # Test single page in detail
    print("\n1️⃣ DETAILED SINGLE PAGE TEST:")
    single_result = test_bot_protection()
    
    # Test multiple pages
    print("\n2️⃣ MULTIPLE PAGES TEST:")
    multiple_results = test_multiple_pages()
    
    print("\n🎯 FINAL VERDICT:")
    if single_result and all(result == "BLOCKED" for result in multiple_results.values()):
        print("🛡️ Bot protection is working PERFECTLY!")
    else:
        print("⚠️ Bot protection needs improvement!")