import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Canceled</h1>
        <p className="text-lg text-red-900">No worries. You can try subscribing again anytime.</p>
        
        <Link href="/">
          <span className="mt-6 inline-block text-blue-600 underline cursor-pointer">Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
