"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [light, setLight] = useState<{ x: number; y: number } | null>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!navbarRef.current) return;
    const rect = navbarRef.current.getBoundingClientRect();
    setLight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setLight(null);
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-30 bg-white/70 backdrop-blur border-b border-gray-200"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={navbarRef}
    >
      {light && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 80px at ${light.x}px ${light.y}px, rgba(0, 195, 255, 0.2), transparent 60%)`,
          }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tight hover:text-blue-600 transition">
          BetaOffice
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700 font-medium">
          <Link href="#pricing" className="hover:text-blue-600">Plans</Link>
          <Link href="#features" className="hover:text-blue-600">Features</Link>
          <Link href="#testimonials" className="hover:text-blue-600">Testimonials</Link>
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>

          {/* Enhanced Glow Fuchsia Partner CTA */}
          <Link
            href="/partners"
            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-600 shadow-md hover:shadow-lg transition-all animate-pulse"
          >
            Become a Partner
          </Link>

          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </Link>
        </nav>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3 text-gray-700 font-medium bg-white shadow-sm">
          <Link href="#pricing" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Plans</Link>
          <Link href="#features" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Features</Link>
          <Link href="#testimonials" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Testimonials</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Blog</Link>
          <Link
            href="/partners"
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-600 text-white px-4 py-2 rounded-md hover:shadow-lg transition text-center animate-pulse"
          >
            Become a Partner
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
          >
            Log In
          </Link>
        </div>
      )}
    </header>
  );
}
