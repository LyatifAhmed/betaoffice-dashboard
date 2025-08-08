"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AffiliateCard({
  title,
  description,
  image,
  cta,
  href,
}: {
  title: string;
  description: string;
  image: string;
  cta: string;
  href: string;
}) {
  return (
    <Card
      onClick={() => window.open(href, "_blank")}
      className="
        group
        w-full
        min-w-[260px]
        max-w-md
        rounded-2xl
        overflow-hidden
        border border-white/10
        bg-gradient-to-br from-white/5 to-white/10
        backdrop-blur-lg
        hover:border-blue-400
        hover:shadow-[0_0_20px_rgba(0,123,255,0.3)]
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.02]
        cursor-pointer
        flex flex-col
      "
    >
      {/* Image */}
      <div className="relative w-full aspect-video">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-1 flex flex-col flex-1 justify-between">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/70 line-clamp-2">{description}</p>

        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            window.open(href, "_blank");
          }}
          className="
            group/btn flex items-center gap-1 mt-2
            text-blue-400 hover:text-white
            px-0 py-0 h-auto text-xs font-medium
            transition-all duration-200
            w-fit
          "
        >
          {cta}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
