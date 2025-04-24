"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white text-gray-900 text-center overflow-hidden">
        <Image
          src="/office4.png"
          alt="Office Background"
          fill
          style={{ objectFit: "cover", opacity: 1 }}
          className="absolute z-0"
        />
        <div className="relative z-10 px-6 max-w-3xl w-full mx-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Virtual Office. <span className="text-blue-600">Real Business.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed">
            Get a professional London address, secure scanned mail, and a fully digital KYC process — all in minutes.
          </p>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
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
              billingCycle="/month"
              vatNote="+ VAT (£24 total)"
              benefits={[
                "London business address",
                "Scanned letters to your dashboard",
                "Email notifications",
                "Cancel anytime",
              ]}
              color="blue"
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)}
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
                "Mail forwarding available (pay per item)",
              ]}
              badge="Best Value"
              color="green"
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!)}
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
