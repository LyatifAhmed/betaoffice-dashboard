// components/layout/Sidebar.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Inbox, FileText, Users, CreditCard, Link2, LogOut, HelpCircle } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type Item = { label: string; tab: DashboardTab; icon: React.ElementType };

const items: Item[] = [
  { label: "Mail",      tab: "mail",      icon: Inbox },
  { label: "Details",   tab: "details",   icon: FileText },
  { label: "Billing",   tab: "billing",   icon: CreditCard }, // NEW
  { label: "Affiliate", tab: "affiliate", icon: Link2 },      // NEW
  { label: "Referral",  tab: "referral",  icon: Users },
];

export type DashboardTab = "mail" | "details" | "referral" | "billing" | "affiliate";

export default function MainSidebar({
  activeTab,
  setActiveTab,
  onClose,
}:{
  activeTab: DashboardTab;
  setActiveTab:(t:DashboardTab)=>void;
  onClose?:()=>void;
}) {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const closeMenu = useCallback(() => onClose?.(), [onClose]);

  const handleSelect = (t: DashboardTab) => {
    setActiveTab(t);
    closeMenu();
  };

  const handleLogoutConfirm = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });

      // Selectively clear client-side data
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("external_id");
          localStorage.removeItem("selected_plan");

          // Remove cached AI summaries we added before
          const prefixes = ["ai_summary_", "bo_summary_"];
          const toDelete: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (prefixes.some((p) => key.startsWith(p))) {
              toDelete.push(key);
            }
          }
          toDelete.forEach((k) => localStorage.removeItem(k));
        } catch {/* ignore */}
      }
    } catch {/* ignore */}
    setShowLogout(false);
    router.push("/login");
  }, [router]);

  const handleLogoutClick = useCallback(() => setShowLogout(true), []);
  const handleLogoutCancel = useCallback(() => setShowLogout(false), []);

  return (
    <>
      <aside
        className="
          w-64 sm:w-64 shrink-0
          bg-[#0e1a2b]/90 backdrop-blur-md border-r border-white/10 text-[#dbe7ff]
          md:sticky md:top-0 h-[100svh] flex flex-col
        "
      >
        <div className="flex justify-between items-center px-4 py-5">
          <span className="text-[18px] sm:text-[20px] font-semibold tracking-wide text-[#dbe7ff]">
            BetaOffice
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-[#c5d6ff]/70 hover:text-white transition"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="px-2 sm:px-3 py-2 space-y-1 flex-1 min-h-0">
          {items.map(({ label, tab, icon: Icon }) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleSelect(tab)}
                className={clsx(
                  "group relative flex w-full items-center gap-3 rounded-lg",
                  "px-3 py-2 sm:py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/8 text-white shadow-inner ring-1 ring-inset ring-white/10"
                    : "text-[#c5d6ff]/80 hover:text-white hover:bg-white/5"
                )}
              >
                <span
                  className={clsx(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full transition-all",
                    "bg-gradient-to-b from-transparent to-transparent",
                    "group-hover:from-blue-500 group-hover:to-fuchsia-500",
                    active && "from-blue-500 to-fuchsia-500"
                  )}
                />
                {active && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full blur-md opacity-40 pointer-events-none bg-gradient-to-br from-fuchsia-500 to-blue-500" />
                )}
                <Icon size={18} className={active ? "text-white" : "text-[#c5d6ff]/70 group-hover:text-white"} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pt-3 pb-4 border-t border-white/10 space-y-2">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#c5d6ff]/80 hover:text-white hover:bg-white/5 transition"
            onClick={() => { /* you can wire a Help modal here */ closeMenu(); }}
          >
            <HelpCircle size={18} className="text-[#c5d6ff]/70 group-hover:text-white" />
            Help
          </button>
          <div className="mx-1 h-px bg-white/10" />
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#c5d6ff]/80 hover:text-white hover:bg-white/5 transition"
            onClick={handleLogoutClick}
          >
            <LogOut size={18} className="text-[#c5d6ff]/70 group-hover:text-white" />
            Logout
          </button>
        </div>
      </aside>

      {/* Transparent glassmorphism Logout Modal */}
      <LogoutModal
        open={showLogout}
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

/** Glassy, theme-matching modal */
function LogoutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center
                 bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-[90%] max-w-sm rounded-2xl p-6 shadow-lg
                   bg-white/10 backdrop-blur-md border border-white/20
                   text-white"
      >
        <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
        <p className="text-sm text-[#dbe7ff]/80 mb-5">
          Do you want to log out? This will remove your saved session and cached AI summaries on this device.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/5 text-[#dbe7ff]
                       hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white
                       bg-gradient-to-r from-fuchsia-500 to-blue-500
                       hover:shadow-[0_0_18px_rgba(147,51,234,0.6)]
                       transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
