"use client";

import React, { useEffect, useState } from "react";

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

const TrackPage = () => {
  const [referrer, setReferrer] = useState<string>("");

  useEffect(() => {
    const rawRef = document.referrer;
    setReferrer(getReadableReferrer(rawRef));

    // Optional: Send referrer to backend for logging
    fetch("/api/store-referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referrer: rawRef,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail if backend is unreachable
    });
  }, []);

  return (
    <div style={{ padding: 32, fontSize: 20 }}>
      <h2>Welcome!</h2>
      <p>
        Your visit came from: <strong>{referrer}</strong>
      </p>
    </div>
  );
};

export default TrackPage;
