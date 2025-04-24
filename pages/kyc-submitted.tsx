import Head from "next/head";
import Link from "next/link";

export default function KycSubmitted() {
  return (
    <>
      <Head>
        <title>KYC Submitted | BetaOffice</title>
      </Head>

      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full text-center">
          <div className="text-5xl text-green-600 mb-4">✔</div>
          <h1 className="text-3xl font-bold mb-2 text-green-700">KYC Submitted!</h1>
          <p className="text-gray-700">
            Thank you! We&apos;ve received your information. <br />
            You will soon receive a separate email to verify your identity.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Need help?{" "}
            <a href="mailto:support@betaoffice.uk" className="text-blue-600 underline">
              support@betaoffice.uk
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 text-sm mt-24">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-2">BetaOffice</h3>
            <p>3rd Floor, 86–90 Paul Street</p>
            <p>London EC2A 4NE, UK</p>
            <p>Company No: 16274319</p>
            <p>ICO No: ZB883806</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Trust & Security</h3>
            <ul className="space-y-1">
              <li>🔒 SSL Secured</li>
              <li>✅ GDPR Compliant</li>
              <li>🛡️ ICO Registered</li>
              <li>⭐ Trusted by Businesses</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Legal</h3>
            <ul className="space-y-1">
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:underline">
                Cookie Policy
              </Link>
            </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Contact</h3>
            <ul className="space-y-1">
              <li><a href="mailto:info@betaoffice.uk" className="hover:underline">info@betaoffice.uk</a></li>
              <li><a href="mailto:privacy@betaoffice.uk" className="hover:underline">privacy@betaoffice.uk</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center border-t border-gray-800 py-4 text-gray-500">
          © 2025 Generation Beta Digital Ltd. All rights reserved.
        </div>
      </footer>
    </>
  );
}

