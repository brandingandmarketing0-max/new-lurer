"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BarChart3, Crown, Sparkles, Star, Lock, Heart } from "lucide-react";

export interface DbPage {
  id: number;
  slug: string;
  title: string | null;
  subtitle: string | null;
  avatar_url: string | null;
  exclusive_preview_image: string | null;
  is_active: boolean;
}

export interface DbPageLink {
  id: number;
  page_id: number;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

function safeClickType(label: string) {
  return (
    "link_click:" +
    label
      .toLowerCase()
      .trim()
      .slice(0, 40)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

export function PublicPage({ page, links }: { page: DbPage; links: DbPageLink[] }) {
  const [rawReferrer, setRawReferrer] = useState("");
  const [hasTracked, setHasTracked] = useState(false);

  const activeLinks = useMemo(
    () => links.filter((l) => l.is_active).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [links]
  );

  useEffect(() => {
    const rawRef = document.referrer || "";
    setRawReferrer(rawRef);

    const sessionKey = `page_visit_tracked_${page.slug}`;
    if (localStorage.getItem(sessionKey)) {
      setHasTracked(true);
      return;
    }

    const payload = {
      page: page.slug,
      page_id: page.id,
      referrer: rawRef,
      timestamp: new Date().toISOString(),
      pathname: `/${page.slug}`,
      searchParams: window.location.search?.replace(/^\?/, "") || "",
      click_type: "page_visit",
    };

    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
      localStorage.setItem(sessionKey, "true");
      setHasTracked(true);
    } catch {
      // ignore
    }
  }, [page.slug]);

  const trackClick = async (linkId: number, label: string) => {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: page.slug,
          page_id: page.id,
          link_id: linkId,
          referrer: rawReferrer,
          timestamp: new Date().toISOString(),
          pathname: `/${page.slug}`,
          searchParams: window.location.search?.replace(/^\?/, "") || "",
          click_type: safeClickType(label),
        }),
        keepalive: true,
      });
    } catch {
      // ignore
    }
  };

  const handleExclusiveContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeLinks.length > 0) {
      const firstLink = activeLinks[0];
      trackClick(firstLink.id, firstLink.label);
      window.open(firstLink.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeLinks.length > 0) {
      const subscribeLink = activeLinks.find(l => l.label.toLowerCase().includes('subscribe')) || activeLinks[0];
      trackClick(subscribeLink.id, subscribeLink.label);
      window.open(subscribeLink.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
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
                    {page.avatar_url ? (
                      <Image
                        src={page.avatar_url}
                        alt={page.title || page.slug}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover select-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#B6997B]/20">
                        <span className="text-[#8B7355] text-2xl font-bold">{(page.title || page.slug)[0]?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6997B]/80 shadow-lg ring-4 ring-[#B6997B]/20">
                    <Image
                      src="https://2eovi9l2gc.ufs.sh/f/XQC8QM7wDFrt98ZBhgCmgTM2aZbQ3nqXNLtGe4hVci06FUJk"
                      alt="Verified Badge"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain select-none"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      unoptimized
                    />
                  </div>
                </div>

                {/* Name and Status */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-[#8B7355] flex items-center justify-center gap-2">
                    {page.title || page.slug}
                    <Sparkles className="h-5 w-5 text-[#8B7355]" />
                  </h1>
                  {page.subtitle && (
                    <p className="text-sm text-[#8B7355]">
                      {page.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Preview Card - Clickable */}
          {page.exclusive_preview_image && (
            <div onClick={handleExclusiveContentClick}>
              <Card className="mt-6 relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative group">
                    <Image
                      src={page.exclusive_preview_image}
                      alt="Exclusive Content Preview"
                      width={400}
                      height={300}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      unoptimized
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
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            {activeLinks.map((l) => {
              const isSubscribe = l.label.toLowerCase().includes('subscribe');
              return (
                <Button
                  key={l.id}
                  className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm"
                  onClick={isSubscribe ? handleSubscribeClick : () => {
                    trackClick(l.id, l.label);
                    window.open(l.url, "_blank", "noopener,noreferrer");
                  }}
                >
                  {isSubscribe ? (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      {l.label}
                    </>
                  ) : (
                    <>
                      {l.label}
                      <ExternalLink className="h-4 w-4 ml-2 opacity-80" />
                    </>
                  )}
                </Button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={`/${page.slug}/analytics`} className="text-[#B6997B] hover:text-[#d8c2a6] text-sm inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


