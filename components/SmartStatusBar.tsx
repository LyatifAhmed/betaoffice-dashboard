// components/SmartStatusBar.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailWarning, ShieldAlert, Info } from "lucide-react";
import clsx from "clsx";

const statusConfig = {
  ACTIVE: {
    icon: <CheckCircle2 className="w-4 h-4 mr-2" />, bg: "bg-green-100", textColor: "text-green-800" },
  PENDING: {
    icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />, bg: "bg-yellow-100", textColor: "text-yellow-800" },
  NO_ID: {
    icon: <MailWarning className="w-4 h-4 mr-2" />, bg: "bg-blue-100", textColor: "text-blue-800" },
  CANCELLED: {
    icon: <ShieldAlert className="w-4 h-4 mr-2" />, bg: "bg-red-100", textColor: "text-red-800" },
  UNKNOWN: {
    icon: <Info className="w-4 h-4 mr-2" />, bg: "bg-gray-100", textColor: "text-gray-800" },
};

const rotatingMessages = [
  "📬 New scanned mail has arrived!",
  "🧠 Try our new AI Summary feature!",
  "🎁 Enjoy exclusive benefits during your first 7 days.",
  "🔒 Your personal details are safe with director privacy.",
];

type SmartStatusBarProps = {
  status: "ACTIVE" | "PENDING" | "NO_ID" | "CANCELLED" | "UNKNOWN";
  newMail: boolean;
  isFirstWeek: boolean;
};


export default function SmartStatusBar({ status, newMail, isFirstWeek }: SmartStatusBarProps) { {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const config = statusConfig[status] || statusConfig.UNKNOWN;

  useEffect(() => {
    if (!isExpanded) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % rotatingMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden cursor-pointer transition-all duration-500 flex items-center justify-between px-4 py-2 rounded-xl shadow-md border border-opacity-50 text-sm",
        config.bg,
        config.textColor
      )}
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <div className="flex items-center font-medium">
        {config.icon}
        {isExpanded ? (
          <span className="whitespace-nowrap animate-fade-in-out">
            {rotatingMessages[messageIndex]}
          </span>
        ) : (
          <span>{statusMessage(status)}</span>
        )}
      </div>
      <span className="ml-4 text-xs opacity-60">Click to toggle</span>
    </div>
  );
}

function statusMessage(status: string) {
  switch (status) {
    case "ACTIVE":
      return "✅ ID Verified. All features unlocked.";
    case "PENDING":
      return "⏳ ID verification in progress...";
    case "NO_ID":
      return "📩 Check your inbox to verify your ID.";
    case "CANCELLED":
      return "🚫 Subscription cancelled.";
    default:
      return "ℹ️ Unknown subscription status.";
  }
}
}
