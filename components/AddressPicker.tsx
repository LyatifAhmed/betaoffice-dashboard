// components/AddressPicker.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UKAddr = {
  line_1: string;
  line_2?: string;
  city?: string;
  postcode?: string;
  country?: string; // "GB"
  label?: string;
};

type Suggestion = { id: string; label: string };

type Props = {
  defaultPostcode?: string;
  onChange?: (addr: UKAddr) => void;
};

const isUkPostcode = (s: string) =>
  /^(GIR 0AA|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[ABD-HJLNP-UW-Z]{2})$/i.test(s.trim());

const normalizePc = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

// basit 60sn cache
type CacheEntry = { data: Suggestion[]; ts: number };
const AC_CACHE = new Map<string, CacheEntry>();
const PC_CACHE = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

export default function AddressPicker({ defaultPostcode = "", onChange }: Props) {
  // ❗ default: ADDRESS mode
  const [mode, setMode] = useState<"address" | "postcode">("address");

  // shared
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // address search
  const [query, setQuery] = useState("");
  const [acList, setAcList] = useState<Suggestion[]>([]);

  // postcode lookup
  const [postcode, setPostcode] = useState(defaultPostcode.toUpperCase());
  const [pcList, setPcList] = useState<Suggestion[]>([]);

  // controls (ekonomi + düzgün iptal)
  const debTimer = useRef<number | null>(null);
  const acAbort = useRef<AbortController | null>(null);
  const suppressAc = useRef(false);
  const lastAcQ = useRef<string>("");

  const cancelAutocomplete = () => {
    if (debTimer.current) {
      window.clearTimeout(debTimer.current);
      debTimer.current = null;
    }
    acAbort.current?.abort();
  };

  const switchMode = (m: "address" | "postcode") => {
    if (m === mode) return;
    setMode(m);
    setOpen(false);
    cancelAutocomplete();
    if (m === "address") {
      // postcode state'i sıfırla
      setPcList([]);
    } else {
      // address state'i sıfırla
      setAcList([]);
    }
  };

  // ----------------- AUTOCOMPLETE (ADDRESS) -----------------
  useEffect(() => {
    if (mode !== "address") return;

    if (suppressAc.current) {
      suppressAc.current = false;
      return;
    }

    const q = query.trim();
    if (q.length < 4) {
      setAcList([]);
      setOpen(false);
      cancelAutocomplete();
      return;
    }

    // cache kontrol
    const cached = AC_CACHE.get(q);
    const now = Date.now();
    if (cached && now - cached.ts < TTL_MS) {
      setAcList(cached.data);
      setOpen(cached.data.length > 0);
      return;
    }

    // aynı sorguyu üst üste çalıştırma
    if (lastAcQ.current === q) return;
    lastAcQ.current = q;

    cancelAutocomplete();
    acAbort.current = new AbortController();

    debTimer.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(
          `/api/autocomplete?term=${encodeURIComponent(q)}&top=6&showPostcode=true`,
          { signal: acAbort.current!.signal }
        );
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();

        const arr: any[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.items)
          ? (data as any).items
          : Array.isArray((data as any)?.suggestions)
          ? (data as any).suggestions
          : [];

        const list: Suggestion[] = arr
          .map((d: any): Suggestion => ({
            id: d.id ?? d.value ?? d.key ?? d.url ?? String(Math.random()),
            label:
              d.label ??
              d.text ??
              d.address ??
              d.description ??
              (typeof d === "string" ? d : ""),
          }))
          .filter((s: Suggestion) => typeof s.label === "string" && !!s.label);

        setAcList(list);
        AC_CACHE.set(q, { data: list, ts: now });
        setOpen(list.length > 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 400) as unknown as number;

    return cancelAutocomplete;
  }, [query, mode]);

  const parseGetById = useCallback((data: any) => {
    const a = data?.address ?? data ?? {};
    const line_1: string = a.line_1 ?? a.address_line_1 ?? a.lines?.[0] ?? "";
    const line_2: string = a.line_2 ?? a.address_line_2 ?? a.lines?.[1] ?? "";
    const city: string = a.town_or_city ?? a.city ?? a.post_town ?? a.locality ?? "";
    const pc: string = a.postcode ?? a.post_code ?? "";
    const country: string = a.country ?? "GB";
    return { line_1, line_2, city, postcode: pc, country };
  }, []);

  const selectSuggestion = useCallback(
    async (s: Suggestion) => {
      if (mode !== "address") return;

      cancelAutocomplete();
      suppressAc.current = true;

      try {
        setLoading(true);
        const r = await fetch(`/api/get-by-id?id=${encodeURIComponent(s.id)}`);
        if (!r.ok) throw new Error(await r.text());
        const d = parseGetById(await r.json());

        onChange?.(d);
        setQuery([d.line_1, d.line_2, d.city, d.postcode].filter(Boolean).join(", "));
        setPostcode((d.postcode || "").toUpperCase());
        setOpen(false);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [mode, onChange, parseGetById]
  );

  // ----------------- POSTCODE LOOKUP -----------------
  const findByPostcode = useCallback(async () => {
    if (mode !== "postcode") return;
    const pcN = normalizePc(postcode);
    if (!isUkPostcode(pcN)) return;

    // cache kontrol
    const now = Date.now();
    const cached = PC_CACHE.get(pcN);
    if (cached && now - cached.ts < TTL_MS) {
      setPcList(cached.data);
      setOpen(cached.data.length > 0);
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`/api/find-address?postcode=${encodeURIComponent(pcN)}`);
      if (!r.ok) throw new Error(await r.text());
      const raw = await r.json();

      const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.addresses)
        ? raw.addresses
        : Array.isArray(raw?.results)
        ? raw.results
        : [];

      const list: Suggestion[] = arr.map((x: any, i: number) => {
        const label: string =
          typeof x === "string"
            ? x
            : x.label ||
              x.formatted_address ||
              x.description ||
              [
                x.line_1 || x.address_line_1 || x.address1 || x.street || "",
                x.line_2 || x.address_line_2 || "",
                x.city || x.town || x.post_town || x.locality || "",
                x.postcode || x.post_code || pcN,
              ]
                .filter(Boolean)
                .join(", ");
        return { id: `${pcN}#${i}`, label };
      });

      setPcList(list);
      PC_CACHE.set(pcN, { data: list, ts: now });
      setOpen(list.length > 0);
    } catch {
      setPcList([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [mode, postcode]);
  const UK_PC_RE = /\b(GIR 0AA|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[ABD-HJLNP-UW-Z]{2})\b/i;

  function parseFromPostcodeLabel(label: string, fallbackPc: string) {
    const m = label.match(UK_PC_RE);
    const pc = (m?.[0] || fallbackPc || "").toUpperCase();

    // postcode'tan ÖNCEKİ metni al, sondaki virgül/boşlukları temizle
    const before = (m ? label.slice(0, m.index!) : label).replace(/[,\s]+$/, "");

    const parts: string[] = before
      .split(",")
      .map((p: string) => p.trim())
      .filter((x): x is string => Boolean(x));

    // son parça = city, ondan önce kalanlar = line_1/line_2
    const city = parts.length ? parts[parts.length - 1] : "";
    const head = parts.slice(0, Math.max(0, parts.length - 1));

    const line_1 = head[0] || "";
    const line_2 = head.length > 1 ? head.slice(1).join(", ") : "";

    return { line_1, line_2, city, postcode: pc, country: "GB" as const };
  } 

  const selectFromPostcodeList = useCallback(
    (s: Suggestion) => {
      const label = String(s.label || "");
      const normalized = parseFromPostcodeLabel(label, postcode);
      onChange?.(normalized);
      setQuery(label);
      setOpen(false);
    },
    [onChange, postcode]
  );

  // ----------------- RENDER -----------------
  return (
    <div className="w-full max-w-xl space-y-3">
      {/* Mode selector (Address önce) */}
      <div className="flex gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="addrMode"
            checked={mode === "address"}
            onChange={() => switchMode("address")}
          />
          Address search (free text)
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="addrMode"
            checked={mode === "postcode"}
            onChange={() => switchMode("postcode")}
          />
          UK Postcode lookup
        </label>
      </div>

      {/* ADDRESS SEARCH UI */}
      {mode === "address" && (
        <div className="relative">
          <input
            className="w-full rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 outline-none border border-gray-300
                       dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:border-white/20"
            placeholder="Start typing your address… (min 4 chars)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (acList.length) setOpen(true);
            }}
          />

          {open && (
            <div
              className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg
                         max-h-64 overflow-auto
                         dark:border-white/20 dark:bg-[#0b1220] dark:text-white"
            >
              {loading && (
                <div className="px-3 py-2 text-gray-600 dark:text-white/70 text-sm">
                  Loading…
                </div>
              )}
              {!loading && acList.length === 0 && (
                <div className="px-3 py-2 text-gray-600 dark:text-white/70 text-sm">
                  No suggestions
                </div>
              )}
              {!loading &&
                acList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSuggestion(s)}
                    className="block w-full text-left px-3 py-2 text-sm
                               hover:bg-gray-50 text-gray-900
                               dark:hover:bg-white/10 dark:text-white"
                  >
                    {s.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* POSTCODE UI */}
      {mode === "postcode" && (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className="rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 outline-none border border-gray-300
                         dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:border-white/20"
              placeholder="Postcode (e.g. SE6 3NR)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onFocus={() => {
                // bu moda girerken adres modunu tamamen susturduk
                switchMode("postcode");
              }}
            />
            <button
              type="button"
              onClick={findByPostcode}
              className="rounded-lg px-4 py-2 bg-emerald-600 text-white disabled:opacity-50"
              disabled={!isUkPostcode(normalizePc(postcode)) || loading}
            >
              {loading ? "Searching…" : "Find by postcode"}
            </button>
          </div>

          {open && pcList.length > 0 && (
            <div
              className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm
                         max-h-64 overflow-auto mt-1
                         dark:border-white/20 dark:bg-[#0b1220] dark:text-white"
            >
              {pcList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectFromPostcodeList(s)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            UK lookup is on — country is fixed to GB.
          </p>
        </>
      )}
    </div>
  );
}
