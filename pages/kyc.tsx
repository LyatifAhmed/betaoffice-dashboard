'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import KycForm from '../components/KycForm';
import Link from 'next/link';

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState<string | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const tokenFromQuery = router.query.token as string;
    if (!tokenFromQuery) {
      setError('No token found.');
      setLoading(false);
      return;
    }

    setToken(tokenFromQuery); // ✅ Store token to pass to KycForm

    axios
      .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/recover-token?token=${tokenFromQuery}`)
      .then((res) => {
        const data = res.data;
        setPlanName(data.plan_name);
        setProductId(data.product_id);
        setEmail(data.email);
        setError(null);
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setError('✅ This KYC form was already submitted.');
        } else if (err.response?.status === 410) {
          setError('⚠️ This KYC link has expired. You can request a new one.');
        } else if (err.response?.status === 404) {
          setError('❌ Invalid or broken KYC link.');
        } else {
          setError('Something went wrong.');
        }
      })
      .finally(() => setLoading(false));
  }, [router.isReady, router.query]);

  const handleResend = async () => {
    try {
      await axios.post('/api/resend-kyc-link', { email: resendEmail });
      setResendStatus('✅ Link sent! Check your inbox.');
    } catch {
      setResendStatus('❌ Could not resend. Please try again.');
    }
  };

  if (!router.isReady || loading) {
    return <p className="mt-10 text-center">🔄 Loading your KYC session…</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl text-red-600 font-bold">Oops!</h1>
        <p className="mt-2">{error}</p>

        {error.includes('expired') && (
          <div className="mt-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={handleResend}
              className="ml-2 px-4 py-1 bg-blue-600 text-white rounded"
            >
              Resend
            </button>
            {resendStatus && (
              <p className="mt-2 text-sm text-green-600">{resendStatus}</p>
            )}
          </div>
        )}

        {error.includes('submitted') && (
          <p className="mt-4 text-sm text-gray-500">
            If you need to make changes, please contact support or request a refund.
          </p>
        )}

        {error.includes('Invalid') && (
          <p className="mt-4 text-sm text-gray-500">
            Please check the link or contact us at <a className="underline text-blue-600" href="mailto:support@betaoffice.uk">support@betaoffice.uk</a>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-green-50 border border-green-500 p-4 text-center text-green-700 font-medium">
        You selected the <strong>{planName}</strong> plan. Let&apos;s complete your KYC!
      </div>
      <KycForm
        lockedProductId={productId!}
        customerEmail={email}
        token={token!} // ✅ Pass token to form
      />
    </div>
  );
}
