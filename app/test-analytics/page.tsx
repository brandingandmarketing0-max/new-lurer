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

const TestAnalyticsPage = () => {
  const [referrer, setReferrer] = useState<string>("");
  const [rawReferrer, setRawReferrer] = useState<string>("");

  useEffect(() => {
    const rawRef = document.referrer;
    setRawReferrer(rawRef);
    setReferrer(getReadableReferrer(rawRef));

    // Send to analytics
    fetch("/api/store-referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "test-analytics",
        referrer: rawRef,
        timestamp: new Date().toISOString(),
        pathname: "/test-analytics",
        searchParams: "",
      }),
    }).catch((error) => {
      console.error("Failed to track analytics:", error);
    });
  }, []);

  return (
    <div style={{ padding: 32, fontSize: 20 }}>
      <h2>Analytics Test Page</h2>
      <p>
        <strong>Raw Referrer:</strong> {rawReferrer || "None"}
      </p>
      <p>
        <strong>Processed Referrer:</strong> {referrer}
      </p>
      <p>
        <strong>Page:</strong> test-analytics
      </p>
      <p>
        <strong>Timestamp:</strong> {new Date().toLocaleString()}
      </p>
    </div>
  );
};

export default TestAnalyticsPage; 