"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (router.query.reason === "kyc") {
      setWarning("⚠️ Your identity verification is still pending. Please wait until your account is approved.");
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setWarning("");

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

      {/* Background image */}
      <div className="relative min-h-screen flex items-center justify-center bg-white text-gray-900 overflow-hidden">
        <Image
          src="/office4.png"
          alt="Background"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="absolute z-0"
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0" />

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-md mx-4 p-8 
            bg-white/10 backdrop-blur-md border border-white/20 
            rounded-2xl shadow-2xl ring-1 ring-white/10
            transition-all duration-300 animate-fade-in-up"
        >
          <div className="text-center mb-6">
            <Image
              src="/logo.png"
              alt="BetaOffice Logo"
              width={80}
              height={80}
              className="mx-auto opacity-90 drop-shadow"
            />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in to your Dashboard</h1>
            <p className="text-sm text-gray-600">
              Enter your email and we&apos;ll send you a secure login link.
            </p>
          </div>

          {warning && (
            <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded border border-yellow-300 mb-4">
              {warning}
            </div>
          )}

          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded px-4 py-2 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              bg-white/80 placeholder-gray-500 text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white 
              font-semibold py-2 rounded shadow-md transition duration-200"
          >
            {loading ? "Sending link..." : "Send Login Link"}
          </button>

          {message && (
            <div className="text-sm text-center mt-4 text-gray-700">{message}</div>
          )}
        </form>
      </div>
    </>
  );
}
