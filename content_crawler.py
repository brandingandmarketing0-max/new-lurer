#!/usr/bin/env python3
"""
Enhanced Python script to crawl rachel links and extract visible content/data.
This script will parse HTML and show what data is actually accessible.
"""

import requests
import time
from bs4 import BeautifulSoup
import json
import re

# Configuration
BASE_URL = "https://www.viewit.bio"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

def extract_content_data(html_content, url):
    """Extract meaningful content from HTML."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    data = {
        'url': url,
        'title': '',
        'creator_name': '',
        'description': '',
        'images': [],
        'buttons': [],
        'text_content': [],
        'meta_data': {},
        'scripts': [],
        'has_loading_screen': False,
        'has_bot_detection': False,
        'obfuscated_urls': [],
        'analytics_tracking': []
    }
    
    # Extract title
    title_tag = soup.find('title')
    if title_tag:
        data['title'] = title_tag.get_text().strip()
    
    # Extract meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc:
        data['meta_data']['description'] = meta_desc.get('content', '')
    
    # Look for creator name patterns
    creator_patterns = [
        r'class="[^"]*text-[^"]*[^"]*"[^>]*>([^<]+)<',
        r'<h1[^>]*>([^<]+)</h1>',
        r'<h2[^>]*>([^<]+)</h2>',
        r'<span[^>]*>([^<]*Rachel[^<]*)</span>',
        r'<div[^>]*>([^<]*Rachel[^<]*)</div>'
    ]
    
    for pattern in creator_patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        for match in matches:
            if 'rachel' in match.lower() or any(name in match.lower() for name in ['creator', 'premium', 'verified']):
                data['creator_name'] = match.strip()
                break
        if data['creator_name']:
            break
    
    # Extract all text content
    text_elements = soup.find_all(['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    for element in text_elements:
        text = element.get_text().strip()
        if text and len(text) > 3:  # Filter out very short text
            data['text_content'].append(text)
    
    # Extract images
    img_tags = soup.find_all('img')
    for img in img_tags:
        src = img.get('src', '')
        alt = img.get('alt', '')
        if src:
            data['images'].append({
                'src': src,
                'alt': alt,
                'is_obfuscated': 'ufs.sh' in src or '2eovi9l2gc' in src
            })
    
    # Extract buttons and links
    button_tags = soup.find_all(['button', 'a'])
    for btn in button_tags:
        text = btn.get_text().strip()
        href = btn.get('href', '')
        onclick = btn.get('onclick', '')
        if text or href or onclick:
            data['buttons'].append({
                'text': text,
                'href': href,
                'onclick': onclick,
                'tag': btn.name
            })
    
    # Check for loading screen
    loading_indicators = ['loading', 'spinner', 'animate-spin', 'Loading...']
    for indicator in loading_indicators:
        if indicator.lower() in html_content.lower():
            data['has_loading_screen'] = True
            break
    
    # Check for bot detection
    bot_indicators = ['botd', 'bot detection', 'human verification', 'captcha', 'verification', 'blocked']
    for indicator in bot_indicators:
        if indicator.lower() in html_content.lower():
            data['has_bot_detection'] = True
            break
    
    # Look for obfuscated URLs (common pattern in the codebase)
    obfuscated_patterns = [
        r'https://[a-zA-Z0-9]+\.ufs\.sh/[a-zA-Z0-9]+',
        r'https://onlyfans\.com/[a-zA-Z0-9_]+',
        r'String\.fromCharCode\([^)]+\)',
        r'chars\s*=\s*\[[^\]]+\]'
    ]
    
    for pattern in obfuscated_patterns:
        matches = re.findall(pattern, html_content)
        data['obfuscated_urls'].extend(matches)
    
    # Extract script content
    script_tags = soup.find_all('script')
    for script in script_tags:
        script_content = script.get_text().strip()
        if script_content:
            data['scripts'].append(script_content[:200] + '...' if len(script_content) > 200 else script_content)
    
    # Look for analytics tracking
    analytics_patterns = [
        r'/api/track',
        r'analytics',
        r'tracking',
        r'click_type',
        r'fetch\s*\(\s*["\']/api/'
    ]
    
    for pattern in analytics_patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        data['analytics_tracking'].extend(matches)
    
    return data

def crawl_rachel_links():
    """Crawl rachel links and extract content data."""
    
    endpoints = ["/rachel", "/rachelirl", "/rachsotiny"]
    
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    print("RACHEL LINK CONTENT CRAWLER")
    print("=" * 60)
    print(f"User-Agent: {USER_AGENT}")
    print("=" * 60)
    
    all_results = []
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        print(f"\nCrawling: {url}")
        print("-" * 40)
        
        try:
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
            end_time = time.time()
            
            print(f"Status: {response.status_code}")
            print(f"Response Time: {end_time - start_time:.2f}s")
            print(f"Content Length: {len(response.content):,} bytes")
            
            if response.status_code == 200:
                # Extract content data
                content_data = extract_content_data(response.text, url)
                all_results.append(content_data)
                
                # Display extracted data
                print(f"\nEXTRACTED DATA:")
                print(f"   Title: {content_data['title']}")
                print(f"   Creator: {content_data['creator_name']}")
                print(f"   Description: {content_data['meta_data'].get('description', 'N/A')}")
                print(f"   Images Found: {len(content_data['images'])}")
                print(f"   Buttons/Links: {len(content_data['buttons'])}")
                print(f"   Text Elements: {len(content_data['text_content'])}")
                print(f"   Scripts: {len(content_data['scripts'])}")
                
                # Show key text content
                if content_data['text_content']:
                    print(f"\nKEY TEXT CONTENT:")
                    for i, text in enumerate(content_data['text_content'][:10]):  # Show first 10
                        print(f"   {i+1}. {text[:100]}{'...' if len(text) > 100 else ''}")
                
                # Show images
                if content_data['images']:
                    print(f"\nIMAGES:")
                    for i, img in enumerate(content_data['images'][:5]):  # Show first 5
                        print(f"   {i+1}. {img['src'][:80]}{'...' if len(img['src']) > 80 else ''}")
                        if img['alt']:
                            print(f"      Alt: {img['alt']}")
                        if img['is_obfuscated']:
                            print(f"      [OBFUSCATED] Obfuscated URL detected")
                
                # Show buttons/links
                if content_data['buttons']:
                    print(f"\nBUTTONS/LINKS:")
                    for i, btn in enumerate(content_data['buttons'][:5]):  # Show first 5
                        print(f"   {i+1}. {btn['text'][:50]}{'...' if len(btn['text']) > 50 else ''}")
                        if btn['href']:
                            print(f"      Link: {btn['href']}")
                
                # Show obfuscated URLs
                if content_data['obfuscated_urls']:
                    print(f"\nOBFUSCATED URLS:")
                    for i, url in enumerate(content_data['obfuscated_urls'][:3]):  # Show first 3
                        print(f"   {i+1}. {url}")
                
                # Show analytics tracking
                if content_data['analytics_tracking']:
                    print(f"\nANALYTICS TRACKING:")
                    for i, track in enumerate(set(content_data['analytics_tracking'][:5])):
                        print(f"   {i+1}. {track}")
                
                # Special indicators
                if content_data['has_loading_screen']:
                    print(f"\n[LOADING] LOADING SCREEN DETECTED")
                if content_data['has_bot_detection']:
                    print(f"\n[BOT] BOT DETECTION DETECTED")
                
                # Save detailed response
                filename = f"crawled_{endpoint.replace('/', '_')}.html"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print(f"\n[SAVE] Full HTML saved to: {filename}")
                
            else:
                print(f"ERROR: Failed to load page")
                
        except requests.exceptions.RequestException as e:
            print(f"ERROR: Request failed: {e}")
        
        print("\n" + "="*60)
        time.sleep(2)  # Delay between requests
    
    # Save all results to JSON
    with open('crawled_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    print(f"\nSUMMARY:")
    print(f"   Total pages crawled: {len(all_results)}")
    print(f"   Successful crawls: {len([r for r in all_results if r])}")
    print(f"   Data saved to: crawled_data.json")
    
    return all_results

if __name__ == "__main__":
    # Install required packages if not available
    try:
        import bs4
    except ImportError:
        print("Installing BeautifulSoup4...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'beautifulsoup4'])
        import bs4
    
    crawl_rachel_links()
