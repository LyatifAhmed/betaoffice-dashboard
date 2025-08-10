// components/layout/DetailsArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.json();
};

function normalizeCompany(data: any) {
  const d = data || {};
  return {
    name: d.company_name ?? d.name ?? d.legal_name ?? "—",
    number: d.company_number ?? d.registration_number ?? d.reg_no ?? "—",
    incorporationDate: d.incorporation_date ?? d.incorp_date ?? d.created_at ?? null,
    // ✅ parantez eklendi: ?? ile || karışımı
    address:
      d.registered_address ??
      d.address ??
      ((([d.address_line1, d.address_line2, d.city, d.postcode ?? d.zip, d.country]
        .filter(Boolean)
        .join(", ")) as string) || "—"),
    director: d.director ?? d.director_name ?? d.primary_contact ?? d.owner ?? "—",
    serviceActive: Boolean(d.service_active ?? d.active ?? true),
    walletBalance: Number(d.wallet_balance ?? d.balance ?? 0),
  };
}

async function postNoBody(url: string) {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res;
}
async function postJSON(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res;
}

export default function DetailsArea() {
  const [externalId, setExternalId] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>("25");
  const [busy, setBusy] = useState<"start" | "stop" | "topup" | "cert" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setExternalId(localStorage.getItem("external_id"));
  }, []);

  const detailsUrl = useMemo(() => {
    if (!externalId) return null;
    return `${API}/company?external_id=${encodeURIComponent(externalId)}`;
  }, [externalId]);

  const { data, isLoading, error, mutate } = useSWR(detailsUrl, fetcher, { revalidateOnFocus: false });
  const company = useMemo(() => normalizeCompany(data), [data]);

  const fmtDate = (v: any) => {
    if (!v) return "—";
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? String(v) : dt.toLocaleDateString();
  };

  const handleStart = async () => {
    if (!externalId) return;
    try {
      setBusy("start");
      await postNoBody(`${API}/service/start?external_id=${encodeURIComponent(externalId)}`);
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Start failed");
    } finally {
      setBusy(null);
    }
  };

  const handleStop = async () => {
    if (!externalId) return;
    try {
      setBusy("stop");
      await postNoBody(`${API}/service/stop?external_id=${encodeURIComponent(externalId)}`);
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Stop failed");
    } finally {
      setBusy(null);
    }
  };

  const handleTopup = async () => {
    if (!externalId) return;
    const amount = Number(topupAmount);
    if (!isFinite(amount) || amount <= 0) return alert("Please enter a valid amount");
    try {
      setBusy("topup");
      await postJSON(`${API}/wallet/topup`, { external_id: externalId, amount });
      setTopupOpen(false);
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Top-up failed");
    } finally {
      setBusy(null);
    }
  };

  const handleCertificate = async () => {
  if (!externalId) return;
  try {
    setBusy("cert");
    const res = await fetch(`${API}/company/cert-letter?external_id=${encodeURIComponent(externalId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    if (blob.type.includes("pdf") && blob.size > 0) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `address-certificate-${externalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      throw new Error("Invalid PDF file");
    }
  } catch (e) {
    console.error(e);
    alert("Could not download certificate PDF");
  } finally {
    setBusy(null);
  }
};


  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">📄 Company Details</h2>

            <div className="flex flex-wrap gap-2">
              {company.serviceActive ? (
                <Button
                  variant="secondary"
                  onClick={handleStop}
                  disabled={busy === "stop"}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/20"
                >
                  {busy === "stop" ? "Stopping…" : "Stop"}
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={busy === "start"}
                  className="bg-emerald-500/80 hover:bg-emerald-500 text-white"
                >
                  {busy === "start" ? "Starting…" : "Start"}
                </Button>
              )}

              <Button
                onClick={() => setTopupOpen(true)}
                disabled={busy === "topup"}
                className="bg-indigo-500/80 hover:bg-indigo-500 text-white"
              >
                Top up wallet
              </Button>

              <Button
                onClick={handleCertificate}
                disabled={busy === "cert"}
                className="bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white"
              >
                {busy === "cert" ? "Preparing PDF…" : "Certificate (PDF)"}
              </Button>
            </div>
          </div>

          {!externalId && (
            <p className="text-sm text-amber-200/90">
              external_id not found. Make sure
              <code className="mx-1 px-1 rounded bg-black/30">external_id</code> is stored in localStorage during the login/connection flow.
            </p>

          )}

          {isLoading && <p className="text-sm text-white/80">Loading company details…</p>}
          {error && <p className="text-sm text-red-200">Failed to load: {(error as Error).message}</p>}

          {!isLoading && !error && (
            <>
              <div className="text-sm text-white/80">
                This section shows your company information pulled from the backend.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">Service status</div>
                  <div className="text-base mt-1 font-semibold text-white">
                    {company.serviceActive ? "Active" : "Stopped"}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">Wallet balance</div>
                  <div className="text-base mt-1 font-semibold text-white">£{company.walletBalance.toFixed(2)}</div>
                </div>
              </div>

              <ul className="text-sm text-white/70 space-y-1 pl-4 list-disc">
                <li>Company Name: <strong>{company.name}</strong></li>
                <li>Incorporation Date: <strong>{fmtDate(company.incorporationDate)}</strong></li>
                <li>Company Number: <strong>{company.number}</strong></li>
                <li>Registered Address: <strong>{company.address}</strong></li>
                <li>Director: <strong>{company.director}</strong></li>
              </ul>
            </>
          )}
        </div>
      </div>

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
              This will create a top-up for your wallet. You can use it for future mail actions.
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
