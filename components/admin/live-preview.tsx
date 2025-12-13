"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Crown, Sparkles, Star, Lock, Heart } from "lucide-react";

type PreviewPage = {
  slug: string;
  title: string | null;
  subtitle: string | null;
  avatar_url: string | null;
  exclusive_preview_image: string | null;
  is_active: boolean;
};

type PreviewLink = {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

export function LivePreview({ page, links }: { page: PreviewPage; links: PreviewLink[] }) {
  const activeLinks = links
    .filter((l) => l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mobile frame */}
      <div className="bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* Mobile status bar */}
          <div className="bg-black h-6 flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
          </div>

          {/* Mobile content */}
          <div className="min-h-screen bg-black p-4" style={{ minHeight: "600px" }}>
            <div className="flex min-h-screen items-center justify-center px-2">
              <div className="w-full max-w-md mx-auto">
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

                {/* Content Preview Card */}
                {page.exclusive_preview_image && (
                  <Card className="mt-6 relative overflow-hidden border border-[#B6997B]/50 bg-[#B6997B]/10 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="relative group">
                        <Image
                          src={page.exclusive_preview_image}
                          alt="Exclusive Content Preview"
                          width={400}
                          height={300}
                          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                          draggable={false}
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
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-4">
                  {activeLinks.length > 0 ? (
                    activeLinks.map((l) => {
                      const isSubscribe = l.label.toLowerCase().includes('subscribe');
                      return (
                        <Button
                          key={l.id}
                          className="w-full bg-[#B6997B]/60 hover:bg-[#B6997B]/70 text-white font-semibold py-3 shadow-lg backdrop-blur-sm"
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
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No active links yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

