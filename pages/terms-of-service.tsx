// pages/terms-of-service.tsx

import Head from "next/head";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | BetaOffice</title>
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <p className="mb-4">
          These Terms of Service ("Terms") govern your use of the BetaOffice platform provided by Generation Beta Digital Limited, a company registered in England and Wales.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Services</h2>
        <p className="mb-4">
          BetaOffice provides virtual office services including but not limited to mail handling, digital dashboard access, and integration with third-party providers (e.g. The Hoxton Mix Ltd).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Provide accurate and lawful information when registering.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Use the services only for lawful purposes.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your access if you violate these Terms or use the service inappropriately.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
        <p className="mb-4">
          To the fullest extent permitted by law, BetaOffice and Generation Beta Digital Limited are not liable for any indirect or consequential damages arising from your use of our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
        <p className="mb-4">
          We may update these Terms from time to time. Continued use of the service after changes implies your acceptance of the revised Terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the laws of England and Wales.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at <a href="mailto:info@gebedi.com" className="text-blue-600 underline">info@gebedi.com</a>.
        </p>
      </main>
    </>
  );
}
