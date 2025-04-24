// pages/index.tsx
"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function HomePage() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const handleCheckout = useCallback(async (priceId: string) => {
    if (!agree) return alert("You must agree to the terms to continue.");
    const stripe = await stripePromise;

    const response = await fetch("/api/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();
    if (data.sessionId && stripe) {
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      alert("Unable to start checkout");
    }
  }, [agree]);

  return (
    <>
      <Head>
        <title>BetaOffice – Virtual Office KYC</title>
        <meta name="description" content="BetaOffice: Get a professional London address with scanned mail and secure KYC." />
      </Head>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white text-center">
        <Image
          src="/office-bg.png"
          alt="Office Background"
          fill
          style={{ objectFit: "cover" }}
          className="absolute z-0 opacity-50"
        />
        <div className="relative z-10 p-6 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Virtual Office. Real Business.</h1>
          <p className="text-lg mb-6">Professional London address. Secure mail. Fully online KYC process.</p>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded font-semibold"
          >
            See Plans
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Why BetaOffice?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Feature icon="🏢" title="Central London Address" text="Boost your credibility with a premium London business address." />
            <Feature icon="📬" title="Scanned Mail Access" text="We scan and notify you instantly. View mail securely online." />
            <Feature icon="📦" title="Mail Forwarding" text="Physical letters? We forward them to you anywhere in the world." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Simple Pricing (excl. VAT)</h2>
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <PlanCard
              title="Monthly Plan"
              price="£20"
              savings={null}
              benefits={["Central London address", "Scanned mail", "Cancel anytime"]}
              color="blue"
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID)}
            />
            <PlanCard
              title="Annual Plan"
              price="£200"
              savings="Save £48/year"
              benefits={["All monthly features", "Priority support", "Forwarding available"]}
              color="green"
              badge="Best Value"
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID)}
            />
          </div>
          <div className="mt-6 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" onChange={(e) => setAgree(e.target.checked)} className="form-checkbox" />
              I agree to the <a href="/terms-of-service" className="underline text-blue-600">Terms of Service</a> and{" "}
              <a href="/privacy-policy" className="underline text-blue-600">Privacy Policy</a>.
            </label>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PlanCard({
  title,
  price,
  savings,
  benefits,
  onClick,
  color,
  badge,
}: {
  title: string;
  price: string;
  savings: string | null;
  benefits: string[];
  onClick: () => void;
  color: "blue" | "green";
  badge?: string;
}) {
  const colorClasses = {
    blue: {
      border: "border-blue-500",
      badge: "bg-blue-500",
      hover: "hover:bg-blue-600",
      bg: "bg-blue-500",
    },
    green: {
      border: "border-green-500",
      badge: "bg-green-500",
      hover: "hover:bg-green-600",
      bg: "bg-green-500",
    },
  };

  const current = colorClasses[color];

  return (
    <div className={`bg-white ${current.border} border-2 rounded-lg p-6 shadow-md max-w-sm relative`}>
      {badge && (
        <span className={`${current.badge} text-white text-xs font-bold px-2 py-1 rounded-full absolute -top-3 -right-3`}>
          {badge}
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">
        {price}
        <span className="text-base font-normal">/plan</span>
      </p>
      {savings && <p className="text-sm text-green-600 mb-2">{savings}</p>}
      <ul className="text-gray-700 space-y-2 mb-6 mt-4 text-left">
        {benefits.map((b, i) => (
          <li key={i}>✓ {b}</li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className={`${current.bg} ${current.hover} text-white font-semibold py-2 px-4 rounded w-full transition`}
      >
        Choose {title.split(" ")[0]}
      </button>
    </div>
  );
}
