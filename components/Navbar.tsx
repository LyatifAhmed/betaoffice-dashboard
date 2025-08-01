"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // 👉 Eğer yüklü değilse: npm install lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="https://betaoffice.uk/logo.png"
              alt="BetaOffice Logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
          </Link>
          <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            BetaOffice
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700 font-medium">
          <Link href="#pricing" className="hover:text-blue-600">Plans</Link>
          <Link href="#features" className="hover:text-blue-600">Features</Link>
          <Link href="#testimonials" className="hover:text-blue-600">Testimonials</Link>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3 text-gray-700 font-medium bg-white shadow-sm">
          <Link href="#pricing" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Plans</Link>
          <Link href="#features" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Features</Link>
          <Link href="#testimonials" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Testimonials</Link>
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
