"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3, AlertTriangle, X } from "lucide-react"

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

// In-App Browser Detection
type DetectResult = {
  isMobile: boolean;
  isAndroid: boolean;
  isiOS: boolean;
  isInstagram: boolean;
  isFacebookInApp: boolean;
  isInAppBrowser: boolean;
  reasons: string;
  ua: string;
};

function detectInAppBrowser(): DetectResult {
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
  const isAndroid = /android/.test(ua);
  const isiOS = /iphone|ipad|ipod/.test(ua);
  const isMobile = isAndroid || isiOS;

  const isInstagram = /instagram/.test(ua);
  const isFacebookInApp = /fbav|fban|facebook/.test(ua);

  // iOS webview heuristic: UA lacks 'safari' on iOS
  const hasSafari = /safari/.test(ua) && !/chrome/.test(ua);
  const isStandalone = typeof (window as any).navigator !== 'undefined' && !!(window as any).navigator.standalone;
  const isWebviewIOSSuspect = isiOS && !hasSafari && !isStandalone;

  const ref = typeof document !== 'undefined' ? document.referrer.toLowerCase() : '';
  const refIsInstagram = /instagram\.com/.test(ref);

  // Test window.open behavior (many in-app webviews block it or return null)
  let windowOpenBlocked = false;
  try {
    const w = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    if (!w) windowOpenBlocked = true;
    else w.close();
  } catch (e) {
    windowOpenBlocked = true;
  }

  const isInAppBrowser = isInstagram || isFacebookInApp || isWebviewIOSSuspect || windowOpenBlocked || refIsInstagram;

  const reasons: string[] = [];
  if (isInstagram) reasons.push('ua:instagram');
  if (isFacebookInApp) reasons.push('ua:facebook');
  if (isWebviewIOSSuspect) reasons.push('ios-no-safari-in-ua');
  if (windowOpenBlocked) reasons.push('window.open-blocked');
  if (refIsInstagram) reasons.push('referrer-instagram');

  return {
    isMobile,
    isAndroid,
    isiOS,
    isInstagram,
    isFacebookInApp,
    isInAppBrowser,
    reasons: reasons.join('|') || 'none',
    ua,
  };
}

// Enhanced browser opening function that tries multiple methods
function openInDefaultBrowser(finalUrl: string, detection: DetectResult): boolean {
  // 1) Best-effort: try window.open('_blank') — some IG webviews spawn an external browser for that
  try {
    const newWin = window.open(finalUrl, '_blank', 'noopener,noreferrer');
    if (newWin) {
      return true; // Successfully opened
    }
  } catch (e) {
    // fall through
  }

  // 2) Android intent fallback (works in some Android webviews)
  if (detection.isAndroid) {
    try {
      const intentUrl =
        'intent://' +
        finalUrl.replace(/^https?:\/\//, '') +
        `#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(finalUrl)};end`;
      window.location.href = intentUrl;
      return true;
    } catch (e) {
      // continue
    }
  }

  // 3) iOS: nudge Chrome (if installed) then fallback to final URL
  if (detection.isiOS) {
    try {
      const chromeScheme = 'googlechrome://' + finalUrl.replace(/^https?:\/\//, '');
      window.location.href = chromeScheme;
      setTimeout(() => {
        window.location.href = finalUrl;
      }, 500);
      return true;
    } catch (e) {
      // continue
    }
  }

  // 4) Last resort: direct navigation
  try {
    window.location.href = finalUrl;
    return true;
  } catch (e) {
    return false;
  }
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
  const [showBrowserFallback, setShowBrowserFallback] = useState<boolean>(false);
  
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

    // IMMEDIATE: If in Instagram's in-app browser, try to open in default browser RIGHT AWAY
    if (browserDet.isInAppBrowser && browserDet.isMobile) {
      const currentUrl = window.location.href;
      
      // Try to open current page in default browser immediately
      const opened = openInDefaultBrowser(currentUrl, browserDet);
      
      if (!opened) {
        // If automatic opening fails, show fallback after a short delay
        setTimeout(() => setShowBrowserFallback(true), 1500);
      }
      
      // Still continue with the rest of the page load, but user should be redirected
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
    
    // Just open the target URL normally (browser opening already happened on page load)
    window.open(targetUrl, "_blank", "noopener,noreferrer");

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

  const handleManualOpen = () => {
    // Open the current page URL in default browser
    const currentUrl = window.location.href;
    if (browserDetection) {
      openInDefaultBrowser(currentUrl, browserDetection);
    } else {
      window.open(currentUrl, "_blank", "noopener,noreferrer");
    }
    beaconVisit({
      ts: Date.now(),
      event: 'user_clicked_manual_open',
      path: window.location.pathname,
    });
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

      {/* Browser Fallback UI - shown when automatic opening fails */}
      {showBrowserFallback && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#8B7355]">Open in Browser</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBrowserFallback(false)}
                  className="text-[#8B7355] hover:bg-[#B6997B]/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-[#8B7355] text-sm leading-relaxed">
                  {browserDetection?.isInstagram 
                    ? "If this opened inside Instagram, tap the ⋯ menu (top-right) → Open in Browser, then tap the button below."
                    : "Please tap the button below to open in your default browser."}
                </p>
                
                <Button
                  onClick={handleManualOpen}
                  className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3"
                >
                  Open in Browser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
