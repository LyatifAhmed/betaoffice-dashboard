"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function MagicChatButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event("magicchat:toggle"));
  };

  return (
    <motion.div
      className="fixed z-50"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      style={{
        right: "calc(env(safe-area-inset-right) + 16px)",
        bottom: "calc(env(safe-area-inset-bottom) + 16px)",
      }}
    >
      <div className="relative" onClick={handleClick}>
        {/* Dönen ışık efekti */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-[-2] animate-spin-slow">
          <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,#a855f7,#ec4899,#9333ea,#f472b6,#a855f7)] blur-xl opacity-40" />
        </div>

        {/* Buton */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full
                     bg-gradient-to-br from-fuchsia-600 via-pink-500 to-purple-700
                     text-white flex items-center justify-center
                     shadow-2xl border-4 border-white/20 relative z-10"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          aria-label="Open assistant chat"
          title="Talk to AI"
        >
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
        </motion.button>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 18s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
}
