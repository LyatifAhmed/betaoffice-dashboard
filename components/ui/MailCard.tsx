"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReaderIcon } from "@radix-ui/react-icons";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type Mail = {
  id: string;
  sender: string;
  category: "bank" | "government" | "urgent" | "other";
  summary?: string;
  receivedAt: string;
  expiresAt?: string | null;
  isRead?: boolean;
};

const aiSummaryCache = new Map<string, string>();

export default function MailCard({
  mail,
  size = "compact",
  onForward,
  hideForward = false,
}: {
  mail: Mail;
  size?: "compact" | "normal";
  onForward?: (mailId: string) => Promise<void> | void;
  hideForward?: boolean;
}) {
  const [summary, setSummary] = useState<string>(mail.summary || "");
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [fwdBusy, setFwdBusy] = useState(false);

  // Envelope dialog state
  const [envOpen, setEnvOpen] = useState(false);
  const [envLoading, setEnvLoading] = useState(false);
  const [envErr, setEnvErr] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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
    if (aiSummaryCache.has(key)) {
      const cached = aiSummaryCache.get(key)!;
      if (!summary) setSummary(cached);
      showBubble("success");
      return;
    }
    showBubble("loading", 0);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailId: key }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.summary) {
        aiSummaryCache.set(key, data.summary);
        setSummary((s) => s || data.summary);
        showBubble("success");
      } else throw new Error("no-summary");
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

  const handleForward = async () => {
    if (hideForward) return;
    try {
      setFwdBusy(true);
      if (onForward) {
        await onForward(mail.id);
      } else {
        await fetch(`/api/hoxton/mail/${encodeURIComponent(mail.id)}/forward`, { method: "POST" });
      }
      showBubble("success");
    } catch {
      showBubble("error");
    } finally {
      setFwdBusy(false);
    }
  };

  // Envelope loader (front/back + pdf link)
  const openEnvelope = async () => {
    setEnvOpen(true);
    setEnvLoading(true);
    setEnvErr(null);
    setFrontUrl(null);
    setBackUrl(null);
    setPdfUrl(null);
    try {
      // 1) zarf görselleri
      const envRes = await fetch(`/api/mail/envelope/${encodeURIComponent(mail.id)}`, { cache: "no-store" });
      const envData = await envRes.json().catch(() => ({}));
      setFrontUrl(envData?.url_envelope_front || envData?.front || null);
      setBackUrl(envData?.url_envelope_back || envData?.back || null);

      // 2) pdf linki (24h presigned)
      const pdfRes = await fetch(`/api/mail/open/${encodeURIComponent(mail.id)}`, { cache: "no-store" });
      const pdfData = await pdfRes.json().catch(() => ({}));
      setPdfUrl(pdfData?.url || null);
    } catch (e: any) {
      setEnvErr("Couldn’t load envelope assets.");
    } finally {
      setEnvLoading(false);
    }
  };

  const chipStyles: Record<NonNullable<Mail["category"]>, string> = {
    bank: "bg-emerald-200 text-emerald-900",
    government: "bg-amber-200 text-amber-900",
    urgent: "bg-rose-300 text-rose-900",
    other: "bg-indigo-200 text-indigo-900",
  };

  const pad = size === "compact" ? "px-3 py-3 sm:px-4 sm:py-3" : "px-4 sm:px-6 py-4";
  const titleCls = size === "compact" ? "text-[12.5px] sm:text-sm" : "text-xs sm:text-sm";
  const dateCls = size === "compact" ? "text-[10.5px] sm:text-xs" : "text-[11px] sm:text-xs";

  // okunmamış → kalın çerçeve, okunmuş → standart
  const readCls = mail.isRead
    ? "border border-white/30 dark:border-white/15"
    : "border-2 border-violet-400/60";

  return (
    <div className="relative group">
      <div
        className={`w-full max-w-full bg-white/70 dark:bg-white/10 backdrop-blur-md
                    rounded-xl ${pad} transition-all duration-300 overflow-hidden
                    hover:bg-white/90 dark:hover:bg-white/15 hover:border-blue-300 shadow-sm
                    ${readCls}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-1.5">
          <div className={`font-semibold text-gray-800 dark:text-white truncate max-w-full sm:max-w-[60%] ${titleCls}`}>
            {mail.sender || "Unknown sender"}
          </div>
          <div className={`text-gray-500 dark:text-white/70 ${dateCls}`}>
            {new Date(mail.receivedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Badge + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className={`text-[10px] w-fit px-2 py-0.5 rounded-full ${chipStyles[mail.category]}`}>
            {mail.category.toUpperCase()}
          </div>

          <div className="relative flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-2 overflow-x-auto max-w-full">
            {/* Open PDF */}
            <button
              onClick={handleOpenPDF}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full
                         bg-blue-200 text-blue-900 hover:bg-blue-300 transition
                         dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30"
              aria-label="Open document"
            >
              <ReaderIcon className="w-3 h-3" /> <span className="hidden xs:inline">Open</span>
              <span className="xs:hidden">Open</span>
            </button>

            {/* Envelope preview (dialog açar) */}
            <button
              onClick={openEnvelope}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full
                         bg-slate-200 text-slate-900 hover:bg-slate-300 transition
                         dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              aria-label="Open envelope"
            >
              ✉️ <span className="hidden xs:inline">Envelope</span>
              <span className="xs:hidden">Env</span>
            </button>

            {/* Forward */}
            {!hideForward && (
              <button
                onClick={handleForward}
                disabled={fwdBusy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full
                           bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                aria-label="Forward mail"
              >
                {fwdBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">Forward</span>
                <span className="xs:hidden">Fwd</span>
              </button>
            )}

            {/* AI Summary */}
            <div className="relative inline-flex">
              <button
                onClick={handleSummarize}
                disabled={phase === "loading"}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full
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
                <span className="hidden xs:inline">{phase === "loading" ? "Summarizing…" : "AI Summary"}</span>
                <span className="xs:hidden">{phase === "loading" ? "…" : "AI"}</span>
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
                                 text-[12px] text-white"
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
              className="mt-2 text-[12.5px] text-gray-700 dark:text-white/80"
            >
              {summary}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Envelope Dialog */}
      <Dialog open={envOpen} onOpenChange={setEnvOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Envelope preview</DialogTitle>
          </DialogHeader>

          {envLoading ? (
            <div className="text-sm text-gray-600 dark:text-white/70">Loading…</div>
          ) : envErr ? (
            <div className="text-sm text-rose-600">{envErr}</div>
          ) : (
            <div className="space-y-4">
              {/* PDF link (opsiyonel) */}
              {pdfUrl && (
                <div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md
                               bg-blue-100 text-blue-800 hover:bg-blue-200 transition
                               dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30"
                  >
                    📄 Open PDF
                  </a>
                </div>
              )}

              {!frontUrl && !backUrl ? (
                <div className="text-sm text-gray-600 dark:text-white/70">
                  No envelope images were provided for this item.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {frontUrl && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-white/5">
                        Front
                      </div>
                      <img
                        src={frontUrl}
                        alt="Envelope front"
                        className="w-full h-auto"
                        loading="eager"
                      />
                    </div>
                  )}
                  {backUrl && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-white/5">
                        Back
                      </div>
                      <img
                        src={backUrl}
                        alt="Envelope back"
                        className="w-full h-auto"
                        loading="eager"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setEnvOpen(false)}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white 
                         hover:bg-gray-50 dark:bg-white/10 dark:border-white/15 dark:text-white"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
