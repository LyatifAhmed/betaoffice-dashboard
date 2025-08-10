// components/layout/MailArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import MailCard from "@/components/ui/MailCard";

// ---------------- Backend base helper ----------------
const BACKEND =
  (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim()) ||
  (typeof window !== "undefined"
    ? `${location.protocol}//${location.hostname}:8000`
    : "");

function mustBackend(urlPath: string) {
  if (!BACKEND) throw new Error("Backend base URL not set");
  return `${BACKEND}${urlPath}`;
}

// ---------------- Fetch helpers ----------------
const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

// önce POST, sonra PUT/PATCH dene
async function reqWithFallback(url: string, body?: any) {
  const methods = ["POST", "PUT", "PATCH"];
  const headers = body ? { "Content-Type": "application/json" } : undefined;
  let lastErr: any = null;
  for (const m of methods) {
    try {
      const res = await fetch(url, {
        method: m,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) return res;
      if ([404, 405, 415].includes(res.status)) {
        lastErr = new Error(`${m} ${url} -> ${res.status}`);
        continue;
      }
      const txt = await res.text().catch(() => "");
      throw new Error(`${m} ${url} -> ${res.status}: ${txt}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`All methods failed for ${url}`);
}

// ---------------- Types & normalizers ----------------
type MailCategory = "bank" | "government" | "urgent" | "other";
type RawMailItem = any;

type MailItem = {
  id: string;
  sender: string;
  category: MailCategory;
  summary: string;
  receivedAt: string;
  expiresAt: string | null;
  fileUrl: string | null;
  isRead: boolean;
  _status: "active" | "trash";
};

const categoryLabels = {
  all: "All",
  bank: "Bank",
  government: "Government",
  urgent: "Urgent",
  other: "Other",
  trash: "Trash",
} as const;

const normalizeCategory = (row: any): MailCategory => {
  const guess =
    row.category ??
    row.industry ??
    (Array.isArray(row.categories) ? row.categories[0] : null) ??
    row.status ??
    "other";
  const lower = String(guess ?? "other").toLowerCase();
  if (["bank", "government", "urgent"].includes(lower)) return lower as MailCategory;
  return "other";
};

const pickSender = (row: any) =>
  row.sender_name ??
  row.from_name ??
  row.sender ??
  row.company_name ??
  row.company ??
  "Unknown sender";

const pickReceivedAt = (row: any) =>
  row.received_at ?? row.created_at ?? row.createdAt ?? row.date ?? new Date().toISOString();

const pickExpiresAt = (row: any) => {
  try {
    const ki =
      typeof row.key_information === "string"
        ? JSON.parse(row.key_information)
        : row.key_information;
    if (Array.isArray(ki)) {
      const hit = ki.find((x) =>
        /deadline|due|expire/i.test(String(x?.key ?? "")),
      );
      if (hit?.value) return String(hit.value);
    }
  } catch {}
  return row.expires_at ?? row.deadline ?? null;
};

// ---------------- Component ----------------
export default function MailArea({
  mails = [],
  onSelectionMetaChange,
}: {
  mails?: RawMailItem[];
  onSelectionMetaChange?: (meta: {
    selectedCount: number;
    onDeleteMarked: () => void;
    onSelectAll: () => void;
    onClear: () => void;
    isTrashView: boolean;
  }) => void;
}) {
  const [externalId, setExternalId] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
    setExternalId(id);
  }, []);

  const swrKey = externalId ? mustBackend(`/mail?external_id=${encodeURIComponent(externalId)}`) : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { keepPreviousData: true });

  const [items, setItems] = useState<MailItem[]>([]);
  useEffect(() => {
    const src: RawMailItem[] = Array.isArray(data) ? data : Array.isArray(mails) ? mails : [];
    const normalized = src.map((row: any) => ({
      id: String(row.id ?? crypto.randomUUID()),
      sender: pickSender(row),
      category: normalizeCategory(row),
      summary: row.summary ?? row.document_title ?? row.title ?? "",
      receivedAt: pickReceivedAt(row),
      expiresAt: pickExpiresAt(row),
      fileUrl: row.url ?? null,
      isRead: Boolean(row.is_read),
      _status: "active" as const,
    }));
    setItems(normalized);
  }, [data, mails]);

  // filtre/arama/tarih
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isTrashView = category === "trash";

  const visibleItems = useMemo(() => {
    const base = items.filter((m) => (isTrashView ? m._status === "trash" : m._status === "active"));
    return base.filter((mail) => {
      const catOk = category === "all" || category === "trash" || mail.category === category;
      const q = search.trim().toLowerCase();
      const textOk =
        !q || mail.sender.toLowerCase().includes(q) || mail.summary.toLowerCase().includes(q);
      const d = new Date(mail.receivedAt);
      const fromOk = fromDate ? d >= new Date(fromDate) : true;
      const toOk = toDate ? d <= new Date(toDate) : true;
      return catOk && textOk && fromOk && toOk;
    });
  }, [items, category, isTrashView, search, fromDate, toDate]);

  // seçim / toplu
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const anySelected = selected.size > 0;

  const onToggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const onSelectAll = () => {
    const n = new Set(selected);
    visibleItems.forEach((m) => n.add(m.id));
    setSelected(n);
  };
  const onClear = () => setSelected(new Set());

  const moveSelectedToTrash = () => {
    if (!anySelected) return;
    setItems((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, _status: "trash" } : m)));
    onClear();
  };
  const restoreSelected = () => {
    if (!anySelected) return;
    setItems((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, _status: "active" } : m)));
    onClear();
  };
  const clearTrash = () => {
    setItems((prev) => prev.filter((m) => m._status !== "trash"));
    onClear();
  };

  // ---- actions → backend
  const markAsRead = async (id: string) => {
    try {
      // optimistic
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      await reqWithFallback(mustBackend(`/mail/${encodeURIComponent(id)}/mark-read`));
      await mutate();
    } catch (e) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: false } : m)));
      console.error(e);
      alert("Mark as read failed");
    }
  };

  const markAllRead = async () => {
    if (!externalId) return alert("external_id bulunamadı (localStorage).");
    try {
      setItems((prev) => prev.map((m) => ({ ...m, isRead: true })));
      await reqWithFallback(
        mustBackend(`/mail/mark-all-read?external_id=${encodeURIComponent(externalId)}`),
      );
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Mark all read failed");
    }
  };

  const forwardMail = async (id: string) => {
    try {
      const body: any = { mail_id: id };
      if (externalId) body.external_id = externalId;
      await reqWithFallback(mustBackend(`/mail/forward`), body);
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Forward failed");
    }
  };

  // SelectionBar için meta
  useEffect(() => {
    onSelectionMetaChange?.({
      selectedCount: anySelected ? selected.size : 0,
      onDeleteMarked: isTrashView ? restoreSelected : moveSelectedToTrash,
      onSelectAll,
      onClear,
      isTrashView,
    });
  }, [anySelected, selected.size, isTrashView]);

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-4">
        {/* Üst satır */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {isTrashView ? "Trash" : "Your scanned mail"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
            >
              Mark all read
            </button>
            <button
              onClick={() => mutate()}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Kategori / Arama / Tarih */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  onClear();
                }}
                className={[
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  category === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200",
                ].join(" ")}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 w-full sm:w-44 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full sm:w-auto"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full sm:w-auto"
            />
            {isTrashView && (
              <button
                onClick={clearTrash}
                className="ml-1 px-3 py-2 text-sm rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                title="Permanently delete everything in trash"
              >
                Clear trash
              </button>
            )}
          </div>
        </div>

        {/* Liste (scrollable) */}
        <div className="grid gap-3 max-h-[calc(100svh-260px)] overflow-y-auto pr-1 pb-2">
          {error ? (
            <div className="text-rose-600 text-center py-10">Failed to load mail.</div>
          ) : isLoading && !data ? (
            <div className="text-gray-500 text-center py-10">Loading scanned mail...</div>
          ) : visibleItems.length > 0 ? (
            visibleItems.map((mail) => {
              const checked = selected.has(mail.id);
              return (
                <div key={mail.id} className="flex items-start gap-3">
                  {/* Select checkbox */}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(mail.id)}
                    className="mt-2 h-4 w-4 sm:h-5 sm:w-5 accent-blue-600 cursor-pointer"
                    aria-label={`Select ${mail.sender}`}
                  />

                  {/* Card */}
                  <div className="flex-1 min-w-0">
                    <MailCard mail={mail} />
                    {/* Kart altı küçük aksiyonlar */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => markAsRead(mail.id)}
                        className="px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Mark as read
                      </button>
                      <button
                        onClick={() => forwardMail(mail.id)}
                        className="px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Forward
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-center py-10">
              {isTrashView ? "Trash is empty." : "No mail found."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
