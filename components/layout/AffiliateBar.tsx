"use client";

import { useState } from "react";
import AffiliateCard from "@/components/layout/AffiliateCard";
import Drawer from "@/components/ui/drawer";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

const affiliateLinks = [
  { title: "UK Company Formation", description: "Start your UK business remotely in minutes.", image: "/images/affiliate-ukcompany.jpg", cta: "Form Now", href: "https://affiliate-link.com/ukcompany" },
  { title: "Business Bank Account", description: "Get a UK account with no hassle.", image: "/images/affiliate-bank.jpg", cta: "Open Account", href: "https://affiliate-link.com/bank" },
  { title: "Accounting Services", description: "Stay compliant with UK regulations.", image: "/images/affiliate-accounting.jpg", cta: "Get Accountant", href: "https://affiliate-link.com/accounting" },
  { title: "UK Virtual Number", description: "Receive UK calls from anywhere in the world.", image: "/images/affiliate-number.jpg", cta: "Get Number", href: "https://affiliate-link.com/number" },
];

export default function AffiliateBar() {
  // Masaüstü “çekmece”
  const [collapsed, setCollapsed] = useState(false);
  // Mobil Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobil: sağ altta aç butonu */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 shadow-md hover:shadow-xl transition"
        aria-label="Open services"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobil Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="p-4 space-y-4">
          <h2 className="text-white text-base font-semibold">🌐 Services</h2>
          {affiliateLinks.map((l, i) => (
            <AffiliateCard key={i} {...l} />
          ))}
        </div>
      </Drawer>

      {/* Masaüstü: sağda kayan çekmece */}
      <aside
        className={[
          "hidden md:flex h-[calc(100svh-112px)] z-10",
          "bg-white/10 backdrop-blur-lg border-l border-white/20 shadow-xl",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[40px]" : "w-[240px] xl:w-[260px]", // BURADA GENİŞLİK AZALTTIK
          "relative",
        ].join(" ")}
      >
        {/* İçerik alanı */}
        <div className={`flex-1 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-200`}>
          <div className="px-2 pt-4 pb-3 h-full"> {/* px-3 → px-2 */}
            <h3 className="text-white/90 text-sm font-semibold mb-3 px-1">🌐 Services</h3>
            <div className="h-full overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {affiliateLinks.map((l, i) => (
                <AffiliateCard key={i} {...l} />
              ))}
            </div>
          </div>
        </div>

        {/* Tutacak / toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={[
            "absolute top-1/2 -translate-y-1/2 -left-3",
            "h-10 w-6 rounded-full",
            "bg-white/60 backdrop-blur-md border border-white/70",
            "shadow-md hover:shadow-lg transition flex items-center justify-center",
          ].join(" ")}
          aria-label={collapsed ? "Open services panel" : "Collapse services panel"}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4 text-gray-700" /> : <ChevronRight className="w-4 h-4 text-gray-700" />}
        </button>
      </aside>
    </>
  );
}
