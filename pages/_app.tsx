import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import CookieConsent from "react-cookie-consent";
import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer"; // ✅ Add this line

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>BetaOffice – Virtual Office KYC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="BetaOffice KYC submission portal for virtual office customers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
      <Footer /> {/* ✅ Show the global footer on all pages */}

      <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="betaoffice_cookie_consent"
        style={{ background: "#2B373B", fontSize: "14px", padding: "10px 20px" }}
        buttonStyle={{ background: "#4CAF50", color: "#fff", fontSize: "13px", borderRadius: "4px", padding: "6px 12px" }}
        declineButtonStyle={{ background: "#aaa", color: "#000", fontSize: "13px", borderRadius: "4px", padding: "6px 12px", marginLeft: "10px" }}
        expires={150}
        onAccept={() => {
          if (router.pathname === "/cookie-policy") {
            router.push("/");
          }
        }}
      >
        We use cookies to enhance your experience and analyze usage.{" "}
        <Link href="/cookie-policy" passHref legacyBehavior>
          <a className="underline text-blue-300">Learn more</a>
        </Link>
      </CookieConsent>
    </>
  );
}




