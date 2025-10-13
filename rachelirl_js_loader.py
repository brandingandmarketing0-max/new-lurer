#!/usr/bin/env python3
"""
Script to try loading rachelirl with JavaScript execution simulation.
This attempts to get the actual content that loads after the initial page.
"""

import requests
import time
import json
from bs4 import BeautifulSoup

# Configuration
TARGET_URL = "https://www.viewit.bio/rachelirl"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

def try_load_with_selenium():
    """Try using Selenium to load the page with JavaScript execution."""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        print("SELENIUM JAVASCRIPT LOADING ATTEMPT")
        print("=" * 50)
        
        # Set up Chrome options
        chrome_options = Options()
        chrome_options.add_argument(f'--user-agent={USER_AGENT}')
        chrome_options.add_argument('--headless')  # Run in background
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        # Create driver
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            print(f"Loading: {TARGET_URL}")
            driver.get(TARGET_URL)
            
            # Wait for page to load
            print("Waiting for page to load...")
            time.sleep(5)
            
            # Try to wait for specific elements that might appear
            try:
                # Wait for any content that's not just "Loading..."
                WebDriverWait(driver, 10).until(
                    lambda driver: "Loading..." not in driver.page_source or 
                    len(driver.find_elements(By.TAG_NAME, "img")) > 0
                )
                print("Content loaded!")
            except:
                print("Timeout waiting for content to load")
            
            # Get the final page source
            final_html = driver.page_source
            soup = BeautifulSoup(final_html, 'html.parser')
            
            # Extract content
            all_text = soup.get_text()
            images = soup.find_all('img')
            buttons = soup.find_all('button')
            links = soup.find_all('a')
            
            print(f"\nFINAL CONTENT ANALYSIS:")
            print(f"Text content length: {len(all_text)}")
            print(f"Images found: {len(images)}")
            print(f"Buttons found: {len(buttons)}")
            print(f"Links found: {len(links)}")
            
            print(f"\nFINAL TEXT CONTENT:")
            print("-" * 30)
            print(all_text)
            
            if images:
                print(f"\nIMAGES:")
                for i, img in enumerate(images):
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    print(f"  {i+1}. {src}")
                    if alt:
                        print(f"     Alt: {alt}")
            
            if buttons:
                print(f"\nBUTTONS:")
                for i, btn in enumerate(buttons):
                    text = btn.get_text().strip()
                    onclick = btn.get('onclick', '')
                    print(f"  {i+1}. {text}")
                    if onclick:
                        print(f"     Onclick: {onclick}")
            
            # Save the final HTML
            with open('rachelirl_selenium_result.html', 'w', encoding='utf-8') as f:
                f.write(final_html)
            print(f"\n[SAVE] Selenium result saved to: rachelirl_selenium_result.html")
            
            return {
                'success': True,
                'text_content': all_text,
                'images_count': len(images),
                'buttons_count': len(buttons),
                'links_count': len(links),
                'html_length': len(final_html)
            }
            
        finally:
            driver.quit()
            
    except ImportError:
        print("Selenium not available. Install with: pip install selenium")
        return None
    except Exception as e:
        print(f"Selenium error: {e}")
        return None

def try_multiple_requests():
    """Try multiple requests with different approaches."""
    print("\nMULTIPLE REQUEST ATTEMPT")
    print("=" * 50)
    
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    # Try with different headers
    variations = [
        headers,
        {**headers, 'Accept': '*/*'},
        {**headers, 'Cache-Control': 'no-cache'},
        {**headers, 'X-Requested-With': 'XMLHttpRequest'},
    ]
    
    results = []
    
    for i, test_headers in enumerate(variations):
        print(f"\nRequest {i+1}:")
        try:
            response = requests.get(TARGET_URL, headers=test_headers, timeout=30)
            soup = BeautifulSoup(response.text, 'html.parser')
            text = soup.get_text()
            
            print(f"  Status: {response.status_code}")
            print(f"  Content length: {len(response.content)}")
            print(f"  Text length: {len(text)}")
            print(f"  Loading screen: {'YES' if 'Loading...' in text else 'NO'}")
            
            results.append({
                'request': i+1,
                'status': response.status_code,
                'content_length': len(response.content),
                'text_length': len(text),
                'has_loading': 'Loading...' in text
            })
            
        except Exception as e:
            print(f"  Error: {e}")
            results.append({
                'request': i+1,
                'error': str(e)
            })
    
    return results

def main():
    """Main function to try different approaches."""
    print("RACHELIRL JAVASCRIPT LOADING ANALYSIS")
    print("=" * 60)
    print(f"Target: {TARGET_URL}")
    print("=" * 60)
    
    # Try Selenium first
    selenium_result = try_load_with_selenium()
    
    # Try multiple requests
    request_results = try_multiple_requests()
    
    # Save all results
    final_results = {
        'target_url': TARGET_URL,
        'selenium_result': selenium_result,
        'request_variations': request_results,
        'timestamp': time.time()
    }
    
    with open('rachelirl_js_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n[SAVE] Complete analysis saved to: rachelirl_js_analysis.json")
    
    # Summary
    print(f"\nSUMMARY:")
    if selenium_result and selenium_result.get('success'):
        print(f"  Selenium: SUCCESS - Content loaded")
        print(f"    Images: {selenium_result.get('images_count', 0)}")
        print(f"    Buttons: {selenium_result.get('buttons_count', 0)}")
    else:
        print(f"  Selenium: FAILED or not available")
    
    successful_requests = len([r for r in request_results if 'error' not in r])
    print(f"  HTTP Requests: {successful_requests}/{len(request_results)} successful")
    
    loading_screens = len([r for r in request_results if r.get('has_loading', False)])
    print(f"  Loading screens: {loading_screens}/{len(request_results)}")

if __name__ == "__main__":
    main()


