// pages/auth/callback.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import { createHash } from "crypto";
import Cookies from "js-cookie";

function generateToken(email: string): string {
  const secret = process.env.NEXT_PUBLIC_MAGIC_LINK_SECRET || "defaultsecret";
  return createHash("sha256").update(email + secret).digest("hex");
}

export default function CallbackPage() {
  const router = useRouter();
  const { email, token } = router.query;

  useEffect(() => {
    if (!email || !token || typeof email !== "string" || typeof token !== "string") return;

    const expectedToken = generateToken(email);

    if (token === expectedToken) {
      // Save session (very simple, cookie-based)
      Cookies.set("user_email", email, { expires: 7 }); // expires in 7 days
      router.replace("/dashboard");
    } else {
      alert("Invalid or expired login link.");
      router.replace("/");
    }
  }, [email, token, router]);

  return <p>Verifying your login link...</p>;
}
