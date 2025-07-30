// pages/admin/invites.tsx
import { useState } from "react";

export default function AdminInvites() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSend = async () => {
    setStatus("sending");

    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, name, inviteLink: link }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Send KYC Invite</h1>

      <input
        className="border w-full mb-2 p-2"
        placeholder="Owner Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border w-full mb-2 p-2"
        placeholder="Owner Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border w-full mb-4 p-2"
        placeholder="KYC Invite Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSend}
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Send Invite"}
      </button>

      {status === "sent" && <p className="text-green-600 mt-2">Invite sent ✅</p>}
      {status === "error" && <p className="text-red-600 mt-2">Failed to send invite ❌</p>}
    </div>
  );
}
