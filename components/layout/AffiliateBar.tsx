"use client";

import AffiliateCard from "@/components/layout/AffiliateCard";

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
  return (
    <aside
      className="
        hidden md:flex
        w-[280px]
        h-screen
        flex-col
        bg-gradient-to-b from-white/10 via-white/5 to-transparent
        backdrop-blur-xl border-l border-white/20 shadow-[inset_0_0_0.5px_rgba(255,255,255,0.1)] z-10
        px-4 pt-6 pb-4
        rounded-l-3xl
      "
    >
      <h2 className="text-white text-sm font-semibold mb-4 tracking-widest px-1 uppercase opacity-70">
        Discover
      </h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {affiliateLinks.map((link, index) => (
          <AffiliateCard key={index} {...link} />
        ))}
      </div>
    </aside>
  );
}
