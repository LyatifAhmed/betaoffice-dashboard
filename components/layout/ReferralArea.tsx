// components/layout/ReferralArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2, QrCode, RefreshCw, Info } from "lucide-react";

type Summary = {
  code: string;
  clicks: number;
  signups: number;
  earnings_pennies: number;
  created_at?: string;
  month_clicks?: number;
  month_signups?: number;
  month_earnings_pennies?: number;
};

const fmtMoney = (pennies: number) => `£${((pennies ?? 0) / 100).toFixed(2)}`;

export default function ReferralArea() {
  const [externalId, setExternalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
      setExternalId(m ? decodeURIComponent(m[1]) : localStorage.getItem("external_id"));
    }
  }, []);

  const base = useMemo(() => {
    if (typeof window === "undefined") return "https://betaoffice.io";
    return `${location.protocol}//${location.host}`;
  }, []);

  const link = useMemo(() => {
    if (!summary?.code) return "";
    return `${base}/r/${summary.code}`;
  }, [summary?.code, base]);

  const shareUrl = useMemo(() => {
    if (!link) return "";
    const url = new URL(link);
    url.searchParams.set("utm_source", "referral");
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "member_referral");
    return url.toString();
  }, [link]);

  const load = async () => {
    if (!externalId) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/referral?external_id=${encodeURIComponent(externalId)}`, { cache: "no-store" });
      if (r.ok) setSummary(await r.json());
      else if (r.status === 404) setSummary(null);
      else throw new Error(`${r.status}`);
    } catch (e: any) {
      setError("Failed to load referral data");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalId) load();
  }, [externalId]);

  const generate = async () => {
    if (!externalId) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/referral/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: externalId }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const d = await r.json();
      setSummary({ code: d.code, clicks: 0, signups: 0, earnings_pennies: 0 });
    } catch (e) {
      console.error(e);
      setError("Could not generate link");
    } finally {
      setLoading(false);
    }
  };

  // “Reset link (advanced)” — günlük akışta kullanma
  const resetLink = async () => {
    if (!externalId) return;
    const ok = confirm(
      "Resetting your link can BREAK older shares.\n\nOnly do this if your code leaked or you must rotate it.\n\nContinue?"
    );
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/referral/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: externalId }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const d = await r.json();
      setSummary((s) => ({ ...(s ?? { clicks: 0, signups: 0, earnings_pennies: 0 }), code: d.code }));
    } catch (e) {
      console.error(e);
      setError("Could not reset link");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    const payload = { title: "Join me on BetaOffice", text: "Use my referral link to get a virtual office in minutes.", url: shareUrl };
    // @ts-ignore
    if (navigator.share) { try { /* @ts-ignore */ await navigator.share(payload); } catch {} }
    else { copy(); alert("Link copied"); }
  };

  const SocialButtons = () => {
    if (!shareUrl) return null;
    const enc = encodeURIComponent;
    const text = enc("Use my link to get a premium virtual office in minutes →");
    const wapp = `https://wa.me/?text=${text}%20${enc(shareUrl)}`;
    const twitter = `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${text}`;
    const telegram = `https://t.me/share/url?url=${enc(shareUrl)}&text=${text}`;
    const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
    return (
      <div className="flex flex-wrap gap-2">
        <a className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-white/10" href={wapp} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-white/10" href={twitter} target="_blank" rel="noreferrer">X / Twitter</a>
        <a className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-white/10" href={telegram} target="_blank" rel="noreferrer">Telegram</a>
        <a className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg:white/10" href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg:white/10" href={facebook} target="_blank" rel="noreferrer">Facebook</a>
      </div>
    );
  };

  const milestoneTarget = 3;
  const milestoneProgress = Math.min(100, Math.round(((summary?.signups ?? 0) / milestoneTarget) * 100));

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        {/* CARD: Referral Program */}
        <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6 space-y-5
                        border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold">Referral Program</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] border border-emerald-300/50 bg-emerald-50 text-emerald-700
                                 dark:bg-emerald-500/10 dark:text-emerald-200">Earn & withdraw</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-white/70">
                Reward is added after your friend pays and becomes ACTIVE (KYC complete).
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={load} variant="outline" className="border-gray-300 dark:border-white/20">Refresh</Button>
              {summary?.code ? (
                <Button onClick={resetLink} disabled={loading} variant="outline" className="gap-2 border-gray-300 dark:border-white/20">
                  <RefreshCw size={16} />
                  Reset link (advanced)
                </Button>
              ) : (
                <Button onClick={generate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Generate my referral link
                </Button>
              )}
            </div>
          </div>

          {/* Link + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-1 rounded-lg px-4 py-2 font-mono text-sm bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
              {shareUrl || "Your referral link will appear here"}
            </div>
            <div className="flex gap-2">
              <Button onClick={copy} variant="outline" className="gap-2 border-gray-300 dark:border-white/20">
                <Copy size={16} />{copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={nativeShare} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Share2 size={16} />Share
              </Button>
              {summary?.code ? (
                <Button onClick={() => setShowQR(true)} variant="outline" className="gap-2 border-gray-300 dark:border-white/20">
                  <QrCode size={16} />QR
                </Button>
              ) : null}
            </div>
          </div>

          {/* Social quick share */}
          <SocialButtons />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat title="Clicks" value={summary?.clicks ?? 0} />
            <Stat title="Signups" value={summary?.signups ?? 0} />
            <Stat title="Conversion" value={summary && summary.clicks > 0 ? `${Math.round((summary.signups / Math.max(1, summary.clicks)) * 100)}%` : "—"} />
            <Stat title="Total earnings" value={fmtMoney(summary?.earnings_pennies ?? 0)} />
            <Stat title="This month" value={
              summary?.month_signups != null || summary?.month_earnings_pennies != null
                ? `${summary?.month_signups ?? 0} · ${fmtMoney(summary?.month_earnings_pennies ?? 0)}`
                : "—"
            } />
          </div>

          {/* Milestone */}
          <div className="rounded-xl p-4 border bg-gray-50 text-gray-900 border-gray-200 dark:bg:white/5 dark:text-white dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Milestone</span>
              <span className="text-xs text-gray-500 dark:text-white/60">First {milestoneTarget} signups → £20 bonus</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div className="h-2 bg-emerald-500 dark:bg-emerald-400" style={{ width: `${milestoneProgress}%` }} />
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-white/70">{summary?.signups ?? 0}/{milestoneTarget} completed</div>
          </div>

          {/* Tips */}
          <div className="rounded-xl p-4 border bg-white text-gray-900 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium"><Info size={16} /><span>Pro tips to boost conversions</span></div>
            <ul className="mt-2 text-sm list-disc pl-5 text-gray-600 dark:text-white/70 space-y-1">
              <li>Add the link to your Instagram bio & Linktree.</li>
              <li>Post a short “how it works” reel and pin it.</li>
              <li>Share the QR at events or on your business card.</li>
              <li>Mention the benefit: “address privacy + instant setup”.</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="rounded-xl p-3 border bg-amber-50 text-amber-900 text-sm border-amber-200
                          dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/30">
            Resetting your link can break old posts. Use only if your code leaked.
          </div>

          {error && (
            <div className="text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200
                            dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
              {error}
            </div>
          )}

          {/* Simple QR modal */}
          {showQR && summary?.code ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowQR(false)} />
              <div className="relative z-10 w-[320px] rounded-2xl border bg-white p-5 text-gray-900
                              dark:bg-[#0b1220] dark:text-white dark:border-white/15">
                <div className="text-sm font-medium mb-3">Scan to join</div>
                <QR value={shareUrl} size={256} />
                <div className="mt-3 text-xs break-all opacity-80">{shareUrl}</div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setShowQR(false)} className="border-gray-300 dark:border-white/20">Close</Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* CARD: Custom Links (vanity) */}
        <CustomLinksCard externalId={externalId} base={base} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4 bg-gray-50 text-gray-900 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/60">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

/** Minimal QR via external generator (proxylemen önerilir) */
function QR({ value, size = 192 }: { value: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&qzone=2&data=${encodeURIComponent(value)}`;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 w-max">
      <img src={src} width={size} height={size} alt="QR" />
    </div>
  );
}

/* -------------------- Custom Links Card (with Kill) -------------------- */

type CustomLinkRow = {
  id: number;
  slug: string;
  campaign?: string | null;
  active: boolean;
  total_clicks: number;
  paid_clicks?: number;
  created_at?: string;
  revoked_at?: string | null;
};

function CustomLinksCard({ externalId, base }: { externalId: string | null; base: string }) {
  const [links, setLinks] = useState<CustomLinkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const [campaign, setCampaign] = useState("");

  const load = async () => {
    if (!externalId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/referral/custom-links?owner=${encodeURIComponent(externalId)}`, { cache: "no-store" });
      if (r.ok) setLinks(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [externalId]);

  const create = async () => {
    if (!externalId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/referral/custom-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner_external_id: externalId, slug: slug || undefined, campaign: campaign || undefined }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      setSlug(""); setCampaign("");
      await load();
    } catch (e) {
      alert("Could not create custom link");
      console.error(e);
    } finally { setLoading(false); }
  };

  const toggleActive = async (id: number, next: boolean) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/referral/custom-link`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, active: next }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      await load();
    } catch (e) {
      alert("Failed to update link");
    } finally { setLoading(false); }
  };

  const kill = async (id: number) => {
    const ok = confirm("Kill this link permanently? Old posts will stop working immediately.");
    if (!ok) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/referral/custom-link`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, revoke: true, reason: "owner_request" }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      await load();
    } catch (e) {
      alert("Failed to kill link");
      console.error(e);
    } finally { setLoading(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this custom link? This may break old posts.")) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/referral/custom-link`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      await load();
    } catch (e) {
      alert("Failed to delete link");
    } finally { setLoading(false); }
  };

  const full = (slug: string) => `${base}/r/${slug}`;

  return (
    <div className="rounded-2xl border bg-white text-gray-900 shadow-sm p-6 space-y-5 border-gray-200 dark:bg-[#0b1220] dark:text-white dark:border-white/15">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">Custom Links</h3>
          <p className="text-sm text-gray-600 dark:text-white/70">Create name-based links (e.g. influencers) and track each separately.</p>
        </div>
        <Button onClick={load} variant="outline" className="border-gray-300 dark:border-white/20">Refresh</Button>
      </div>

      {/* Create form */}
      <div className="rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 p-4">
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10"
                 placeholder="slug (optional, e.g. sena)"
                 value={slug} onChange={(e)=>setSlug(e.target.value)} />
          <input className="px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10"
                 placeholder="campaign (optional)"
                 value={campaign} onChange={(e)=>setCampaign(e.target.value)} />
          <Button onClick={create} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Create custom link
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-600 dark:text-white/60">
          Leave <span className="font-semibold">slug</span> empty to auto-generate. Each link redirects with UTM tags.
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50/70 dark:bg-white/5">
              <th className="p-3">Link</th>
              <th className="p-3">Campaign</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-gray-500 dark:text-white/60">No custom links yet.</td></tr>
            ) : links.map((l) => (
              <tr key={l.id} className="border-t border-gray-200 dark:border-white/10">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono break-all ${l.revoked_at ? "line-through opacity-60" : ""}`}>{full(l.slug)}</span>
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(full(l.slug))}
                            className="px-2 py-1 h-8 text-xs border-gray-300 dark:border-white/20" disabled={Boolean(l.revoked_at)}>
                      Copy
                    </Button>
                  </div>
                </td>
                <td className="p-3">{l.campaign || "—"}</td>
                <td className="p-3">{l.paid_clicks != null ? `${l.paid_clicks} / ${l.total_clicks}` : l.total_clicks}</td>
                <td className="p-3">
                  {l.revoked_at ? (
                    <span className="px-2 py-0.5 rounded-full text-xs border bg-rose-50 text-rose-700 border-rose-200
                                     dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/30">
                      Killed
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-xs border
                      ${l.active ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200"
                                 : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-white/60"}`}>
                      {l.active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {!l.revoked_at && (
                      <>
                        <Button variant="outline" className="h-8 text-xs border-gray-300 dark:border-white/20"
                                onClick={() => toggleActive(l.id, !l.active)}>
                          {l.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="outline" className="h-8 text-xs border-rose-300 text-rose-700 dark:border-rose-400/50 dark:text-rose-300"
                                onClick={() => kill(l.id)}>
                          Kill
                        </Button>
                      </>
                    )}
                    <Button variant="outline" className="h-8 text-xs border-gray-300 dark:border-white/20"
                            onClick={() => del(l.id)} disabled={Boolean(l.revoked_at)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-600 dark:text-white/60">
        Tip: Use different slugs per channel (e.g. <span className="font-mono">/r/sena</span>, <span className="font-mono">/r/sena-yt</span>) to compare performance.
      </div>
    </div>
  );
}
