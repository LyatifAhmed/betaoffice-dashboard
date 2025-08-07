"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SmartStatusBar() {
  const [hovering, setHovering] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerMode, setTickerMode] = useState(false);

  const status = {
    verified: true,
    subscription: "active", // or: "inactive", "trial", etc.
    unreadMails: 2,
    urgentMails: 1,
  };

  const messages = [
    "📨 2 new scanned letters available.",
    "⚠️ 1 urgent mail detected. Please check immediately.",
    "💳 Your subscription is active.",
    "💡 Tip: Forward mail within 30 days to avoid deletion.",
    "💰 Earn £50 for each verified referral!",
  ];

  useEffect(() => {
    if (tickerMode) {
      const interval = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % messages.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [tickerMode]);

  return (
    <div
      className={cn(
        "w-full flex justify-center mt-2",
        tickerMode && "cursor-pointer"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => setTickerMode((prev) => !prev)}
    >
      <div
        className={cn(
          "px-6 py-2 rounded-3xl shadow-lg backdrop-blur-md transition-all duration-300 text-sm font-medium",
          "border border-white/20 bg-white/30 text-gray-900",
          tickerMode ? "w-[36rem]" : "w-fit"
        )}
      >
        {tickerMode ? (
          <div className="animate-fade text-center">{messages[tickerIndex]}</div>
        ) : (
          <div className="flex gap-2 items-center justify-center">
            <span className="animate-pulse text-green-600">●</span>
            <span>
              {status.subscription === "active"
                ? "Your subscription is active."
                : "Subscription inactive."}
            </span>
            {status.unreadMails > 0 && (
              <span className="ml-3 text-blue-700">
                {status.unreadMails} new mail
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
