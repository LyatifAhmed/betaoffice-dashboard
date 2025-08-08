"use client";

type TopRibbonProps = {
  companyName?: string;
  statusText?: string; // "active", "pending", "urgent" vs. (renk için)
};

const paletteFor = (status: string | undefined) => {
  const s = (status || "active").toLowerCase();
  if (s.includes("urgent"))  return "from-pink-500/30 via-fuchsia-500/25 to-red-500/25";
  if (s.includes("pending")) return "from-amber-400/30 via-yellow-400/25 to-orange-500/25";
  if (s.includes("inactive"))return "from-slate-400/30 via-slate-500/25 to-slate-600/25";
  return "from-blue-500/30 via-indigo-500/25 to-violet-500/25"; // active/default
};

export default function TopRibbon({ companyName = "Your Company", statusText }: TopRibbonProps) {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-30 w-full">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div
          className={[
            "mt-1 h-12 sm:h-14 w-full rounded-2xl",
            "bg-gradient-to-r", paletteFor(statusText),
            "backdrop-blur-xl border border-white/30",
            "shadow-[0_12px_60px_rgba(37,99,235,0.20)]",
            "flex items-center justify-center",
          ].join(" ")}
        >
          <span className="text-sm sm:text-base font-semibold text-white/90 tracking-wide">
            {companyName}
          </span>
        </div>
      </div>
    </div>
  );
}
