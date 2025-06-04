"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function MagicLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verifyLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("❌ Invalid or missing login token.");
        return;
      }

      try {
        const res = await axios.post("/api/verify-token", { token });

        if (res.data.email && res.data.external_id) {
          // ✅ Set HTTP-only cookie securely
          await axios.post(
            "/api/set-cookie",
            { external_id: res.data.external_id },
            { withCredentials: true } // 🔥 bu önemli
          );

          setStatus("✅ Login successful. Redirecting...");
          router.replace("/dashboard");
        } else {
          setStatus("❌ Invalid or expired login token.");
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Login failed. Please try again.");
      }
    };

    verifyLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 px-4">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
}
