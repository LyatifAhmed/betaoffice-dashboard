import Link from "next/link";
import { FaLock, FaShieldAlt, FaCheckCircle, FaStar } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="font-bold text-lg mb-2">BetaOffice</h3>
          <p className="text-sm mb-1">3rd Floor, 86–90 Paul Street</p>
          <p className="text-sm mb-1">London EC2A 4NE, UK</p>
          <p className="text-sm">Company No: 16274319</p>
          <p className="text-sm">ICO No: ZB883806</p>
        </div>

        {/* Trust Badges */}
        <div>
          <h4 className="font-semibold mb-3">Trust & Security</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaLock className="text-green-400" /> SSL Secured
            </li>
            <li className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-400" /> GDPR Compliant
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-yellow-400" /> ICO Registered
            </li>
            <li className="flex items-center gap-2">
              <FaStar className="text-yellow-400" /> Trusted by Businesses
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm mb-2"><a href="mailto:info@betaoffice.uk" className="underline">info@betaoffice.uk</a></p>
          <p className="text-sm"><a href="mailto:privacy@betaoffice.uk" className="underline">privacy@betaoffice.uk</a></p>
        </div>
      </div>

      <div className="text-center mt-10 text-xs text-gray-400">
        © {new Date().getFullYear()} Generation Beta Digital Ltd. All rights reserved.
      </div>
    </footer>
  );
}

