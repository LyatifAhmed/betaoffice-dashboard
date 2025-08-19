// components/layout/DetailsArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

/* ---------- helpers ---------- */

const backend = (p: string) => `/api/backend${p}`;
const fetcher = async (url: string) => {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};

const ORG_LABEL: Record<number, string> = {
  1: "Limited company (LTD, LP, LLP, LLC, Corp)",
  3: "Individual / sole trader",
  9: "Unincorporated / not yet registered",
  10: "Charity / non-profit",
  12: "Trust, foundation or fund",
  13: "Association, club or society",
};

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

/* ---------- component ---------- */

export default function DetailsArea() {
  const [externalId, setExternalId] = useState<string | null>(null);

  // auth email dialog
  const [emailDlgOpen, setEmailDlgOpen] = useState(false);
  const [newAuthEmail, setNewAuthEmail] = useState("");

  // read external_id
  useEffect(() => {
    const m = typeof document !== "undefined"
      ? document.cookie.match(/(?:^|; )external_id=([^;]+)/)
      : null;
    const fromCookie = m ? decodeURIComponent(m[1]) : null;
    const fromLS = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
    setExternalId(fromCookie || fromLS);
  }, []);

  /* ---- load merged details (prefill source) ---- */
  const url = useMemo(() => (externalId ? backend(`/account-details/${encodeURIComponent(externalId)}`) : null), [externalId]);
  const { data, isLoading, mutate } = useSWR(url, fetcher, { revalidateOnFocus: false });

  // derived
  const company = data?.company ?? {};
  const contact = data?.contact ?? {};
  const forwarding = data?.forwarding ?? {};
  const notifications = data?.notifications ?? {};

  /* ---- local form state (prefilled) ---- */
  const [fContact, setFContact] = useState({ first_name: "", last_name: "", phone: "" });
  const [fForward, setFForward] = useState({ line1: "", line2: "", city: "", postcode: "", country: "GB" });
  const [fCompany, setFCompany] = useState({ name: "", trading_name: "", number: "", org_type: 1 });
  const [notifEmail, setNotifEmail] = useState<boolean>(true);

  useEffect(() => {
    if (!data) return;
    setFContact({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      phone: contact.phone || "",
    });
    setFForward({
      line1: forwarding.line1 || "",
      line2: forwarding.line2 || "",
      city: forwarding.city || "",
      postcode: forwarding.postcode || "",
      country: forwarding.country || "GB",
    });
    setFCompany({
      name: company.name || "",
      trading_name: company.trading_name || "",
      number: company.number || "",
      org_type: Number(company.org_type || 1),
    });
    setNotifEmail(Boolean(notifications.email ?? true));
  }, [data, contact, forwarding, company, notifications]);

  /* ---- actions ---- */
  const saveContact = async () => {
    if (!externalId) return;
    const res = await fetch(backend(`/account-details/${externalId}/contact`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fContact),
    });
    if (!res.ok) return toast.error("Could not update contact");
    toast.success("Contact updated");
    mutate();
  };

  const saveForwarding = async () => {
    if (!externalId) return;
    const res = await fetch(backend(`/account-details/${externalId}/forwarding`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fForward),
    });
    if (!res.ok) return toast.error("Could not update forwarding address");
    toast.success("Forwarding address updated");
    mutate();
  };

  const saveCompany = async () => {
    if (!externalId) return;
    const res = await fetch(backend(`/account-details/${externalId}/company`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fCompany),
    });
    if (!res.ok) return toast.error("Could not update company");
    toast.success("Company updated");
    mutate();
  };

  const saveNotif = async (val: boolean) => {
    if (!externalId) return;
    setNotifEmail(val);
    const res = await fetch(backend(`/account-details/${externalId}/notifications`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: val }),
    });
    if (!res.ok) {
      toast.error("Could not update notifications");
      setNotifEmail(!val);
    } else {
      toast.success("Notifications updated");
    }
  };

  const startAuthEmailChange = async () => {
    if (!externalId || !newAuthEmail) return;
    const res = await fetch(backend(`/account-details/${externalId}/auth-email/start`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_email: newAuthEmail }),
    });
    if (!res.ok) return toast.error("Could not start email change");
    toast.success("Verification email sent");
    setEmailDlgOpen(false);
    setNewAuthEmail("");
  };

  /* ---- UI ---- */
  if (!externalId) {
    return (
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <div className="rounded-xl border p-4 bg-amber-50 border-amber-200 text-amber-900">
          external_id not found. Please sign in again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
      {/* ---------- TOP: Business Settings (read-only summary) ---------- */}
      <section className="rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Business Settings</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="text-[12px] uppercase text-gray-500 dark:text-white/60">Legal Name</div>
            <div className="text-base font-semibold">{company.name || "—"}</div>
          </div>
          <div>
            <div className="text-[12px] uppercase text-gray-500 dark:textwhite/60">Trading Name</div>
            <div className="text-base font-semibold">{company.trading_name || company.name || "—"}</div>
          </div>
          <div>
            <div className="text-[12px] uppercase text-gray-500 dark:textwhite/60">Company Number</div>
            <div className="text-base font-semibold">#{company.number || "—"}</div>
          </div>
          <div>
            <div className="text-[12px] uppercase text-gray-500 dark:textwhite/60">Formation</div>
            <div className="text-base font-semibold">{fmtDate(data?.company?.incorporation_date)}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-[12px] uppercase text-gray-500 dark:textwhite/60">Business Type</div>
            <div className="text-base font-semibold">
              {ORG_LABEL[Number(company.org_type)] || "—"}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Contact (editable) ---------- */}
      <section className="rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">Business Contact Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Full legal first and middle names*</Label>
            <Input value={fContact.first_name} onChange={(e) => setFContact(s => ({ ...s, first_name: e.target.value }))} />
          </div>
          <div>
            <Label>Full legal last name(s)*</Label>
            <Input value={fContact.last_name} onChange={(e) => setFContact(s => ({ ...s, last_name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Contact Telephone Number</Label>
            <Input value={fContact.phone} onChange={(e) => setFContact(s => ({ ...s, phone: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveContact} disabled={isLoading}>Update</Button>
        </div>
      </section>

      {/* ---------- Forwarding Address (editable) ---------- */}
      <section className="rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">Forwarding Address</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Address line 1*</Label>
            <Input value={fForward.line1} onChange={(e) => setFForward(s => ({ ...s, line1: e.target.value }))} />
          </div>
          <div>
            <Label>Address line 2</Label>
            <Input value={fForward.line2} onChange={(e) => setFForward(s => ({ ...s, line2: e.target.value }))} />
          </div>
          <div>
            <Label>City*</Label>
            <Input value={fForward.city} onChange={(e) => setFForward(s => ({ ...s, city: e.target.value }))} />
          </div>
          <div>
            <Label>Country*</Label>
            <Input value={fForward.country} onChange={(e) => setFForward(s => ({ ...s, country: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Postcode*</Label>
            <Input value={fForward.postcode} onChange={(e) => setFForward(s => ({ ...s, postcode: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveForwarding} disabled={isLoading}>Update</Button>
        </div>
      </section>

      {/* ---------- Company (editable – only necessary fields) ---------- */}
      <section className="rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">Company</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Legal Name*</Label>
            <Input value={fCompany.name} onChange={(e) => setFCompany(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Trading Name</Label>
            <Input value={fCompany.trading_name} onChange={(e) => setFCompany(s => ({ ...s, trading_name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Company Number</Label>
            <Input value={fCompany.number} onChange={(e) => setFCompany(s => ({ ...s, number: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveCompany} disabled={isLoading}>Update</Button>
        </div>
      </section>

      {/* ---------- My Account (auth email + notifications) ---------- */}
      <section className="rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">My Account</h3>

        <div className="grid gap-4">
          <div>
            <Label>Authentication Email</Label>
            <div className="mt-1 flex items-center gap-3">
              <Input value={contact.email || ""} readOnly className="bg-gray-50 dark:bg-gray-800/40" />
              <Button variant="secondary" onClick={() => setEmailDlgOpen(true)}>Change</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              We’ll send a verification link to the new email. Change completes after verification.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium text-sm">Email Notifications</div>
              <div className="text-xs text-muted-foreground">Receive mail arrival alerts.</div>
            </div>
            <Switch checked={notifEmail} onCheckedChange={saveNotif} />
          </div>
        </div>
      </section>

      {/* ---------- Email change dialog ---------- */}
      <Dialog open={emailDlgOpen} onOpenChange={setEmailDlgOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Change authentication email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="newEmail">New email address</Label>
            <Input id="newEmail" type="email" value={newAuthEmail} onChange={(e) => setNewAuthEmail(e.target.value)} placeholder="name@example.com" />
            <p className="text-xs text-muted-foreground">
              A verification link will be sent. Your login email will update after you confirm.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEmailDlgOpen(false)}>Cancel</Button>
            <Button onClick={startAuthEmailChange} disabled={!newAuthEmail}>Send link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
