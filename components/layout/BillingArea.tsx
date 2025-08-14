// components/layout/BillingArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Star,
  Trash2,
  CalendarClock,
  Crown,
  PauseCircle,
  PlayCircle,
  ArrowRightLeft,
  Info,
  BadgePercent,
} from "lucide-react";

/* ------------------------------ Types ------------------------------ */

type Currency = "GBP" | "USD" | "EUR";

type Invoice = {
  id: string;
  date: string;                  // ISO
  amount_pennies: number;
  currency: Currency;
  status: "paid" | "due" | "failed";
  pdf_url?: string;
  period?: { from?: string; to?: string };
  description?: string;
};

type PaymentMethod = {
  id: string;
  brand: string;                 // visa, mastercard, amex...
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default?: boolean;
};

type Charge = {
  id: string;
  created: string;               // ISO
  amount_pennies: number;
  currency: Currency;
  status: "succeeded" | "pending" | "failed" | "refunded";
  description?: string;
  receipt_url?: string;
};

type PlanId = "monthly" | "annual";

type PlanInfo = {
  id: PlanId;
  name: string;
  price_pennies: number;         // excl. VAT
  interval: "month" | "year";
  features: string[];
  badge?: string;
  vat_note?: string;             // UI copy only
  price_id_env: string;          // env var name
};

/* ------------------------------ Constants (match Home) ------------------------------ */

const PLANS: PlanInfo[] = [
  {
    id: "monthly",
    name: "Monthly",
    price_pennies: 2000,                    // £20
    interval: "month",
    features: [
      "Prestigious London address",
      "AI-sorted scanned mail",
      "Director address privacy included",
      "Cancel anytime",
    ],
    vat_note: "+ VAT (£24 total)",
    price_id_env: "NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID",
  },
  {
    id: "annual",
    name: "Annual",
    price_pennies: 20000,                   // £200
    interval: "year",
    features: [
      "All monthly features",
      "Save £48/year",
      "Priority support",
      "Mail forwarding in UK (for small fee)",
    ],
    vat_note: "+ VAT (£240 total)",
    badge: "Best Value",
    price_id_env: "NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID",
  },
];

/* ------------------------------ Utils ------------------------------ */

const money = (pennies: number, cur: Currency) =>
  (pennies / 100).toLocaleString(undefined, { style: "currency", currency: cur });

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

const invBadge = (status: Invoice["status"]) => {
  if (status === "paid")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200";
  if (status === "due")
    return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200";
};

const chargeBadge = (status: Charge["status"]) => {
  if (status === "succeeded")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200";
  if (status === "pending")
    return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200";
  if (status === "refunded")
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-200";
  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200";
};

/* ------------------------------ Subscription shape (server) ------------------------------ */

type Subscription = {
  // backend artık plan yerine price_id ile çalışabilir
  price_id?: string;               // Stripe price id
  plan_id?: PlanId;                // geriye dönük uyum için
  status: "ACTIVE" | "CANCELLED" | "PENDING" | "PAST_DUE";
  current_period_end?: string;     // ISO
  cancel_at_period_end?: boolean;
};

/* ------------------------------ Component ------------------------------ */

export default function BillingArea() {
  // invoices
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // payment methods
  const [pmLoading, setPmLoading] = useState(true);
  const [pmErr, setPmErr] = useState<string>("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  // add-card modal
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });

  // subscription
  const [subLoading, setSubLoading] = useState(true);
  const [subErr, setSubErr] = useState<string>("");
  const [sub, setSub] = useState<Subscription | null>(null);
  const [busyAction, setBusyAction] = useState<"change" | "cancel" | "resume" | null>(null);

  // charges (payment history)
  const [chgLoading, setChgLoading] = useState(true);
  const [chgErr, setChgErr] = useState<string>("");
  const [charges, setCharges] = useState<Charge[]>([]);

  const totalDue = useMemo(() => {
    const gbp = invoices.filter(i => i.status === "due" && i.currency === "GBP")
      .reduce((s, i) => s + i.amount_pennies, 0);
    return gbp;
  }, [invoices]);

  // env’den price_id değerlerini al
  const envPriceId = (envName: string) =>
    (typeof window !== "undefined" ? (window as any).__ENV?.[envName] : null) ??
    process.env[envName as keyof typeof process.env] ??
    (process as any).env?.[envName];

  // aktif planı env price id üzerinden çöz
  const currentPlan: PlanInfo | null = useMemo(() => {
    // sub.price_id mevcutsa env eşleşmesi yap
    if (sub?.price_id) {
      return (
        PLANS.find(p => envPriceId(p.price_id_env) === sub.price_id) ??
        null
      );
    }
    // geriye dönük: plan_id varsa kullan
    if (sub?.plan_id) {
      return PLANS.find(p => p.id === sub.plan_id) ?? null;
    }
    return null;
  }, [sub]);

  /* ------------------------------ Fetchers ------------------------------ */

  const loadInvoices = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/billing/invoices", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      const rows: Invoice[] = Array.isArray(data?.results) ? data.results : data;
      setInvoices(rows ?? []);
    } catch {
      setErr("Failed to load invoices.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMethods = async () => {
    setPmLoading(true);
    setPmErr("");
    try {
      const r = await fetch("/api/billing/payment-methods", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      const rows: PaymentMethod[] = Array.isArray(data?.results) ? data.results : data;
      setMethods(rows ?? []);
    } catch {
      setPmErr("Failed to load payment methods.");
      setMethods([]);
    } finally {
      setPmLoading(false);
    }
  };

  const loadSubscription = async () => {
    setSubLoading(true);
    setSubErr("");
    try {
      const r = await fetch("/api/billing/subscription", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data: Subscription = await r.json();
      setSub(data ?? null);
    } catch {
      setSubErr("Failed to load subscription info.");
      setSub(null);
    } finally {
      setSubLoading(false);
    }
  };

  const loadCharges = async () => {
    setChgLoading(true);
    setChgErr("");
    try {
      const r = await fetch("/api/billing/charges?limit=20", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data: Charge[] = await r.json();
      setCharges(Array.isArray(data) ? data : []);
    } catch {
      setChgErr("Failed to load payment history.");
      setCharges([]);
    } finally {
      setChgLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadMethods();
    loadSubscription();
    loadCharges();
  }, []);

  /* ------------------------------ Actions ------------------------------ */

  const addCard = async () => {
    // ⚠️ Örnek; prod’da Stripe Elements vb. ile tokenize et.
    if (!card.number || !card.exp || !card.cvc) return alert("Please fill all card fields.");
    setAdding(true);
    try {
      const body = { number: card.number, exp: card.exp, cvc: card.cvc };
      const r = await fetch("/api/billing/add-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(String(r.status));
      setAddOpen(false);
      setCard({ number: "", exp: "", cvc: "" });
      await loadMethods();
    } catch {
      alert("Could not add card.");
    } finally {
      setAdding(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      const r = await fetch(`/api/billing/methods/${encodeURIComponent(id)}/default`, { method: "POST" });
      if (!r.ok) throw new Error(String(r.status));
      await loadMethods();
    } catch {
      alert("Failed to set default card.");
    }
  };

  const removeMethod = async (id: string) => {
    if (!confirm("Remove this payment method?")) return;
    try {
      const r = await fetch(`/api/billing/methods/${encodeURIComponent(id)}/delete`, { method: "DELETE" });
      if (!r.ok) throw new Error(String(r.status));
      await loadMethods();
    } catch {
      alert("Failed to remove card.");
    }
  };

  // Ana sayfa akışına uygun: price_id ile plan değiştir
  const changePlan = async (target: PlanInfo) => {
    const priceId = envPriceId(target.price_id_env);
    if (!priceId) {
      alert(`Missing env: ${target.price_id_env}`);
      return;
    }
    const label = `${target.name} (${money(target.price_pennies, "GBP")}/${target.interval})`;
    if (!confirm(`Switch your subscription to ${label}? Proration may apply.`)) return;

    setBusyAction("change");
    try {
      const r = await fetch("/api/billing/plan/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_id: priceId }),
      });
      if (!r.ok) throw new Error(String(r.status));
      await loadSubscription();
      await loadInvoices(); // olası pro-rata fatura için
    } catch {
      alert("Failed to change plan.");
    } finally {
      setBusyAction(null);
    }
  };

  const cancelAtPeriodEnd = async () => {
    if (!confirm("Cancel at the end of current period?")) return;
    setBusyAction("cancel");
    try {
      const r = await fetch("/api/billing/subscription/cancel", { method: "POST" });
      if (!r.ok) throw new Error(String(r.status));
      await loadSubscription();
    } catch {
      alert("Failed to schedule cancellation.");
    } finally {
      setBusyAction(null);
    }
  };

  const resumeSubscription = async () => {
    setBusyAction("resume");
    try {
      const r = await fetch("/api/billing/subscription/resume", { method: "POST" });
      if (!r.ok) throw new Error(String(r.status));
      await loadSubscription();
    } catch {
      alert("Failed to resume subscription.");
    } finally {
      setBusyAction(null);
    }
  };

  /* ------------------------------ Render ------------------------------ */

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6
                        border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl sm:text-2xl font-semibold">Billing</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { loadInvoices(); loadMethods(); loadSubscription(); loadCharges(); }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300
                           bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/20"
              >
                <RefreshCw className={`w-4 h-4 ${loading || pmLoading || subLoading || chgLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-indigo-300
                           bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                           dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-400/30"
              >
                <PlusCircle className="w-4 h-4" />
                Add card
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg text-sm border bg-gray-50 text-gray-700
                             dark:bg-white/10 dark:text-white dark:border-white/15">
              Total invoices: <b>{invoices.length}</b>
            </span>
            <span className="px-3 py-1.5 rounded-lg text-sm border bg-amber-50 text-amber-800
                             dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30">
              Due: <b>{money(totalDue, "GBP")}</b>
            </span>
          </div>
        </div>

        {/* GRID: Subscription + Methods + Invoices */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Subscription card */}
          <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6
                          border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-fuchsia-500" />
                <h3 className="text-lg font-semibold">Subscription</h3>
              </div>
            </div>

            {subErr && (
              <div className="mt-3 text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                              dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
                {subErr}
              </div>
            )}

            {subLoading ? (
              <div className="mt-4 h-28 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 animate-pulse" />
            ) : sub ? (
              <>
                <div className="mt-3 rounded-xl border p-4 bg-gray-50 text-gray-900
                                border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10">
                  <div className="text-sm">Current plan</div>
                  <div className="mt-1 text-lg font-semibold">
                    {currentPlan?.name ?? (sub.plan_id ? sub.plan_id.toUpperCase() : "—")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-white/70">
                    {currentPlan ? `${money(currentPlan.price_pennies, "GBP")}/${currentPlan.interval}` : "—"}
                    {currentPlan?.vat_note ? ` • ${currentPlan.vat_note}` : ""}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <CalendarClock className="w-4 h-4 text-indigo-500" />
                    Next renewal: <b className="ml-1">{fmtDate(sub.current_period_end)}</b>
                  </div>
                  {sub.cancel_at_period_end && (
                    <div className="mt-2 text-xs rounded-md px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200
                                    dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30">
                      Cancellation scheduled at the end of the period.
                    </div>
                  )}
                </div>

                {/* Plan chooser (Monthly vs Annual) */}
                <div className="mt-4 space-y-3">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-fuchsia-500" />
                    Change plan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLANS.map(p => {
                      const active = currentPlan?.id === p.id;
                      const badge = p.badge ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          <BadgePercent className="w-3 h-3" /> {p.badge}
                        </span>
                      ) : null;

                      return (
                        <button
                          key={p.id}
                          onClick={() => !active && changePlan(p)}
                          disabled={active || busyAction === "change"}
                          className={[
                            "rounded-xl border p-3 text-left transition",
                            active
                              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-400/30"
                              : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10",
                          ].join(" ")}
                          title={active ? "Current plan" : "Switch to this plan"}
                        >
                          <div className="font-semibold flex items-center">
                            {p.name} {badge}
                          </div>
                          <div className="text-sm opacity-80">
                            {money(p.price_pennies, "GBP")}/{p.interval}
                            {p.vat_note ? ` • ${p.vat_note}` : ""}
                          </div>
                          <ul className="mt-2 text-xs opacity-80 list-disc pl-4">
                            {p.features.slice(0, 4).map(f => <li key={f}>{f}</li>)}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cancel / Resume */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {!sub.cancel_at_period_end && sub.status === "ACTIVE" ? (
                    <button
                      onClick={cancelAtPeriodEnd}
                      disabled={busyAction === "cancel"}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border
                                 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100
                                 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Cancel at period end
                    </button>
                  ) : (
                    <button
                      onClick={resumeSubscription}
                      disabled={busyAction === "resume"}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border
                                 border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700
                                 dark:border-emerald-400/30"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Resume subscription
                    </button>
                  )}
                  <div className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border
                                  bg-white text-gray-700 border-gray-200
                                  dark:bg-white/5 dark:text-white dark:border-white/10">
                    <Info className="w-3.5 h-3.5" />
                    Changes prorate automatically.
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 text-sm text-gray-600 dark:text-white/70">
                No active subscription.
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6
                          border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment methods</h3>
            </div>

            {pmErr && (
              <div className="mt-3 text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                              dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
                {pmErr}
              </div>
            )}

            {pmLoading ? (
              <div className="mt-4 space-y-3">
                {[1,2].map(k => (
                  <div key={k} className="h-16 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : methods.length === 0 ? (
              <div className="mt-4 text-sm text-gray-600 dark:text-white/70">
                No payment methods. Click <b>Add card</b> to attach one.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {methods.map(m => (
                  <li key={m.id} className="rounded-xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {m.brand || "card"} •••• {m.last4}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-white/60">
                        Expires {String(m.exp_month).padStart(2,"0")}/{String(m.exp_year).slice(-2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.is_default ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border
                                         bg-emerald-50 text-emerald-700 border-emerald-200
                                         dark:bg-emerald-500/10 dark:text-emerald-200">
                          <Star className="w-3.5 h-3.5" /> Default
                        </span>
                      ) : (
                        <button
                          onClick={() => setDefault(m.id)}
                          className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50
                                     dark:bg-white/10 dark:border-white/20"
                        >
                          Make default
                        </button>
                      )}
                      <button
                        onClick={() => removeMethod(m.id)}
                        className="px-2 py-1 text-xs rounded-md border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100
                                   dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200"
                        title="Remove card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Invoices (span 1 on xl:2) */}
          <div className="xl:col-span-2 rounded-2xl border bg-white text-gray-900 shadow-sm p-6
                          border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invoices</h3>
            </div>

            {err && (
              <div className="mt-3 text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                              dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
                {err}
              </div>
            )}

            {loading ? (
              <div className="mt-4 space-y-3">
                {[1,2,3].map(k => (
                  <div key={k} className="h-14 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg:white/5 animate-pulse" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="mt-4 text-sm text-gray-600 dark:text-white/70">
                No invoices yet.
              </div>
            ) : (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/70 dark:bg-white/5">
                    <tr>
                      <th className="p-3 text-left">Invoice</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Period</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-t border-gray-200 dark:border-white/10">
                        <td className="p-3">
                          <div className="font-medium">{inv.id}</div>
                          {inv.description ? (
                            <div className="text-xs text-gray-500 dark:text-white/60">{inv.description}</div>
                          ) : null}
                        </td>
                        <td className="p-3">{fmtDate(inv.date)}</td>
                        <td className="p-3">
                          {inv.period?.from || inv.period?.to
                            ? `${fmtDate(inv.period?.from)} – ${fmtDate(inv.period?.to)}`
                            : "—"}
                        </td>
                        <td className="p-3">{money(inv.amount_pennies, inv.currency)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${invBadge(inv.status)}`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          {inv.pdf_url ? (
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border
                                         border-gray-300 bg-white hover:bg-gray-50 text-xs
                                         dark:bg-white/10 dark:border-white/20"
                            >
                              <Download className="w-4 h-4" /> PDF
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-white/60">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Paid
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-4 h-4 text-rose-500" /> Failed
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT HISTORY (charges) */}
        <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6
                        border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold">Payment history</h3>
            </div>
          </div>

          {chgErr && (
            <div className="mt-3 text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                            dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
              {chgErr}
            </div>
          )}

          {chgLoading ? (
            <div className="mt-4 space-y-3">
              {[1,2,3,4].map(k => (
                <div key={k} className="h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : charges.length === 0 ? (
            <div className="mt-4 text-sm text-gray-600 dark:text-white/70">
              No payments yet.
            </div>
          ) : (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 dark:bg-white/5">
                  <tr>
                    <th className="p-3 text-left">Charge</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c) => (
                    <tr key={c.id} className="border-t border-gray-200 dark:border-white/10">
                      <td className="p-3">
                        <div className="font-medium">{c.description || "Subscription charge"}</div>
                        <div className="text-xs text-gray-500 dark:text-white/60">{c.id}</div>
                      </td>
                      <td className="p-3">{fmtDate(c.created)}</td>
                      <td className="p-3">{money(c.amount_pennies, c.currency)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${chargeBadge(c.status)}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        {c.receipt_url ? (
                          <a
                            href={c.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border
                                       border-gray-300 bg-white hover:bg-gray-50 text-xs
                                       dark:bg-white/10 dark:border-white/20"
                          >
                            Receipt
                          </a>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD CARD modal */}
        {addOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAddOpen(false)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-5 text-gray-900
                            dark:bg-[#0b1220] dark:text-white dark:border-white/15">
              <h4 className="text-lg font-semibold">Add new card</h4>

              <div className="mt-4 grid gap-3">
                <input
                  className="px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10"
                  placeholder="Card number"
                  value={card.number}
                  onChange={(e) => setCard(c => ({ ...c, number: e.target.value }))}
                  inputMode="numeric"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10"
                    placeholder="MM/YY"
                    value={card.exp}
                    onChange={(e) => setCard(c => ({ ...c, exp: e.target.value }))}
                    inputMode="numeric"
                  />
                  <input
                    className="px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10"
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={(e) => setCard(c => ({ ...c, cvc: e.target.value }))}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setAddOpen(false)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50
                             dark:bg-white/10 dark:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={addCard}
                  disabled={adding}
                  className="px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700
                             disabled:opacity-60"
                >
                  {adding ? "Saving…" : "Save card"}
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-white/60">
                Cards are securely stored by our payment processor. Do not share your card details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
