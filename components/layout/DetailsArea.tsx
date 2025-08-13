// components/layout/DetailsArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Next API proxy helper (you already use this pattern) */
const backend = (path: string) => `/api/backend${path}`;

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.json();
};

function normalizeCompany(data: any) {
  const d = data || {};
  const addrParts = [d.address_line1, d.address_line2, d.city, d.postcode ?? d.zip, d.country]
    .filter(Boolean)
    .join(", ");

  return {
    name: d.company_name ?? d.name ?? d.legal_name ?? "—",
    number: d.company_number ?? d.registration_number ?? d.reg_no ?? "—",
    incorporationDate: d.incorporation_date ?? d.incorp_date ?? d.created_at ?? null,
    address: d.registered_address ?? d.address ?? (addrParts || "—"),
    walletBalance: Number(d.wallet_balance ?? d.balance ?? 0),
  };
}

/** Map Hoxton / local statuses to a friendly tri-state */
function mapStatus(s: string | undefined): "NO_ID" | "ACTIVE" | "CANCELLED" | "UNKNOWN" {
  const v = String(s || "").toUpperCase();
  if (["NO_ID", "PENDING", "UNDER_REVIEW"].includes(v)) return "NO_ID";
  if (["ACTIVE", "ACTIVE_SUBSCRIPTION"].includes(v)) return "ACTIVE";
  if (["CANCELLED", "CANCELED"].includes(v)) return "CANCELLED";
  return "UNKNOWN";
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
  const [topupAmount, setTopupAmount] = useState<string>("25");
  const [busy, setBusy] = useState<"start" | "stop" | "topup" | "cert" | null>(null);
  const [scheduledInfo, setScheduledInfo] = useState<string | null>(null); // transient “scheduled cancel” note

  // external_id: cookie first, then localStorage
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
  const { data: companyRaw, isLoading: loadingCompany, error: companyErr, mutate: mutateCompany } =
    useSWR(companyUrl, fetcher, { revalidateOnFocus: false });
  const company = useMemo(() => normalizeCompany(companyRaw), [companyRaw]);

  // Subscription status (canonical source)
  const subUrl = useMemo(() => {
    if (!externalId) return null;
    return backend(`/subscription/${encodeURIComponent(externalId)}`);
  }, [externalId]);
  const { data: sub, isLoading: loadingSub, error: subErr, mutate: mutateSub } =
    useSWR(subUrl, fetcher, { revalidateOnFocus: false });

  const hoxtonStatus = mapStatus(sub?.hoxton_status ?? sub?.review_status ?? sub?.status);

  const fmtDate = (v: any) => {
    if (!v) return "—";
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? String(v) : dt.toLocaleDateString();
  };

  // Actions
  const handleStart = async () => {
    if (!externalId) return;
    try {
      setBusy("start");
      await postJSON(backend(`/subscription/${encodeURIComponent(externalId)}/start`));
      await Promise.all([mutateSub(), mutateCompany()]);
    } catch (e) {
      console.error(e);
      alert("Start failed.");
    } finally {
      setBusy(null);
    }
  };

  /** Cancel at period end (END_OF_TERM) */
  const handleCancelAtPeriodEnd = async () => {
    if (!externalId) return;
    try {
      setBusy("stop");
      await postJSON(backend(`/subscription/${encodeURIComponent(externalId)}/stop`), {
        end_date: "END_OF_TERM",
        reason: "User requested via dashboard",
      });
      setScheduledInfo("Cancellation scheduled at the end of the current period.");
      await mutateSub(); // status will likely remain ACTIVE until the end date
    } catch (e) {
      console.error(e);
      alert("Scheduling cancellation failed.");
    } finally {
      setBusy(null);
    }
  };

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
      const res = await fetch(backend(`/company/cert-letter?external_id=${encodeURIComponent(externalId)}`));
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

  const statusBadge = (() => {
    const base =
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border";
    if (hoxtonStatus === "ACTIVE")
      return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/30`}>ACTIVE</span>;
    if (hoxtonStatus === "NO_ID")
      return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30`}>NO ID</span>;
    if (hoxtonStatus === "CANCELLED")
      return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:border-rose-400/30`}>CANCELLED</span>;
    return <span className={`${base} bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-white/70 dark:border-white/15`}>—</span>;
  })();

  const statusHelp = (() => {
    switch (hoxtonStatus) {
      case "NO_ID":
        return "Your ID verification is not complete yet. Please finish IDV to activate your mail service.";
      case "ACTIVE":
        return scheduledInfo ?? "Your mail service is active.";
      case "CANCELLED":
        return "Your mail service is cancelled. You can restart anytime.";
      default:
        return "Service status is currently unavailable.";
    }
  })();

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6 space-y-6
                        border-gray-200
                        dark:bg-[#0b1220] dark:text-white dark:border-white/15">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Company & Subscription</h2>
              <div className="mt-1 flex items-center gap-2">
                {statusBadge}
                <span className="text-sm text-gray-600 dark:text-white/70">{statusHelp}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Buttons depend on Hoxton status */}
              {hoxtonStatus === "ACTIVE" && (
                <Button
                  onClick={handleCancelAtPeriodEnd}
                  disabled={busy === "stop"}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {busy === "stop" ? "Scheduling…" : "Cancel at period end"}
                </Button>
              )}

              {hoxtonStatus === "CANCELLED" && (
                <Button
                  onClick={handleStart}
                  disabled={busy === "start"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {busy === "start" ? "Starting…" : "Start"}
                </Button>
              )}

              {/* While NO_ID we don’t show start/stop; just allow wallet/cert */}
              <Button
                onClick={() => setTopupOpen(true)}
                disabled={busy === "topup"}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Top up wallet
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

          {/* Errors / Empty external_id */}
          {!externalId && (
            <div className="text-sm rounded-md px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200
                            dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30">
              <span className="font-medium">external_id</span> not found. Make sure it is stored during login.
            </div>
          )}
          {(companyErr || subErr) && (
            <div className="text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                            dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
              Failed to load details.
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat title="Wallet balance" value={`£${company.walletBalance.toFixed(2)}`} />
            <Stat title="Company number" value={company.number} />
          </div>

          {/* Essentials */}
          <div className="rounded-xl border p-4 bg-gray-50 text-gray-900
                          border-gray-200
                          dark:bg-white/5 dark:text-white dark:border-white/10">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-white/60">Company name</dt>
                <dd className="font-medium">{company.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-white/60">Incorporation date</dt>
                <dd className="font-medium">{fmtDate(company.incorporationDate)}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-white/60">Registered address</dt>
                <dd className="font-medium">{company.address}</dd>
              </div>
            </dl>
            {(loadingCompany || loadingSub) && (
              <div className="text-sm text-gray-600 dark:text-white/70 mt-3">Loading details…</div>
            )}
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
            <Button variant="secondary" onClick={() => setTopupOpen(false)}>Cancel</Button>
            <Button onClick={handleTopup} disabled={busy === "topup"}>
              {busy === "topup" ? "Processing…" : "Top up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 bg-gray-50 text-gray-900
                    border-gray-200
                    dark:bg-white/5 dark:text-white dark:border-white/10">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/60">
        {title}
      </div>
      <div className="text-base mt-1 font-semibold">{value}</div>
    </div>
  );
}
