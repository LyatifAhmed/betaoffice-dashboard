// components/MailList.tsx
import { useMemo, useState } from 'react'
import type { MailItem } from '@/types/mail'

const KNOWN_CATEGORIES = [
  'Financial','Taxation','Official / Legal','Suppliers & Vendors','Clients & Customers',
  'Human Resources','Industry Updates','Government & Public Sector','Marketing & Advertising',
  'Technology & IT','Utilities & Services'
];

type Props = { items: MailItem[] };

export default function MailList({ items }: Props) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | 'ALL'>('ALL');

  const dynamicCats = useMemo(() => {
    const s = new Set<string>();
    items.forEach(i => (i.ai_metadata?.categories || []).forEach(c => s.add(c)));
    // merge known + dynamic, keep unique
    return Array.from(new Set([...KNOWN_CATEGORIES, ...Array.from(s)])).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const hay = [
        i.file_name,
        i.ai_metadata?.sender_name,
        i.ai_metadata?.document_title,
        i.ai_metadata?.summary,
        i.ai_metadata?.reference_number,
        ...(i.ai_metadata?.categories || []),
      ].join(' ').toLowerCase();
      const okQ = q ? hay.includes(q.toLowerCase()) : true;
      const cats = i.ai_metadata?.categories || [];
      const okCat = cat === 'ALL' ? true : cats.includes(cat);
      return okQ && okCat;
    });
  }, [items, q, cat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <input
          placeholder="Search sender, title, ref, file..."
          className="w-full md:max-w-md border rounded px-3 py-2"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={cat} onChange={e => setCat(e.target.value as any)}>
          <option value="ALL">All categories</option>
          {dynamicCats.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} / {items.length}</span>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(i => (
          <li key={i.id} className="rounded-xl border p-4 bg-white shadow-sm space-y-3">
            <div className="text-sm text-gray-500">{new Date(i.created_at).toLocaleString()}</div>
            <div className="font-medium">{i.ai_metadata?.document_title || i.file_name || 'Untitled'}</div>
            {i.ai_metadata?.sender_name && (
              <div className="text-sm">From: <span className="font-medium">{i.ai_metadata.sender_name}</span></div>
            )}
            {i.ai_metadata?.summary && (
              <p className="text-sm text-gray-700 line-clamp-3">{i.ai_metadata.summary}</p>
            )}
            {(i.ai_metadata?.categories?.length ? (
              <div className="flex flex-wrap gap-2">
                {i.ai_metadata!.categories!.map(c => (
                  <span key={c} className="text-xs bg-gray-100 rounded-full px-2 py-1">{c}</span>
                ))}
              </div>
            ) : null)}
            <div className="flex gap-2">
              {i.url && (
                <a href={i.url} target="_blank" className="text-blue-600 text-sm underline">Open PDF</a>
              )}
              {i.url_envelope_front && (
                <a href={i.url_envelope_front} target="_blank" className="text-blue-600 text-sm underline">Envelope (front)</a>
              )}
              {i.url_envelope_back && (
                <a href={i.url_envelope_back} target="_blank" className="text-blue-600 text-sm underline">Envelope (back)</a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}