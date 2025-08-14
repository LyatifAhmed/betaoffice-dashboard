// components/layout/DetailsArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WithdrawDialog from "@/components/wallet/WithdrawDialog";

/** Next API proxy helper */
const backend = (path: string) => `/api/backend${path}`;

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.json();
};

function pickAddressLike(d: any, base?: string) {
  if (typeof base === "string" && base.trim()) return base;
  const parts = [
    d?.address_line1,
    d?.address_line2,
    d?.city,
    d?.postcode ?? d?.zip,
    d?.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : d?.registered_address ?? d?.address ?? "—";
}

function pickForwardingAddress(d: any) {
  // farklı backend adları için esnek alan seçimi
  const direct =
    d?.forwarding_address ??
    d?.mailing_address ??
    d?.shipping_address ??
    d?.forward_address ??
    d?.mail_forward_address;
  if (typeof direct === "string" && direct.trim()) return direct;

  const lineParts = [
    d?.forward_address_line1 ?? d?.mailing_address_line1,
    d?.forward_address_line2 ?? d?.mailing_address_line2,
    d?.forward_city ?? d?.mailing_city,
    d?.forward_postcode ?? d?.mailing_postcode ?? d?.mailing_zip,
    d?.forward_country ?? d?.mailing_country,
  ].filter(Boolean);
  return lineParts.length ? lineParts.join(", ") : null;
}

function normalizeCompany(data: any) {
  const d = data || {};
  const name = d.company_name ?? d.name ?? d.legal_name ?? "—";
  const number = d.company_number ?? d.registration_number ?? d.reg_no ?? "—";
  const incorporationDate = d.incorporation_date ?? d.incorp_date ?? d.created_at ?? null;
  const address = pickAddressLike(d, d.registered_address);
  const forwardingAddress = pickForwardingAddress(d);
  const walletBalance = Number(d.wallet_balance ?? d.balance ?? 0);

  return {
    name,
    number,
    incorporationDate,
    address,
    forwardingAddress,
    walletBalance,
  };
}

async function postJSON(url: string, body?: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res;
}

export default function DetailsArea() {
  const [externalId, setExternalId] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>("25");
  const [busy, setBusy] = useState<"topup" | "cert" | null>(null);

  // virtual office address (kartvizit kartında gösterilecek sabit metin)
  const VIRTUAL_OFFICE_ADDR = "86-90 Paul Street\nLondon EC2A 4NE, UK";

  // external_id: cookie -> localStorage
  useEffect(() => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]) : null;
      const fromLS = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
      setExternalId(fromCookie || fromLS);
    }
  }, []);

  // Company / wallet
  const companyUrl = useMemo(() => {
    if (!externalId) return null;
    return backend(`/company?external_id=${encodeURIComponent(externalId)}`);
  }, [externalId]);
  const {
    data: companyRaw,
    isLoading: loadingCompany,
    error: companyErr,
    mutate: mutateCompany,
  } = useSWR(companyUrl, fetcher, { revalidateOnFocus: false });
  const company = useMemo(() => normalizeCompany(companyRaw), [companyRaw]);

  const fmtDate = (v: any) => {
    if (!v) return "—";
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? String(v) : dt.toLocaleDateString();
  };

  // Actions
  const handleTopup = async () => {
    if (!externalId) return;
    const amount = Number(topupAmount);
    if (!isFinite(amount) || amount <= 0) return alert("Please enter a valid amount.");
    try {
      setBusy("topup");
      await postJSON(backend(`/wallet/topup`), { external_id: externalId, amount });
      setTopupOpen(false);
      await mutateCompany();
    } catch (e) {
      console.error(e);
      alert("Top-up failed.");
    } finally {
      setBusy(null);
    }
  };

  const handleCertificate = async () => {
    if (!externalId) return;
    try {
      setBusy("cert");
      const res = await fetch(
        backend(`/company/cert-letter?external_id=${encodeURIComponent(externalId)}`)
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.type.includes("pdf") || blob.size === 0) throw new Error("Invalid PDF file");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `address-certificate-${externalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not download certificate PDF.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        <div
          className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6 space-y-6
                     border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15"
        >
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Company & Details</h2>
              <p className="text-sm text-gray-600 dark:text-white/70">
                Manage wallet, view your addresses and download your certificate. Subscription
                changes (cancel/restart) are available in the <span className="font-semibold">Billing</span> tab.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setTopupOpen(true)}
                disabled={busy === "topup"}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Top up wallet
              </Button>

              <Button
                onClick={() => setWithdrawOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Withdraw
              </Button>

              <Button
                onClick={handleCertificate}
                disabled={busy === "cert"}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              >
                {busy === "cert" ? "Preparing PDF…" : "Certificate (PDF)"}
              </Button>
            </div>
          </div>

          {/* Warnings / Errors */}
          {!externalId && (
            <div
              className="text-sm rounded-md px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200
                         dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30"
            >
              <span className="font-medium">external_id</span> not found. Make sure it is stored during login.
            </div>
          )}
          {companyErr && (
            <div
              className="text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                         dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30"
            >
              Failed to load details.
            </div>
          )}

          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat title="Wallet balance" value={`£${company.walletBalance.toFixed(2)}`} />
            <Stat title="Company number" value={company.number} />
            <Stat title="Incorporation date" value={fmtDate(company.incorporationDate)} />
          </div>

          {/* Addresses */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"
          >
            {/* Registered + Forwarding (standard card) */}
            <div
              className="rounded-xl border p-4 bg-gray-50 text-gray-900
                         border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10
                         lg:col-span-2"
            >
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="md:col-span-2">
                  <dt className="text-gray-500 dark:text-white/60">Registered address</dt>
                  <dd className="font-medium whitespace-pre-line">{company.address}</dd>
                </div>

                <div className="md:col-span-2">
                  <dt className="text-gray-500 dark:text-white/60">Forwarding address</dt>
                  <dd className="font-medium whitespace-pre-line">
                    {company.forwardingAddress ?? "—"}
                  </dd>
                </div>
              </dl>
              {loadingCompany && (
                <div className="text-sm text-gray-600 dark:text-white/70 mt-3">Loading details…</div>
              )}
            </div>

            {/* Virtual office – premium business card */}
            <VirtualAddressCard address={VIRTUAL_OFFICE_ADDR} />
          </div>
        </div>
      </div>

      {/* Top-up dialog */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Top up wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (GBP)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="1"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="25"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Funds will be added to your wallet for future mail actions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setTopupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTopup} disabled={busy === "topup"}>
              {busy === "topup" ? "Processing…" : "Top up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        balanceGBP={company.walletBalance || 0}
        guessCountry={company.address}
        onSuccess={() => {
          // withdraw sonrası bakiyeyi tazele
          mutateCompany();
        }}
      />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div
      className="rounded-xl border p-4 bg-gray-50 text-gray-900
                 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10"
    >
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/60">
        {title}
      </div>
      <div className="text-base mt-1 font-semibold">{value}</div>
    </div>
  );
}

/** Parıltı yansıma efektli premium kartvizit görünümlü virtual office kartı */
function VirtualAddressCard({ address }: { address: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(120%_160%_at_50%_-20%,rgba(236,72,153,0.25),rgba(79,70,229,0.25)_35%,rgba(2,6,23,0.85)_62%,rgba(2,6,23,0.95)_100%)] shadow-[0_20px_60px_rgba(79,70,229,0.25)] backdrop-blur-xl text-white p-5">
      {/* parıltı/yansıma */}
      <div
        className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/15 blur-xl
                   translate-x-0 transition-transform duration-700 ease-out
                   group-hover:translate-x-[260%]"
      />
      {/* ince dış çizgi */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/15 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="text-[11px] uppercase tracking-widest text-fuchsia-200/90">
          Virtual Office
        </div>
        <div className="mt-1 text-lg font-semibold">BetaOffice — London</div>

        <pre className="mt-3 whitespace-pre-line text-sm text-white/90 font-sans leading-6">
{address}
        </pre>

        <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-white/70">
          <span>Premium business presence</span>
          <span>EC2A • Shoreditch</span>
        </div>
      </div>
    </div>
  );
}
