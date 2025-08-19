// components/layout/TeamInviteDialog.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  externalId: string;
  onCreated: () => void;
  canInvite: boolean;
};

export default function TeamInviteDialog({ open, onClose, externalId, onCreated, canInvite }: Props) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "READ_ACTION" | "READ">("READ_ACTION");
  const [notif, setNotif] = useState(true);
  const [busy, setBusy] = useState(false);
  const disabled = !first.trim() || !last.trim() || !email.trim() || !canInvite || busy;

  if (!open) return null;

  const submit = async () => {
    if (disabled) return;
    try {
      setBusy(true);
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          external_id: externalId,
          first_name: first.trim(),
          last_name: last.trim(),
          email: email.trim(),
          role,
          email_notifications: notif,
        }),
      });
      if (!res.ok) throw new Error("invite-failed");
      onCreated();
    } catch {
      alert("Could not invite member.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[92%] max-w-xl rounded-2xl p-5 bg-white/10 text-white border border-white/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Invite Member</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/70">First Name*</label>
            <input
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">Last Name*</label>
            <input
              value={last}
              onChange={(e) => setLast(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/70">Email Address*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/70">Notifications</label>
          <div className="mt-1">
            <button
              onClick={() => setNotif(!notif)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20"
            >
              <span
                className={`inline-block w-3 h-3 rounded-full ${notif ? "bg-emerald-400" : "bg-gray-500"}`}
              />
              {notif ? "Email Notifications ON" : "Email Notifications OFF"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/70">Role</label>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                checked={role === "ADMIN"}
                onChange={() => setRole("ADMIN")}
              />
              <span className="text-sm">Administrator</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                checked={role === "READ_ACTION"}
                onChange={() => setRole("READ_ACTION")}
              />
              <span className="text-sm">Read & Action Mail</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                checked={role === "READ"}
                onChange={() => setRole("READ")}
              />
              <span className="text-sm">Read Mail</span>
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={disabled}
            className="px-4 py-2 rounded-lg text-white disabled:opacity-50
                       bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500"
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
