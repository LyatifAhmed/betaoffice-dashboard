// pages/privacy-policy.tsx
import Link from "next/link";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | BetaOffice</title>
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          This Privacy Policy explains how Generation Beta Digital Limited (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects your personal data when you use our services through BetaOffice (betaoffice.uk).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and identity documents.</li>
          <li><strong>Company Details:</strong> Company name, registration number, address, directors.</li>
          <li><strong>Payment Information:</strong> Processed securely via Stripe. We do not store card details.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, access times, and website interactions.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">We use your data to:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Provide and manage your virtual office services</li>
          <li>Verify your identity (KYC/AML compliance)</li>
          <li>Communicate with you about your account and services</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
        <p className="mb-4">
          We only share your information with trusted third parties required for service delivery, including:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>The Hoxton Mix Ltd – for virtual office services & mail handling</li>
          <li>Stripe – for secure payment processing</li>
          <li>Companies House API – for business verification</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Storage & Security</h2>
        <p className="mb-4">
          We store your data on secure, encrypted systems and limit access to authorised personnel only. All data transfers are secured via HTTPS.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Access your data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent at any time</li>
          <li>Object to or restrict processing</li>
        </ul>
        <p className="mb-4">
          To exercise your rights, contact us at <a href="mailto:privacy@betaoffice.uk" className="text-blue-600 underline">privacy@betaoffice.uk</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies</h2>
        <p className="mb-4">
          Our website uses cookies for functionality, security, and analytics. Please refer to our <Link href="/cookie-policy" className="text-blue-600 underline">Cookie Policy</Link> for details.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Data Retention</h2>
        <p className="mb-4">
          We retain your personal data for as long as necessary to provide our services and meet legal obligations. 
          Scanned mail is securely stored for a period of <strong>12 months</strong> from the date of receipt, after which it is automatically deleted unless otherwise required by law.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. The most recent version will always be available on our website.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
        <p className="mb-4">
          If you have any questions or concerns, please contact: <br />
          <strong>Generation Beta Digital Limited</strong><br />
          Email: <a href="mailto:privacy@betaoffice.uk" className="text-blue-600 underline">privacy@betaoffice.uk</a>
        </p>
      </main>
    </>
  );
}



