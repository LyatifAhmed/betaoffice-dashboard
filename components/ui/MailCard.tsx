"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReaderIcon } from "@radix-ui/react-icons";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Mail = {
  id: string;
  sender: string;
  category: "bank" | "government" | "urgent" | "other";
  summary?: string;
  receivedAt: string;
  expiresAt?: string | null;
};

/** Sayfa ömrü boyunca basit cache: aynı mail için yalnızca 1 API çağrısı */
const aiSummaryCache = new Map<string, string>();

export default function MailCard({ mail }: { mail: Mail }) {
  const [summary, setSummary] = useState<string>(mail.summary || "");
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const daysLeft = useMemo(() => {
    if (!mail.expiresAt) return null;
    const t = new Date(mail.expiresAt).getTime();
    if (Number.isNaN(t)) return null;
    const diff = Math.floor((t - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [mail.expiresAt]);

  const showBubble = (p: "loading" | "success" | "error", autoHideMs = 1300) => {
    setPhase(p);
    setBubbleOpen(true);
    if (p !== "loading") {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setBubbleOpen(false);
        setPhase("idle");
      }, autoHideMs);
    }
  };

  const handleSummarize = async () => {
    const key = String(mail.id);

    // cache’te varsa tekrar çağrı yapma
    if (aiSummaryCache.has(key)) {
      const cached = aiSummaryCache.get(key)!;
      if (!summary) setSummary(cached);
      showBubble("success");
      return;
    }

    // ilk kez: yükleme → çağrı → cache
    showBubble("loading", 0);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailId: key }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (data?.summary) {
        aiSummaryCache.set(key, data.summary);
        setSummary((s) => s || data.summary);
        showBubble("success");
      } else {
        throw new Error("no-summary");
      }
    } catch {
      showBubble("error");
    }
  };

  const handleOpenPDF = async () => {
    try {
      const res = await fetch(`/api/mail/open/${encodeURIComponent(mail.id)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      // no-op
    }
  };

  const chipStyles: Record<Mail["category"], string> = {
    bank: "bg-emerald-200 text-emerald-900",
    government: "bg-amber-200 text-amber-900",
    urgent: "bg-rose-300 text-rose-900",
    other: "bg-indigo-200 text-indigo-900",
  };

  return (
    <div
      className="w-full max-w-full bg-white/70 dark:bg-white/10 backdrop-blur-md
                 border border-white/30 dark:border-white/15 rounded-xl
                 px-4 sm:px-6 py-4 transition-all duration-300 overflow-hidden
                 hover:bg-white/90 dark:hover:bg-white/15 hover:border-blue-300 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-2">
        <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white truncate max-w-full sm:max-w-[60%]">
          {mail.sender || "Unknown sender"}
        </div>
        <div className="text-[11px] sm:text-xs text-gray-500 dark:text-white/70">
          {new Date(mail.receivedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Badge + Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className={`text-[10px] w-fit px-2 py-0.5 rounded-full ${chipStyles[mail.category]}`}>
          {mail.category.toUpperCase()}
        </div>

        <div className="relative flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-2 overflow-x-auto max-w-full">
          {/* Open */}
          <button
            onClick={handleOpenPDF}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-full
                       bg-blue-200 text-blue-900 hover:bg-blue-300 transition
                       dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30"
            aria-label="Open document"
          >
            <ReaderIcon className="w-3 h-3" /> Open
          </button>

          {/* AI Summary – tek tık + şeffaf baloncuk + cache */}
          <div className="relative inline-flex">
            <button
              onClick={handleSummarize}
              disabled={phase === "loading"}
              className="flex items-center gap-2 px-3 py-1 text-xs rounded-full
                         bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                         hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]
                         transition disabled:opacity-60"
              aria-label="Generate AI summary"
            >
              {phase === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {phase === "loading" ? "Summarizing…" : "AI Summary"}
            </button>

            {/* Baloncuk */}
            <AnimatePresence>
              {bubbleOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 -top-2 translate-y-[-100%] z-50 pointer-events-none"
                  aria-live="polite"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl
                               bg-white/20 dark:bg-white/10 backdrop-blur-xl
                               border border-white/30 dark:border-white/15
                               shadow-[0_8px_30px_rgba(0,0,0,0.15)]
                               text-[12.5px] text-white"
                  >
                    {phase === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                    {phase === "success" && <CheckCircle2 className="w-4 h-4" />}
                    {phase === "error" && <AlertCircle className="w-4 h-4" />}
                    <span className="whitespace-nowrap">
                      {phase === "loading" && "Generating…"}
                      {phase === "success" && "Done!"}
                      {phase === "error" && "Couldn’t generate"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary */}
      <AnimatePresence>
        {summary && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 text-xs text-gray-700 dark:text-white/80"
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
