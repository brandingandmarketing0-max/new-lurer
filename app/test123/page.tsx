"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3, AlertTriangle, X } from "lucide-react"
import { UAParser } from 'ua-parser-js';

// BotD import (npm)
import { load } from '@fingerprintjs/botd';

const getReadableReferrer = (ref: string) => {
  if (!ref) return "Direct or unknown";
  if (ref.includes("instagram.com")) return "Instagram";
  if (ref.includes("twitter.com") || ref.includes("x.com")) return "Twitter/X";
  if (ref.includes("facebook.com")) return "Facebook";
  if (ref.includes("tiktok.com")) return "TikTok";
  if (ref.includes("linkedin.com")) return "LinkedIn";
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "WhatsApp";
  return ref;
};

// In-App Browser Detection using ua-parser-js
type DetectResult = {
  isMobile: boolean;
  isAndroid: boolean;
  isiOS: boolean;
  isInstagram: boolean;
  isFacebookInApp: boolean;
  isInAppBrowser: boolean;
  reasons: string;
  ua: string;
  deviceType?: string;
  osName?: string;
  browserName?: string;
};

function detectInAppBrowser(): DetectResult {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  // Use ua-parser-js for reliable device/browser detection
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();
  
  const isAndroid = os.name?.toLowerCase() === 'android';
  const isiOS = os.name?.toLowerCase() === 'ios' || /iphone|ipad|ipod/.test(ua.toLowerCase());
  const isMobile = device.type === 'mobile' || isAndroid || isiOS;

  // Check for in-app browsers
  const uaLower = ua.toLowerCase();
  const isInstagram = /instagram/.test(uaLower);
  const isFacebookInApp = /fbav|fban|facebook/.test(uaLower);
  const isTwitter = /twitter/.test(uaLower);
  const isTikTok = /tiktok/.test(uaLower);
  const isSnapchat = /snapchat/.test(uaLower);
  const isLinkedIn = /linkedinapp/.test(uaLower);
  const isWhatsApp = /whatsapp/.test(uaLower);
  
  // Check referrer
  const ref = typeof document !== 'undefined' ? document.referrer.toLowerCase() : '';
  const refIsInstagram = /instagram\.com/.test(ref);
  const refIsFacebook = /facebook\.com/.test(ref);

  // iOS webview detection
  const hasSafari = /safari/.test(uaLower) && !/chrome/.test(uaLower);
  const isStandalone = typeof (window as any).navigator !== 'undefined' && !!(window as any).navigator.standalone;
  const isWebviewIOSSuspect = isiOS && !hasSafari && !isStandalone;

  // Test window.open behavior
  let windowOpenBlocked = false;
  try {
    const w = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    if (!w) windowOpenBlocked = true;
    else w.close();
  } catch (e) {
    windowOpenBlocked = true;
  }

  // Determine if in-app browser
  const isInAppBrowser = isInstagram || isFacebookInApp || isTwitter || isTikTok || 
                        isSnapchat || isLinkedIn || isWhatsApp || 
                        isWebviewIOSSuspect || windowOpenBlocked || 
                        refIsInstagram || refIsFacebook;

  const reasons: string[] = [];
  if (isInstagram) reasons.push('ua:instagram');
  if (isFacebookInApp) reasons.push('ua:facebook');
  if (isTwitter) reasons.push('ua:twitter');
  if (isTikTok) reasons.push('ua:tiktok');
  if (isSnapchat) reasons.push('ua:snapchat');
  if (isLinkedIn) reasons.push('ua:linkedin');
  if (isWhatsApp) reasons.push('ua:whatsapp');
  if (isWebviewIOSSuspect) reasons.push('ios-no-safari-in-ua');
  if (windowOpenBlocked) reasons.push('window.open-blocked');
  if (refIsInstagram) reasons.push('referrer-instagram');
  if (refIsFacebook) reasons.push('referrer-facebook');

  return {
    isMobile,
    isAndroid,
    isiOS,
    isInstagram,
    isFacebookInApp,
    isInAppBrowser,
    reasons: reasons.join('|') || 'none',
    ua,
    deviceType: device.type || 'unknown',
    osName: os.name || 'unknown',
    browserName: browser.name || 'unknown',
  };
}

// Automatic handoff function - tries multiple techniques without user interaction
// Based on best-effort methods for iOS/Instagram webviews
async function attemptAutomaticHandoff(finalUrl: string, detection: DetectResult): Promise<void> {
  const ua = navigator.userAgent || '';
  
  // Utility: attempt window.open and return true if returned a window reference
  function tryWindowOpen(url: string): boolean {
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      return !!w;
    } catch (e) {
      return false;
    }
  }

  // Utility: try programmatic anchor click
  function tryAnchorClick(url: string): boolean {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);

      // dispatch click event
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      let dispatched = a.dispatchEvent(ev);

      // also call legacy click as fallback
      try { (a as any).click(); } catch (err) {}

      // remove
      document.body.removeChild(a);
      return dispatched;
    } catch (e) {
      return false;
    }
  }

  // Utility: try form submit target=_blank
  function tryFormSubmit(url: string): boolean {
    try {
      const form = document.createElement('form');
      form.action = url;
      form.method = 'GET';
      form.target = '_blank';
      form.style.display = 'none';
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Small visual/interaction "nudge" using focus/blur
  function focusNudge(): void {
    try {
      window.focus?.();
      const input = document.createElement('input');
      input.style.position = 'absolute';
      input.style.opacity = '0';
      input.style.height = '0';
      input.style.width = '0';
      document.body.appendChild(input);
      input.focus();
      input.blur();
      document.body.removeChild(input);
    } catch (e) {}
  }

  // Android intent - Try multiple formats to open directly in Chrome
  function tryAndroidIntent(url: string): boolean {
    if (!detection.isAndroid) return false;
    
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    
    // Method 1: Direct Chrome intent (most likely to work without popup)
    try {
      const chromeIntent = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      window.location.href = chromeIntent;
      return true;
    } catch (e) {
      // Continue to next method
    }
    
    // Method 2: Try with window.open (sometimes bypasses popup)
    try {
      const chromeIntent = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      const win = window.open(chromeIntent, '_blank');
      if (win) return true;
    } catch (e) {
      // Continue
    }
    
    // Method 3: Standard intent (fallback)
    try {
      const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      window.location.href = intentUrl;
      return true;
    } catch (e) {
      return false;
    }
    
    return false;
  }

  // Android: Try direct Chrome scheme (alternative method)
  function tryAndroidChromeScheme(url: string): boolean {
    if (!detection.isAndroid) return false;
    try {
      // Try chrome:// URL scheme (if Chrome is set as default)
      const chromeUrl = url.replace(/^https?:\/\//, 'chrome://');
      window.location.href = chromeUrl;
      // If that doesn't work, fallback happens automatically
      setTimeout(() => {
        // If still here after 500ms, try intent
        tryAndroidIntent(url);
      }, 500);
      return true;
    } catch (e) {
      return false;
    }
  }

  // iOS-specific: Try visible link click (sometimes works better than hidden)
  function tryVisibleLinkClick(url: string): boolean {
    if (!detection.isiOS) return false;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      // Make it visible but tiny and positioned off-screen
      a.style.position = 'fixed';
      a.style.top = '0';
      a.style.left = '0';
      a.style.width = '1px';
      a.style.height = '1px';
      a.style.opacity = '0.01';
      a.style.pointerEvents = 'auto';
      document.body.appendChild(a);
      
      // Force a layout recalculation
      void a.offsetHeight;
      
      // Try multiple click methods
      const ev1 = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: 0 });
      a.dispatchEvent(ev1);
      
      // Also try touch event (iOS specific)
      const ev2 = new TouchEvent('touchstart', { bubbles: true, cancelable: true, view: window } as any);
      try { a.dispatchEvent(ev2); } catch {}
      
      // Legacy click
      try { (a as any).click(); } catch {}
      
      // Remove after a delay
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
      }, 100);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // iOS-specific: Aggressive location.href attempts with delays
  async function tryIOSLocationHref(url: string): Promise<void> {
    if (!detection.isiOS) return;
    
    // Try multiple times with increasing delays
    const attempts = [100, 300, 600, 1000];
    for (const delay of attempts) {
      await new Promise((r) => setTimeout(r, delay));
      try {
        window.location.href = url;
        // If this succeeds, we'll navigate away
        return;
      } catch (e) {
        // Continue to next attempt
      }
    }
  }

  // iOS-specific: Create a full-screen invisible button that auto-clicks (simulates user tap)
  function tryIOSFullScreenButton(url: string): boolean {
    if (!detection.isiOS) return false;
    try {
      const button = document.createElement('button');
      button.style.position = 'fixed';
      button.style.top = '0';
      button.style.left = '0';
      button.style.width = '100%';
      button.style.height = '100%';
      button.style.opacity = '0';
      button.style.zIndex = '999999';
      button.style.cursor = 'pointer';
      button.style.border = 'none';
      button.style.background = 'transparent';
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      button.appendChild(link);
      document.body.appendChild(button);
      
      // Immediately trigger click
      setTimeout(() => {
        try {
          // Try clicking the link inside
          const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          link.dispatchEvent(clickEvent);
          (link as any).click();
          
          // Also try touching the button (iOS touch event)
          const touchEvent = new TouchEvent('touchend', { bubbles: true, cancelable: true, view: window } as any);
          try { button.dispatchEvent(touchEvent); } catch {}
        } catch (e) {}
        
        // Remove after attempt
        setTimeout(() => {
          try { document.body.removeChild(button); } catch {}
        }, 200);
      }, 50);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // Sequence of attempts
  // 1) immediate window.open
  if (tryWindowOpen(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'opened_via_window_open', ua: ua.slice(0, 300), page: 'test123' });
    return;
  }

  await new Promise((r) => setTimeout(r, 160));

  // 2) Android: Try Chrome scheme first (might bypass popup)
  if (detection.isAndroid && tryAndroidChromeScheme(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'attempted_android_chrome_scheme', ua: ua.slice(0, 300), page: 'test123' });
    await new Promise((r) => setTimeout(r, 600));
  }

  // 3) Android intent (for Android devices) - tries multiple formats
  if (detection.isAndroid && tryAndroidIntent(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'opened_via_android_intent', ua: ua.slice(0, 300), page: 'test123' });
    // Give it time to open - if popup appears, user needs to click OK (we can't auto-click system dialogs)
    await new Promise((r) => setTimeout(r, 1000));
    return;
  }

  // 4) iOS-specific: Try full-screen invisible button (simulates user tap)
  if (detection.isiOS && tryIOSFullScreenButton(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'attempted_ios_fullscreen_button', ua: ua.slice(0, 300), page: 'test123' });
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 5) iOS-specific: Try visible link click (works better on iOS sometimes)
  if (detection.isiOS && tryVisibleLinkClick(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'attempted_visible_link_click_ios', ua: ua.slice(0, 300), page: 'test123' });
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 6) Android: One more attempt with window.open + intent
  if (detection.isAndroid) {
    try {
      const urlWithoutProtocol = finalUrl.replace(/^https?:\/\//, '');
      const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(finalUrl)};end`;
      // Try window.open with intent - sometimes works better
      window.open(intentUrl, '_system');
      beaconVisit({ ts: Date.now(), event: 'attempted_android_window_open_intent', ua: ua.slice(0, 300), page: 'test123' });
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      // Continue
    }
  }

  // 7) programmatic anchor click
  if (tryAnchorClick(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'attempted_anchor_click', ua: ua.slice(0, 300), page: 'test123' });
    await new Promise((r) => setTimeout(r, 900));
  }

  // 8) focus/blur nudge then re-try anchor click
  focusNudge();
  await new Promise((r) => setTimeout(r, 120));
  if (tryAnchorClick(finalUrl)) {
    beaconVisit({ ts: Date.now(), event: 'attempted_anchor_click_after_nudge', ua: ua.slice(0, 300), page: 'test123' });
    await new Promise((r) => setTimeout(r, 900));
  }

  // 9) iOS-specific: Aggressive location.href attempts
  if (detection.isiOS) {
    await tryIOSLocationHref(finalUrl);
    beaconVisit({ ts: Date.now(), event: 'attempted_ios_location_href', ua: ua.slice(0, 300), page: 'test123' });
    // If location.href worked, we navigated away, so return
    await new Promise((r) => setTimeout(r, 500));
  }

  // 10) try form submit
  tryFormSubmit(finalUrl);
  beaconVisit({ ts: Date.now(), event: 'attempted_form_submit', ua: ua.slice(0, 300), page: 'test123' });
  await new Promise((r) => setTimeout(r, 700));

  // 11) iOS: One more aggressive attempt with location.href
  if (detection.isiOS) {
    try {
      window.location.href = finalUrl;
      return; // If this works, we navigate away
    } catch (e) {
      // Continue
    }
  }

  // 12) last fallback: replace to final (keeps user inside webview but at least navigates)
  try {
    window.location.replace(finalUrl);
  } catch (e) {
    // ignore
  }

  beaconVisit({ ts: Date.now(), event: 'auto_attempts_finished', ua: ua.slice(0, 300), page: 'test123' });
}

// Beacon helper: tries navigator.sendBeacon, falls back to fetch
function beaconVisit(payload: Record<string, any>) {
  try {
    const url = '/api/visit-beacon';
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      (navigator as any).sendBeacon(url, blob);
      return;
    }
    // fallback
    fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  } catch (err) {
    // ignore errors
  }
}

export default function ProfilePage() {
  const [referrer, setReferrer] = useState<string>("");
  const [rawReferrer, setRawReferrer] = useState<string>("");
  const [showAgeWarning, setShowAgeWarning] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [botDetectionComplete, setBotDetectionComplete] = useState<boolean>(false);
  const [browserDetection, setBrowserDetection] = useState<DetectResult | null>(null);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState<boolean>(false);
  
  // Obfuscation helper functions
  const decodeUrl = () => {
    const chars = [104, 116, 116, 112, 115, 58, 47, 47, 111, 110, 108, 121, 102, 97, 110, 115, 46, 99, 111, 109, 47, 116, 101, 115, 116, 49, 50, 51];
    return chars.map(c => String.fromCharCode(c)).join("");
  };
  
  // Image URL obfuscation
  const getObfuscatedImageUrl = (imageId: string) => {
    const baseUrl = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 50, 101, 111, 118, 105, 57, 108, 50, 103, 99, 46, 117, 102, 115, 46, 115, 104, 47, 102, 47);
    return baseUrl + imageId;
  };
  
  // Dummy functions to confuse crawlers
  const dummyFunction1 = () => "https://example.com";
  const dummyFunction2 = () => "https://google.com";
  const dummyFunction3 = () => "https://facebook.com";

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect in-app browser FIRST - before anything else
    const browserDet = detectInAppBrowser();
    setBrowserDetection(browserDet);

    // Send beacon for analytics
    beaconVisit({
      ts: Date.now(),
      path: window.location.pathname + window.location.search,
      ua: browserDet.ua.slice(0, 300),
      isInAppBrowser: browserDet.isInAppBrowser,
      isInstagram: browserDet.isInstagram,
      isAndroid: browserDet.isAndroid,
      isiOS: browserDet.isiOS,
      reasons: browserDet.reasons,
      page: "test123",
    });

    // IMMEDIATE: If in Instagram's in-app browser, automatically try to open in default browser
    // Use sessionStorage to prevent multiple attempts across re-renders
    const redirectKey = 'instagram_redirect_attempted';
    const hasTriedRedirect = sessionStorage.getItem(redirectKey);
    
    if (browserDet.isInAppBrowser && browserDet.isMobile && !hasTriedRedirect) {
      sessionStorage.setItem(redirectKey, 'true');
      setHasAttemptedRedirect(true);
      
      // Automatically attempt handoff to default browser (no modal, silent attempt)
      const currentUrl = window.location.href;
      attemptAutomaticHandoff(currentUrl, browserDet).catch(() => {
        // If all attempts fail silently, just continue showing the page
      });
    }

    // User Agent check - IMMEDIATE, before any content renders
    const userAgent = navigator.userAgent;
    
    // Block FirecrawlApp specifically
    if (userAgent.includes('FirecrawlApp')) {
      window.location.replace('/blocked');
      return;
    }
    
    // BotD check - IMMEDIATE, before any content renders
    (async () => {
      try {
        const botd = await load({ monitoring: false });
        const result = await botd.detect();
        
        // BotD returns { bot: true/false, botKind?: BotKind }
        if (result.bot === true) {
          window.location.replace('/blocked');
          return;
        }
        
        // Only set complete if not a bot
        setBotDetectionComplete(true);
      } catch (error) {
        // If BotD fails, allow user through (don't block on errors)
        console.error('BotD detection failed:', error);
        setBotDetectionComplete(true);
      }
    })();

    const rawRef = document.referrer;
    setRawReferrer(rawRef);
    setReferrer(getReadableReferrer(rawRef));

    // Image protection handlers
    const preventImageActions = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventImageContextMenu = (e: MouseEvent) => {
      // Allow normal right-click everywhere - no blocking
      return true;
    };

    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventImageSelection = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };

    // Add protection to all images
    const addImageProtection = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('dragstart', preventDragStart);
        img.addEventListener('selectstart', preventImageSelection);
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        (img.style as any).webkitTouchCallout = 'none';
        img.draggable = false;
      });
    };

    // Add global protection only for drag/select
    document.addEventListener('selectstart', preventImageSelection);
    document.addEventListener('dragstart', preventDragStart);

    // Set images loaded after a delay and dynamically load avatar
    setTimeout(() => {
      setImagesLoaded(true);
      addImageProtection();
      
      // Dynamically create and insert avatar image
      const avatarContainer = document.getElementById('avatar-container');
      if (avatarContainer) {
        const img = document.createElement('img');
        img.src = getObfuscatedImageUrl("XQC8QM7wDFrtiLpV9tslATwoI4p5NLEYWZtg3UXS2BFR9Gdj");
        img.alt = "Test123";
        img.className = "w-full h-full object-cover select-none";
        img.draggable = false;
        img.addEventListener('dragstart', preventDragStart);
        img.addEventListener('selectstart', preventImageSelection);
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        (img.style as any).webkitTouchCallout = 'none';
        
        avatarContainer.innerHTML = '';
        avatarContainer.appendChild(img);
      }
    }, 100);

    // Send analytics to Supabase with sendBeacon
    const send = () => {
      try {
        if (document.visibilityState !== 'visible') return;
        const payload = {
          page: "test123",
          referrer: rawRef,
          timestamp: new Date().toISOString(),
          pathname: "/test123",
          searchParams: "",
          click_type: "page_visit"
        };
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/track', blob);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true
          }).catch(() => {});
        }

      } catch (error) {
        console.error("Failed to track Test123 analytics:", error);
      }
    };

    // Track immediately when page loads (only once per session)
    send();
    
    return () => {
      // Cleanup
      document.removeEventListener('selectstart', preventImageSelection);
      document.removeEventListener('dragstart', preventDragStart);
    };
  }, []);

  // Click tracking functions
  const trackClick = async (clickType: string) => {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "test123",
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: "/test123",
          searchParams: "",
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error(`Failed to track ${clickType} click:`, error);
    }
  };

  const handleExclusiveContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackClick("exclusive_content");
    setShowAgeWarning(true);
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackClick("subscribe_now");
    setShowAgeWarning(true);
  };

  const handleConfirmAge = () => {
    setShowAgeWarning(false);
    const targetUrl = decodeUrl();
    
    // If in-app browser detected, use automatic handoff method
    if (browserDetection?.isInAppBrowser && browserDetection?.isMobile) {
      attemptAutomaticHandoff(targetUrl, browserDetection).catch(() => {
        // Fallback to normal window.open if all methods fail
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      });
    } else {
      // Normal browser - just open normally
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    // Track the click
    beaconVisit({
      ts: Date.now(),
      event: 'user_confirmed_age_and_opened',
      path: window.location.pathname,
      isInAppBrowser: browserDetection?.isInAppBrowser || false,
    });
  };

  const handleCancelAge = () => {
    setShowAgeWarning(false);
  };

  return (
    <>
      {/* Bot Detection Loading Screen */}
      {!botDetectionComplete && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6997B] mx-auto mb-4"></div>
            <p className="text-[#8B7355] text-sm">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Main Content - Only render after bot detection */}
      {botDetectionComplete && (
    <div 
      className="min-h-screen bg-black p-4 overflow-x-hidden select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      } as React.CSSProperties}
      onDragStart={(e: React.DragEvent) => e.preventDefault()}
    >
      <div className="flex min-h-screen items-center justify-center px-2">
        <div className="w-full max-w-md mx-auto">
          {/* Main Profile Card */}
          <Card className="relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <Crown className="h-4 w-4 text-[#8B7355]" />
                <Badge variant="secondary" className="bg-[#B6997B]/30 text-[#8B7355] border-[#B6997B]/50">
                  Premium
                </Badge>
              </div>

              {/* Profile Header */}
              <div className="flex flex-col items-center space-y-6">
                {/* Avatar with border */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-[#B6997B]/60 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-28 w-28 border-4 border-[#B6997B]/20 shadow-lg rounded-full overflow-hidden bg-[#B6997B]/20">
                    <div 
                      id="avatar-container"
                      className="w-full h-full flex items-center justify-center bg-[#B6997B]/20"
                    >
                      <span className="text-[#8B7355] text-2xl font-bold">T</span>
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/80 shadow-lg ring-4 ring-[#B6997B]/20">
                    <Image
                      src={imagesLoaded ? getObfuscatedImageUrl("XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk") : ""}
                      alt="Verified Badge"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain select-none"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                </div>

                {/* Name and Status */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-[#8B7355] flex items-center justify-center gap-2">
                    test123
                    <Sparkles className="h-5 w-5 text-[#8B7355]" />
                  </h1>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Content Preview Card - Now Clickable with Tracking */}
          <div onClick={handleExclusiveContentClick}>
            <Card className="mt-6 relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative group">
                    <Image
                      src={imagesLoaded ? getObfuscatedImageUrl("XQC8QM7wDFrthotKyHiEcfAFW435V1LnPm2vkgNqaxYtzRST") : ""}
                      alt="Exclusive Content Preview"
                      width={400}
                      height={300}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30"></div>
                    
                    {/* Content Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <Badge className="bg-[#B6997B]/80 text-white border-0">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Exclusive Content
                        </span>
                      </Badge>
                    </div>

                    {/* Lock Icon */}
                    <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/40 backdrop-blur-sm text-[#8B7355] border border-[#B6997B]/50">
                      <Lock className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            <div onClick={handleSubscribeClick}>
              <Button className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm">
                <Heart className="h-5 w-5 mr-2" />
                Subscribe Now
              </Button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
               
            </p>
          </div>
        </div>
      </div>

      {/* 18+ Age Warning Modal */}
      {showAgeWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-bold text-[#8B7355]">18+ Content Warning</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelAge}
                  className="text-[#8B7355] hover:bg-[#B6997B]/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-[#8B7355] text-sm leading-relaxed">
                  This content is intended for adults only (18+). By clicking "Continue", you confirm that:
                </p>
                
                <ul className="text-[#8B7355] text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    You are 18 years of age or older
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    You consent to viewing adult content
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    You understand this content may not be suitable for minors
                  </li>
                </ul>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancelAge}
                    variant="outline"
                    className="flex-1 border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmAge}
                    className="flex-1 bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
      )}
    </>
  )
} 
