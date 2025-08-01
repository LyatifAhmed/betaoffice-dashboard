"use client";

import { Users, PoundSterling, TrendingUp } from "lucide-react";

const cardData = [
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Total Referrals",
    value: "18",
    description: "People signed up using your link",
  },
  {
    icon: <PoundSterling className="w-6 h-6 text-green-600" />,
    title: "Total Earnings",
    value: "£90",
    description: "Referral credit earned",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
    title: "This Month",
    value: "£25",
    description: "Credit earned this month",
  },
];

export default function AffiliateCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cardData.map((card, i) => (
        <div
          key={i}
          className="relative rounded-3xl border border-white/20 bg-white/20 backdrop-blur-md p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
          style={{
            backgroundImage: "url('/textures/noise.png')",
            backgroundBlendMode: "overlay",
            backgroundSize: "cover",
            backgroundRepeat: "repeat",
          }}
        >
          {/* 💫 Glow ring on hover */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-400/20 to-cyan-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex items-center gap-4 mb-4 z-10 relative">
            <div className="p-2 bg-white/80 rounded-full shadow-md">{card.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-700">{card.title}</p>
              <p className="text-2xl font-extrabold text-gray-900 drop-shadow-sm">{card.value}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 z-10 relative">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
