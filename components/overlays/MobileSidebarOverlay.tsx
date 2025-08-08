"use client";

import { PropsWithChildren } from "react";
import MainSidebar from "@/components/layout/Sidebar";

export default function MobileSidebarOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
        <MainSidebar />
      </div>
    </div>
  );
}
