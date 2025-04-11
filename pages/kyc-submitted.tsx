import Link from "next/link";

export default function KycSubmittedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="max-w-md bg-white p-8 rounded shadow text-center border border-green-400">
        <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 KYC Submitted!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for submitting your KYC form. Our team will now verify your details and activate your service.
        </p>
        <Link href="/">
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
