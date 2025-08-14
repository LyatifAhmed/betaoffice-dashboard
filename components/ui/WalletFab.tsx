"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WalletFabProps = {
  balance: number;
  position?: "left" | "right" | "center"; // geriye uyumluluk için duruyor, parent konumlandırıyor
  onTopUp: (amount: number) => void;
};

export default function WalletFab({
  balance,
  position = "right",
  onTopUp,
}: WalletFabProps) {
  const [open, setOpen] = useState(false);

  // Sadece hizalama için (parent fixed veriyor)
  const align =
    position === "left" ? "items-start" : position === "center" ? "items-center" : "items-end";

  return (
    <div className={`relative flex ${align}`}>
      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg
                   border border-white/30 hover:bg-white/30 transition font-medium
                   dark:bg-white/10 dark:border-white/20"
        aria-expanded={open}
        aria-label="Wallet balance"
        title="Wallet"
      >
        💰 £{balance.toFixed(2)}
      </motion.button>

      {/* Expand Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 flex gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl
                       border border-white/20 shadow-xl"
          >
            {[5, 10, 20].map((amount) => (
              <button
                key={amount}
                onClick={() => onTopUp(amount)}
                className="bg-white/25 hover:bg-white/35 px-3 py-1 rounded-lg transition text-white text-sm
                           dark:bg-white/15 dark:hover:bg-white/25"
              >
                +£{amount}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
