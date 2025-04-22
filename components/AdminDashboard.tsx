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
  proof_of_id: string | null;
  proof_of_address: string | null;
}

interface SubmissionDetails {
  submission: Submission;
  members: Member[];
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<SubmissionDetails | null>(null);
  const [error, setError] = useState('');
  const [loadingView, setLoadingView] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendBase = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;

  const resolveFileUrl = (filePath: string | null): string => {
    if (!filePath) return '';
    return filePath.startsWith('http')
      ? filePath
      : `${backendBase}/${filePath.replace(/^\/+/, '')}`;
  };
  

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendBase}/api/admin/submissions`, {
        auth: {
          username: process.env.NEXT_PUBLIC_ADMIN_USER!,
          password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
        },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch KYC submissions', err);
      setError('❌ Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (external_id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.post(
        `${backendBase}/api/admin/review-submission`,
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
      setSelected(null);
    } catch (err) {
      alert(`❌ Failed to ${status.toLowerCase()} submission`);
    }
  };

  const openSubmission = async (external_id: string) => {
    setLoadingView(true);
    try {
      const res = await axios.get(`${backendBase}/api/admin/submission/${external_id}`, {
        auth: {
          username: process.env.NEXT_PUBLIC_ADMIN_USER!,
          password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
        },
      });
      setSelected(res.data);
    } catch (err) {
      alert('❌ Failed to fetch submission details');
    } finally {
      setLoadingView(false);
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

      {loading ? (
        <p>🔄 Loading submissions...</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.external_id}
              className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="mb-2 md:mb-0">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Email:</span> {sub.customer_email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Company:</span> {sub.company_name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Submitted:</span>{' '}
                  {new Date(sub.start_date).toLocaleString()}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      sub.review_status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : sub.review_status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {sub.review_status}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 flex-wrap mt-2 md:mt-0">
                <button
                  className="text-blue-600 text-sm underline"
                  onClick={() => openSubmission(sub.external_id)}
                  disabled={loadingView}
                >
                  {loadingView ? 'Loading...' : 'View'}
                </button>
                <button
                  className="text-green-600 text-sm underline"
                  onClick={() => reviewSubmission(sub.external_id, 'APPROVED')}
                >
                  Approve
                </button>
                <button
                  className="text-red-600 text-sm underline"
                  onClick={() => reviewSubmission(sub.external_id, 'REJECTED')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl p-6 rounded shadow-lg relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-2">🔍 {selected.submission.company_name}</h2>
            <p className="text-sm mb-4 text-gray-600">{selected.submission.customer_email}</p>

            {selected.members.length === 0 ? (
              <p className="text-gray-600">No owners uploaded.</p>
            ) : (
              selected.members.map((m, idx) => (
                <div key={idx} className="mb-4 border p-3 rounded bg-gray-50">
                  <p><strong>👤 {m.first_name} {m.last_name}</strong></p>
                  <p>📞 {m.phone_number}</p>
                  <p>🎂 {new Date(m.date_of_birth).toLocaleDateString()}</p>
                  <div className="flex gap-4 mt-2">
                  {m.proof_of_id ? (
                    <a
                      href={resolveFileUrl(m.proof_of_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View ID
                    </a>
                  ) : (
                    <span className="text-gray-500">No ID uploaded</span>
                  )}
                  {m.proof_of_address ? (
                    <a
                      href={resolveFileUrl(m.proof_of_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Address
                    </a>
                  ) : (
                    <span className="text-gray-500">No Address uploaded</span>
                  )}

                  </div>
                </div>
              ))
            )}

            <button
              onClick={closeModal}
              className="absolute top-2 right-4 text-gray-500 text-xl hover:text-black"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

<button
  onClick={() => {
    localStorage.removeItem('admin_auth');
    window.location.href = '/admin-login';
  }}
  className="mt-6 text-sm text-red-600 hover:underline"
>
  Logout
</button>
