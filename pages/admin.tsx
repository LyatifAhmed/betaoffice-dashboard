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
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/submissions`,
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER || 'admin',
            password: process.env.NEXT_PUBLIC_ADMIN_PASS || 'adminpass',
          },
        }
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch KYC submissions', err);
      setError('❌ Failed to fetch submissions');
    }
  };

  const handleAction = async (external_id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/review-submission`,
        { external_id, action },
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER || 'admin',
            password: process.env.NEXT_PUBLIC_ADMIN_PASS || 'adminpass',
          },
        }
      );
      setActionStatus(`✅ Submission ${external_id} marked as ${action}`);
      fetchSubmissions(); // Refresh list
    } catch (err) {
      console.error('Failed to update submission status', err);
      setActionStatus('❌ Failed to update submission status');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">🧾 KYC Submissions</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {actionStatus && <p className="text-blue-700 mb-4">{actionStatus}</p>}

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
                  onClick={() => handleAction(sub.external_id, 'APPROVED')}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(sub.external_id, 'REJECTED')}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
