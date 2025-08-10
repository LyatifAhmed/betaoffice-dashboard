// components/ui/WalletFab.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type WalletFabProps = {
  balance: number;
  position?: "left" | "right" | "center";
  onTopUp: (amount: number) => void;
};

export default function WalletFab({
  balance,
  position = "left",
  onTopUp,
}: WalletFabProps) {
  const [open, setOpen] = useState(false);

  const positionClasses =
    position === "left"
      ? "left-6"
      : position === "right"
      ? "right-6"
      : "left-1/2 -translate-x-1/2";

  return (
    <div className={`fixed bottom-6 z-50 ${positionClasses}`}>
      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/30 hover:bg-white/30 transition"
      >
        💰 {balance.toFixed(2)}
      </motion.button>

      {/* Expand Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 flex gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg"
          >
            {[5, 10, 20].map((amount) => (
              <button
                key={amount}
                onClick={() => onTopUp(amount)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition text-white"
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
