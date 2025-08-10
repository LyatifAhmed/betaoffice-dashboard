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
import WalletFab from "@/components/ui/WalletFab"; // ⬅️ FAB

type SelectionMeta = {
  selectedCount: number;
  onDeleteMarked: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  isTrashView: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function DashboardLayout({
  children,
  mailItems = [],
}: PropsWithChildren<{ mailItems?: any[] }>) {
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
  const urgentTimer = useRef<number | null>(null);

  // ---- WALLET BALANCE (FAB için) ----
  const [externalId, setExternalId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setExternalId(localStorage.getItem("external_id"));
    }
  }, []);

  const fetchBalance = async (ext: string) => {
    // company endpoint'inde wallet_balance bekliyoruz; yoksa 0.
    const tryUrls = [
      `${API}/company?external_id=${encodeURIComponent(ext)}`,
      `${API}/account/details?external_id=${encodeURIComponent(ext)}`,
      `${API}/customer?external_id=${encodeURIComponent(ext)}`,
    ];
    for (const u of tryUrls) {
      try {
        const r = await fetch(u, { cache: "no-store" });
        if (!r.ok) continue;
        const d = await r.json();
        const bal =
          Number(d?.wallet_balance ?? d?.balance ?? d?.wallet?.balance ?? 0);
        if (!Number.isNaN(bal)) {
          setWalletBalance(bal);
          return;
        }
      } catch {
        // diğer URL'yi dene
      }
    }
  };

  useEffect(() => {
    if (externalId) fetchBalance(externalId);
  }, [externalId]);

  // Yeni mail geldiğinde tetiklenir
  const handleNewMail = (evt?: { urgent?: boolean }) => {
    try {
      // 1) /mail içeren tüm SWR key’lerini yenile
      mutate((key: string) => typeof key === "string" && key.includes("/mail"));

      // 2) external_id ile nokta atışı revalidate (hem relative hem absolute)
      if (typeof window !== "undefined") {
        const ext = localStorage.getItem("external_id");
        if (ext) {
          mutate(`/mail?external_id=${ext}`);
          if (API) mutate(`${API}/mail?external_id=${ext}`);
        }
      }
    } catch {}

    // 3) Urgent görsel tepkisi
    if (evt?.urgent) {
      barRef.current?.show?.();
      barRef.current?.pulse?.(1800);
      setUrgentFlash(true);
      if (urgentTimer.current) window.clearTimeout(urgentTimer.current);
      urgentTimer.current = window.setTimeout(() => setUrgentFlash(false), 6000);
    }
  };

  // Global WS event’ini dinle (SmartStatusBar bunu yayıyor)
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

  // Top-up sonrası yapılacaklar
  const handleTopUp = async (amount: number) => {
    if (!externalId) return alert("external_id bulunamadı.");
    try {
      const res = await fetch(`${API}/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: externalId, amount }),
      });
      if (!res.ok) throw new Error(`Top-up failed ${res.status}`);
      // bakiye yenile
      await fetchBalance(externalId);
      // company ilgili SWR key’lerini yenile
      mutate((key: string) => typeof key === "string" && key.includes("/company"));
      // ufak görsel feedback
      barRef.current?.pulse?.(1200);
      // global event
      window.dispatchEvent(new CustomEvent("betaoffice:wallet:changed"));
    } catch (e) {
      console.error(e);
      alert("Top-up başarısız.");
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
    if (activeTab === "referral") return "Referral & rewards";
    return "Your subscription is active.";
  }, [activeTab, selectionMeta.selectedCount, urgentFlash]);

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
        <SmartStatusBar
          ref={barRef}
          onMenuClick={() => setSidebarOpen(true)}
          status={statusText}
          onNewMail={handleNewMail}
          autoCloseAfter={6}
        />

        {/* Selection bar */}
        <div
          className={[
            "fixed z-50",
            "left-1/2 -translate-x-1/2",
            "top-[60px]",
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

      {/* ⬇️ Sol/sağ/orta konumlandırılabilen şeffaf FAB */}
      <WalletFab
        balance={walletBalance}
        position="left"          // "left" | "right" | "center" — yatay konumu buradan değiştirirsin
        onTopUp={handleTopUp}    // hızlı +£5/10/20
      />
    </div>
  );
}
