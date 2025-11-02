"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3, AlertTriangle, X } from "lucide-react"

// BotD import (npm)
import { load } from '@fingerprintjs/botd';

// Text obfuscation helper
const decodeText = (codes: number[]) => {
  return codes.map(c => String.fromCharCode(c)).join("");
};

const getReadableReferrer = (ref: string) => {
  if (!ref) return decodeText([68, 105, 114, 101, 99, 116, 32, 111, 114, 32, 117, 110, 107, 110, 111, 119, 110]);
  if (ref.includes("instagram.com")) return decodeText([73, 110, 115, 116, 97, 103, 114, 97, 109]);
  if (ref.includes("twitter.com") || ref.includes("x.com")) return decodeText([84, 119, 105, 116, 116, 101, 114, 47, 88]);
  if (ref.includes("facebook.com")) return decodeText([70, 97, 99, 101, 98, 111, 111, 107]);
  if (ref.includes("tiktok.com")) return decodeText([84, 105, 107, 84, 111, 107]);
  if (ref.includes("linkedin.com")) return decodeText([76, 105, 110, 107, 101, 100, 73, 110]);
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return decodeText([87, 104, 97, 116, 115, 65, 112, 112]);
  return ref;
};

export default function ProfilePage() {
  const [referrer, setReferrer] = useState<string>("");
  const [rawReferrer, setRawReferrer] = useState<string>("");
  const [hasTracked, setHasTracked] = useState<boolean>(false);
  const [showAgeWarning, setShowAgeWarning] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [botDetectionComplete, setBotDetectionComplete] = useState<boolean>(false);
  
  // Obfuscation helper functions
  const decodeUrl = () => {
    const chars = [104, 116, 116, 112, 115, 58, 47, 47, 111, 110, 108, 121, 102, 97, 110, 115, 46, 99, 111, 109, 47, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120, 47, 99, 49, 53];
    return chars.map(c => String.fromCharCode(c)).join("");
  };

  // Text content obfuscation
  const getText = (codes: number[]) => decodeText(codes);
  
  // Image URL obfuscation
  const getObfuscatedImageUrl = (imageId: string) => {
    const baseUrl = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 50, 101, 111, 118, 105, 57, 108, 50, 103, 99, 46, 117, 102, 115, 46, 115, 104, 47, 102, 47);
    return baseUrl + imageId;
  };
  
  // Dummy functions to confuse crawlers
  const dummyFunction1 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 101, 120, 97, 109, 112, 108, 101, 46, 99, 111, 109]);
  const dummyFunction2 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 103, 111, 111, 103, 108, 101, 46, 99, 111, 109]);
  const dummyFunction3 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 102, 97, 99, 101, 98, 111, 111, 107, 46, 99, 111, 109]);
  
  // Additional obfuscation - fake URLs to confuse crawlers
  const fakeUrl1 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 105, 110, 115, 116, 97, 103, 114, 97, 109, 46, 99, 111, 109, 47, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]);
  const fakeUrl2 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 116, 119, 105, 116, 116, 101, 114, 46, 99, 111, 109, 47, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]);
  const fakeUrl3 = () => getText([104, 116, 116, 112, 115, 58, 47, 47, 116, 105, 107, 116, 111, 107, 46, 99, 111, 109, 47, 64, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]);

  useEffect(() => {
    // BotD check - IMMEDIATE, before any content renders
    (async () => {
      try {
        const botd = await load({ monitoring: false });
        const result = await botd.detect();
        
        // BotD returns { bot: true/false, botKind?: BotKind }
        if (result.bot === true) {
          window.location.replace(getText([47, 98, 108, 111, 99, 107, 101, 100]));
          return;
        }
        
        // Only set complete if not a bot
        setBotDetectionComplete(true);
      } catch (error) {
        // If BotD fails, allow user through (don't block on errors)
        console.error(getText([66, 111, 116, 68, 32, 100, 101, 116, 101, 99, 116, 105, 111, 110, 32, 102, 97, 105, 108, 101, 100, 58]), error);
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
        img.src = getObfuscatedImageUrl('XQC8QM7wDFrtiv2TKAslATwoI4p5NLEYWZtg3UXS2BFR9Gdj');
        img.alt = getText([76, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]);
        img.className = 'w-full h-full object-cover select-none';
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

    // Create a unique session ID for this page load
    const sessionId = `littlelouxxx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionKey = `littlelouxxx_visit_tracked_${sessionId}`;

    // Check if we've already tracked this session
    if (localStorage.getItem(sessionKey)) {
      setHasTracked(true);
      return;
    }

    // Send analytics to Supabase with sendBeacon (only once per session)
    const send = () => {
      try {
        // Double-check we haven't already tracked this session
        if (hasTracked || localStorage.getItem(sessionKey)) {
          return;
        }
        
        const payload = {
          page: getText([108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]),
          referrer: rawRef,
          timestamp: new Date().toISOString(),
          pathname: getText([47, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]),
          searchParams: "",
          click_type: getText([112, 97, 103, 101, 95, 118, 105, 115, 105, 116])
        };
        
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon(getText([47, 97, 112, 105, 47, 116, 114, 97, 99, 107]), blob);
          console.log(getText([100, 100, 100, 32, 76, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120, 32, 65, 110, 97, 108, 121, 116, 105, 99, 115, 32, 45, 32, 80, 97, 103, 101, 32, 118, 105, 115, 105, 116, 32, 116, 114, 97, 99, 107, 101, 100, 32, 118, 105, 97, 32, 115, 101, 110, 100, 66, 101, 97, 99, 111, 110]));
          
          // Mark this specific session as tracked
          localStorage.setItem(sessionKey, 'true');
          localStorage.setItem('littlelouxxx_last_tracked', new Date().toISOString());
          setHasTracked(true);
        } else {
          fetch(getText([47, 97, 112, 105, 47, 116, 114, 97, 99, 107]), {
            method: getText([80, 79, 83, 84]),
            headers: { "Content-Type": getText([97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110]) },
            body,
            keepalive: true
          }).then(() => {
            console.log(getText([100, 100, 100, 32, 76, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120, 32, 65, 110, 97, 108, 121, 116, 105, 99, 115, 32, 45, 32, 80, 97, 103, 101, 32, 118, 105, 115, 105, 116, 32, 116, 114, 97, 99, 107, 101, 100, 32, 118, 105, 97, 32, 102, 101, 116, 99, 104]));
            
            // Mark this specific session as tracked
            localStorage.setItem(sessionKey, 'true');
            localStorage.setItem('littlelouxxx_last_tracked', new Date().toISOString());
            setHasTracked(true);
          }).catch((error) => {
            console.error(getText([100, 100, 100, 32, 76, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120, 32, 65, 110, 97, 108, 121, 116, 105, 99, 115, 32, 45, 32, 80, 97, 103, 101, 32, 118, 105, 115, 105, 116, 32, 116, 114, 97, 99, 107, 105, 110, 103, 32, 102, 97, 105, 108, 101, 100, 58]), error);
          });
        }
      } catch (error) {
        console.error(getText([100, 100, 100, 32, 70, 97, 105, 108, 101, 100, 32, 116, 111, 32, 116, 114, 97, 99, 107, 32, 76, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120, 32, 97, 110, 97, 108, 121, 116, 105, 99, 115, 58]), error);
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
      await fetch(getText([47, 97, 112, 105, 47, 116, 114, 97, 99, 107]), {
        method: getText([80, 79, 83, 84]),
        headers: { "Content-Type": getText([97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110]) },
        body: JSON.stringify({
          page: getText([108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]),
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: getText([47, 108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120]),
          searchParams: "",
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error(getText([70, 97, 105, 108, 101, 100, 32, 116, 111, 32, 116, 114, 97, 99, 107, 32]) + clickType + getText([32, 99, 108, 105, 99, 107, 58]), error);
    }
  };

  const handleExclusiveContentClick = () => {
    trackClick(getText([101, 120, 99, 108, 117, 115, 105, 118, 101, 95, 99, 111, 110, 116, 101, 110, 116]));
    setShowAgeWarning(true);
  };

  const handleSubscribeClick = () => {
    trackClick(getText([115, 117, 98, 115, 99, 114, 105, 98, 101, 95, 110, 111, 119]));
    setShowAgeWarning(true);
  };

  const handleViewAllContentClick = () => {
    trackClick(getText([118, 105, 101, 119, 95, 97, 108, 108, 95, 99, 111, 110, 116, 101, 110, 116]));
    setShowAgeWarning(true);
  };

  const handleCancelAge = () => {
    setShowAgeWarning(false);
  };

  const handleConfirmAge = () => {
    setShowAgeWarning(false);
    // Use obfuscated URL generation
    const targetUrl = decodeUrl();
    
    // Random delay with additional obfuscation
    const delay = Math.floor(Math.random() * 300) + 100;
    setTimeout(() => {
      window.open(targetUrl, getText([95, 98, 108, 97, 110, 107]), getText([110, 111, 111, 112, 101, 110, 101, 114, 44, 110, 111, 114, 101, 102, 101, 114, 114, 101, 114]));
    }, delay);
  };

  return (
    <>
      {/* Bot Detection Loading Screen */}
      {!botDetectionComplete && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6997B] mx-auto mb-4"></div>
            <p className="text-[#8B7355] text-sm">{getText([76, 111, 97, 100, 105, 110, 103, 46, 46, 46])}</p>
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
                  {getText([80, 114, 101, 109, 105, 117, 109])}
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
                      <span className="text-[#8B7355] text-2xl font-bold">{getText([76])}</span>
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/80 shadow-lg ring-4 ring-[#B6997B]/20">
                    <Image
                      src={imagesLoaded ? getObfuscatedImageUrl("XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk") : ""}
                      alt={getText([86, 101, 114, 105, 102, 105, 101, 100, 32, 66, 97, 100, 103, 101])}
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
                    {getText([108, 105, 116, 116, 108, 101, 108, 111, 117, 120, 120, 120])}
                    <Sparkles className="h-5 w-5 text-[#8B7355]" />
                  </h1>
                  <p className="text-sm text-[#8B7355]">
                    ngl, my OF bio will shock you 👹🤣
                  </p>
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
                      src={imagesLoaded ? getObfuscatedImageUrl("XQC8QM7wDFrtfBQnAPrFEYHRmqn7SKJGctzVyX9N8iI0r1TZ") : ""}
                      alt={getText([69, 120, 99, 108, 117, 115, 105, 118, 101, 32, 67, 111, 110, 116, 101, 110, 116, 32, 80, 114, 101, 118, 105, 101, 119])}
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
                          {getText([69, 120, 99, 108, 117, 115, 105, 118, 101, 32, 67, 111, 110, 116, 101, 110, 116])}
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
                {getText([83, 117, 98, 115, 99, 114, 105, 98, 101, 32, 78, 111, 119])}
              </Button>
            </div>
          </div>

          {/* Footer Info */}
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
                  <h2 className="text-xl font-bold text-[#8B7355]">{getText([49, 56, 43, 32, 67, 111, 110, 116, 101, 110, 116, 32, 87, 97, 114, 110, 105, 110, 103])}</h2>
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
                  {getText([84, 104, 105, 115, 32, 99, 111, 110, 116, 101, 110, 116, 32, 105, 115, 32, 105, 110, 116, 101, 110, 100, 101, 100, 32, 102, 111, 114, 32, 97, 100, 117, 108, 116, 115, 32, 111, 110, 108, 121, 32, 40, 49, 56, 43, 41, 46, 32, 66, 121, 32, 99, 108, 105, 99, 107, 105, 110, 103, 32, 34, 67, 111, 110, 116, 105, 110, 117, 101, 34, 44, 32, 121, 111, 117, 32, 99, 111, 110, 102, 105, 114, 109, 32, 116, 104, 97, 116, 58])}
                </p>
                
                <ul className="text-[#8B7355] text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    {getText([89, 111, 117, 32, 97, 114, 101, 32, 49, 56, 32, 121, 101, 97, 114, 115, 32, 111, 102, 32, 97, 103, 101, 32, 111, 114, 32, 111, 108, 100, 101, 114])}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    {getText([89, 111, 117, 32, 99, 111, 110, 115, 101, 110, 116, 32, 116, 111, 32, 118, 105, 101, 119, 105, 110, 103, 32, 97, 100, 117, 108, 116, 32, 99, 111, 110, 116, 101, 110, 116])}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B6997B] font-bold">•</span>
                    {getText([89, 111, 117, 32, 117, 110, 100, 101, 114, 115, 116, 97, 110, 100, 32, 116, 104, 105, 115, 32, 99, 111, 110, 116, 101, 110, 116, 32, 109, 97, 121, 32, 110, 111, 116, 32, 98, 101, 32, 115, 117, 105, 116, 97, 98, 108, 101, 32, 102, 111, 114, 32, 109, 105, 110, 111, 114, 115])}
                  </li>
                </ul>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancelAge}
                    variant="outline"
                    className="flex-1 border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20"
                  >
                    {getText([67, 97, 110, 99, 101, 108])}
                  </Button>
                  <Button
                    onClick={handleConfirmAge}
                    className="flex-1 bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white"
                  >
                    {getText([67, 111, 110, 116, 105, 110, 117, 101])}
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




