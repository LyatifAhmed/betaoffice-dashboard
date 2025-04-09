import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Select from 'react-select';

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

type Tab = 'All' | 'Unread' | 'Read';

export default function MailPage() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>({ label: 'All', value: 'All' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [readMails, setReadMails] = useState<Set<string>>(new Set());

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

  const toggleRead = (id: string) => {
    setReadMails(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const companies = ['All', ...new Set(mails.map(mail => mail.company_name || 'Unknown'))];
  const companyOptions = companies.map(name => ({ label: name, value: name }));

  const filteredMails = mails
    .filter(mail =>
      selectedCompany.value === 'All' || mail.company_name === selectedCompany.value
    )
    .filter(mail =>
      [mail.sender_name, mail.document_title, mail.summary]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(mail => {
      if (activeTab === 'Unread') return !readMails.has(mail.id);
      if (activeTab === 'Read') return readMails.has(mail.id);
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.received_at).getTime();
      const bTime = new Date(b.received_at).getTime();
      return sortNewestFirst ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Scanned Mails</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by sender, title or summary"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          className="border p-2 w-full md:w-1/3"
        />

        <Select
          options={companyOptions}
          value={selectedCompany}
          onChange={option => {
            setSelectedCompany(option);
            setPage(0);
          }}
          placeholder="Filter by company"
        />

        <button
          className="bg-gray-100 border p-2 rounded"
          onClick={() => setSortNewestFirst(prev => !prev)}
        >
          Sort: {sortNewestFirst ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {(['All', 'Unread', 'Read'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded border ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="space-y-6">
            {filteredMails.map(mail => (
              <li
                key={mail.id}
                className={`p-4 border rounded shadow bg-white ${
                  !readMails.has(mail.id) ? 'border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">
                    {mail.document_title || 'Untitled'}{' '}
                    {!readMails.has(mail.id) && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Unread
                      </span>
                    )}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(mail.received_at).toLocaleString()}
                  </span>
                </div>

                <p><strong>Sender:</strong> {mail.sender_name || 'N/A'}</p>
                <p><strong>Summary:</strong> {mail.summary || 'N/A'}</p>
                <p><strong>Company:</strong> {mail.company_name || 'N/A'}</p>

                <div className="flex gap-4 mt-3 flex-wrap">
                  {mail.url && (
                    <a
                      href={mail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Document
                    </a>
                  )}
                  {mail.url_envelope_front && (
                    <div className="w-32 h-auto relative">
                      <Image
                        src={mail.url_envelope_front}
                        alt={`Envelope front for ${mail.company_name || 'N/A'}`}
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
                        alt={`Envelope back for ${mail.company_name || 'N/A'}`}
                        width={128}
                        height={80}
                        className="rounded object-contain"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleRead(mail.id)}
                  className="mt-4 text-sm px-3 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                >
                  Mark as {readMails.has(mail.id) ? 'Unread' : 'Read'}
                </button>
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

