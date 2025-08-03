import Head from "next/head";
import Link from "next/link";

export default function KycSubmitted() {
  return (
    <>
      <Head>
        <title>KYC Submitted | BetaOffice</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-[#f9fbff] to-[#ecf3ff] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Neon glow animation layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Glass card */}
        <div className="bg-white/40 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl max-w-xl w-full text-center p-10 relative z-10">
          <div className="text-6xl text-green-500 mb-4 animate-bounce">✔</div>
          <h1 className="text-3xl font-bold mb-2 text-green-700">KYC Submitted</h1>
          <p className="text-gray-800">
            Thank you! We’ve received your information. <br />
            You will soon receive a separate email to verify your identity.
          </p>

          <p className="mt-6 text-sm text-gray-600">
            Need help?{" "}
            <a href="mailto:support@betaoffice.uk" className="text-blue-600 underline hover:text-blue-800">
              support@betaoffice.uk
            </a>
          </p>

          <Link
            href="/"
            className="inline-block mt-8 px-6 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Go Home
          </Link>
        </div>
      </main>
    </>
  );
}
