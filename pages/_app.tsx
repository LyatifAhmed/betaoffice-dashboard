import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";
import Footer from "../components/Footer"; // 👈 Make sure path is correct
import TopBanner from "../components/TopBanner";
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <TopBanner />
      <main></main>
      <Head>
        <title>BetaOffice – Virtual Office KYC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Easily complete your virtual office KYC with BetaOffice. Powered by Generation Beta Digital Ltd." />

        {/* Open Graph (Facebook, LinkedIn, etc.) */}
        <meta property="og:title" content="BetaOffice – Virtual Office KYC" />
        <meta property="og:description" content="Secure your UK virtual office service and complete KYC in minutes." />
        <meta property="og:image" content="/images/og-banner.png" />
        <meta property="og:url" content="https://betaoffice.uk" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BetaOffice – Virtual Office KYC" />
        <meta name="twitter:description" content="Secure your UK virtual office service and complete KYC in minutes." />
        <meta name="twitter:image" content="https://betaoffice.uk/preview.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <Component {...pageProps} />

      <Footer /> {/* 👈 Your new dark footer */}

      <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="betaoffice_cookie_consent"
        style={{ background: "#1a202c", fontSize: "14px", padding: "10px 20px" }}
        buttonStyle={{
          background: "#4CAF50",
          color: "#fff",
          fontSize: "13px",
          borderRadius: "4px",
          padding: "6px 12px",
        }}
        declineButtonStyle={{
          background: "#aaa",
          color: "#000",
          fontSize: "13px",
          borderRadius: "4px",
          padding: "6px 12px",
          marginLeft: "10px",
        }}
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







