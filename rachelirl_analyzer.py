#!/usr/bin/env python3
"""
Targeted analyzer for viewit.bio/rachelirl specifically.
This script will deeply analyze the rachelirl link and its content.
"""

import requests
import time
from bs4 import BeautifulSoup
import json
import re

# Configuration
TARGET_URL = "https://www.viewit.bio/rachelirl"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

def analyze_rachelirl():
    """Deep analysis of the rachelirl link."""
    
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    print("RACHELIRL LINK DEEP ANALYSIS")
    print("=" * 50)
    print(f"Target URL: {TARGET_URL}")
    print(f"User-Agent: {USER_AGENT}")
    print("=" * 50)
    
    try:
        # Make the request
        start_time = time.time()
        response = requests.get(TARGET_URL, headers=headers, timeout=30, allow_redirects=True)
        end_time = time.time()
        
        print(f"\nRESPONSE INFO:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {end_time - start_time:.2f} seconds")
        print(f"Content Length: {len(response.content):,} bytes")
        print(f"Final URL: {response.url}")
        
        if response.history:
            print(f"\nREDIRECTS ({len(response.history)}):")
            for i, hist_resp in enumerate(response.history):
                print(f"  {i+1}. {hist_resp.status_code} -> {hist_resp.url}")
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check if it's a loading screen
        loading_indicators = ['loading', 'spinner', 'animate-spin', 'Loading...']
        is_loading = any(indicator.lower() in response.text.lower() for indicator in loading_indicators)
        
        print(f"\nLOADING SCREEN: {'YES' if is_loading else 'NO'}")
        
        if is_loading:
            print("\nANALYSIS: This appears to be a loading screen.")
            print("The actual content may be loaded via JavaScript after page load.")
        
        # Extract all text content
        all_text = soup.get_text()
        print(f"\nALL TEXT CONTENT:")
        print("-" * 30)
        print(all_text)
        
        # Look for JavaScript that might load content
        scripts = soup.find_all('script')
        print(f"\nJAVASCRIPT ANALYSIS:")
        print(f"Scripts found: {len(scripts)}")
        
        for i, script in enumerate(scripts):
            script_content = script.get_text().strip()
            if script_content:
                print(f"\nScript {i+1} (first 200 chars):")
                print(script_content[:200] + "..." if len(script_content) > 200 else script_content)
        
        # Look for specific patterns that might indicate content loading
        patterns_to_check = [
            r'rachelirl',
            r'rachel',
            r'creator',
            r'premium',
            r'onlyfans',
            r'https://[a-zA-Z0-9.-]+',
            r'String\.fromCharCode',
            r'chars\s*=\s*\[',
            r'decodeUrl',
            r'obfuscated'
        ]
        
        print(f"\nPATTERN ANALYSIS:")
        for pattern in patterns_to_check:
            matches = re.findall(pattern, response.text, re.IGNORECASE)
            if matches:
                print(f"  {pattern}: {len(matches)} matches")
                for match in matches[:3]:  # Show first 3 matches
                    print(f"    - {match}")
        
        # Check for meta tags
        meta_tags = soup.find_all('meta')
        print(f"\nMETA TAGS ({len(meta_tags)}):")
        for meta in meta_tags:
            name = meta.get('name', '')
            content = meta.get('content', '')
            property_attr = meta.get('property', '')
            if name or property_attr:
                print(f"  {name or property_attr}: {content}")
        
        # Check for any images
        images = soup.find_all('img')
        print(f"\nIMAGES ({len(images)}):")
        for i, img in enumerate(images):
            src = img.get('src', '')
            alt = img.get('alt', '')
            print(f"  {i+1}. {src}")
            if alt:
                print(f"     Alt: {alt}")
        
        # Check for any links
        links = soup.find_all('a')
        print(f"\nLINKS ({len(links)}):")
        for i, link in enumerate(links):
            href = link.get('href', '')
            text = link.get_text().strip()
            if href or text:
                print(f"  {i+1}. {href} - {text}")
        
        # Check for buttons
        buttons = soup.find_all('button')
        print(f"\nBUTTONS ({len(buttons)}):")
        for i, button in enumerate(buttons):
            text = button.get_text().strip()
            onclick = button.get('onclick', '')
            print(f"  {i+1}. {text}")
            if onclick:
                print(f"     Onclick: {onclick}")
        
        # Look for any hidden content or data attributes
        elements_with_data = soup.find_all(attrs={"data-something": True})
        print(f"\nELEMENTS WITH DATA ATTRIBUTES: {len(elements_with_data)}")
        
        # Check for any CSS classes that might indicate content
        all_classes = set()
        for element in soup.find_all(class_=True):
            all_classes.update(element.get('class', []))
        
        print(f"\nCSS CLASSES FOUND ({len(all_classes)}):")
        for cls in sorted(all_classes)[:20]:  # Show first 20
            print(f"  - {cls}")
        
        # Save the full response
        filename = "rachelirl_full_analysis.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"\n[SAVE] Full HTML saved to: {filename}")
        
        # Create a summary
        summary = {
            'url': TARGET_URL,
            'status_code': response.status_code,
            'response_time': end_time - start_time,
            'content_length': len(response.content),
            'is_loading_screen': is_loading,
            'scripts_count': len(scripts),
            'images_count': len(images),
            'links_count': len(links),
            'buttons_count': len(buttons),
            'meta_tags_count': len(meta_tags),
            'css_classes_count': len(all_classes),
            'all_text': all_text,
            'patterns_found': {pattern: len(re.findall(pattern, response.text, re.IGNORECASE)) for pattern in patterns_to_check}
        }
        
        with open('rachelirl_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n[SAVE] Analysis summary saved to: rachelirl_analysis.json")
        
        return summary
        
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Request failed: {e}")
        return None

if __name__ == "__main__":
    analyze_rachelirl()


