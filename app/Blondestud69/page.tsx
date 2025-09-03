"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles, BarChart3 } from "lucide-react"

const getReadableReferrer = (ref: string) => {
  if (!ref) return "Direct or unknown";
  
  // Instagram - catches both mobile and desktop
  if (ref.includes("instagram.com") || ref.includes("m.instagram.com")) return "Instagram";
  
  // Twitter/X - catches both mobile and desktop
  if (ref.includes("twitter.com") || ref.includes("x.com") || ref.includes("mobile.twitter.com")) return "Twitter/X";
  
  // Facebook - catches both mobile and desktop
  if (ref.includes("facebook.com") || ref.includes("m.facebook.com") || ref.includes("fb.com")) return "Facebook";
  
  // TikTok - catches both mobile and desktop
  if (ref.includes("tiktok.com") || ref.includes("vm.tiktok.com")) return "TikTok";
  
  // LinkedIn - catches both mobile and desktop
  if (ref.includes("linkedin.com") || ref.includes("m.linkedin.com")) return "LinkedIn";
  
  // WhatsApp - catches both mobile and desktop
  if (ref.includes("whatsapp.com") || ref.includes("wa.me") || ref.includes("web.whatsapp.com")) return "WhatsApp";
  
  // Snapchat
  if (ref.includes("snapchat.com")) return "Snapchat";
  
  // YouTube
  if (ref.includes("youtube.com") || ref.includes("youtu.be") || ref.includes("m.youtube.com")) return "YouTube";
  
  // Reddit
  if (ref.includes("reddit.com") || ref.includes("m.reddit.com")) return "Reddit";
  
  // Pinterest
  if (ref.includes("pinterest.com") || ref.includes("m.pinterest.com")) return "Pinterest";
  
  // Telegram
  if (ref.includes("t.me") || ref.includes("telegram.org")) return "Telegram";
  
  // Discord
  if (ref.includes("discord.com") || ref.includes("discord.gg")) return "Discord";
  
  // Google search
  if (ref.includes("google.com") || ref.includes("google.co.uk") || ref.includes("google.ca")) return "Google Search";
  
  // Bing search
  if (ref.includes("bing.com")) return "Bing Search";
  
  // DuckDuckGo
  if (ref.includes("duckduckgo.com")) return "DuckDuckGo";
  
  return ref;
};

export default function ProfilePage() {
  const [referrer, setReferrer] = useState<string>("");
  const [rawReferrer, setRawReferrer] = useState<string>("");
  const [userAgent, setUserAgent] = useState<string>("");
  const [screenInfo, setScreenInfo] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");
  const [hasTracked, setHasTracked] = useState<boolean>(false);

  useEffect(() => {
    // Create a unique session ID for this page load
    const sessionId = `Blondestud69_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionKey = `Blondestud69_session_${sessionId}`;
    
    // Check if we've already tracked this specific session
    const hasTrackedThisSession = localStorage.getItem(sessionKey);
    
    // If we've already tracked this specific session, don't track again
    if (hasTrackedThisSession) {
      setHasTracked(true);
      return;
    }
    
    // Get comprehensive referrer and search data
    const rawRef = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const utmContent = urlParams.get('utm_content');
    
    // Enhanced referrer detection
    let finalReferrer = rawRef;
    if (utmSource) {
      finalReferrer = utmSource;
    } else if (rawRef) {
      finalReferrer = rawRef;
    }
    
    setRawReferrer(finalReferrer);
    setReferrer(getReadableReferrer(finalReferrer));

    // Collect additional user data
    const userAgentStr = navigator.userAgent;
    const screenInfoStr = `${screen.width}x${screen.height}`;
    const timezoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    setUserAgent(userAgentStr);
    setScreenInfo(screenInfoStr);
    setTimezone(timezoneStr);

    // Build comprehensive search params string
    const searchParamsString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Send analytics to Supabase with sendBeacon
    const send = () => {
      try {
        // Double-check we haven't already tracked this session
        if (hasTracked) {
          return;
        }
        
        const payload = {
          page: "Blondestud69",
          referrer: finalReferrer,
          timestamp: new Date().toISOString(),
          pathname: window.location.pathname,
          searchParams: searchParamsString,
          click_type: "page_visit"
        };
        
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/track', blob);
          
          // Mark this specific session as tracked
          localStorage.setItem(sessionKey, 'true');
          localStorage.setItem('Blondestud69_last_tracked', new Date().toISOString());
          setHasTracked(true);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true
          }).then(() => {
            // Mark this specific session as tracked
            localStorage.setItem(sessionKey, 'true');
            localStorage.setItem('Blondestud69_last_tracked', new Date().toISOString());
            setHasTracked(true);
          }).catch((error) => {
            console.error("Failed to track Blondestud69 analytics:", error);
          });
        }
      } catch (error) {
        console.error("Failed to track Blondestud69 analytics:", error);
      }
    };

    // Track immediately when page loads (only once per session)
    send();
    
    return () => {
      // Cleanup not needed for single tracking
    };
  }, []);

  // Click tracking functions
  const trackClick = async (clickType: string) => {
    try {
      // Get current URL parameters for comprehensive tracking
      const urlParams = new URLSearchParams(window.location.search);
      const searchParamsString = Array.from(urlParams.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "Blondestud69",
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: window.location.pathname,
          searchParams: searchParamsString,
          click_type: clickType
        }),
      });
    } catch (error) {
      console.error(`Failed to track ${clickType} click:`, error);
    }
  };

  const handleExclusiveContentClick = () => {
    trackClick("exclusive_content");
  };

  const handleSubscribeClick = () => {
    trackClick("subscribe_now");
  };

  const handleViewAllContentClick = () => {
    trackClick("view_all_content");
  };

  return (
    <div className="min-h-screen bg-black p-4 overflow-x-hidden">
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
                  <Avatar className="relative h-28 w-28 border-4 border-[#B6997B]/20 shadow-lg">
                    <AvatarImage src="/bl1.png" alt="Blondestud69" className="object-cover" />
                    <AvatarFallback className="bg-[#B6997B]/20 text-[#8B7355] text-2xl font-bold">
                      BS
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/80 shadow-lg ring-4 ring-[#B6997B]/20">
                    <Image
                      src="/images/verified-badge.png"
                      alt="Verified Badge"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Name and Status */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-[#8B7355] flex items-center justify-center gap-2">
                    Blondestud69
                    <Sparkles className="h-5 w-5 text-[#8B7355]" />
                  </h1>
                </div>

                {/* Platform Badge */}
                <div className="flex items-center gap-2 bg-[#B6997B]/10 rounded-full px-4 py-2 border border-[#B6997B]/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/20 p-1">
                    <Image
                      src="/images/of-logo.png"
                      alt="OnlyFans Logo"
                      width={24}
                      height={24}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[#8B7355] font-medium">OnlyFans Creator</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Preview Card - Now Clickable with Tracking */}
          <div onClick={handleExclusiveContentClick}>
            <Link href="https://onlyfans.com/blondestud6969" target="_blank" rel="noopener noreferrer">
              <Card className="mt-6 relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative group">
                    <Image
                      src="/bl2.jpg"
                      alt="Exclusive Content Preview"
                      width={400}
                      height={300}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            <div onClick={handleSubscribeClick}>
              <Link href="https://onlyfans.com/blondestud6969" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm">
                  <Heart className="h-5 w-5 mr-2" />
                  Subscribe Now
                </Button>
              </Link>
            </div>
            <div onClick={handleViewAllContentClick}>
              <Link href="https://onlyfans.com/blondestud6969" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-[#B6997B]/50 text-[#8B7355] hover:bg-[#B6997B]/20 backdrop-blur-sm">
                  View All Content
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              
            </p>
            

          </div>
        </div>
      </div>
    </div>
  )
}
