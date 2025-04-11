'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import KycForm from '@/components/KycForm';

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

    axios.get(`/api/recover-token?token=${token}`)
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

  if (loading) return <p className="mt-10 text-center">Recovering your subscription…</p>;
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
            {resendStatus && <p className="mt-2 text-sm text-green-600">{resendStatus}</p>}
            <p className="mt-2 text-sm text-gray-500">
              Or <a href="/refund-request" className="underline text-blue-600">request a refund</a>.
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


// --- File: /pages/refund-request.tsx ---
'use client';
import { useState } from 'react';
import axios from 'axios';

export default function RefundRequest() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await axios.post('/api/refund-request', { email, reason });
      setStatus('✅ Your refund request has been submitted. We will review it shortly.');
      setEmail('');
      setReason('');
    } catch (err) {
      setStatus('❌ There was an error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Request a Refund</h1>
      <p className="mb-4 text-sm text-gray-600 text-center">
        If you no longer wish to proceed with your KYC, you may request a refund here.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email Address</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2 mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Reason for Refund</label>
          <textarea
            rows={4}
            required
            className="w-full border rounded px-3 py-2 mt-1"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit Refund Request'}
        </button>
      </form>
      {status && (
        <div className="mt-4 text-center text-sm text-gray-700">{status}</div>
      )}
    </div>
  );
}
