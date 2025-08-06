"use client";

import { useState, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  MailWarning,
  ShieldAlert,
  Info,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { icon: JSX.Element; color: string; message: string }
> = {
  ACTIVE: {
    icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
    color: "from-green-300 to-cyan-400",
    message: "All features unlocked. Verified 🎉",
  },
  PENDING: {
    icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
    color: "from-yellow-300 to-amber-400",
    message: "Verification in progress...",
  },
  NO_ID: {
    icon: <MailWarning className="w-4 h-4 mr-2" />,
    color: "from-blue-300 to-cyan-400",
    message: "We need your ID to activate your service.",
  },
  CANCELLED: {
    icon: <ShieldAlert className="w-4 h-4 mr-2" />,
    color: "from-red-300 to-rose-400",
    message: "Subscription cancelled.",
  },
  UNKNOWN: {
    icon: <Info className="w-4 h-4 mr-2" />,
    color: "from-gray-300 to-gray-500",
    message: "Status unknown.",
  },
};

type SmartStatusBarProps = {
  status: keyof typeof statusConfig;
  unreadCount?: number;
};

export default function SmartStatusBar({
  status = "UNKNOWN",
  unreadCount = 0,
}: SmartStatusBarProps) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);

  const config = statusConfig[status] || statusConfig.UNKNOWN;

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-80, 0], [0, 1]);

  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartY.current !== null &&
      touchEndY.current !== null &&
      touchStartY.current - touchEndY.current > 60
    ) {
      setHidden(true);
    }
    touchStartY.current = null;
    touchEndY.current = null;
  };

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.div
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl",
              "text-white text-sm font-medium flex items-center gap-3",
              "cursor-pointer transition-all duration-300 ease-out",
              "border border-white/10 backdrop-blur-2xl bg-white/10 ring-1 ring-cyan-300/20",
              "bg-gradient-to-br",
              config.color,
              hovered
                ? "scale-105 shadow-[0_0_32px_#00ffc8] animate-pulse"
                : "shadow-md"
            )}
            style={{
              y,
              opacity,
              boxShadow: hovered
                ? "0 12px 38px rgba(0, 255, 200, 0.4)"
                : "0 6px 18px rgba(0, 255, 200, 0.15)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -60) setHidden(true);
            }}
            dragElastic={0.2}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {config.icon}
            <span className="whitespace-nowrap truncate max-w-[60vw]">
              {unreadCount > 0
                ? `📬 You have ${unreadCount} unread letter${unreadCount > 1 ? "s" : ""}`
                : config.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {hidden && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl cursor-pointer hover:bg-white/20 shadow-xl flex items-center justify-center"
          onClick={() => setHidden(false)}
          title="Reopen Status Bar"
        >
          <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
        </div>
      )}



      {expanded && !hidden && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="absolute top-[72px] left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-4 shadow-2xl z-50"
        >
          <p className="text-white text-sm leading-relaxed">
            <strong>Status:</strong> {status} <br />
            This status controls your access level inside BetaOffice.
          </p>
          {status === "ACTIVE" && (
            <p className="text-green-300 text-xs mt-2">
              You now have full access to AI tools, scanned mail, forwarding & business perks.
            </p>
          )}
          {status === "NO_ID" && (
            <p className="text-blue-300 text-xs mt-2">
              Please complete identity verification to activate your service.
            </p>
          )}
        </motion.div>
      )}
    </>
  );
}

