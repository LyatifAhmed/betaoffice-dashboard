"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right"; // ✅ Ekledik
};

export default function Drawer({ open, onClose, children, side = "right" }: DrawerProps) {
  return (
    <div
      className={`
        fixed top-0 ${side === "right" ? "right-0" : "left-0"}
        w-[80vw] max-w-xs h-full z-50
        bg-white/10 backdrop-blur-xl shadow-lg border-l border-white/20
        transform transition-transform duration-300
        ${open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"}
      `}
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white">✕</button>
      <div className="p-4 overflow-y-auto h-full">{children}</div>
    </div>
  );
}

