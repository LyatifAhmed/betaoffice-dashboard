"use client";

import { HTMLAttributes } from "react";
import { Check } from "lucide-react";

type Props = {
  checked?: boolean;
  onChange?: () => void;
  ariaLabel?: string;
} & Omit<HTMLAttributes<HTMLLabelElement>, "onChange">;

export default function Checkbox({ checked, onChange, ariaLabel, className, ...rest }: Props) {
  return (
    <label
      {...rest}
      className={[
        "inline-flex items-center justify-center select-none cursor-pointer",
        "h-5 w-5 rounded-md",
        // cam efekti + yumuşak kenar
        "bg-white/70 dark:bg-white/10 backdrop-blur",
        "border border-gray-300/80 dark:border-white/20",
        "shadow-sm",
        // premium: ince parıltı + yumuşak ring
        "relative overflow-hidden",
        "transition-all duration-150",
        checked
          ? "ring-2 ring-violet-500/40 dark:ring-violet-400/40 bg-white/90 dark:bg-white/15"
          : "hover:bg-white/90 dark:hover:bg-white/15",
        className || "",
      ].join(" ")}
      aria-label={ariaLabel}
      role="checkbox"
      aria-checked={!!checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange?.();
        }
      }}
    >
      {/* gerçek input (görünmez ama erişilebilir) */}
      <input
        type="checkbox"
        checked={!!checked}
        onChange={() => onChange?.()}
        aria-label={ariaLabel}
        className="sr-only"
      />

      {/* iç dolgu animasyonu */}
      <span
        className={[
          "absolute inset-0 rounded-md",
          "transition-all duration-150",
          checked ? "bg-violet-500/10 dark:bg-violet-400/15" : "bg-transparent",
        ].join(" ")}
      />

      {/* tik ikonu */}
      <Check
        size={14}
        className={[
          "transition-all duration-150",
          checked
            ? "opacity-100 scale-100 text-violet-700 dark:text-violet-300"
            : "opacity-0 scale-75",
        ].join(" ")}
      />
    </label>
  );
}
