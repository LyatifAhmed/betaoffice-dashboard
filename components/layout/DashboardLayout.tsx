"use client";

import { useState } from "react";
import type { PropsWithChildren } from "react";

import MainSidebar, { DashboardTab } from "@/components/layout/Sidebar";
import SmartStatusBar from "@/components/layout/SmartStatusBar";
import AffiliateBar from "@/components/layout/AffiliateBar";
import MobileSidebarOverlay from "@/components/overlays/MobileSidebarOverlay";
import MailArea from "@/components/layout/MailArea";
import DetailsTab from "@/components/layout/DetailsArea";
import ReferralTab from "@/components/layout/ReferralArea";
import SelectionBar from "@/components/layout/SelectionBar";

type SelectionMeta = {
  selectedCount: number;
  onDeleteMarked: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  isTrashView: boolean;
};

export default function DashboardLayout({
  children,
  mailItems = [],
}: PropsWithChildren<{ mailItems?: any[] }>) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("mail");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectionMeta, setSelectionMeta] = useState<SelectionMeta>({
    selectedCount: 0,
    onDeleteMarked: () => {},
    onSelectAll: () => {},
    onClear: () => {},
    isTrashView: false,
  });

  return (
    <div className="flex w-full flex-col md:flex-row bg-white text-black min-h-[100svh]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebarOverlay open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <MainSidebar
          activeTab={activeTab}
          setActiveTab={(t) => {
            setActiveTab(t);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </MobileSidebarOverlay>

      <div className="flex-1 flex min-w-0 flex-col overflow-hidden">
        <SmartStatusBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Sabit SelectionBar */}
        <div
          className={[
            "fixed z-50",
            "left-1/2 -translate-x-1/2", // Ortala
            "top-[60px]", // SmartStatusBar (88px) + 8px boşluk
            selectionMeta.selectedCount > 0
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
            "transition-opacity duration-200",
          ].join(" ")}
        >
          <SelectionBar
            selectedCount={selectionMeta.selectedCount}
            onDeleteMarked={selectionMeta.onDeleteMarked}
            onSelectAll={selectionMeta.onSelectAll}
            onClear={selectionMeta.onClear}
            isTrashView={selectionMeta.isTrashView}
          />
        </div>

        <div className="flex-1 min-w-0 flex items-stretch overflow-hidden gap-3 sm:gap-4 md:gap-6 pb-[env(safe-area-inset-bottom)]">
          <main className="min-w-0 flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="mx-auto w-full max-w-[92rem]">
              {activeTab === "mail" && (
                <MailArea
                  mails={mailItems}
                  onSelectionMetaChange={(meta) => setSelectionMeta(meta)}
                />
              )}
              {activeTab === "details" && <DetailsTab />}
              {activeTab === "referral" && <ReferralTab />}
              {children}
            </div>
          </main>

          {/* Sağ affiliate bar */}
          <div className="hidden lg:block shrink-0">
            <AffiliateBar />
          </div>
        </div>
      </div>
    </div>
  );
}
