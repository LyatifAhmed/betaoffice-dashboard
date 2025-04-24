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

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-black text-white text-center overflow-hidden">
        <Image
          src="/office-bg.png"
          alt="Office Background"
          fill
          style={{ objectFit: "cover" }}
          className="absolute z-0 opacity-400"
        />
        <div className="absolute inset-0 bg-black/60 z-0" /> {/* Dark overlay */}

        <div className="relative z-10 px-6 max-w-3xl animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-xl">
            Virtual Office. <span className="text-blue-400">Real Business.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto leading-relaxed">
            Get a professional London address, secure scanned mail, and a fully digital KYC process — all in minutes.
          </p>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
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
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)}
            />
            <PlanCard
              title="Annual Plan"
              price="£200"
              savings="Save £48/year"
              benefits={["All monthly features", "Priority support", "Forwarding available"]}
              color="green"
              badge="Best Value"
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
  return (
    <div
      className={`flex flex-col justify-between border-2 border-${color}-500 rounded-lg p-6 shadow-md max-w-sm w-full relative bg-white transition-transform duration-300 hover:shadow-xl hover:-translate-y-1`}
      style={{ minHeight: "440px" }}
    >
      {badge && (
        <span className={`absolute -top-3 -right-3 bg-${color}-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow`}>
          {badge}
        </span>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-3xl font-bold">
          {price}
          <span className="text-base font-normal">/plan</span>
        </p>
        {savings && <p className="text-sm text-green-600 mb-2">{savings}</p>}
        <ul className="text-gray-700 space-y-2 mt-4 text-left">
          {benefits.map((b, i) => (
            <li key={i}>✓ {b}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <button
          onClick={onClick}
          className={`w-full py-2 px-4 rounded font-semibold text-white bg-${color}-500 hover:bg-${color}-600 transition duration-200`}
        >
          Choose {title.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}
