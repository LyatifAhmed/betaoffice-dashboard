// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import MagicChatButton from "@/components/MagicChatButton";
import { useEffect } from "react";
import { useChatStore, type ChatScope } from "@/stores/chat-store";
import { ChatProvider } from "@/utils/chat-context"; // ✅ EKLENDİ

// Absolute URL ise kullan; değilse aynı origin
const RAW = process.env.NEXT_PUBLIC_HOXTON_API_URL?.replace(/\/$/, "") || "";
const API_BASE = /^https?:\/\//i.test(RAW) ? RAW : ""; // "" => same-origin

// route -> chat scope
function scopeFromPath(pathname: string): ChatScope {
  if (pathname.startsWith("/dashboard")) return "dashboard:mail";
  if (pathname.startsWith("/kyc")) return "kyc";
  return "landing";
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // external_id’yi yaz
  useEffect(() => {
    let cancelled = false;

    const writeExternalId = async () => {
      try {
        const res = await fetch(`/api/me`, {
          credentials: "include",
          mode: "same-origin",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (typeof window !== "undefined") {
          if (data?.external_id) {
            localStorage.setItem("external_id", data.external_id);
          } else {
            localStorage.removeItem("external_id");
          }
        }
      } catch (e) {
        console.warn("failed to fetch /api/me", e);
      }
    };

    writeExternalId();

    const onDone = () => writeExternalId();
    router.events.on("routeChangeComplete", onDone);

    const onVisible = () => {
      if (document.visibilityState === "visible") writeExternalId();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      router.events.off("routeChangeComplete", onDone);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router.events]);

  // route -> chat scope (global, hafif)
  useEffect(() => {
    const setScope = () => {
      const s = scopeFromPath(router.pathname);
      useChatStore.getState().setScope(s);
    };
    setScope();
    router.events.on("routeChangeComplete", setScope);
    return () => router.events.off("routeChangeComplete", setScope);
  }, [router.pathname, router.events]);

  return (
    <>
      <Head>
        <title>BetaOffice – Virtual Office KYC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Easily complete your virtual office KYC with BetaOffice. Powered by Generation Beta Digital Ltd."
        />
        <meta property="og:title" content="BetaOffice – Virtual Office KYC" />
        <meta property="og:description" content="Secure your UK virtual office service and complete KYC in minutes." />
        <meta property="og:image" content="/images/og-banner.png" />
        <meta property="og:url" content="https://betaoffice.uk" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BetaOffice – Virtual Office KYC" />
        <meta name="twitter:description" content="Secure your UK virtual office service and complete KYC in minutes." />
        <meta name="twitter:image" content="https://betaoffice.uk/preview.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatProvider> {/* ✅ Provider burada */}
        <main>
          <Component {...pageProps} />
          <MagicChatButton />
        </main>

        <Footer />

        <CookieConsent
          location="bottom"
          buttonText="Accept"
          declineButtonText="Decline"
          enableDeclineButton
          cookieName="betaoffice_cookie_consent"
          style={{ background: "#1a202c", fontSize: "14px", padding: "10px 20px" }}
          buttonStyle={{ background: "#4CAF50", color: "#fff", fontSize: "13px", borderRadius: "4px", padding: "6px 12px" }}
          declineButtonStyle={{ background: "#aaa", color: "#000", fontSize: "13px", borderRadius: "4px", padding: "6px 12px", marginLeft: "10px" }}
          expires={150}
          onAccept={() => {
            if (router.pathname === "/cookie-policy") router.push("/");
          }}
        >
          We use cookies to enhance your experience and analyze usage.{" "}
          <Link href="/cookie-policy" passHref legacyBehavior>
            <a className="underline text-blue-300">Learn more</a>
          </Link>
        </CookieConsent>

        <Toaster position="top-center" />
      </ChatProvider>
    </>
  );
}
