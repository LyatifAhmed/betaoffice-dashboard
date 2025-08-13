"use client";

import { HTMLAttributes } from "react";
import { Check } from "lucide-react";

type Props = {
  checked?: boolean;
  onChange?: () => void;
  ariaLabel?: string;
} & Omit<HTMLAttributes<HTMLLabelElement>, "onChange">;

export default function Checkbox({ checked, onChange, ariaLabel, className, ...rest }: Props) {
  return
  (
    <label
      className={[
        "inline-flex items-center justify-center select-none cursor-pointer",
        "h-5 w-5 rounded-md",
        // glassy background
        "bg-white/70 dark:bg-white/10 backdrop-blur",
        "border border-gray-300/80 dark:border-white/20",
        "shadow-sm",
        "transition-all duration-150",
        checked ? "ring-2 ring-violet-500/40 dark:ring-violet-400/40" : "hover:bg-white/90 dark:hover:bg-white/15",
        className || "",
      ].join(" ")}
      aria-label={ariaLabel}
      {...rest}
    >
      {/* Hidden native input for accessibility / forms */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="sr-only"
      />
      {/* Icon */}
      <Check
        size={14}
        className={[
          "transition-opacity duration-150",
          checked ? "opacity-100 text-violet-700 dark:text-violet-300" : "opacity-0",
        ].join(" ")}
      />
    </label>
  );
}
