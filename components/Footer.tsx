// components/Footer.tsx (simplified example)
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-12 p-6 text-sm text-center text-gray-600">
      <p>
        &copy; {new Date().getFullYear()} Generation Beta Digital Limited. All rights reserved.
      </p>
      <div className="mt-2 space-x-4">
        <Link href="/cookie-policy" className="hover:underline">
          Cookie Policy
        </Link>
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
