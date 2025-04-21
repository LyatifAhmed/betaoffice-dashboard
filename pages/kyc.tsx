'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import KycForm from '../components/KycForm';

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string>('');

  useEffect(() => {
    if (!router.isReady) return;
  
    const tokenFromQuery = router.query.token as string;
    if (!tokenFromQuery) {
      setError('No token found.');
      setLoading(false);
      return;
    }
  
    axios
      .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/recover-token?token=${tokenFromQuery}`)
      .then((res) => {
        const data = res.data;
        if (data.kyc_submitted === 1) {
          router.push('/kyc-submitted');
          return;
        } else {
          setTokenData({ ...data, token: tokenFromQuery });
        }
      })
      .catch((err) => {
        if (err.response?.status === 410) {
          setError('⚠️ This KYC link has expired. You can request a new one.');
        } else if (err.response?.status === 404) {
          setError('❌ Invalid or broken KYC link.');
        } else {
          setError('Something went wrong.');
        }
      })
      .finally(() => setLoading(false));
  }, [router]); // ✅ include the whole router object
  

  const handleResend = async () => {
    try {
      await axios.post('/api/resend-kyc-link', { email: resendEmail });
      setResendStatus('✅ Link sent! Check your inbox.');
    } catch {
      setResendStatus('❌ Could not resend. Please try again.');
    }
  };

  if (loading) {
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
            Please check the link or contact us at{' '}
            <a className="underline text-blue-600" href="mailto:support@betaoffice.uk">
              support@betaoffice.uk
            </a>
          </p>
        )}
      </div>
    );
  }

  if (!tokenData) return null;

  return (
    <div>
      <div className="bg-green-50 border border-green-500 p-4 text-center text-green-700 font-medium">
        You selected the <strong>{tokenData.plan_name}</strong> plan. Let&apos;s complete your KYC!
      </div>
      <KycForm
        lockedProductId={tokenData.product_id}
        customerEmail={tokenData.email}
        token={tokenData.token}
      />
    </div>
  );
}

