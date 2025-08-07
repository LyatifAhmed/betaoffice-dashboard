"use client";

import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // if using shadcn tooltip
import { cn } from "@/lib/utils"; // from shadcn setup

type IconButtonProps = {
  icon: ReactNode;
  onClick?: () => void;
  tooltip?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "danger" | "success";
  className?: string;
};

export default function IconButton({
  icon,
  onClick,
  tooltip,
  size = "md",
  variant = "default",
  className = "",
}: IconButtonProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    default: "bg-white/20 hover:bg-white/30 text-gray-800",
    danger: "bg-red-100 hover:bg-red-200 text-red-600",
    success: "bg-green-100 hover:bg-green-200 text-green-600",
  };

  const baseClasses =
    "rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/30 transition-all duration-200 hover:scale-110";

  const button = (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon}
    </button>
  );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top" className="bg-white/80 text-black text-xs px-2 py-1 rounded-md shadow-md">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
}
