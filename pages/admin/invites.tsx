// pages/admin/invites.tsx
import { useEffect, useState } from "react";

type OwnerData = {
  id: number;
  name: string;
  email: string;
  subscriptionId: string;
  companyName: string;
};

export default function AdminInvites() {
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [inviteLinks, setInviteLinks] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<Record<number, string>>({});

  useEffect(() => {
    const isAuthed = localStorage.getItem("admin-authed");
    if (isAuthed !== "true") {
      window.location.href = "/admin/login";
    } else {
      fetch("/api/admin/owners")
        .then((res) => res.json())
        .then(setOwners);
    }
  }, []);

  const handleSend = async (owner: OwnerData) => {
    const link = inviteLinks[owner.id];
    if (!link) return;

    setStatus((prev) => ({ ...prev, [owner.id]: "sending" }));
    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: owner.email,
        name: owner.name,
        inviteLink: link,
      }),
    });

    setStatus((prev) => ({
      ...prev,
      [owner.id]: res.ok ? "sent" : "error",
    }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">KYC Invite Panel</h1>
      <table className="w-full text-sm border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Invite Link</th>
            <th className="p-2 border">Send</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <tr key={owner.id}>
              <td className="p-2 border">{owner.name}</td>
              <td className="p-2 border">{owner.email}</td>
              <td className="p-2 border">{owner.companyName}</td>
              <td className="p-2 border">
                <input
                  className="border px-2 py-1 w-full"
                  type="text"
                  placeholder="Paste invite link"
                  value={inviteLinks[owner.id] || ""}
                  onChange={(e) =>
                    setInviteLinks((prev) => ({
                      ...prev,
                      [owner.id]: e.target.value,
                    }))
                  }
                />
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handleSend(owner)}
                  disabled={status[owner.id] === "sending"}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  {status[owner.id] === "sent"
                    ? "✅ Sent"
                    : status[owner.id] === "error"
                    ? "❌ Error"
                    : "Send"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
