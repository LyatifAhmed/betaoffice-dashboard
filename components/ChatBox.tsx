"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const pathname = usePathname();

  // İlk butona basıldığında MagicChatButton store event’inden açılır
  useEffect(() => {
    const onToggle = () => setIsOpen((o) => !o);
    window.addEventListener("magicchat:toggle", onToggle);
    return () => window.removeEventListener("magicchat:toggle", onToggle);
  }, []);

  // Sayfaya göre sohbet başlangıcı (landing / kyc / dashboard)
  const getInitialMessage = () => {
    if (pathname.startsWith("/kyc")) return "Welcome to KYC support 👋";
    if (pathname.startsWith("/dashboard")) return "How can I help with your dashboard?";
    return "Hello! Ask me anything about BetaOffice ✨";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chatbox"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="fixed bottom-24 right-4 z-[70] w-[95%] max-w-md"
        >
          <div className="rounded-2xl shadow-2xl border border-white/20 
                          bg-white/70 dark:bg-[#0b1220]/70 backdrop-blur-xl 
                          flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 
                            bg-gradient-to-r from-fuchsia-600 via-pink-500 to-purple-700 
                            text-white">
              <span className="font-semibold">AI Assistant</span>
              <div className="flex gap-2">
                <button onClick={() => setMinimized((m) => !m)} aria-label="Minimize">
                  <Minus size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat content */}
            {!minimized && (
              <div className="flex-1 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                <div className="bg-purple-600 text-white px-3 py-2 rounded-lg w-fit">
                  {getInitialMessage()}
                </div>
                {/* Buraya AI cevapları vs. entegre edebilirsin */}
              </div>
            )}

            {/* Input */}
            {!minimized && (
              <div className="p-2 border-t border-white/20">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-[#111827]/80 
                             backdrop-blur text-sm focus:outline-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
