"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type Props = {
  mailId: number | string;
  onComplete: (summary: string) => void;
  align?: "left" | "right";
};

// Basit cache (sayfa yenilenene kadar)
const aiSummaryCache = new Map<string, string>();

export default function AISummaryButton({ mailId, onComplete, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">("idle");
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const generateSummary = async () => {
    const cacheKey = String(mailId);

    // Eğer önceden özet alınmışsa API çağrısı yapma
    if (aiSummaryCache.has(cacheKey)) {
      onComplete(aiSummaryCache.get(cacheKey)!);
      showBubble("success");
      return;
    }

    // Balonu aç ve yükleme başlat
    setOpen(true);
    setPhase("loading");

    try {
      const res = await fetch(`/api/ai-summary?mailId=${encodeURIComponent(cacheKey)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (data?.summary) {
        aiSummaryCache.set(cacheKey, data.summary); // cache'e ekle
        onComplete(data.summary);
        showBubble("success");
      } else {
        throw new Error("No summary");
      }
    } catch {
      showBubble("error");
    }
  };

  const showBubble = (newPhase: "success" | "error") => {
    setPhase(newPhase);
    setOpen(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setOpen(false);
      setPhase("idle");
    }, 1500);
  };

  const popSide =
    align === "right"
      ? "right-0 origin-top-right"
      : "left-0 origin-top-left";

  return (
    <div className="relative inline-flex">
      <Button
        type="button"
        onClick={generateSummary}
        disabled={phase === "loading"}
        className="group relative flex items-center gap-2 rounded-xl text-sm
                   bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                   hover:from-blue-500 hover:to-indigo-500
                   active:scale-[0.98] transition disabled:opacity-60"
      >
        {phase === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {phase === "loading" ? "Summarizing…" : "Summarize with AI"}
      </Button>

      {/* Şeffaf baloncuk */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`absolute ${popSide} -top-2 translate-y-[-100%] z-50 pointer-events-none`}
            aria-live="polite"
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-2xl
                         bg-white/20 dark:bg-white/10 backdrop-blur-xl
                         border border-white/30 dark:border-white/15
                         shadow-[0_8px_30px_rgba(0,0,0,0.15)]
                         text-[13px] text-white"
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
  );
}
