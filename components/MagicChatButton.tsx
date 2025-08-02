"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatBox from "./ChatBox";

export default function MagicChatButton() {
  const router = useRouter();
  const visiblePaths = ["/", "/dashboard", "/kyc"];
  const isVisible = visiblePaths.includes(router.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [delayedOpen, setDelayedOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (hovered) {
      timer = setTimeout(() => {
        setDelayedOpen(true);
        setIsOpen(true);
      }, 1250); // 2 saniyede aç
    }

    return () => {
      clearTimeout(timer);
      setDelayedOpen(false);
    };
  }, [hovered]);

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && <ChatBox onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <motion.div
          className="fixed z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{
            bottom: "6rem",
            right: "19rem",
          }}
        >
          <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setIsOpen(true)} // tıklamayla da aç
          >
            {/* 🔥 Dönen Işık Katmanı */}
            <div className="absolute inset-0 rounded-full pointer-events-none z-[-3] animate-spin-slow">
              <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,#a855f7,#ec4899,#9333ea,#f472b6,#a855f7)] blur-xl opacity-50" />
            </div>

            {/* 🌈 Sihirli Halo efekti */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [1, 1.4, 1.8],
                    opacity: [0.3, 0.6, 0],
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-800 rounded-full blur-2xl z-[-2]"
                />
              )}
            </AnimatePresence>

            {/* ✨ Parlayan Noktalar */}
            <div className="absolute inset-0 z-[-1] pointer-events-none">
              <div className="absolute w-2 h-2 bg-fuchsia-400 rounded-full animate-twinkle top-1 left-6 opacity-70" />
              <div className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full animate-twinkle2 top-4 right-3 opacity-60" />
              <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-twinkle3 bottom-3 left-5 opacity-50" />
            </div>

            {/* 🪄 Asıl Buton */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 via-pink-500 to-purple-700 text-white flex items-center justify-center shadow-2xl border-4 border-white/20 relative z-10"
              animate={{
                scale: [1, 1.05, 1],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              title="Talk to AI"
            >
              <MessageCircle className="w-8 h-8" />
            </motion.button>
          </div>

          {/* 🔧 Animasyonlar */}
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

            .animate-twinkle {
              animation: twinkle 2.5s infinite ease-in-out alternate;
            }

            .animate-twinkle2 {
              animation: twinkle 3.2s infinite ease-in-out alternate;
            }

            .animate-twinkle3 {
              animation: twinkle 4s infinite ease-in-out alternate;
            }

            @keyframes twinkle {
              0% {
                transform: scale(1);
                opacity: 0.3;
              }
              100% {
                transform: scale(1.5);
                opacity: 0.9;
              }
            }
          `}</style>
        </motion.div>
      )}
    </>
  );
}
