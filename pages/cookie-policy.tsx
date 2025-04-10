// pages/cookie-policy.tsx
import React from "react";
import Head from "next/head";

const CookiePolicy = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy | BetaOffice</title>
      </Head>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="mb-4 text-gray-700">
          This Cookie Policy explains how <strong>Generation Beta Digital Limited</strong> ("we", "us", or "our")
          uses cookies and similar technologies when you visit our website at <strong>betaoffice.uk</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. What are cookies?</h2>
        <p className="mb-4 text-gray-700">
          Cookies are small text files stored on your device by your browser. They help us provide a better experience,
          understand how the site is used, and personalize your experience.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Types of Cookies We Use</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Essential Cookies:</strong> Required for core functionality such as secure login and form submissions.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (e.g. pages visited, bounce rates).</li>
          <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track marketing campaign performance.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. How You Can Control Cookies</h2>
        <p className="mb-4 text-gray-700">
          You can manage cookie preferences anytime using our Cookie Settings panel. Most browsers also allow you to block or delete cookies via your browser settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Third-Party Cookies</h2>
        <p className="mb-4 text-gray-700">
          We may use services such as Google Analytics or Facebook Pixel. These services may use their own cookies to collect data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to This Policy</h2>
        <p className="mb-4 text-gray-700">
          We may update this Cookie Policy to reflect changes in our practices or legal obligations. Updates will be posted here.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact Us</h2>
        <p className="mb-4 text-gray-700">
          If you have questions about our Cookie Policy, contact us at:
          <br />
          <a href="mailto:info@gebedi.com" className="text-blue-600 underline">info@gebedi.com</a>
        </p>
      </div>
    </>
  );
};

export default CookiePolicy;
