"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn(
        "relative overflow-hidden w-full h-full",
        className
      )}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          "w-full h-full rounded-md",
          "scrollbar-none", // mobil scroll native
          "touch-pan-y"     // iOS uyumlu swipe
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* Scrollbar sadece büyük ekranlar için görünür */}
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="hidden sm:flex select-none touch-none p-0.5 bg-transparent transition-colors hover:bg-white/10"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-white/30" />
      </ScrollAreaPrimitive.Scrollbar>

      {/* İsteğe bağlı: yatay scrollbar */}
      {/* 
      <ScrollAreaPrimitive.Scrollbar
        orientation="horizontal"
        className="hidden sm:flex select-none touch-none p-0.5 bg-transparent transition-colors hover:bg-white/10"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-white/30" />
      </ScrollAreaPrimitive.Scrollbar> 
      */}
    </ScrollAreaPrimitive.Root>
  );
}
