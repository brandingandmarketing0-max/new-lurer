"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

export const useAnalytics = (pageName: string) => {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      const rawRef = document.referrer;
      const referrer = getReadableReferrer(rawRef);
      const timestamp = new Date().toISOString();
      const pathnameStr = pathname || "";
      const searchParamsStr = ""; // Simplified - we don't need search params for basic analytics

      try {
        await fetch("/api/store-referrer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pageName,
            referrer: rawRef,
            timestamp,
            pathname: pathnameStr,
            searchParams: searchParamsStr,
          }),
        });
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }
    };

    // Track the visit
    trackVisit();
  }, [pageName, pathname]);

  return null;
}; 