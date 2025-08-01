"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function HomePage() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);

  const handlePlanSelect = (productId: string) => {
    localStorage.setItem("selected_plan", productId);
    router.push("/kyc");
  };
  
  <Navbar />

  return (
    <>
      <Head>
        <title>BetaOffice – Digital Office for Global Creators</title>
        <meta
          name="description"
          content="BetaOffice: Premium London address with AI-powered mail dashboard, digital KYC, and multi-language support."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white text-gray-900 text-center overflow-hidden">
        <Image
          src="/office4.png" // ✅ Yeni spotlight görseli
          alt="Premium Virtual Office Background"
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.8 }}
          className="absolute z-0"
        />
        <div className="relative z-10 px-6 max-w-3xl w-full mx-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Your Global HQ. <span className="text-blue-600">From London.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed">
            Trusted UK address, secure mail viewing, and easy onboarding. Perfect for creators, founders, and remote workers.
          </p>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
          >
            View Plans
          </button>

          <div className="mt-4">
            <Link
              href="/login"
              className="text-blue-700 hover:text-blue-900 underline text-base font-medium transition-colors duration-200"
            >
              Already have an account? Log in
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
      <section className="bg-white py-20 text-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              name="Sarah, Founder of NomadWise"
              quote="BetaOffice helped me register my UK company in minutes. The AI mail system is a lifesaver while I travel."
            />
            <TestimonialCard
              name="David, E-commerce Consultant"
              quote="Finally a virtual office without annoying hidden fees. Everything I need is included."
            />
            <TestimonialCard
              name="Leila, Creative Agency Owner"
              quote="I love how professional my business now looks. The director privacy option gave me real peace of mind."
            />
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
              benefits={[
                "Prestigious London address",
                "AI-sorted scanned mail",
                "Director address privacy included",
                "Cancel anytime",
              ]}
              color="blue"
              onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)}
            />

            <PlanCard
              title="Annual Plan"
              price="£200"
              billingCycle="/year"
              vatNote="+ VAT (£240 total)"
              benefits={[
                "All monthly features",
                "Save £48/year",
                "Priority support",
                "Mail forwarding in UK (for small fee)",
              ]}
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

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition duration-300 transform hover:scale-105">
      <div className="text-4xl mb-3 transition-opacity duration-300 opacity-80 hover:opacity-100">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

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

function PlanCard({
  title,
  price,
  billingCycle,
  vatNote,
  benefits,
  onClick,
  color,
  badge,
}: PlanCardProps) {
  return (
    <div
      className={`
        flex flex-col justify-between border-2 border-${color}-500 
        rounded-2xl p-6 shadow-md max-w-sm w-full bg-white 
        transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02]
        relative
      `}
    >
      {badge && (
        <span className={`absolute -top-3 -right-3 bg-${color}-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
          {badge}
        </span>
      )}
      <div>
        <h3 className="text-xl font-bold mb-1 text-gray-900">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900">
          {price}
          <span className="text-base font-medium text-gray-600">{billingCycle}</span>
        </p>
        {vatNote && <p className="text-sm text-gray-500 mt-1">{vatNote}</p>}
        <ul className="text-sm text-gray-700 mt-4 space-y-2 text-left">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <button
          onClick={onClick}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-${color}-500 hover:bg-${color}-600 transition duration-300 shadow-sm hover:shadow-md`}
        >
          Choose {title.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}

function TestimonialCard({ name, quote }: { name: string; quote: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow text-left">
      <p className="text-gray-700 italic mb-4">“{quote}”</p>
      <p className="font-semibold text-gray-900">– {name}</p>
    </div>
  );
}