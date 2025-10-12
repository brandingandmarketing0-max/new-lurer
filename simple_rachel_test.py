#!/usr/bin/env python3
"""
Simple Python script to test rachel link access with specific user agent.
Run this script to test the rachel endpoints.
"""

import requests
import time

# Configuration
BASE_URL = "https://www.viewit.bio"  # The actual domain
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

def test_rachel_link():
    """Test accessing the rachel link with the specified user agent."""
    
    # Test endpoints
    endpoints = ["/rachel", "/rachelirl", "/rachsotiny"]
    
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    print("Testing Rachel Links with User Agent:")
    print(f"User-Agent: {USER_AGENT}")
    print("=" * 80)
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        print(f"\nTesting: {url}")
        
        try:
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
            end_time = time.time()
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Time: {end_time - start_time:.2f} seconds")
            print(f"Final URL: {response.url}")
            print(f"Content Length: {len(response.content)} bytes")
            
            # Check for redirects
            if response.history:
                print(f"Redirects ({len(response.history)}):")
                for i, hist_resp in enumerate(response.history):
                    print(f"  {i+1}. {hist_resp.status_code} -> {hist_resp.url}")
            
            # Check for bot detection
            content = response.text.lower()
            bot_indicators = ['botd', 'bot detection', 'human verification', 'captcha', 'verification']
            found_indicators = [indicator for indicator in bot_indicators if indicator in content]
            
            if found_indicators:
                print(f"WARNING: Bot Detection Found: {', '.join(found_indicators)}")
            else:
                print("SUCCESS: No bot detection indicators found")
            
            # Save response to file
            filename = f"response_{endpoint.replace('/', '_')}.html"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"Response saved to: {filename}")
            
        except requests.exceptions.RequestException as e:
            print(f"ERROR: Request failed: {e}")
        
        print("-" * 40)
        time.sleep(1)  # Small delay between requests

if __name__ == "__main__":
    test_rachel_link()
