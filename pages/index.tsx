"use client";

import { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Mail,
  Building2,
  Sparkles,
  Globe,
  Users,
  ArrowRight,
  PoundSterling,
  CheckCircle2,
  XCircle,
  CreditCard,
  BadgeCheck,
  Boxes,
  ScrollText,
  Trophy,
  Inbox,
  Filter,
  Tag,
  FileText,
  Search,
} from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type PlanCardProps = {
  title: string;
  price: string;
  billingCycle: string;
  sublabel?: string;
  vatNote?: string;
  benefits: string[];
  onClick: () => void;
  color: "blue" | "green" | "purple";
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
    if (!productId) return;
    localStorage.setItem("selected_plan", productId);
    router.push("/kyc");
  };

  return (
    <>
      <Navbar />

      <Head>
        <title>BetaOffice – Premium UK Address without the Corporate Vibe</title>
        <meta
          name="description"
          content="BetaOffice: Modern UK business address with AI‑sorted mail, instant KYC, and director privacy. From £16/mo (annual). No hidden fees."
        />
      </Head>

      {/* Hero */}
      <section className="relative pt-28 min-h-[92vh] flex flex-col items-center justify-center bg-white text-gray-900 text-center overflow-hidden">
        <Image src="/office4.png" alt="Premium Virtual Office Background" fill priority style={{ objectFit: "cover" }} className="absolute z-0" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-0" />

        <div
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="relative z-10 px-6 py-12 max-w-4xl w-full mx-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-lg ring-1 ring-white/5 hover:ring-white/10 transition-all duration-500 group overflow-hidden animate-breath hover:animate-excite"
        >
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(circle 140px at ${heroLight.x}px ${heroLight.y}px, rgba(0, 200, 255, 0.14), transparent 60%)` }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="w-5 h-5" />
              <p className="text-xs uppercase tracking-widest text-gray-700">Affordable but premium • Built for modern founders</p>
              <Sparkles className="w-5 h-5" />
            </div>

            <Image src="/logo.png" alt="BetaOffice Logo" width={220} height={220} className="mx-auto mb-6 opacity-90 drop-shadow-lg" />

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-800 mb-4 drop-shadow-sm">
              A real London HQ — <span className="text-blue-600"> without the corporate price.</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-gray-700 max-w-3xl mx-auto">
              For flat‑shares, lodgers, tenants with restrictive leases, and global makers. Use a trusted UK address, keep your home private, and manage mail with AI — all in one clean dashboard.
            </p>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition duration-300"
              >
                <PoundSterling className="w-5 h-5" /> From £16/mo <span className="text-white/80 text-sm">(annual)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="text-blue-700 hover:text-blue-900 underline text-base font-medium transition-colors duration-200">
                Already a member? Log in
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Director privacy included</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> AI‑sorted scanned mail</div>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4"/> No hidden fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BetaOffice */}
      <section id="why" className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Built for real life in the UK</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Feature icon={<Building2 className="w-6 h-6"/>} title="Landlord says ‘no registered address’?" text="Use our address for Companies House and protect your tenancy. No need to risk your lease." />
            <Feature icon={<Globe className="w-6 h-6"/>} title="Abroad or travelling?" text="Register and manage your UK company from anywhere. We scan, sort, and summarize your mail automatically." />
            <Feature icon={<Shield className="w-6 h-6"/>} title="Keep home details private" text="Director service address included. Your home stays off the public register." />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Get started in minutes</h2>
          <ol className="relative border-s border-gray-200 mx-auto max-w-3xl">
            <TimelineStep icon={<Boxes className="w-5 h-5"/>} title="Pick a plan" text="Monthly or annual. From £16/mo when billed annually." />
            <TimelineStep icon={<ScrollText className="w-5 h-5"/>} title="Quick digital KYC" text="Upload ID — typically approved same‑day." />
            <TimelineStep icon={<CreditCard className="w-5 h-5"/>} title="Checkout securely" text="Stripe payments. No setup fee." />
            <TimelineStep icon={<BadgeCheck className="w-5 h-5"/>} title="Instant address" text="Use your new address for Companies House and HMRC." />
            <TimelineStep icon={<Mail className="w-5 h-5"/>} title="AI mail dashboard" text="We scan, categorize (e.g., HMRC, Bank, Government), and auto‑summarize letters." />
          </ol>
        </div>
      </section>

      {/* Demo Preview – AI Mail */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">See the AI Mail Dashboard</h2>
            <p className="text-gray-600 mt-2">Auto‑sorted inbox, one‑click summaries, and quick forwarding — all in your browser.</p>
          </div>
          <DemoPreview />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Transparent Pricing</h2>
          <p className="text-gray-600 mb-10">No handling charges. No surprise add‑ons.</p>
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <PlanCard title="Monthly" price="£20" billingCycle="/mo" vatNote="+ VAT (£24 total)" benefits={["Prestigious London address","AI‑sorted scanned mail","Director service address included","Cancel anytime"]} color="blue" onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)} />
            <PlanCard title="Annual" price="£16" billingCycle="/mo" sublabel="when billed annually (£192/yr)" vatNote="+ VAT (£230.40 total)" benefits={["Everything in Monthly","Save £48/year","Priority support","UK mail forwarding available (small fee)"]} badge="Best Value" color="green" onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!)} />
            <PlanCard title="Starter (Student)" price="£12" billingCycle="/mo" sublabel="limited scanning • annual billing" vatNote="+ VAT (£14.40/mo equiv)" benefits={["Same registered address","Light scan quota","Upgrade anytime","Director privacy included"]} color="purple" onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!)} />
          </div>
          <p className="text-sm text-gray-500 mt-4">Physical mail stored 30 days, then securely shredded if not forwarded.</p>
        </div>
      </section>

      {/* Comparison: BetaOffice vs P.O. Box & Agents */}
      <section id="compare" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">Why not a P.O. Box or formation agent?</h2>
          <p className="text-center text-gray-600 mb-12">Short answer: Companies House often requires a real service address, and agents add fees you don’t need.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComparisonCard
              title="BetaOffice"
              good={["Real London service address","Director privacy included","AI mail sorting & summaries","No hidden handling fees","Modern dashboard"]}
              bad={[]}
              highlight
            />
            <ComparisonCard
              title="P.O. Box"
              good={["Cheap for general mail"]}
              bad={["Not valid for Companies House service address","No director privacy","No scanning/summaries","Slow manual processes"]}
            />
            <ComparisonCard
              title="Formation Agents"
              good={["They can incorporate for you"]}
              bad={["Markups & add‑ons for address","You can register yourself in minutes","Lock‑in to yearly upsells","Dated dashboards"]}
            />
          </div>
          <div className="text-center mt-10">
            <Link href="/guide/incorporate-yourself" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 underline">
              How to register your company yourself (free step‑by‑step) <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* Audience-driven Cards */}
      <section id="audience" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Made for creators & side‑hustlers</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <AudienceCard icon={<Users className="w-6 h-6"/>} title="House‑share founders" text="Your tenancy forbids using the flat as your office? Use our address and keep everyone happy."/>
            <AudienceCard icon={<Globe className="w-6 h-6"/>} title="Non‑UK residents" text="Stuck paying middlemen £££ for a UK address? Get a real service address and set it up yourself."/>
            <AudienceCard icon={<Sparkles className="w-6 h-6"/>} title="Young entrepreneurs" text="Start lean. Get the essentials, keep the premium vibe, grow on your terms."/>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50 py-20 text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What founders like you say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard name="Zara – Etsy seller" quote="I live in a flat‑share and couldn’t use my address. BetaOffice solved it in a day and my shop looks legit now."/>
            <TestimonialCard name="Mo – App developer" quote="The AI mail summaries are clutch. I get the gist of HMRC letters without opening PDFs on mobile."/>
            <TestimonialCard name="Ana – Agency owner (EU)" quote="I paid an agent once—never again. Did it myself with their guide and saved hundreds."/>
          </div>
        </div>
      </section>

      {/* Referral CTA */}
      <section id="referral" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white/70 backdrop-blur-md p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40" style={{background:"radial-gradient(1200px 240px at 50% 120%, rgba(56,189,248,.25), transparent)"}}/>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2"><Trophy className="w-4 h-4"/> Share & earn</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Refer friends, get months free</h3>
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">Invite makers who need a UK address. Earn wallet credit or months off your plan for every signup. Instant tracking inside your dashboard.</p>
              <Link href="/referrals" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition duration-300">Start promoting <ArrowRight className="w-5 h-5"/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer mini‑CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 mb-4">Have questions about leases, Companies House, or privacy?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 underline">Talk to us <ArrowRight className="w-4 h-4"/></Link>
          <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} BetaOffice — Generation Beta Digital Ltd</p>
        </div>
      </section>
    </>
  );
}

// ---------- Subcomponents ----------

function DemoPreview() {
  type MailItem = {
    id: string;
    sender: string;
    subject: string;
    category: "Government" | "Bank" | "Invoice" | "Other";
    date: string;
    summary: string;
  };

  const data: MailItem[] = [
    {
      id: "1",
      sender: "HMRC",
      subject: "Self Assessment — Payment Reminder",
      category: "Government",
      date: "2025-08-12",
      summary: "Reminder to pay by 31 Jan. Interest applies after the deadline. Amount due likely last year's estimate; check statement online.",
    },
    {
      id: "2",
      sender: "Barclays Business",
      subject: "Account verification — additional doc",
      category: "Bank",
      date: "2025-08-10",
      summary: "Bank requests proof of business activity (invoice or contract). Upload via app within 7 days to avoid limitations.",
    },
    {
      id: "3",
      sender: "CloudPrint Ltd",
      subject: "Invoice #INV-2037",
      category: "Invoice",
      date: "2025-08-08",
      summary: "£48 due in 14 days for printing services (50 cards + shipping). No late-fee clause.",
    },
  ];

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<MailItem["category"] | "All">("All");
  const [active, setActive] = useState<MailItem | null>(data[0]);

  const categories: (MailItem["category"] | "All")[] = ["All", "Government", "Bank", "Invoice", "Other"];

  const filtered = data.filter((m) => {
    const q = query.toLowerCase();
    const matchesQ = [m.sender, m.subject, m.category].join(" ").toLowerCase().includes(q);
    const matchesC = cat === "All" ? true : m.category === cat;
    return matchesQ && matchesC;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: controls + list */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md p-4 shadow">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <Inbox className="w-4 h-4"/> Demo Inbox
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 border rounded-xl px-3 py-2 bg-gray-50">
              <Search className="w-4 h-4 text-gray-500"/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search sender or subject" className="w-full bg-transparent outline-none text-sm"/>
            </div>
            <div className="relative">
              <select value={cat} onChange={(e)=>setCat(e.target.value as any)} className="appearance-none border rounded-xl px-3 py-2 text-sm bg-white pr-8">
                {categories.map(c => (<option key={c}>{c}</option>))}
              </select>
              <Filter className="w-4 h-4 absolute right-2 top-2.5 text-gray-500"/>
            </div>
          </div>

          <ul className="space-y-2 max-h-80 overflow-auto">
            {filtered.map((m)=> (
              <li key={m.id}>
                <button onClick={()=>setActive(m)} className={`w-full text-left p-3 rounded-xl border ${active?.id===m.id?"border-blue-300 bg-blue-50":"border-gray-200 bg-white hover:bg-gray-50"} transition flex flex-col gap-0.5`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{m.sender}</span>
                    <span className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm text-gray-700 truncate">{m.subject}</span>
                  <span className="text-[10px] inline-flex items-center gap-1 text-gray-600">
                    <Tag className="w-3 h-3"/> {m.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: preview */}
      <div className="lg:col-span-2">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md p-6 shadow-xl min-h-[320px]">
          {active ? (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5"/>
                  <h3 className="text-lg font-bold">{active.subject}</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">AI Summary</span>
              </div>
              <p className="text-sm text-gray-700 mb-4">From <strong>{active.sender}</strong> • {active.category}</p>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
                {active.summary}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Open PDF</button>
                <button className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">Forward (£2.50)</button>
                <button className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">Copy address</button>
              </div>

              <p className="mt-4 text-xs text-gray-500">Categories shown are examples (HMRC, Bank, Government, Invoice). Files open with temporary secure links.</p>
            </div>
          ) : (
            <div className="h-full grid place-items-center text-gray-500">
              Select a letter to preview
            </div>
          )}

          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full opacity-30" style={{background:"radial-gradient(600px 120px at 50% 0%, rgba(59,130,246,.25), transparent)"}}/>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className="relative bg-gray-100 p-6 rounded-2xl shadow hover:shadow-xl transition duration-300 transform hover:scale-[1.03] overflow-hidden group"
    >
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle 110px at ${pos.x}px ${pos.y}px, rgba(0, 255, 255, 0.18), transparent 60%)` }}
      />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center mb-3">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">{text}</p>
      </div>
    </div>
  );
}

function TimelineStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="mb-10 ms-6">
      <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-gray-50">
        {icon}
      </span>
      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-base text-gray-600">{text}</p>
    </li>
  );
}

function ComparisonCard({ title, good, bad, highlight }: { title: string; good: string[]; bad: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 border ${highlight ? "bg-white/70 backdrop-blur-md border-blue-200 shadow-xl" : "bg-white border-gray-200 shadow"}`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="space-y-2 text-sm">
        {good.map((g, i) => (
          <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5"/> <span>{g}</span></li>
        ))}
        {bad.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700"><XCircle className="w-4 h-4 text-red-500 mt-0.5"/> <span>{b}</span></li>
        ))}
      </ul>
    </div>
  );
}

function AudienceCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className="relative bg-white/60 md:bg-white/70 backdrop-blur-sm md:backdrop-blur-md p-6 rounded-2xl border border-gray-200/60 shadow-xl overflow-hidden group"
    >
      <div className="absolute w-full h-full pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle 120px at ${pos.x}px ${pos.y}px, rgba(0, 195, 255, 0.15), transparent 60%)` }} />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-700 text-sm">{text}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ name, quote }: { name: string; quote: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className="relative bg-white/50 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-200 text-left hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="absolute w-full h-full pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle 100px at ${pos.x}px ${pos.y}px, rgba(0, 255, 220, 0.12), transparent 60%)` }} />
      <div className="relative z-10">
        <p className="text-gray-800 italic mb-4">“{quote}”</p>
        <p className="font-semibold text-gray-900">– {name}</p>
      </div>
    </div>
  );
}

function PlanCard({ title, price, billingCycle, sublabel, vatNote, benefits, onClick, color, badge }: PlanCardProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const ringColor = color === "blue" ? "hover:ring-blue-400/40" : color === "green" ? "hover:ring-green-400/40" : "hover:ring-purple-400/40";
  const buttonColor = color === "blue" ? "bg-blue-500 hover:bg-blue-600" : color === "green" ? "bg-green-500 hover:bg-green-600" : "bg-purple-500 hover:bg-purple-600";

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      className={`relative flex flex-col justify-between rounded-2xl p-6 max-w-sm w-full bg-white/60 md:bg-white/70 backdrop-blur-sm md:backdrop-blur-md border border-gray-200/50 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:ring-2 ${ringColor} ring-offset-2 ring-offset-white/30 overflow-hidden group`}
    >
      {badge && (
        <span className={`absolute top-2 right-2 ${color === "blue" ? "bg-blue-500" : color === "green" ? "bg-green-500" : "bg-purple-500"} text-white text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full shadow-md z-10`}>
          {badge}
        </span>
      )}
      <div className="absolute w-full h-full pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle 120px at ${pos.x}px ${pos.y}px, rgba(0, 195, 255, 0.15), transparent 60%)` }} />
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-1 text-gray-900">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900">
          {price}
          <span className="text-base font-medium text-gray-600">{billingCycle}</span>
        </p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
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
            Choose {title}
          </button>
        </div>
      </div>
    </div>
  );
}
