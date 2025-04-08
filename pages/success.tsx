import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('paymentCompleted', 'true');
    router.push('/kyc');
  }, [router]); // ✅ added router as a dependency

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold">Redirecting to KYC Form...</h1>
    </div>
  );
}

  