// components/layout/DashboardLayout.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { mutate } from "swr";

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

// ✅ Chat
import ChatBox from "@/components/ChatBox";            // store kontrollü, props gerektirmez
import MagicChatButton from "@/components/MagicChatButton";
import { useSyncChatContext } from "@/utils/chat-context";

type SelectionMeta = {
  selectedCount: number;
  onDeleteMarked: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  isTrashView: boolean;
};

function readExternalIdFromBrowser(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
  const fromCookie = m ? decodeURIComponent(m[1]) : null;
  const fromLS = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
  return fromCookie || fromLS;
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("mail");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const barRef = useRef<SmartStatusBarHandle>(null);

  // ✅ Chat bağlamını sekmeye göre eşitle
  useSyncChatContext(
    activeTab === "mail"      ? "inbox"     :
    activeTab === "details"   ? "settings"  :
    activeTab === "billing"   ? "billing"   :
    activeTab === "affiliate" ? "affiliate" :
    activeTab === "referral"  ? "referral"  :
    "inbox"
  );

  const [selectionMeta, setSelectionMeta] = useState<SelectionMeta>({
    selectedCount: 0,
    onDeleteMarked: () => {},
    onSelectAll: () => {},
    onClear: () => {},
    isTrashView: false,
  });

  const [urgentFlash, setUrgentFlash] = useState(false);
  const urgentTimer = useRef<number | null>(null);

  // Wallet
  const [externalId, setExternalId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    setExternalId(readExternalIdFromBrowser());
  }, []);

  const fetchBalance = async (ext: string) => {
    const tryUrls = [
      `/api/backend/company?external_id=${encodeURIComponent(ext)}`,
      `/api/backend/account/details?external_id=${encodeURIComponent(ext)}`,
      `/api/backend/customer?external_id=${encodeURIComponent(ext)}`,
    ];
    for (const u of tryUrls) {
      try {
        const r = await fetch(u, { cache: "no-store" });
        if (!r.ok) continue;
        const d = await r.json();
        const bal = Number(d?.wallet_balance ?? d?.balance ?? d?.wallet?.balance ?? 0);
        if (!Number.isNaN(bal)) {
          setWalletBalance(bal);
          return;
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (externalId) fetchBalance(externalId);
  }, [externalId]);

  const handleNewMail = (evt?: { urgent?: boolean }) => {
    try {
      mutate((key: string) => typeof key === "string" && key.startsWith("/api/hoxton/mail"), undefined, {
        revalidate: true,
      });
      const ext = readExternalIdFromBrowser();
      if (ext) {
        mutate(`/api/hoxton/mail?external_id=${encodeURIComponent(ext)}&source=remote`, undefined, { revalidate: true });
        mutate(`/api/hoxton/mail?external_id=${encodeURIComponent(ext)}&source=db`, undefined, { revalidate: true });
      }
    } catch {}

    if (evt?.urgent) {
      barRef.current?.show?.();
      barRef.current?.pulse?.(1800);
      setUrgentFlash(true);
      if (urgentTimer.current) window.clearTimeout(urgentTimer.current);
      urgentTimer.current = window.setTimeout(() => setUrgentFlash(false), 6000);
    }
  };

  useEffect(() => {
    const onNewMailGlobal = (e: Event) => {
      const { detail } = e as CustomEvent<{ urgent?: boolean }>;
      handleNewMail(detail);
    };
    window.addEventListener("betaoffice:new-mail", onNewMailGlobal as EventListener);
    return () => {
      window.removeEventListener("betaoffice:new-mail", onNewMailGlobal as EventListener);
      if (urgentTimer.current) window.clearTimeout(urgentTimer.current);
    };
  }, []);

  const handleTopUp = async (amount: number) => {
    if (!externalId) return alert("Could not detect your account (external_id).");
    try {
      const res = await fetch(`/api/backend/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: externalId, amount }),
      });
      if (!res.ok) throw new Error(`Top-up failed with status ${res.status}`);
      await fetchBalance(externalId);
      mutate((key: string) => typeof key === "string" && key.includes("/company"), undefined, { revalidate: true });
      barRef.current?.pulse?.(1200);
      window.dispatchEvent(new CustomEvent("betaoffice:wallet:changed"));
    } catch (e) {
      console.error(e);
      alert("Top-up failed. Please try again.");
    }
  };

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

  useEffect(() => {
    if (activeTab !== "mail" && selectionMeta.selectedCount > 0) {
      selectionMeta.onClear();
    }
  }, [activeTab, selectionMeta]);

  return (
    <div className="flex w-full flex-col md:flex-row bg-[#f7f9fce8] text-black dark:bg-[#0b1220] dark:text-white min-h-[100svh]">
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
        <SmartStatusBar
          ref={barRef}
          onMenuClick={() => setSidebarOpen(true)}
          status={statusText}
          onNewMail={handleNewMail}
          autoCloseAfter={10}
        />

        {/* Selection bar – yalnız Mail tab’ında */}
        <div
          className={[
            "fixed z-50",
            "left-1/2 -translate-x-1/2",
            "top-[67px]",
            activeTab === "mail" && selectionMeta.selectedCount > 0
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

        {/* CONTENT */}
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

          {/* Right-side affiliate bar */}
          <div className="hidden lg:block shrink-0">
            <AffiliateBar />
          </div>
        </div>
      </div>

      {/* Wallet & Chat */}
      <div className="fixed right-3 bottom-3 z-[60] md:right-4 md:bottom-4">
        <div className="relative flex flex-col items-end gap-3">
          <div className="z-[60]">
            <WalletFab balance={walletBalance} position="right" onTopUp={handleTopUp} />
          </div>

          {/* Chat toggle butonu: mail sekmesinde mobilde gizle, diğerlerinde göster */}
          <div className={activeTab === "mail" ? "hidden md:block" : "block"}>
            <MagicChatButton />
          </div>
        </div>
      </div>

      {/* Chat kutusu: her sayfada mount olur; aç/kapa store’dan yönetilir */}
      <ChatBox />
    </div>
  );
}
