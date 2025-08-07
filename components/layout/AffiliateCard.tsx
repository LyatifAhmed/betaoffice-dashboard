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
        max-w-xs
        p-0
        rounded-3xl
        overflow-hidden
        border border-white/20
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-md
        hover:border-blue-400
        transition-all duration-300 ease-in-out
        shadow-[0_0_20px_1px_rgba(255,255,255,0.05)]
        hover:shadow-[0_0_25px_2px_rgba(0,123,255,0.3)]
        cursor-pointer
      "
    >
      {/* Image */}
      <div className="relative w-full h-36 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80 line-clamp-3">{description}</p>

        <Button
          variant="ghost"
          className="group flex items-center gap-1 mt-2 text-blue-400 hover:text-white p-0"
        >
          {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
