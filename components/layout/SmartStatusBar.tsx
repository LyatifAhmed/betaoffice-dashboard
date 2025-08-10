"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import { mutate } from "swr";

export type SmartStatusBarHandle = {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  pulse: (ms?: number) => void; // manual glow
};

type SmartStatusBarProps = {
  onMenuClick?: () => void;
  status?: string;
  newMailCount?: number;
  onNewMail?: (evt: { sender?: string; company?: string; title?: string; received_at?: string | null; urgent?: boolean }) => void;
  /** Auto-close seconds after auto-open (0 = never) */
  autoCloseAfter?: number;
  /** Open state key for persistence in localStorage */
  storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "smartbar_open";

const SmartStatusBar = forwardRef<SmartStatusBarHandle, SmartStatusBarProps>(function SmartStatusBar(
  {
    onMenuClick,
    status = "Your subscription is active.",
    newMailCount,
    onNewMail,
    autoCloseAfter = 0,
    storageKey = DEFAULT_STORAGE_KEY,
  },
  ref
) {
  const [open, setOpen] = useState(true);
  const [localUnread, setLocalUnread] = useState(0);
  const [externalId, setExternalId] = useState<string | null>(null);
  const [glow, setGlow] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  const glowTimer = useRef<number | null>(null);
  const autoCloseTimer = useRef<number | null>(null);

  // Restore persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = localStorage.getItem("external_id");
    setExternalId(id);
    const saved = localStorage.getItem(storageKey);
    if (saved === "0") setOpen(false);
    if (saved === "1") setOpen(true);
  }, [storageKey]);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, open ? "1" : "0");
  }, [open, storageKey]);

  // Imperative API
  useImperativeHandle(ref, () => ({
    show: () => setOpen(true),
    hide: () => setOpen(false),
    toggle: () => setOpen((v) => !v),
    pulse: (ms = 1500) => triggerGlow(ms),
  }));

  const triggerGlow = (ms = 1500) => {
    setGlow(true);
    if (glowTimer.current) window.clearTimeout(glowTimer.current);
    glowTimer.current = window.setTimeout(() => setGlow(false), ms);
  };

  // Keyboard shortcut: Ctrl/⌘ + J to toggle (renk/dizayn dokunmadan)
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

  // Custom events to control bar from anywhere
  useEffect(() => {
    const onShow = () => setOpen(true);
    const onHide = () => setOpen(false);
    const onToggle = () => setOpen((v) => !v);
    const onPulse = (e: Event) => {
      const detail = (e as CustomEvent<{ ms?: number }>).detail;
      triggerGlow(detail?.ms ?? 1500);
    };
    window.addEventListener("betaoffice:smartbar:show", onShow);
    window.addEventListener("betaoffice:smartbar:hide", onHide);
    window.addEventListener("betaoffice:smartbar:toggle", onToggle);
    window.addEventListener("betaoffice:smartbar:pulse", onPulse as EventListener);
    return () => {
      window.removeEventListener("betaoffice:smartbar:show", onShow);
      window.removeEventListener("betaoffice:smartbar:hide", onHide);
      window.removeEventListener("betaoffice:smartbar:toggle", onToggle);
      window.removeEventListener("betaoffice:smartbar:pulse", onPulse as EventListener);
    };
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

  // --- WebSocket with auto-reconnect (expo backoff) ---
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_HOXTON_WS_URL;
    if (!base) return;

    let ws: WebSocket | null = null;
    let attempts = 0;
    let reconnectTimer: number | null = null;

    const connect = () => {
      const url = `${base.replace(/\/$/, "")}/ws/mail`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        attempts = 0;
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data?.type === "new_mail") {
            if (typeof newMailCount !== "number") {
              setLocalUnread((n) => n + 1);
            }

            // Fire a global event for other components
            window.dispatchEvent(
              new CustomEvent("betaoffice:new-mail", { detail: data })
            );

            onNewMail?.({
              sender: data.sender,
              company: data.company,
              title: data.title,
              received_at: data.received_at,
              urgent: !!data.urgent,
            });

            if (externalId) {
              mutate(`/api/mail?external_id=${externalId}`);
            }


            // Auto drop-down if hidden
            if (!open) {
              setOpen(true);
              setAutoOpened(true);
            }

            // Pulse glow
            triggerGlow(1800);

            // Optional auto-close after N seconds if we auto-opened
            if (autoCloseAfter > 0) {
              if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
              autoCloseTimer.current = window.setTimeout(() => {
                setAutoOpened(false);
                setOpen((v) => {
                  // only close if user didn't manually toggle in the meantime
                  return v && autoOpened ? false : v;
                });
              }, autoCloseAfter * 1000);
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        try { ws?.close(); } catch {}
      };

      ws.onclose = () => {
        const delay = Math.min(30000, 500 * Math.pow(2, attempts++));
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
  }, [newMailCount, onNewMail, externalId, autoCloseAfter, open]);

  const clearUnread = () => {
    if (typeof newMailCount !== "number") setLocalUnread(0);
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl pointer-events-none">
      {/* ARIA live region for screen readers */}
      <span className="sr-only" role="status" aria-live="polite">{status}{displayUnread ? ` — ${displayUnread} new mail` : ""}</span>

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
                // *** AESTHETIC: unchanged ****
                "bg-gradient-to-br from-slate-800/40 via-slate-700/25 to-purple-900/20",
                "backdrop-blur-md border border-white/12",
                // *** AESTHETIC: glow only when active (same palette) ***
                glow
                  ? "shadow-[0_10px_44px_rgba(217,70,239,0.22)] ring-1 ring-fuchsia-400/25"
                  : "shadow-[0_8px_40px_rgba(147,51,234,0.16)]",
              ].join(" ")}
            >
              {/* Handle */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 opacity-90" />

              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="md:hidden -ml-1 px-2 py-1 rounded-md hover:bg-white/10 transition"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}

              <Sparkles size={16} className="text-fuchsia-400" />
              <span
                className={[
                  "text-sm font-medium truncate max-w-[200px]",
                  "text-gray-200",
                  "drop-shadow-[0_0_6px_rgba(168,85,247,0.45)]",
                ].join(" ")}
              >
                {status}
              </span>

              {displayUnread > 0 && (
                <button
                  onClick={clearUnread}
                  className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-400 animate-pulse"
                  title="Mark as seen"
                >
                  <Bell size={14} />
                  {displayUnread} new mail
                </button>
              )}

              <span className="ml-auto text-[11px] text-white/60">Drag ↑ to hide • Ctrl/⌘+J</span>
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
              shadow-[0_6px_24px_rgba(217,70,239,0.25)]
              border border-white/10 backdrop-blur-md
            "
            title="Show status"
          >
            Show status
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SmartStatusBar;
