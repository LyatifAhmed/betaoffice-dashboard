"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, MailWarning, ShieldAlert, Sparkles } from "lucide-react";

interface SmartStatusBarProps {
  status: "ACTIVE" | "PENDING" | "NO_ID" | "CANCELLED";
  newMail: boolean;
  isFirstWeek: boolean;
}

const STATUS_INFO = {
  ACTIVE: {
    icon: <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />,
    message: "Your ID is verified. All features unlocked.",
    color: "bg-green-100 text-green-800",
  },
  PENDING: {
    icon: <Loader2 className="w-4 h-4 mr-2 animate-spin text-yellow-500" />,
    message: "ID verification is in progress...",
    color: "bg-yellow-100 text-yellow-800",
  },
  NO_ID: {
    icon: <MailWarning className="w-4 h-4 mr-2 text-blue-500" />,
    message: "Awaiting your ID verification. Check your inbox.",
    color: "bg-blue-100 text-blue-800",
  },
  CANCELLED: {
    icon: <ShieldAlert className="w-4 h-4 mr-2 text-red-500" />,
    message: "Your subscription has been cancelled.",
    color: "bg-red-100 text-red-800",
  },
};

const TIPS = [
  "✨ Invite friends – earn rewards!",
  "🧠 Try Smart Inbox & AI Summarise!",
  "📨 Forward important letters instantly!",
];

export default function SmartStatusBar({ status, newMail, isFirstWeek }: SmartStatusBarProps) {
  const [showTips, setShowTips] = useState(isFirstWeek);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!showTips) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showTips]);

  const handleClick = () => setShowTips(false);

  const currentStatus = STATUS_INFO[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleClick}
      className={`
        fixed top-2 left-1/2 transform -translate-x-1/2
        rounded-full px-6 py-2 text-sm font-medium
        shadow-xl transition-all duration-500 ease-in-out
        backdrop-blur-lg bg-white/20 border border-white/30
        ${newMail && !showTips ? "animate-breath" : ""}
        ${showTips ? "text-blue-100" : currentStatus.color}
      `}
    >
      <AnimatePresence mode="wait">
        {showTips ? (
          <motion.div
            key="tip"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-blue-200" />
            <span>{TIPS[tipIndex]}</span>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center"
          >
            {currentStatus.icon}
            <span>{currentStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

