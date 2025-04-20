'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Submission {
  external_id: string;
  customer_email: string;
  company_name: string;
  start_date: string;
  review_status: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/submissions`,
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER!,
            password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
          },
        }
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch KYC submissions', err);
      setError('❌ Failed to fetch submissions');
    }
  };

  const reviewSubmission = async (external_id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/review-submission`,
        {
          external_id,
          review_status: status,
        },
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER!,
            password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
          },
        }
      );
      alert(`✅ Submission ${status.toLowerCase()}!`);
      fetchSubmissions(); // 🔄 Refresh list
    } catch (err) {
      console.error(`Failed to ${status.toLowerCase()} submission`, err);
      alert(`❌ Failed to ${status.toLowerCase()} submission`);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">🧾 KYC Submissions</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full table-auto border border-gray-200 shadow-sm rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border-b">Email</th>
            <th className="text-left px-4 py-2 border-b">Company</th>
            <th className="text-left px-4 py-2 border-b">Submitted</th>
            <th className="text-left px-4 py-2 border-b">Status</th>
            <th className="text-left px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.external_id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{sub.customer_email}</td>
              <td className="px-4 py-2">{sub.company_name}</td>
              <td className="px-4 py-2">{new Date(sub.start_date).toLocaleString()}</td>
              <td className="px-4 py-2 font-semibold">{sub.review_status}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => reviewSubmission(sub.external_id, 'APPROVED')}
                  className="text-green-600 hover:underline"
                >
                  Approve
                </button>
                <button
                  onClick={() => reviewSubmission(sub.external_id, 'REJECTED')}
                  className="text-red-600 hover:underline"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

