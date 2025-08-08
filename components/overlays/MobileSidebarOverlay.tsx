"use client";

import { useEffect, useState, PropsWithChildren } from "react";

export default function MobileSidebarOverlay({
  open,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Delay to trigger transition
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open && !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden overflow-hidden">
      {/* Background blur & dim */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden
      />

      {/* Sliding drawer */}
      <div
        className={`
          absolute top-0 left-0 h-full w-[76vw] max-w-[320px]
          bg-gradient-to-br from-[#0e1a2b]/90 to-[#1a2b3c]/80
          backdrop-blur-xl
          border-r border-white/10
          shadow-[0_8px_24px_rgba(0,0,0,0.4)]
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {children}
      </div>
    </div>
  );
}

