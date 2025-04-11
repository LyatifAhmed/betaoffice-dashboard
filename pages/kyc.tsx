'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import KycForm from '../components/KycForm'; // make sure this path matches your file!
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

  useEffect(() => {
    const token = router.query.token as string;

    if (!token) {
      setError('No token found.');
      setLoading(false);
      return;
    }

    axios
    axios.get(`https://hoxton-api-backend.onrender.com/api/recover-token?token=${token}`)

      .then((res) => {
        const data = res.data;
        setPlanName(data.plan_name);
        setProductId(data.product_id);
        setEmail(data.email);
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setError('You’ve already completed your KYC.');
        } else if (err.response?.status === 410) {
          setError('This KYC link has expired. You can request a new one.');
        } else {
          setError('Something went wrong.');
        }
      })
      .finally(() => setLoading(false));
  }, [router.query]);

  const handleResend = async () => {
    try {
      await axios.post('/api/resend-kyc-link', { email: resendEmail });
      setResendStatus('✅ Link sent! Check your inbox.');
    } catch (err) {
      setResendStatus('❌ Could not resend. Please try again.');
    }
  };

  if (loading) {
    return <p className="mt-10 text-center">Recovering your subscription…</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl text-red-600 font-bold">Oops!</h1>
        <p>{error}</p>

        {error === 'This KYC link has expired. You can request a new one.' && (
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
            <p className="mt-2 text-sm text-gray-500">
              Or <Link href="/refund-request/">Refund Request</Link>.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-green-50 border border-green-500 p-4 text-center text-green-700 font-medium">
        You selected the <strong>{planName}</strong>. This plan is locked to your payment.
      </div>
      <KycForm lockedProductId={productId!} customerEmail={email} />
    </div>
  );
}
