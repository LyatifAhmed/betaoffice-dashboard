import Link from "next/link";

export default function KycSubmittedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="max-w-md bg-white p-8 rounded shadow text-center border border-green-400">
        <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 KYC Submitted!</h1>
        <h2 className="text-2xl font-semibold text-center">Thank You!</h2>
        <p className="mt-4 text-center text-gray-700">
          Your company KYC information has been submitted successfully.
        </p>
        <p className="mt-2 text-center text-gray-600">
          Each listed business owner will shortly receive a secure email from our compliance partner
          <strong> Hoxton Mix</strong> to complete identity verification.
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Most users receive the verification email within a few minutes. Be sure to check spam folders too.
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Didn&apos;t receive the email? Contact us at <a href="mailto:support@betaoffice.uk" className="text-blue-600 underline">support@betaoffice.uk</a>
        </p>
        <Link href="/">
          <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
