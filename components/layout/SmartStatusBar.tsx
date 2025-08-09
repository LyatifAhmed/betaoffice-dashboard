"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import { mutate } from "swr";

type SmartStatusBarProps = {
  onMenuClick?: () => void;
  status?: string;
  newMailCount?: number;
  onNewMail?: (evt: { sender?: string; company?: string; title?: string; received_at?: string | null }) => void;
};

export default function SmartStatusBar({
  onMenuClick,
  status = "Your subscription is active.",
  newMailCount,
  onNewMail,
}: SmartStatusBarProps) {
  const [open, setOpen] = useState(true);
  const [localUnread, setLocalUnread] = useState(0);
  const [externalId, setExternalId] = useState<string | null>(null);

  // localStorage sadece tarayıcıda var
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("external_id");
      setExternalId(id);
    }
  }, []);

  const displayUnread = useMemo(
    () => (typeof newMailCount === "number" ? newMailCount : localUnread),
    [newMailCount, localUnread]
  );

  const BAR_H = 44;
  const TAB_H = 16;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const draggedUp = info.offset.y < -24 || info.velocity.y < -200;
    const draggedDown = info.offset.y > 24 || info.velocity.y > 200;
    if (draggedUp) setOpen(false);
    else if (draggedDown) setOpen(true);
  };

  const [glow, setGlow] = useState(false);
  const glowTimer = useRef<number | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_HOXTON_WS_URL;
    if (!base) return;

    const ws = new WebSocket(`${base.replace(/\/$/, "")}/ws/mail`);

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.type === "new_mail") {
          if (typeof newMailCount !== "number") {
            setLocalUnread((n) => n + 1);
          }
          onNewMail?.({
            sender: data.sender,
            company: data.company,
            title: data.title,
            received_at: data.received_at,
          });

          if (externalId) {
            mutate(`/api/mail?external_id=${externalId}`);
          }

          setGlow(true);
          if (glowTimer.current) window.clearTimeout(glowTimer.current);
          glowTimer.current = window.setTimeout(() => setGlow(false), 1500);
        }
      } catch {}
    };

    ws.onerror = () => {
      try {
        ws.close();
      } catch {}
    };

    return () => {
      try {
        ws.close();
      } catch {}
      if (glowTimer.current) window.clearTimeout(glowTimer.current);
    };
  }, [newMailCount, onNewMail, externalId]);

  const clearUnread = () => {
    if (typeof newMailCount !== "number") setLocalUnread(0);
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl pointer-events-none">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="bar"
            drag="y"
            dragConstraints={{ top: -BAR_H, bottom: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -BAR_H - 8, opacity: 0.7 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto mx-auto"
          >
            <div
              className={[
                "relative flex items-center gap-3 px-4 h-11 rounded-full",
                "bg-gradient-to-br from-white/30 via-white/20 to-white/10",
                "dark:from-[#0d1b2a]/80 dark:to-[#1e2a3a]/60",
                "backdrop-blur-xl border border-white/30",
                glow
                  ? "shadow-[0_10px_44px_rgba(255,0,255,0.18)] ring-1 ring-fuchsia-400/20"
                  : "shadow-[0_8px_40px_rgba(255,0,255,0.1)]",
              ].join(" ")}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 opacity-90" />

              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="md:hidden -ml-1 px-2 py-1 rounded-md hover:bg-white/30 transition"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}

              <Sparkles size={16} className="text-fuchsia-500" />
              <span className="text-sm font-medium text-gray-800 dark:text-white/90 truncate max-w-[200px]">
                {status}
              </span>

              {displayUnread > 0 && (
                <button
                  onClick={clearUnread}
                  className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-500 animate-pulse"
                  title="Mark as seen"
                >
                  <Bell size={14} />
                  {displayUnread} new mail
                </button>
              )}

              <span className="ml-auto text-[11px] text-gray-500 dark:text-white/60">
                Drag ↑ to hide
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="tab"
            onClick={() => setOpen(true)}
            initial={{ y: -TAB_H, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              pointer-events-auto mx-auto block h-4 px-3 rounded-full
              bg-gradient-to-r from-blue-500 to-fuchsia-500
              text-[11px] text-white/90
              shadow-[0_6px_24px_rgba(255,0,255,0.15)]
              border border-white/30 backdrop-blur-md
            "
            title="Show status"
          >
            Show status
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
