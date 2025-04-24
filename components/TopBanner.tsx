import Link from "next/link";

export default function TopBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm py-2 px-4 text-center shadow-sm">
      🚀 Boost your business with our trusted virtual office services.{" "}
      <Link href="#pricing" className="underline font-semibold hover:text-yellow-300 ml-1">
        View Plans →
      </Link>
    </div>
  );
}
