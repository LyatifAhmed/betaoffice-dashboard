"use client";

import { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type PlanCardProps = {
  title: string;
  price: string;
  billingCycle: string;
  vatNote?: string;
  benefits: string[];
  onClick: () => void;
  color: "blue" | "green";
  badge?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [heroLight, setHeroLight] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setHeroLight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePlanSelect = (productId: string) => {
    localStorage.setItem("selected_plan", productId);
    router.push("/kyc");
  };

  return (
    <>
      <Navbar/>

      <Head>
        <title>BetaOffice – Digital Office for Global Creators</title>
        <meta
          name="description"
          content="BetaOffice: Premium London address with AI-powered mail dashboard, digital KYC, and multi-language support."
        />
      </Head>
      
      {/* Hero Section */}
      <section className="relative pt-28 min-h-[90vh] flex flex-col items-center justify-center bg-white text-gray-900 text-center overflow-hidden">
        <Image
          src="/office4.png"
          alt="Premium Virtual Office Background"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="absolute z-0"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-0" />

        <div
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="relative z-10 px-6 py-12 max-w-3xl w-full mx-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-lg ring-1 ring-white/5 hover:ring-white/10 transition-all duration-500 group overflow-hidden animate-breath hover:animate-excite"
        >



          {/* Mouse takip eden ışık efekti */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle 120px at ${heroLight.x}px ${heroLight.y}px, rgba(0, 255, 255, 0.12), transparent 60%)`,
            }}
          />

          {/* İçerik */}
          <Image
            src="/logo.png"
            alt="BetaOffice Logo"
            width={200}
            height={200}
            className="mx-auto mb-6 opacity-90 drop-shadow-lg"
          />

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-800 mb-6 drop-shadow-sm">
            Your Global HQ. <br />
            <span className="text-blue-600">From London.</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-700">
            Trusted UK address, AI-sorted mail, and instant KYC. For digital founders, nomads & remote-first teams.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() =>
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-xl transition duration-300"
            >
              View Plans
            </button>

            <Link
              href="/login"
              className="text-blue-700 hover:text-blue-900 underline text-base font-medium transition-colors duration-200 mt-2 md:mt-0"
            >
              Already a member? Log in
            </Link>
          </div>
        </div>

      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Makes BetaOffice Unique?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Feature icon="📍" title="Director Address Privacy" text="Keep your personal details protected with our included director service address." />
            <Feature icon="🤖" title="AI Mail Sorting" text="Our smart system categorizes, tags, and summarizes your mail instantly." />
            <Feature icon="💎" title="No Hidden Fees" text="All-inclusive pricing. No handling charges, no surprise add-ons." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white py-20 text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard name="Sarah, Founder of NomadWise" quote="BetaOffice helped me register my UK company in minutes. The AI mail system is a lifesaver while I travel." />
            <TestimonialCard name="David, E-commerce Consultant" quote="Finally a virtual office without annoying hidden fees. Everything I need is included." />
            <TestimonialCard name="Leila, Creative Agency Owner" quote="I love how professional my business now looks. The director privacy option gave me real peace of mind." />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 uppercase tracking-wide text-sm mb-6">
            Used alongside tools trusted by modern entrepreneurs
          </p>
          <div className="flex flex-wrap justify-center gap-8 grayscale opacity-70">
            <Image src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tide.svg" alt="Tide" width={100} height={40} />
            <Image src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wise.svg" alt="Wise" width={100} height={40} />
            <Image src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/revolut.svg" alt="Revolut" width={100} height={40} />
            <Image src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xero.svg" alt="Xero" width={100} height={40} />
            <Image src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/notion.svg" alt="Notion" width={100} height={40} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Transparent Pricing (excl. VAT)</h2>
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <PlanCard
              title="Monthly Plan"
              price="£20"
              billingCycle="/month"
              vatNote="+ VAT (£24 total)"
              benefits={["Prestigious London address", "AI-sorted scanned mail", "Director address privacy included", "Cancel anytime"]}
              color="blue"
              onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)}
            />

            <PlanCard
              title="Annual Plan"
              price="£200"
              billingCycle="/year"
              vatNote="+ VAT (£240 total)"
              benefits={["All monthly features", "Save £48/year", "Priority support", "Mail forwarding in UK (for small fee)"]}
              badge="Best Value"
              color="green"
              onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!)}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Physical mail is stored for 30 days and securely shredded if not forwarded.
          </p>
        </div>
      </section>
    </>
  );
}
// Feature component
function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition duration-300 transform hover:scale-[1.03] overflow-hidden group"
    >
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 100px at ${pos.x}px ${pos.y}px, rgba(0, 255, 255, 0.2), transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">{text}</p>
      </div>
    </div>
  );
}

// TestimonialCard component
function TestimonialCard({ name, quote }: { name: string; quote: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative bg-white/50 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-200 text-left hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div
        className="absolute w-full h-full pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 100px at ${pos.x}px ${pos.y}px, rgba(0, 255, 220, 0.12), transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <p className="text-gray-800 italic mb-4">“{quote}”</p>
        <p className="font-semibold text-gray-900">– {name}</p>
      </div>
    </div>
  );
}

// PlanCard component
function PlanCard({ title, price, billingCycle, vatNote, benefits, onClick, color, badge }: PlanCardProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const ringColor = color === "blue" ? "hover:ring-blue-400/40" : "hover:ring-green-400/40";
  const buttonColor = color === "blue" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600";

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative flex flex-col justify-between rounded-2xl p-6 max-w-sm w-full bg-white/60 md:bg-white/70 backdrop-blur-sm md:backdrop-blur-md border border-gray-200/50 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:ring-2 ${ringColor} ring-offset-2 ring-offset-white/30 overflow-hidden group`}
    >
      {badge && (
        <span className={`absolute top-2 right-2 ${color === "blue" ? "bg-blue-500" : "bg-green-500"} text-white text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full shadow-md z-10 animate-pulse`}>
          {badge}
        </span>
      )}
      <div
        className="absolute w-full h-full pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 120px at ${pos.x}px ${pos.y}px, rgba(0, 195, 255, 0.15), transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-1 text-gray-900">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900">
          {price}
          <span className="text-base font-medium text-gray-600">{billingCycle}</span>
        </p>
        {vatNote && <p className="text-sm text-gray-500 mt-1">{vatNote}</p>}
        <ul className="text-sm text-gray-800 mt-4 space-y-2 text-left">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <button onClick={onClick} className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white ${buttonColor} transition duration-300`}>
            Choose {title.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
