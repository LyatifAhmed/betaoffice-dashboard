"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function ChatBox({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
  if (!input.trim()) return;
  const userMessage = input;
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();
    if (data.reply) {
      setMessages((prev) => [...prev, data.reply]);
    }
  } catch (error) {
    console.error("Chat error:", error);
    setMessages((prev) => [...prev, "⚠️ Error contacting AI."]);
  }
};


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 right-4 md:bottom-32 md:right-10 w-[92%] sm:w-[360px] h-[480px] z-[60] flex flex-col overflow-hidden rounded-3xl border border-white/20 backdrop-blur-[14px] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(251, 207, 232, 0.6), rgba(255, 255, 255, 0.2))",
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-br from-pink-300/60 via-fuchsia-300/40 to-pink-200/20 backdrop-blur-[10px]">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-white shadow-[0_0_6px_rgba(255,255,255,0.8)]">
          BetaOffice AI
        </h3>
        <button
          onClick={onClose}
          className="transition"
          style={{
            color: "#fb7185", // soft neon pembe
            textShadow: "0 0 4px #fb7185, 0 0 6px #fb7185",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm text-slate-100">
  {messages.map((msg, idx) => (
    <div
      key={idx}
      className="p-2 rounded-xl max-w-[80%] bg-[#f3c6e6] text-slate-900 shadow-md"
      style={{
        alignSelf: idx % 2 === 0 ? "flex-end" : "flex-start",
        marginLeft: idx % 2 === 0 ? "auto" : 0,
        marginRight: idx % 2 !== 0 ? "auto" : 0,
      }}
    >
      {msg}
    </div>
  ))}
</div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-white/10 backdrop-blur-[10px]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#f8bdd4] text-zinc-800 placeholder-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"

       />

          <button
            onClick={handleSend}
            className="bg-gradient-to-tr from-pink-300 via-fuchsia-400 to-pink-500 text-white px-4 py-2 rounded-xl hover:brightness-110 transition shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
