import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t mt-12 py-6 px-4 text-center text-sm text-gray-500 bg-gray-50">
      <p className="mb-2">© {new Date().getFullYear()} BetaOffice – Generation Beta Digital Limited</p>
      <div className="space-x-4">
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/cookie-policy" className="hover:underline">
          Cookie Policy
        </Link>
      </div>
    </footer>
  );
}

