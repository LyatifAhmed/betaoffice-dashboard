'use client';
import { useRouter } from 'next/router';
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
  const [rejectionReason, setRejectionReason] = useState('');
  const router = useRouter();

  const backendBase = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;

  const resolveFileUrl = (filePath: string | null): string => {
    if (!filePath) return '';
    return filePath.startsWith('http') ? filePath : `${backendBase}/${filePath}`;
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
      setError('❌ Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (external_id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const payload =
        status === 'REJECTED'
          ? { external_id, review_status: status, rejection_reason: rejectionReason }
          : { external_id, review_status: status };
  
      await axios.post(
        `${backendBase}/api/admin/review-submission`,
        payload,
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
      setRejectionReason(''); // ✅ clear rejection reason after submission
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

  const closeModal = () => {
    setSelected(null);
    setRejectionReason('');
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold">🧾 KYC Submissions</h1>
        <button
          onClick={() => {
            localStorage.removeItem('admin_auth');
            router.push('/admin-login');
          }}
          className="bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>


      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>🔄 Loading submissions...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 shadow-sm rounded text-sm sm:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Email</th>
                <th className="px-3 py-2 border-b text-left">Company</th>
                <th className="px-3 py-2 border-b text-left">Submitted</th>
                <th className="px-3 py-2 border-b text-left">Status</th>
                <th className="px-3 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.external_id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{sub.customer_email}</td>
                  <td className="px-3 py-2">{sub.company_name}</td>
                  <td className="px-3 py-2">{new Date(sub.start_date).toLocaleString()}</td>
                  <td className="px-3 py-2 font-semibold">{sub.review_status}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openSubmission(sub.external_id)}
                      disabled={loadingView}
                    >
                      {loadingView ? 'Loading...' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full mx-4 p-6 rounded shadow-lg relative overflow-y-auto max-h-[90vh]">
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
                  <div className="flex gap-4 mt-2 flex-wrap">
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

            <div className="mt-4 space-y-2">
              <textarea
                placeholder="Optional rejection reason..."
                className="w-full border px-3 py-2 rounded text-sm"
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => reviewSubmission(selected.submission.external_id, 'APPROVED')}
                >
                  Approve
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => reviewSubmission(selected.submission.external_id, 'REJECTED')}
                >
                  Reject
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-black px-4 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
