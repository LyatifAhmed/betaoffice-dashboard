// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="betaoffice_cookie_consent"
        style={{ background: "#2B373B", fontSize: "14px" }}
        buttonStyle={{ background: "#4CAF50", color: "#fff", fontSize: "13px", borderRadius: "4px" }}
        declineButtonStyle={{ background: "#aaa", color: "#000", fontSize: "13px", borderRadius: "4px", marginLeft: "10px" }}
        expires={150}
      >
        We use cookies to enhance your experience and analyze usage.{" "}
        <Link href="/cookie-policy" className="underline text-blue-300">Learn more</Link>.
      </CookieConsent>
    </>
  );
}

