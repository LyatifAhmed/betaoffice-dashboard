'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminRefundRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/refund-requests').then((res) => {
      setRequests(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Refund Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req, idx) => (
            <div key={idx} className="p-4 border rounded shadow-sm">
              <p><strong>Email:</strong> {req.email}</p>
              <p><strong>Reason:</strong> {req.reason}</p>
              <p><strong>Submitted:</strong> {new Date(req.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

