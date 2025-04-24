import Link from "next/link";
export default function KycSubmitted() {
  return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <h1 className="text-3xl font-bold mb-4">✅ KYC Submitted!</h1>
      <p className="text-lg text-gray-700">
        Thank you! We&apos;ve received your information.
        <br />
        You will soon receive a separate email to verify your identity.
      </p>
      <p className="mt-6 text-sm text-gray-500">Need help? Email <a href="mailto:support@betaoffice.uk" className="text-blue-600">support@betaoffice.uk</a></p>
    </div>
  );
}

