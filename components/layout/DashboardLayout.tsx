"use client";

import { ReactNode, useState } from "react";
import MainSidebar from "@/components/layout/Sidebar";
import SmartStatusBar from "@/components/layout/SmartStatusBar";
import AffiliateBar from "@/components/layout/AffiliateBar";
import MobileSidebarOverlay from "@/components/overlays/MobileSidebarOverlay";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white text-black">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <MainSidebar />
      </div>

      {/* Mobile overlay */}
      <MobileSidebarOverlay open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Status bar’a hamburger koy */}
        <SmartStatusBar
          onMenuClick={() => setSidebarOpen(true)}  // optional prop
        />

        <div className="flex-1 flex items-stretch overflow-hidden gap-4 md:gap-6">
          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>

          <div className="hidden md:block shrink-0">
            <AffiliateBar />
          </div>
        </div>
      </div>
    </div>
  );
}

