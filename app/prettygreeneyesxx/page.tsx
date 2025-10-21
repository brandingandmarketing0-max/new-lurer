"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, Heart, Sparkles, AlertTriangle, X } from "lucide-react"

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

export default function ProfilePage() {
  const [referrer, setReferrer] = useState<string>("");
  const [rawReferrer, setRawReferrer] = useState<string>("");
  const [showAgeWarning, setShowAgeWarning] = useState<boolean>(false);
  const [botDetectionComplete, setBotDetectionComplete] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  // Obfuscation helper functions
  const decodeUrl = () => {
    // https://onlyfans.com/prettygreeneyesxx
    const chars = [104, 116, 116, 112, 115, 58, 47, 47, 111, 110, 108, 121, 102, 97, 110, 115, 46, 99, 111, 109, 47, 112, 114, 101, 116, 116, 121, 103, 114, 101, 101, 110, 101, 121, 101, 115, 120, 120];
    return chars.map(c => String.fromCharCode(c)).join("");
  };
  
  // Image URL obfuscation (mirrors josh)
  const getObfuscatedImageUrl = (imageId: string) => {
    const baseUrl = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 50, 101, 111, 118, 105, 57, 108, 50, 103, 99, 46, 117, 102, 115, 46, 115, 104, 47, 102, 47);
    return baseUrl + imageId;
  };

  useEffect(() => {
    // Bot detection and setup
    (async () => {
      try {
        const botd = await load({ monitoring: false });
        const result = await botd.detect();
        if (result.bot === true) {
          window.location.replace('/blocked');
          return;
        }
        setBotDetectionComplete(true);
      } catch (error) {
        console.error('BotD detection failed:', error);
        setBotDetectionComplete(true);
      }
    })();

    const rawRef = document.referrer;
    setRawReferrer(rawRef);
    setReferrer(getReadableReferrer(rawRef));

    // Image protection handlers
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

    // Add global protection only for drag/select
    document.addEventListener('selectstart', preventImageSelection);
    document.addEventListener('dragstart', preventDragStart);

    // After a short delay, mark images loaded and inject avatar image
    const t = setTimeout(() => {
      setImagesLoaded(true);
      const avatarContainer = document.getElementById('avatar-container');
      if (avatarContainer) {
        const img = document.createElement('img');
        img.src = getObfuscatedImageUrl("XQC8QM7wDFrtiLpV9tslATwoI4p5NLEYWZtg3UXS2BFR9Gdj");
        img.alt = "prettygreeneyesxx";
        img.className = "w-full h-full object-cover select-none";
        img.draggable = false;
        img.addEventListener('dragstart', preventDragStart as any);
        img.addEventListener('selectstart', preventImageSelection as any);
        (img.style as any).webkitUserSelect = 'none';
        (img.style as any).webkitTouchCallout = 'none';
        avatarContainer.innerHTML = '';
        avatarContainer.appendChild(img);
      }
    }, 100);

    // Send analytics once (use sendBeacon if available)
    try {
      const payload = {
        page: "prettygreeneyesxx",
        referrer: rawRef,
        timestamp: new Date().toISOString(),
        pathname: "/prettygreeneyesxx",
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
    } catch (e) {
      console.error('Failed to send analytics:', e);
    }

    return () => {
      document.removeEventListener('selectstart', preventImageSelection);
      document.removeEventListener('dragstart', preventDragStart);
      clearTimeout(t);
    };
  }, []);

  // Click tracking
  const trackClick = async (clickType: string) => {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "prettygreeneyesxx",
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: window.location.pathname,
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error(`Failed to track ${clickType} click:`, error);
    }
  };

  const handleExclusiveContentClick = () => {
    trackClick("exclusive_content");
    setShowAgeWarning(true);
  };

  const handleSubscribeClick = () => {
    trackClick("subscribe_now");
    setShowAgeWarning(true);
  };

  const handleCancelAge = () => {
    setShowAgeWarning(false);
  };

  const handleConfirmAge = () => {
    setShowAgeWarning(false);
    const targetUrl = decodeUrl();
    const delay = Math.floor(Math.random() * 300) + 100;
    setTimeout(() => {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }, delay);
  };

  return (
    <>
      {!botDetectionComplete && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6997B] mx-auto mb-4"></div>
            <p className="text-[#8B7355] text-sm">Loading...</p>
          </div>
        </div>
      )}

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
              <Card className="relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-[#B6997B]/60 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative h-28 w-28 border-4 border-[#B6997B]/20 shadow-lg rounded-full overflow-hidden bg-[#B6997B]/20">
                        <div 
                          id="avatar-container"
                          className="w-full h-full flex items-center justify-center bg-[#B6997B]/20"
                        >
                          <span className="text-[#8B7355] text-2xl font-bold">P</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-bold text-[#8B7355] flex items-center justify-center gap-2">
                        prettygreeneyesxx
                        <Sparkles className="h-5 w-5 text-[#8B7355]" />
                      </h1>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

                      <div className="absolute inset-0 bg-black/30"></div>

                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <Badge className="bg-[#B6997B]/80 text-white border-0">
                          Exclusive Content
                        </Badge>
                      </div>

                      <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/40 backdrop-blur-sm text-[#8B7355] border border-[#B6997B]/50">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 space-y-4">
                <div onClick={handleSubscribeClick}>
                  <Button className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm">
                    <Heart className="h-5 w-5 mr-2" />
                    Subscribe Now
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm"></p>
              </div>
            </div>
          </div>

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
                      <li className="flex items-start gap-2"><span className="text-[#B6997B] font-bold">•</span>You are 18 years of age or older</li>
                      <li className="flex items-start gap-2"><span className="text-[#B6997B] font-bold">•</span>You consent to viewing adult content</li>
                      <li className="flex items-start gap-2"><span className="text-[#B6997B] font-bold">•</span>You understand this content may not be suitable for minors</li>
                    </ul>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleCancelAge} variant="outline" className="flex-1 border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20">Cancel</Button>
                      <Button onClick={handleConfirmAge} className="flex-1 bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white">Continue</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}