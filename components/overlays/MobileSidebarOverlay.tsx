"use client";

import { useEffect, useState } from "react";
import MainSidebar from "@/components/layout/Sidebar";

export default function MobileSidebarOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  // Açıldığında animasyon başlasın
  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 10); // hafif gecikmeli animasyon için
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Arkada blur + karanlık */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden
      />

      {/* Kayarak açılan sidebar */}
      <div
        className={`
          absolute top-0 left-0 h-full w-72
          bg-white/10 backdrop-blur-md border-r border-white/10
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${visible ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <MainSidebar onClose={onClose} />
      </div>
    </div>
  );
}

