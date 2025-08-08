"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, FileText, Users, LogOut, LayoutGrid } from "lucide-react";
import clsx from "clsx";

type Item = { label: string; href: string; icon: React.ElementType };

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Mail",      href: "/dashboard/mail", icon: Inbox },
  { label: "Details",   href: "/dashboard/details", icon: FileText },
  { label: "Referral",  href: "/dashboard/referral", icon: Users },
];

export default function MainSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "h-screen w-64 shrink-0",
        "bg-[#0e1a2b]/90 backdrop-blur-md",
        "border-r border-white/10",
        "text-[#dbe7ff]"
      )}
    >
      {/* Top */}
      <div className="flex items-center gap-3 px-4 py-5">
        <img src="/logo.png" alt="BetaOffice" className="h-7 w-7 rounded-md" />
        <span className="text-base font-semibold tracking-wide text-[#e7efff]">
          BetaOffice
        </span>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto md:hidden text-[#c5d6ff]/70 hover:text-white transition"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="px-3 py-2 space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3",
                "rounded-lg px-3 py-2 text-sm font-medium",
                "transition-colors",
                active
                  ? "bg-white/8 text-white"
                  : "text-[#c5d6ff]/80 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Sol ince accent (aktifken gradient) */}
              <span
                className={clsx(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full",
                  active
                    ? "bg-gradient-to-b from-blue-500 to-fuchsia-500"
                    : "bg-transparent group-hover:bg-blue-500/60"
                )}
              />
              <Icon
                size={18}
                className={clsx(
                  "shrink-0",
                  active ? "text-white" : "text-[#c5d6ff]/70 group-hover:text-white"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 h-px bg-white/10" />

      {/* Logout */}
      <div className="mt-auto px-3 py-4">
        <button
          className={clsx(
            "w-full flex items-center gap-2 px-3 py-2 text-sm",
            "rounded-lg text-[#c5d6ff]/70 hover:text-white hover:bg-white/5 transition"
          )}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
