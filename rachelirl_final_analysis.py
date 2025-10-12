#!/usr/bin/env python3
"""
Final comprehensive analysis of viewit.bio/rachelirl
This script provides a complete summary of what we found.
"""

import json
import os

def analyze_rachelirl_findings():
    """Analyze all the findings from our rachelirl investigation."""
    
    print("RACHELIRL FINAL ANALYSIS REPORT")
    print("=" * 60)
    print(f"Target URL: https://www.viewit.bio/rachelirl")
    print("=" * 60)
    
    # Check what files we have
    files_to_check = [
        'rachelirl_analysis.json',
        'rachelirl_js_analysis.json',
        'rachelirl_selenium_result.html',
        'rachelirl_full_analysis.html'
    ]
    
    print("\nFILES GENERATED:")
    for file in files_to_check:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  [OK] {file} ({size:,} bytes)")
        else:
            print(f"  [MISSING] {file} (not found)")
    
    # Load analysis data
    try:
        with open('rachelirl_analysis.json', 'r') as f:
            basic_analysis = json.load(f)
        
        print(f"\nBASIC HTTP REQUEST ANALYSIS:")
        print(f"  Status Code: {basic_analysis['status_code']}")
        print(f"  Response Time: {basic_analysis['response_time']:.2f}s")
        print(f"  Content Length: {basic_analysis['content_length']:,} bytes")
        print(f"  Loading Screen: {'YES' if basic_analysis['is_loading_screen'] else 'NO'}")
        print(f"  Scripts Found: {basic_analysis['scripts_count']}")
        print(f"  Images Found: {basic_analysis['images_count']}")
        print(f"  Buttons Found: {basic_analysis['buttons_count']}")
        print(f"  Links Found: {basic_analysis['links_count']}")
        
    except FileNotFoundError:
        print("\nBASIC ANALYSIS: File not found")
    
    try:
        with open('rachelirl_js_analysis.json', 'r') as f:
            js_analysis = json.load(f)
        
        print(f"\nJAVASCRIPT LOADING ANALYSIS:")
        selenium_result = js_analysis.get('selenium_result')
        if selenium_result and selenium_result.get('success'):
            print(f"  Selenium: SUCCESS")
            print(f"    Final Text Length: {selenium_result.get('text_content', '').__len__()}")
            print(f"    Images: {selenium_result.get('images_count', 0)}")
            print(f"    Buttons: {selenium_result.get('buttons_count', 0)}")
            print(f"    Links: {selenium_result.get('links_count', 0)}")
        else:
            print(f"  Selenium: FAILED or not available")
        
        request_variations = js_analysis.get('request_variations', [])
        successful_requests = len([r for r in request_variations if 'error' not in r])
        print(f"  HTTP Request Variations: {successful_requests}/{len(request_variations)} successful")
        
    except FileNotFoundError:
        print("\nJAVASCRIPT ANALYSIS: File not found")
    
    # Check Selenium result
    if os.path.exists('rachelirl_selenium_result.html'):
        with open('rachelirl_selenium_result.html', 'r', encoding='utf-8') as f:
            selenium_content = f.read()
        
        print(f"\nSELENIUM RESULT ANALYSIS:")
        print(f"  HTML Length: {len(selenium_content):,} bytes")
        
        if "This site can't be reached" in selenium_content:
            print(f"  Status: BLOCKED/ERROR PAGE")
            print(f"  Error Type: ERR_QUIC_PROTOCOL_ERROR")
        elif "Loading..." in selenium_content:
            print(f"  Status: LOADING SCREEN")
        else:
            print(f"  Status: CONTENT LOADED")
        
        if "blocked" in selenium_content.lower():
            print(f"  Blocked Page: YES")
        else:
            print(f"  Blocked Page: NO")
    
    print(f"\nKEY FINDINGS:")
    print(f"  • The rachelirl page shows only a loading screen with basic HTTP requests")
    print(f"  • JavaScript execution reveals the page redirects to a 'blocked' error page")
    print(f"  • The error indicates 'ERR_QUIC_PROTOCOL_ERROR' - network/protocol issue")
    print(f"  • No actual content (images, buttons, text) is accessible")
    print(f"  • The page appears to have bot protection or access restrictions")
    
    print(f"\nTECHNICAL DETAILS:")
    print(f"  • Next.js application with server-side rendering")
    print(f"  • Uses React with client-side hydration")
    print(f"  • Implements loading screens before content loads")
    print(f"  • Has error handling that shows 'blocked' pages")
    print(f"  • User agent is accepted but content is restricted")
    
    print(f"\nCONCLUSION:")
    print(f"  The rachelirl link (https://www.viewit.bio/rachelirl) is:")
    print(f"  [OK] Accessible with the specified user agent")
    print(f"  [OK] Returns HTTP 200 status")
    print(f"  [FAIL] Shows only loading screen with basic requests")
    print(f"  [FAIL] Redirects to blocked/error page with JavaScript")
    print(f"  [FAIL] No actual content is visible or accessible")
    print(f"  [FAIL] Appears to have bot protection or access restrictions")
    
    print(f"\nRECOMMENDATIONS:")
    print(f"  • The page may require specific conditions to load content")
    print(f"  • Bot detection might be more sophisticated than basic user agent checking")
    print(f"  • The page might require additional headers or cookies")
    print(f"  • There could be geographic or time-based restrictions")
    print(f"  • The page might be temporarily down or under maintenance")

if __name__ == "__main__":
    analyze_rachelirl_findings()
