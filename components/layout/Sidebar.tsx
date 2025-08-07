"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "📬 Mail", value: "mail" },
  { label: "📄 Details", value: "details" },
  { label: "🤝 Referral", value: "referral" },
];

export default function Sidebar() {
  const [active, setActive] = useState("mail");
  const router = useRouter();

  const handleClick = (tab: string) => {
    setActive(tab);
    // Optional: Eğer route değiştiriyorsan burada yönlendir
    // router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <aside className="w-52 min-w-[13rem] h-screen bg-white/30 backdrop-blur-sm border-r border-white/20 shadow-inner flex flex-col justify-between py-6 px-4">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-800 mb-6 px-2">📦 BetaOffice</h1>

        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => handleClick(item.value)}
            className={cn(
              "w-full text-left px-4 py-2 rounded-md transition-all font-medium",
              active === item.value
                ? "bg-white/60 text-gray-900 shadow"
                : "text-gray-700 hover:bg-white/20"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-auto">
        <button
          onClick={() => alert("Çıkış yapılacak")}
          className="w-full text-sm text-gray-600 hover:text-red-600"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
