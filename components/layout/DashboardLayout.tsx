"use client";

import { ReactNode } from "react";
import MainSidebar from "@/components/layout/Sidebar";
import SmartStatusBar from "@/components/layout/SmartStatusBar";
import AffiliateBar from "@/components/layout/AffiliateBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-white text-black">
      <MainSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SmartStatusBar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 pr-[72px] md:pr-[96px] lg:pr-[132px] xl:pr-[160px]">
            {children}
          </main>
          <AffiliateBar />
        </div>
      </div>
    </div>
  );
}
