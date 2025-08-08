"use client";

import { useState } from "react";
import AffiliateCard from "@/components/layout/AffiliateCard";
import Drawer from "@/components/ui/drawer";
import { Menu } from "lucide-react";

const affiliateLinks = [
  {
    title: "UK Company Formation",
    description: "Start your UK business remotely in minutes.",
    image: "/images/affiliate-ukcompany.jpg",
    cta: "Form Now",
    href: "https://affiliate-link.com/ukcompany",
  },
  {
    title: "Business Bank Account",
    description: "Get a UK account with no hassle.",
    image: "/images/affiliate-bank.jpg",
    cta: "Open Account",
    href: "https://affiliate-link.com/bank",
  },
  {
    title: "Accounting Services",
    description: "Stay compliant with UK regulations.",
    image: "/images/affiliate-accounting.jpg",
    cta: "Get Accountant",
    href: "https://affiliate-link.com/accounting",
  },
  {
    title: "UK Virtual Number",
    description: "Receive UK calls from anywhere in the world.",
    image: "/images/affiliate-number.jpg",
    cta: "Get Number",
    href: "https://affiliate-link.com/number",
  },
];

export default function AffiliateBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md hover:shadow-xl transition"
        >
          <Menu className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="space-y-4 p-4">
          <h2 className="text-white text-base font-semibold">🌐 Services</h2>
          {affiliateLinks.map((link, index) => (
            <AffiliateCard key={index} {...link} />
          ))}
        </div>
      </Drawer>

      {/* Desktop Sidebar */}
      <aside
        className="
          hidden md:flex
          w-[280px] h-screen flex-col
          bg-white/10 backdrop-blur-lg border-l border-white/20 shadow-xl z-10
          px-4 pt-6 pb-4
        "
      >
        <h2 className="text-white text-sm font-semibold mb-4 tracking-wide px-1">🌐 Services</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {affiliateLinks.map((link, index) => (
            <AffiliateCard key={index} {...link} />
          ))}
        </div>
      </aside>
    </>
  );
}
