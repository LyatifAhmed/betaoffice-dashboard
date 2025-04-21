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

interface Member {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  proof_of_id: string;
  proof_of_address: string;
}

interface SubmissionDetails {
  submission: Submission;
  members: Member[];
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<SubmissionDetails | null>(null);
  const [error, setError] = useState('');
  const [loadingExternalId, setLoadingExternalId] = useState<string | null>(null);

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
        { external_id, review_status: status },
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER!,
            password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
          },
        }
      );
      alert(`✅ Submission ${status.toLowerCase()}!`);
      fetchSubmissions();
    } catch (err) {
      alert(`❌ Failed to ${status.toLowerCase()} submission`);
    }
  };

  const openSubmission = async (external_id: string) => {
    setLoadingExternalId(external_id);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/submission/${external_id}`,
        {
          auth: {
            username: process.env.NEXT_PUBLIC_ADMIN_USER!,
            password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
          },
        }
      );
      setSelected(res.data);
    } catch (err) {
      console.error('❌ Error fetching submission details:', err);
      alert('❌ Failed to fetch submission details');
    } finally {
      setLoadingExternalId(null);
    }
  };

  const closeModal = () => setSelected(null);

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
            <th className="px-4 py-2 border-b text-left">Email</th>
            <th className="px-4 py-2 border-b text-left">Company</th>
            <th className="px-4 py-2 border-b text-left">Submitted</th>
            <th className="px-4 py-2 border-b text-left">Status</th>
            <th className="px-4 py-2 border-b text-left">Actions</th>
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
                  className="text-blue-600 hover:underline"
                  onClick={() => openSubmission(sub.external_id)}
                >
                  {loadingExternalId === sub.external_id ? 'Loading...' : 'View'}
                </button>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => reviewSubmission(sub.external_id, 'APPROVED')}
                >
                  Approve
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => reviewSubmission(sub.external_id, 'REJECTED')}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ View Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl p-6 rounded shadow-lg relative">
            <h2 className="text-xl font-bold mb-2">🔍 {selected.submission.company_name}</h2>
            <p className="text-sm mb-4 text-gray-600">{selected.submission.customer_email}</p>

            {selected.members.map((m, idx) => (
              <div key={idx} className="mb-4 border p-3 rounded">
                <p><strong>👤 {m.first_name} {m.last_name}</strong></p>
                <p>📞 {m.phone_number}</p>
                <p>🎂 {new Date(m.date_of_birth).toLocaleDateString()}</p>
                <div className="flex gap-4 mt-2">
                  <a href={m.proof_of_id} target="_blank" className="text-blue-600 underline">View ID</a>
                  <a href={m.proof_of_address} target="_blank" className="text-blue-600 underline">View Address</a>
                </div>
              </div>
            ))}

            <button onClick={closeModal} className="absolute top-2 right-4 text-gray-500 text-xl hover:text-black">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
