import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

// ✅ Define the shape of mail objects
type Mail = {
  id: string;
  sender_name?: string;
  document_title?: string;
  summary?: string;
  company_name?: string;
  received_at: string;
  url?: string;
  url_envelope_front?: string;
  url_envelope_back?: string;
};

export default function MailPage() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [page, setPage] = useState(0);
  const limit = 5;

  useEffect(() => {
    const fetchMails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mails`, {
          params: {
            skip: page * limit,
            limit,
          },
        });
        setMails(res.data);
      } catch (err) {
        console.error('Failed to fetch mails:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMails();
  }, [page]);

  const companies = ['All', ...new Set(mails.map(mail => mail.company_name || 'Unknown'))];
  const filteredMails =
    selectedCompany === 'All'
      ? mails
      : mails.filter(mail => mail.company_name === selectedCompany);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Scanned Mails</h1>

      <select
        className="border p-2 mb-6"
        value={selectedCompany}
        onChange={e => {
          setSelectedCompany(e.target.value);
          setPage(0);
        }}
      >
        {companies.map(company => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="space-y-6">
            {filteredMails.map(mail => (
              <li key={mail.id} className="p-4 border rounded shadow">
                <p><strong>Sender:</strong> {mail.sender_name || 'N/A'}</p>
                <p><strong>Title:</strong> {mail.document_title || 'N/A'}</p>
                <p><strong>Summary:</strong> {mail.summary || 'N/A'}</p>
                <p><strong>Company:</strong> {mail.company_name || 'N/A'}</p>
                <p><strong>Received:</strong> {new Date(mail.received_at).toLocaleString()}</p>

                <div className="flex gap-4 mt-2 flex-wrap">
                  {mail.url && (
                    <a
                      href={mail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </a>
                  )}

                  {mail.url_envelope_front && (
                    <div className="w-32 h-auto relative">
                      <Image
                        src={mail.url_envelope_front}
                        alt="Envelope Front"
                        width={128}
                        height={80}
                        className="rounded object-contain"
                      />
                    </div>
                  )}

                  {mail.url_envelope_back && (
                    <div className="w-32 h-auto relative">
                      <Image
                        src={mail.url_envelope_back}
                        alt="Envelope Back"
                        width={128}
                        height={80}
                        className="rounded object-contain"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mt-6">
            <button
              className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}


