'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SubmissionDetail() {
  const router = useRouter();
  const { external_id } = router.query;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!external_id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/admin/submission/${external_id}`, {
        auth: {
          username: process.env.NEXT_PUBLIC_ADMIN_USER!,
          password: process.env.NEXT_PUBLIC_ADMIN_PASS!,
        },
      })
      .then((res) => {
        setData(res.data);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('❌ Could not load submission.');
      })
      .finally(() => setLoading(false));
  }, [external_id]);

  if (loading) return <p className="p-6">Loading submission...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const { submission, members } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">🧾 KYC Submission Details</h1>

      <div className="bg-white p-4 border rounded mb-6 shadow">
        <p><strong>Company Name:</strong> {submission.company_name}</p>
        <p><strong>Email:</strong> {submission.customer_email}</p>
        <p><strong>Submitted:</strong> {new Date(submission.start_date).toLocaleString()}</p>
        <p><strong>Status:</strong> {submission.review_status}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Business Owners</h2>
      {members.map((member: any, index: number) => (
        <div key={index} className="border p-4 rounded mb-4 bg-white shadow-sm">
          <p><strong>First Name:</strong> {member.first_name}</p>
          <p><strong>Last Name:</strong> {member.last_name}</p>
          <p><strong>Phone:</strong> {member.phone_number || '—'}</p>
          <p><strong>Date of Birth:</strong> {new Date(member.date_of_birth).toLocaleDateString()}</p>
          <p>
            <strong>Proof of ID:</strong>{' '}
            {member.proof_of_id ? (
              <a
                href={`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/uploaded_files/${member.proof_of_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View File
              </a>
            ) : (
              'Not uploaded'
            )}
          </p>
          <p>
            <strong>Proof of Address:</strong>{' '}
            {member.proof_of_address ? (
              <a
                href={`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/uploaded_files/${member.proof_of_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View File
              </a>
            ) : (
              'Not uploaded'
            )}
          </p>

        </div>
      ))}
    </div>
  );
}

