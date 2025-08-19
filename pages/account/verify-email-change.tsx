"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailChangePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMsg("❌ Invalid verification link.");
        return;
      }

      setStatus("loading");

      try {
        const base =
          process.env.NEXT_PUBLIC_HOXTON_API_URL?.replace(/\/+$/, "") ||
          "http://localhost:8000";

        const res = await fetch(`${base}/account-details/auth-email/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          let errMsg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            errMsg = j?.detail || errMsg;
          } catch {
            try {
              errMsg = await res.text();
            } catch {}
          }
          throw new Error(errMsg);
        }

        const data = await res.json().catch(() => ({}));
        if (data?.ok) {
          setStatus("success");
          setMsg("✅ Your login email has been updated successfully.");
        } else {
          throw new Error("Could not confirm email change.");
        }
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setMsg(
          err?.message ||
            "❌ Could not confirm email change. The link may be invalid or expired."
        );
      }
    };

    run();
  }, []);

  // redirect otomatik success olunca
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm
                      border-gray-200 text-gray-900
                      dark:bg-[#0b1220] dark:text-white dark:border-white/15"
      >
        {status === "idle" || status === "loading" ? (
          <div className="text-center space-y-2">
            <div className="text-xl font-semibold">Confirming…</div>
            <p className="text-sm opacity-80">
              Please wait while we verify your email change.
            </p>
          </div>
        ) : null}

        {status === "success" ? (
          <div className="text-center space-y-4">
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              Success
            </div>
            <p className="text-sm opacity-90">{msg}</p>
            <p className="text-xs opacity-70">
              Redirecting to dashboard in 3 seconds…
            </p>
            <a
              href="/dashboard"
              className="inline-block rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
            >
              Go to Dashboard now
            </a>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="text-center space-y-4">
            <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
              Error
            </div>
            <p className="text-sm opacity-90">{msg}</p>
            <a
              href="/account"
              className="inline-block rounded-md bg-gray-200 px-5 py-2 text-gray-900 hover:bg-gray-300 dark:bg-white/10 dark:text-white"
            >
              Back to Account
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
