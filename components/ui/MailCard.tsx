"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneIcon, RocketIcon, ReaderIcon } from "@radix-ui/react-icons";

export default function MailCard({ mail }: { mail: any }) {
  const [summary, setSummary] = useState(mail.summary || "");
  const [loading, setLoading] = useState(false);
  const [hoverSummarize, setHoverSummarize] = useState(false);
  const [hoverForward, setHoverForward] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const daysLeft = Math.max(
    0,
    Math.floor((new Date(mail.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleSummarize = async () => {
    setHoverSummarize(true);
    if (summary || triggered) return;
    setTriggered(true);
    setLoading(true);

    const res = await fetch("/api/summarize", {
      method: "POST",
      body: JSON.stringify({ mailId: mail.id }),
    });

    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  const handleOpenPDF = async () => {
    const res = await fetch(`/api/mail/open/${mail.id}`);
    const data = await res.json();
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  return (
    <div
      className="
        w-full
        bg-white/70
        backdrop-blur-md
        border border-white/30
        rounded-xl
        px-6 py-4
        transition-all duration-300
        overflow-hidden
        hover:bg-white/90
        hover:border-blue-300
        shadow-sm
      "
    >
      {/* Header Row */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-semibold text-gray-800 truncate max-w-[60%]">
          {mail.sender}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(mail.receivedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Badge + Buttons Row */}
      <div className="flex justify-between items-center">
        <div className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
          {mail.category.toUpperCase()}
        </div>

        <div className="flex items-center gap-2">
          {/* Open Button */}
          <button
            onClick={handleOpenPDF}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-900 hover:bg-blue-300 transition"
          >
            <ReaderIcon className="w-3 h-3" /> Open
          </button>

          {/* Forward Button */}
          <div
            onMouseEnter={() => setHoverForward(true)}
            onMouseLeave={() => setHoverForward(false)}
            className="relative"
          >
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 bg-indigo-200 text-indigo-800 rounded-full hover:bg-indigo-300 transition"
            >
              <PaperPlaneIcon />
            </button>

            <AnimatePresence>
              {hoverForward && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 0.95 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -top-8 right-0 bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-xs shadow-md z-10"
                >
                  ⏳ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left to forward
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summarize Button */}
          <div
            onMouseEnter={handleSummarize}
            onMouseLeave={() => setHoverSummarize(false)}
            className="relative"
          >
            <button className="flex items-center gap-1 px-3 py-1 bg-pink-200 text-pink-900 text-xs rounded-full hover:bg-pink-300 transition">
              <RocketIcon className="w-3 h-3" /> AI Summary
            </button>

            <AnimatePresence>
              {hoverSummarize && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 0.9 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-8 left-2 bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-xs shadow-md z-10"
                >
                  💬 Generating summary...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary text */}
      <AnimatePresence>
        {summary && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 text-xs text-gray-700"
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
