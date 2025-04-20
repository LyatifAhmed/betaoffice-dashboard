'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Submission {
  external_id: string;
  company_name: string;
  customer_email: string;
  start_date: string;
  reviewed: boolean;
  approved: boolean;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/submissions`)
      .then((res) => {
        setSubmissions(res.data);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load submissions.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard – KYC Submissions</h1>

      {loading ? (
        <p>Loading submissions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border-b">Company Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Submitted</th>
              <th className="py-2 px-4 border-b">Reviewed</th>
              <th className="py-2 px-4 border-b">Approved</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.external_id}>
                <td className="py-2 px-4 border-b">{submission.company_name}</td>
                <td className="py-2 px-4 border-b">{submission.customer_email}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(submission.start_date).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{submission.reviewed ? '✅' : '❌'}</td>
                <td className="py-2 px-4 border-b">
                  {submission.approved ? '✅' : submission.reviewed ? '❌' : '-'}
                </td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
