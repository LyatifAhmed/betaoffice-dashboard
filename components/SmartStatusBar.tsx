"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, MailWarning, ShieldAlert, Info } from "lucide-react";

const messages = [
  "💌 Try Smart Inbox: Your letters sorted by AI.",
  "⚡ Instant summaries of scanned documents!",
  "🎁 Invite friends – earn rewards!",
  "✨ BetaOffice: Your HQ from London."
];

interface SmartStatusBarProps {
  status: "ACTIVE" | "PENDING" | "NO_ID" | "CANCELLED" | "UNKNOWN";
  newMail?: boolean;
  isFirstWeek?: boolean;
}

export default function SmartStatusBar({ status, newMail = false, isFirstWeek = false }: SmartStatusBarProps) {
  const [showTicker, setShowTicker] = useState(isFirstWeek);
  const [currentIndex, setCurrentIndex] = useState(0);

  const statusMap = {
    ACTIVE: {
      bg: "bg-green-600",
      text: "You're verified! All features unlocked.",
      icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
    },
    PENDING: {
      bg: "bg-yellow-500",
      text: "Verification in progress...",
      icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
    },
    NO_ID: {
      bg: "bg-blue-600",
      text: "Check your inbox to complete verification.",
      icon: <MailWarning className="w-4 h-4 mr-2" />,
    },
    CANCELLED: {
      bg: "bg-red-600",
      text: "Your subscription has been cancelled.",
      icon: <ShieldAlert className="w-4 h-4 mr-2" />,
    },
    UNKNOWN: {
      bg: "bg-gray-500",
      text: "Status unknown. Please refresh.",
      icon: <Info className="w-4 h-4 mr-2" />,
    },
  };

  useEffect(() => {
    if (showTicker) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [showTicker]);

  const config = statusMap[status] || statusMap.UNKNOWN;

  return (
    <div
      onClick={() => setShowTicker((prev) => !prev)}
      className={`w-full z-50 top-0 sticky cursor-pointer flex items-center justify-center h-12 text-white ${
        config.bg
      } shadow-md transition-all duration-500 ${
        newMail && !showTicker ? "animate-breath" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        {showTicker ? (
          <motion.div
            key={"ticker" + currentIndex}
            className="text-sm text-center whitespace-nowrap"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            {messages[currentIndex]}
          </motion.div>
        ) : (
          <motion.div
            key={"status" + status}
            className="flex items-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {config.icon}
            {config.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
