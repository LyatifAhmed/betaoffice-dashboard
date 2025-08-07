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
    <aside className="w-[72px] md:w-[96px] lg:w-[132px] xl:w-[160px] bg-white/10 backdrop-blur-md border-l border-white/20 p-2 pt-6 space-y-4 flex flex-col items-center">
      {affiliateLinks.map((link, index) => (
        <AffiliateCard key={index} {...link} />
      ))}
    </aside>
  );
}
