"use client";

import { useEffect, useMemo, useState } from "react";
import type { MailItem } from "@/types/mail";
import { Filter, X, Search, FileText } from "lucide-react";

const KNOWN_CATEGORIES = [
  "Financial",
  "Taxation",
  "Official / Legal",
  "Suppliers & Vendors",
  "Clients & Customers",
  "Human Resources",
  "Industry Updates",
  "Government & Public Sector",
  "Marketing & Advertising",
  "Technology & IT",
  "Utilities & Services",
];

type Props = { items: MailItem[] };

export default function MailList({ items }: Props) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [cat, setCat] = useState<string | "ALL">("ALL");

  // debounce search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 200);
    return () => window.clearTimeout(t);
  }, [q]);

  // Dinamik + bilinen kategoriler
  const dynamicCats = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => (i.ai_metadata?.categories || []).forEach((c) => s.add(c)));
    return Array.from(new Set([...KNOWN_CATEGORIES, ...Array.from(s)])).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const query = debouncedQ.toLowerCase();
    return items.filter((i) => {
      const hay = [
        i.file_name,
        i.ai_metadata?.sender_name,
        i.ai_metadata?.document_title,
        i.ai_metadata?.summary,
        i.ai_metadata?.reference_number,
        ...(i.ai_metadata?.categories || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const okQ = query ? hay.includes(query) : true;
      const cats = i.ai_metadata?.categories || [];
      const okCat = cat === "ALL" ? true : cats.includes(cat);
      return okQ && okCat;
    });
  }, [items, debouncedQ, cat]);

  const clearSearch = () => setQ("");
  const total = items.length;
  const count = filtered.length;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="flex flex-col md:flex-row gap-3 md:items-center
                   rounded-xl border border-white/15 bg-white/60 dark:bg-white/5
                   backdrop-blur-md p-3"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-white/50" />
          <input
            placeholder="Search sender, title, ref, file..."
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 dark:border-white/15
                       bg-white/80 dark:bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       text-sm dark:text-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") clearSearch();
            }}
          />
          {q && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label="Clear search"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 text-sm text-gray-600 dark:text-white/60">
            <Filter className="w-4 h-4" /> Category
          </span>
          <select
            className="border border-gray-200 dark:border-white/15 rounded-lg px-3 py-2 bg-white/80 dark:bg-transparent text-sm dark:text-white"
            value={cat}
            onChange={(e) => setCat(e.target.value as any)}
          >
            <option value="ALL">All categories</option>
            {dynamicCats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div className="md:ml-auto text-sm text-gray-600 dark:text-white/70">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border
                           border-gray-200 dark:border-white/15 bg-white/70 dark:bg-white/10">
            {count} / {total}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15
                        bg-white/50 dark:bg-white/5 backdrop-blur-md p-10 text-center">
          <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center
                          border border-gray-300 dark:border-white/20 mb-3">
            <FileText className="w-5 h-5 text-gray-500 dark:text-white/60" />
          </div>
          <div className="text-sm text-gray-600 dark:text-white/70">
            No results. Try a different search or category.
          </div>
        </div>
      ) : null}

      {/* Grid */}
      {count > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((i) => {
            const created = i.created_at
              ? new Date(i.created_at).toLocaleString()
              : "";

            return (
              <li
                key={i.id}
                className="rounded-xl border border-white/20 bg-white/70 dark:bg-white/10
                           backdrop-blur-md shadow-sm p-4 space-y-3
                           hover:border-blue-300 transition"
              >
                <div className="text-xs text-gray-500 dark:text-white/60">{created}</div>

                <div className="font-medium text-gray-900 dark:text-white">
                  {i.ai_metadata?.document_title || i.file_name || "Untitled"}
                </div>

                {i.ai_metadata?.sender_name && (
                  <div className="text-sm text-gray-700 dark:text-white/80">
                    From: <span className="font-medium">{i.ai_metadata.sender_name}</span>
                  </div>
                )}

                {i.ai_metadata?.summary && (
                  <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-3">
                    {i.ai_metadata.summary}
                  </p>
                )}

                {i.ai_metadata?.categories?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {i.ai_metadata.categories.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-1 rounded-full
                                   bg-gray-100 text-gray-700
                                   dark:bg-white/10 dark:text-white/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-1">
                  {i.url && (
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-blue-700 dark:text-blue-300 hover:opacity-90"
                    >
                      Open PDF
                    </a>
                  )}
                  {i.url_envelope_front && (
                    <a
                      href={i.url_envelope_front}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-blue-700 dark:text-blue-300 hover:opacity-90"
                    >
                      Envelope (front)
                    </a>
                  )}
                  {i.url_envelope_back && (
                    <a
                      href={i.url_envelope_back}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-blue-700 dark:text-blue-300 hover:opacity-90"
                    >
                      Envelope (back)
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
