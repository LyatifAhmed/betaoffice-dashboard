"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";

type SmartStatusBarProps = {
  onMenuClick?: () => void;       // (opsiyonel) mobil menü için
  status?: string;                // "Your subscription is active."
  newMailCount?: number;          // 2 new mail
};

export default function SmartStatusBar({
  onMenuClick,
  status = "Your subscription is active.",
  newMailCount = 0,
}: SmartStatusBarProps) {
  const [open, setOpen] = useState(true);

  // Bar yüksekliği
  const BAR_H = 44;
  // Kapanınca ekranda kalacak kulakçık yüksekliği
  const TAB_H = 16;

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Yukarı doğru hızlı/mesafeli itildiyse kapat
    const draggedUp = info.offset.y < -24 || info.velocity.y < -200;
    const draggedDown = info.offset.y > 24 || info.velocity.y > 200;
    if (draggedUp) setOpen(false);
    else if (draggedDown) setOpen(true);
  };

  return (
    <>
      {/* Üst merkezde sabit alan; pointer-events hack'i ile yalnızca bar tıklanabilir */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl pointer-events-none">
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
                className="
                  relative flex items-center gap-3 px-4 h-11
                  rounded-full
                  bg-white/50 dark:bg-white/40
                  backdrop-blur-xl
                  border border-white/60
                  shadow-[0_8px_40px_rgba(37,99,235,0.25)]
                "
              >
                {/* Grab handle */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 opacity-80" />

                {/* (opsiyonel) hamburger */}
                {onMenuClick && (
                  <button
                    onClick={onMenuClick}
                    className="md:hidden -ml-1 px-2 py-1 rounded-md hover:bg-white/40 transition"
                  >
                    ☰
                  </button>
                )}

                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-800">
                  {status}
                </span>

                {newMailCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-700 border border-blue-500/30">
                    <Bell size={14} />
                    {newMailCount} new mail
                  </span>
                )}

                {/* Sağda minik ipucu */}
                <span className="ml-auto text-[11px] text-gray-600">
                  Drag ↑ to hide
                </span>
              </div>
            </motion.div>
          ) : (
            // Kapalıyken görünen kulakçık
            <motion.button
              key="tab"
              onClick={() => setOpen(true)}
              initial={{ y: -TAB_H, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                pointer-events-auto mx-auto block
                h-4 px-3 rounded-full
                bg-white/60 backdrop-blur-md
                border border-white/70
                text-[11px] text-gray-700
                shadow-[0_6px_24px_rgba(0,0,0,0.12)]
              "
              title="Show bar"
            >
              Show status
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
