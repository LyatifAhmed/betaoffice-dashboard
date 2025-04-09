import React from "react";
import Link from "next/link";

export default function KycSubmitted() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 KYC Submitted!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Thank you! We&apos;ve received your KYC form. Our team will review it shortly.
      </p>
      <p className="text-sm text-gray-500 mb-10">
        You will receive a confirmation once your virtual office service is activated.
      </p>
      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
        Return to Home
      </Link>
    </div>
  );
}