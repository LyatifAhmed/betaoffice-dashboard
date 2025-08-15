// components/ChatBox.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";

type ApiReply = { reply?: string };

const MIN_INTERVAL_MS = 1700;
const MAX_TURNS = 16;
const MAX_PER_MINUTE = 8;

export default function ChatBox() {
  const {
    isOpen,
    isMinimized,
    open,
    minimize,
    closeAndForget,
    histories,
    scope,            // ⬅️ contextKey yerine scope
    role,
    push,
    replaceHistory,
  } = useChatStore();

  const msgs = histories[scope] ?? []; // ⬅️ scope ile key’le
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSendRef = useRef(0);
  const tickRef = useRef<number[]>([]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen, scope]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;

    const now = Date.now();
    if (now - lastSendRef.current < MIN_INTERVAL_MS) return;
    lastSendRef.current = now;

    tickRef.current = tickRef.current.filter((t) => now - t < 60_000);
    if (tickRef.current.length >= MAX_PER_MINUTE) {
      push({
        role: "assistant",
        content: "⏳ You're sending messages too fast. Please wait a bit.",
      });
      return;
    }
    tickRef.current.push(now);

    if (msgs.length >= MAX_TURNS) {
      push({
        role: "assistant",
        content: "This chat reached its limit. Please close (X) to reset.",
      });
      return;
    }

    // optimistic
    push({ role: "user", content: userMessage });
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: role, // "landing-sales" | "kyc-helper" | "dashboard-..."
          thread: scope, // ⬅️ bağlam anahtarı olarak scope
        }),
      });
      const data: ApiReply = await res.json().catch(() => ({}));
      push({
        role: "assistant",
        content: data?.reply || "⚠️ Error contacting AI.",
      });
    } catch {
      push({ role: "assistant", content: "⚠️ Error contacting AI." });
    }
  };

  if (!isOpen && !isMinimized) return null;

  return (
    <>
      {isMinimized && (
        <button
          onClick={() => open()}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-8 z-[60] px-3 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-white shadow-lg"
        >
          Open chat
        </button>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-24 right-4 md:bottom-32 md:right-10 w-[92%] sm:w-[360px] h-[480px] z-[60] flex flex-col overflow-hidden rounded-3xl border border-white/20 backdrop-blur-[14px] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(251, 207, 232, 0.6), rgba(255, 255, 255, 0.2))",
          }}
        >
          {/* Header */}
          <div className="p-3 pl-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-br from-pink-300/60 via-fuchsia-300/40 to-pink-200/20 backdrop-blur-[10px]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white drop-shadow">
                BetaOffice AI
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                {role}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => minimize()}
                className="p-1 rounded-md hover:bg-white/10 text-white"
                title="Minimize and keep the conversation"
              >
                <ChevronDown size={18} />
              </button>
              <button
                onClick={() => closeAndForget()}
                className="p-1 rounded-md hover:bg-white/10"
                style={{ color: "#fb7185", textShadow: "0 0 4px #fb7185, 0 0 6px #fb7185" }}
                title="Close and clear this conversation"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm text-slate-100">
            {msgs.length === 0 && (
              <div className="text-white/90 text-xs p-2">
                {role === "landing-sales" &&
                  "Hi! I’m here to explain BetaOffice virtual office plans and pricing."}
                {role === "kyc-helper" &&
                  "Need help completing your KYC? Ask me anything field-by-field."}
                {role?.startsWith("dashboard") &&
                  "I’ll help you with your scanned mail and actions on this tab."}
              </div>
            )}
            {msgs.map((m, i) => {
              const user = m.role === "user";
              return (
                <div
                  key={i}
                  className={`p-2 rounded-xl max-w-[80%] shadow-md ${
                    user
                      ? "bg-[#f3c6e6] text-slate-900 ml-auto"
                      : "bg-white/10 text-white border border-white/15"
                  }`}
                >
                  {m.content}
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-white/10 backdrop-blur-[10px]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#f8bdd4] text-zinc-800 placeholder-zinc-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
                aria-label="Type your message"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-tr from-pink-300 via-fuchsia-400 to-pink-500 text-white px-4 py-2 rounded-xl hover:brightness-110 transition shadow-lg"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[10px] text-white/80">
              Limited mode • {msgs.length}/{MAX_TURNS}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
