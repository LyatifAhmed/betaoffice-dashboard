"use client";

import { usePathname } from "next/navigation";
import { Inbox, FileText, Users, LogOut, HelpCircle } from "lucide-react";
import clsx from "clsx";

type Item = { label: string; tab: DashboardTab; icon: React.ElementType };

const items: Item[] = [
  { label: "Mail",    tab: "mail",    icon: Inbox },
  { label: "Details", tab: "details", icon: FileText },
  { label: "Referral",tab: "referral",icon: Users }, 
];

export type DashboardTab = "mail" | "details" | "referral";

export default function MainSidebar({
  activeTab,
  setActiveTab,
  onClose,
}:{
  activeTab: DashboardTab;
  setActiveTab:(t:DashboardTab)=>void;
  onClose?:()=>void;
}) {
  return (
    <aside
      className="
        w-64 sm:w-64 shrink-0
        bg-[#0e1a2b]/90 backdrop-blur-md border-r border-white/10 text-[#dbe7ff]
        md:sticky md:top-0
        h-[100svh] md:h-[100svh]  /* viewport yüksekliği kadar */
        flex flex-col
      "
    >
      {/* Başlık: logo yerine BetaOffice metni */}
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

      {/* Menü */}
      <nav className="px-2 sm:px-3 py-2 space-y-1 flex-1 min-h-0">
        {items.map(({ label, tab, icon: Icon }) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); onClose?.(); }}
              className={clsx(
                "group relative flex w-full items-center gap-3 rounded-lg",
                "px-3 py-2 sm:py-2.5 text-sm font-medium transition-all duration-200",
                "touch-manipulation",
                active
                  ? "bg-white/8 text-white shadow-inner ring-1 ring-inset ring-white/10"
                  : "text-[#c5d6ff]/80 hover:text-white hover:bg-white/5"
              )}
            >
              <span
                className={clsx(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full transition-all duration-200",
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

      {/* Alt aksiyonlar */}
      <div className="px-3 pt-3 pb-4 border-t border-white/10 space-y-2">
        <button className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#c5d6ff]/80 hover:text-white hover:bg-white/5 transition">
          <HelpCircle size={18} className="text-[#c5d6ff]/70 group-hover:text-white" />
          Help
        </button>
        <div className="mx-1 h-px bg-white/10" />
        <button className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#c5d6ff]/80 hover:text-white hover:bg-white/5 transition">
          <LogOut size={18} className="text-[#c5d6ff]/70 group-hover:text-white" />
          Logout
        </button>
      </div>
    </aside>
  );
}
