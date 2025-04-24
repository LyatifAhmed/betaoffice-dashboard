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

          <Link
            href="/"
            className="inline-block mt-8 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </main>
    </>
  );
}


