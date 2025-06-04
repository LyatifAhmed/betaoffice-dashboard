// pages/login.tsx
"use client";

import { useState } from "react";
import Head from "next/head";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/send-login-link", { email });
      setMessage("✅ Login link sent! Please check your inbox.");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error sending login link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login – BetaOffice</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">Sign in to your Dashboard</h1>
          <p className="text-sm text-gray-600 text-center">
            Enter your email and we&apos;ll send you a secure login link.
          </p>

          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            {loading ? "Sending link..." : "Send Login Link"}
          </button>

          {message && (
            <div className="text-sm text-center mt-2 text-gray-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
