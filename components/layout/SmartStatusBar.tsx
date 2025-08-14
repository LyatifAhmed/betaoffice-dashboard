// components/layout/SmartStatusBar.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import { mutate } from "swr";

export type SmartStatusBarHandle = {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  pulse: (ms?: number) => void;
  // backward compatibility helpers:
  pushNotification?: (n: { title?: string; urgent?: boolean }) => void;
  clearNotifications?: () => void;
};

export type SmartStatusBarProps = {
  /** Mobile hamburger menu trigger */
  onMenuClick?: () => void;
  status?: string;
  newMailCount?: number;
  /** Notify parent on new mail (WS event) */
  onNewMail?: (evt?: Partial<{
    sender: string;
    company: string;
    title: string;
    received_at: string | null;
    urgent: boolean;
  }>) => void;
  /** If bar is hidden, keep it open this many seconds on new mail (0 = do not autoclose) */
  autoCloseAfter?: number;
  /** Optional storage key (not persisted in this version) */
  storageKey?: string;
};

function wsBaseURL(): string | null {
  if (typeof window === "undefined") return null;
  const env = process.env.NEXT_PUBLIC_HOXTON_WS_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  return `${proto}://${host}`;
}

const SmartStatusBar = forwardRef<SmartStatusBarHandle, SmartStatusBarProps>(
  function SmartStatusBar(
    {
      onMenuClick,
      status = "Your subscription is active.",
      newMailCount,
      onNewMail,
      autoCloseAfter = 10,
    },
    ref
  ) {
    // start open (visible)
    const [open, setOpen] = useState(true);
    const [localUnread, setLocalUnread] = useState(0);
    const [externalId, setExternalId] = useState<string | null>(null);
    const [glow, setGlow] = useState(false);
    const [urgentFlash, setUrgentFlash] = useState(false);
    const glowTimer = useRef<number | null>(null);
    const autoCloseTimer = useRef<number | null>(null);

    useEffect(() => {
      const id = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
      setExternalId(id);
      setOpen(true);
    }, []);

    const triggerGlow = (ms = 1500) => {
      setGlow(true);
      if (glowTimer.current) window.clearTimeout(glowTimer.current);
      glowTimer.current = window.setTimeout(() => setGlow(false), ms);
    };

    // Imperative API
    useImperativeHandle(ref, () => ({
      show: () => setOpen(true),
      hide: () => setOpen(false),
      toggle: () => setOpen((v) => !v),
      pulse: (ms?: number) => triggerGlow(ms ?? 1500),
      pushNotification: (n) => {
        if (n?.urgent) setUrgentFlash(true);
        setLocalUnread((x) => x + 1);
        triggerGlow(1800);
      },
      clearNotifications: () => {
        setLocalUnread(0);
        setUrgentFlash(false);
      },
    }));

    // Keyboard toggle Ctrl/⌘ + J
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    const displayUnread = useMemo(
      () => (typeof newMailCount === "number" ? newMailCount : localUnread),
      [newMailCount, localUnread]
    );

    const BAR_H = 48;
    const TAB_H = 16;

    const handleDragEnd = (_: any, info: PanInfo) => {
      const draggedUp = info.offset.y < -24 || info.velocity.y < -200;
      const draggedDown = info.offset.y > 24 || info.velocity.y > 200;
      if (draggedUp) setOpen(false);
      else if (draggedDown) setOpen(true);
    };

    // WebSocket auto-reconnect
    useEffect(() => {
      const base = wsBaseURL();
      if (!base) return;
      const url = `${base}/ws/mail`;

      let ws: WebSocket | null = null;
      let attempts = 0;
      let reconnectTimer: number | null = null;

      const connect = () => {
        ws = new WebSocket(url);

        ws.onopen = () => {
          attempts = 0;
          if (process.env.NODE_ENV !== "production") console.log("[WS] open", url);
        };

        ws.onmessage = (evt) => {
          try {
            const data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
            const kind = (data?.type || data?.event || "").toString().toLowerCase();
            if (kind === "new_mail") {
              const urgent =
                !!data?.urgent ||
                /urgent|penalty|final notice/i.test(`${data?.title ?? ""} ${data?.summary ?? ""}`);

              if (typeof newMailCount !== "number") setLocalUnread((n) => n + 1);
              setUrgentFlash(urgent);

              onNewMail?.({ urgent });
              window.dispatchEvent(new CustomEvent("betaoffice:new-mail", { detail: { urgent } }));

              const key =
                externalId
                  ? `/api/hoxton/mail?external_id=${encodeURIComponent(externalId)}&source=db`
                  : null;
              if (key) mutate(key);

              triggerGlow(1800);

              // If bar hidden, slide down then auto-close after X seconds
              if (!open) {
                setOpen(true);
                if (autoCloseAfter > 0) {
                  if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
                  autoCloseTimer.current = window.setTimeout(
                    () => setOpen(false),
                    autoCloseAfter * 1000
                  );
                }
              }
            }
          } catch (e) {
            if (process.env.NODE_ENV !== "production") console.warn("[WS] parse error", e);
          }
        };

        ws.onerror = () => {
          if (process.env.NODE_ENV !== "production") console.warn("[WS] error");
          try { ws?.close(); } catch {}
        };

        ws.onclose = () => {
          const delay = Math.min(30000, 500 * Math.pow(2, attempts++));
          if (process.env.NODE_ENV !== "production") console.log("[WS] close; reconnect in", delay);
          reconnectTimer = window.setTimeout(connect, delay);
        };
      };

      connect();
      return () => {
        try { ws?.close(); } catch {}
        if (reconnectTimer) window.clearTimeout(reconnectTimer);
        if (glowTimer.current) window.clearTimeout(glowTimer.current);
        if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
      };
    }, [newMailCount, externalId, autoCloseAfter, open, onNewMail]);

    const clearUnread = () => {
      if (typeof newMailCount !== "number") setLocalUnread(0);
      setUrgentFlash(false);
    };

    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl pointer-events-none">
        <span className="sr-only" role="status" aria-live="polite">
          {status}
          {displayUnread ? ` — ${displayUnread} new mail` : ""}
        </span>

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
                  "relative flex items-center gap-3 px-4 h-12 rounded-full",
                  "bg-[radial-gradient(120%_160%_at_50%_-20%,rgba(236,72,153,0.42),rgba(79,70,229,0.33)_35%,rgba(2,6,23,0.8)_62%,rgba(2,6,23,0.9)_100%)]",
                  "backdrop-blur-xl border border-white/12",
                  glow
                    ? "shadow-[0_12px_48px_rgba(236,72,153,0.35)] ring-1 ring-fuchsia-400/30"
                    : "shadow-[0_10px_44px_rgba(147,51,234,0.18)]",
                  "text-white",
                ].join(" ")}
              >
                {/* drag handle */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 opacity-90" />

                {/* Mobile hamburger (only md-) */}
                {onMenuClick && (
                  <button
                    onClick={onMenuClick}
                    className="md:hidden -ml-1 px-2 py-1 rounded-md hover:bg-white/10 transition"
                    aria-label="Open menu"
                  >
                    ☰
                  </button>
                )}

                <Sparkles size={16} className="text-fuchsia-300" />
                <span className="text-sm font-medium truncate max-w-[200px] text-gray-100 drop-shadow-[0_0_6px_rgba(168,85,247,0.45)]">
                  {status}
                </span>

                {urgentFlash && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-rose-400/40 bg-rose-500/20 text-rose-100 font-semibold">
                    URGENT
                  </span>
                )}

                {displayUnread > 0 && (
                  <button
                    onClick={clearUnread}
                    className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200"
                    title="Mark as seen"
                  >
                    <Bell size={14} />
                    {displayUnread} new mail
                  </button>
                )}

                <span className="ml-auto text-[11px] text-white/70">Drag ↑ • Ctrl/⌘+J</span>
              </div>
            </motion.div>
          ) : (
            <>
              {/* MINI HAMBURGER while closed (mobile only) */}
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="pointer-events-auto fixed left-3 top-3 z-50 md:hidden h-9 w-9 rounded-lg bg-white/15 border border-white/20 text-white backdrop-blur-md shadow hover:bg-white/25 transition"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}

              <motion.button
                key="tab"
                onClick={() => setOpen(true)}
                initial={{ y: -TAB_H, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto mx-auto block h-4 px-3 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-[11px] text-white/90 shadow-[0_6px_24px_rgba(217,70,239,0.25)] border border-white/10 backdrop-blur-md"
                title="Show status"
              >
                Show status
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default SmartStatusBar;
