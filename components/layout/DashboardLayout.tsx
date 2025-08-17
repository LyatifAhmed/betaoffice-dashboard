// components/layout/DashboardLayout.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

import MainSidebar, { DashboardTab } from "@/components/layout/Sidebar";
import SmartStatusBar, { SmartStatusBarHandle } from "@/components/layout/SmartStatusBar";
import AffiliateBar from "@/components/layout/AffiliateBar";
import MobileSidebarOverlay from "@/components/overlays/MobileSidebarOverlay";
import MailArea from "@/components/layout/MailArea";
import DetailsTab from "@/components/layout/DetailsArea";
import ReferralTab from "@/components/layout/ReferralArea";
import SelectionBar from "@/components/layout/SelectionBar";
import WalletFab from "@/components/ui/WalletFab";

import BillingArea from "@/components/layout/BillingArea";
import AffiliateTab from "@/components/layout/AffiliateTab";

import ChatBox from "@/components/ChatBox";
import MagicChatButton from "@/components/MagicChatButton";

type SelectionMeta = {
  selectedCount: number;
  onDeleteMarked: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  isTrashView: boolean;
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("mail");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const barRef = useRef<SmartStatusBarHandle>(null);

  const [selectionMeta, setSelectionMeta] = useState<SelectionMeta>({
    selectedCount: 0,
    onDeleteMarked: () => {},
    onSelectAll: () => {},
    onClear: () => {},
    isTrashView: false,
  });

  const [urgentFlash, setUrgentFlash] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const statusText = useMemo(() => {
    if (urgentFlash) return "Urgent mail detected! Please check immediately.";
    if (activeTab === "mail") {
      return selectionMeta.selectedCount > 0
        ? `Mail • ${selectionMeta.selectedCount} selected`
        : "Your mail center";
    }
    if (activeTab === "details") return "Account & details";
    if (activeTab === "billing") return "Billing & invoices";
    if (activeTab === "affiliate") return "Affiliate partners";
    if (activeTab === "referral") return "Referral & rewards";
    return "Your subscription is active.";
  }, [activeTab, selectionMeta.selectedCount, urgentFlash]);

  return (
    <div className="flex w-full flex-col md:flex-row bg-[#f7f9fce8] dark:bg-[#0b1220] min-h-[100svh]">
      {/* Sidebar */}
      <div className="hidden md:block">
        <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

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

      <div className="flex-1 flex min-w-0 flex-col overflow-hidden relative">
        <SmartStatusBar
          ref={barRef}
          onMenuClick={() => setSidebarOpen(true)}
          status={statusText}
          autoCloseAfter={10}
        />

        {/* Selection bar — SmartStatusBar’ın hemen altında, ortalı ve fixed */}
        {selectionMeta.selectedCount > 0 && (
          <div
            className="
              fixed z-[65]
              left-1/2 -translate-x-1/2
              top-[calc(env(safe-area-inset-top)+56px)] sm:top-[calc(env(safe-area-inset-top)+64px)]
              w-auto
            "
          >
            <SelectionBar
              selectedCount={selectionMeta.selectedCount}
              onDeleteMarked={selectionMeta.onDeleteMarked}
              onSelectAll={selectionMeta.onSelectAll}
              onClear={selectionMeta.onClear}
              isTrashView={selectionMeta.isTrashView}
            />
          </div>
        )}

        {/* Wallet sağ üst köşe */}
        <div className="absolute top-3 right-3 z-[70]">
          <WalletFab balance={walletBalance} position="right" onTopUp={() => {}} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-stretch overflow-hidden gap-3 sm:gap-4 md:gap-6 pb-[env(safe-area-inset-bottom)]">
          <main className="min-w-0 flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
            <div className="mx-auto w-full max-w-[92rem]">
              {activeTab === "mail" && (
                <MailArea onSelectionMetaChange={(meta) => setSelectionMeta(meta)} />
              )}
              {activeTab === "details" && <DetailsTab />}
              {activeTab === "billing" && <BillingArea />}
              {activeTab === "affiliate" && <AffiliateTab />}
              {activeTab === "referral" && <ReferralTab />}
              {children}
            </div>
          </main>

          <div className="hidden lg:block shrink-0">
            <AffiliateBar />
          </div>
        </div>
      </div>

      {/* Chat sağ alt köşe */}
      <div className="fixed right-3 bottom-3 z-[60] md:right-4 md:bottom-4">
        <MagicChatButton />
      </div>

      <ChatBox />
    </div>
  );
}
