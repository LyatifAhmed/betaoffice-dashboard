"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Suggestion = { address: string; id: string };
type GetByIdResponse = {
  postcode?: string;
  country?: string;
  town_or_city?: string;
  line_1?: string; line_2?: string; line_3?: string; line_4?: string;
  lines?: string[];
};

export default function AddressPicker(props: {
  onChange?: (addr: {
    line_1: string; line_2?: string; city?: string; postcode?: string; country?: string;
  }) => void;
  defaultPostcode?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postcode, setPostcode] = useState(props.defaultPostcode ?? "");
  const acAbort = useRef<AbortController | null>(null);
  const debTimer = useRef<number | null>(null);

  // autocomplete
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]); setOpen(false);
      return;
    }

    if (debTimer.current) window.clearTimeout(debTimer.current);
    debTimer.current = window.setTimeout(async () => {
      try {
        acAbort.current?.abort();
        acAbort.current = new AbortController();
        setLoading(true);
        const r = await fetch(`/api/autocomplete?term=${encodeURIComponent(query)}&top=6&showPostcode=true`, {
          signal: acAbort.current.signal,
        });
        if (!r.ok) throw new Error("ac failed");
        const data = await r.json();
        setSuggestions(data?.suggestions ?? []);
        setOpen(true);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250) as unknown as number;

    return () => {
      if (debTimer.current) window.clearTimeout(debTimer.current);
      acAbort.current?.abort();
    };
  }, [query]);

  const parseGetById = useCallback((data: any): GetByIdResponse => {
    const a = data?.address ?? data ?? {};
    return {
      line_1: a.line_1 ?? a.lines?.[0] ?? "",
      line_2: a.line_2 ?? a.lines?.[1] ?? "",
      town_or_city: a.town_or_city ?? a.city,
      postcode: a.postcode,
      country: a.country,
      lines: a.lines,
    };
  }, []);

  const selectSuggestion = useCallback(async (s: Suggestion) => {
    try {
      setLoading(true);
      const r = await fetch(`/api/get-by-id?id=${encodeURIComponent(s.id)}`);
      if (!r.ok) throw new Error("get-by-id failed");
      const d = parseGetById(await r.json());

      const normalized = {
        line_1: d.line_1 ?? "",
        line_2: d.line_2 ?? "",
        city: d.town_or_city ?? "",
        postcode: d.postcode ?? "",
        country: d.country ?? "GB",
      };
      props.onChange?.(normalized);
      setQuery(`${normalized.line_1}, ${normalized.city} ${normalized.postcode}`.trim());
      setPostcode(normalized.postcode ?? "");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [parseGetById, props]);

  const findByPostcode = useCallback(async () => {
    if (!postcode) return;
    try {
      setLoading(true);
      const r = await fetch(`/api/find-address?postcode=${encodeURIComponent(postcode)}`);
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert(e?.error || "Postcode not found");
        return;
      }
      const data = await r.json();
      const list: Suggestion[] = (data?.addresses ?? []).map((addr: string, i: number) => ({
        address: addr,
        id: `${postcode}#${i}`,
      }));
      setSuggestions(list);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [postcode]);

  const selectFromPostcodeList = useCallback((s: Suggestion) => {
    const parts = s.address.split(",").map(p => p.trim()).filter(Boolean);
    const pc = parts.find(p => /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(p)) || postcode;
    const city = parts.at(-2) || "";
    const line_1 = parts[0] || "";
    const line_2 = parts[1] || "";
    const normalized = { line_1, line_2, city, postcode: pc || "", country: "GB" };
    props.onChange?.(normalized);
    setQuery(s.address);
    setOpen(false);
  }, [postcode, props]);

  return (
    <div className="w-full max-w-xl space-y-3">
      <label className="block text-sm text-gray-700 dark:text-white/90">
        Address (type to search)
      </label>

      <div className="relative">
        <input
          className="w-full rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 outline-none border border-gray-300
                     dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:border-white/20"
          placeholder="Start typing your address…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
        />

        {open && (
          <div
            className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg
                       max-h-64 overflow-auto
                       dark:border-white/20 dark:bg-[#0b1220] dark:text-white"
          >
            {loading && (
              <div className="px-3 py-2 text-gray-600 dark:text-white/70 text-sm">Loading…</div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="px-3 py-2 text-gray-600 dark:text-white/70 text-sm">No suggestions</div>
            )}
            {!loading &&
              suggestions.map((s, i) => (
                <button
                  key={`${s.id}-${i}`}
                  onClick={() => (s.id.includes("#") ? selectFromPostcodeList(s) : selectSuggestion(s))}
                  className="block w-full text-left px-3 py-2 text-sm
                             hover:bg-gray-50 text-gray-900
                             dark:hover:bg-white/10 dark:text-white"
                >
                  {s.address}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          className="rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 outline-none border border-gray-300
                     dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:border-white/20"
          placeholder="Postcode (e.g. SE16NR)"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
        />
        <button
          type="button"
          onClick={findByPostcode}
          className="rounded-lg px-4 py-2 bg-emerald-600 text-white disabled:opacity-50"
          disabled={!postcode || loading}
        >
          Find by postcode
        </button>
      </div>
    </div>
  );
}
