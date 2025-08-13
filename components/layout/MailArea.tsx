// components/layout/MailArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import MailCard from "@/components/ui/MailCard";

/**
 * List:     /api/hoxton/mail?external_id=...&source=db   (local DB)
 * Actions:  /api/backend/...                              (Next API proxy -> backend)
 */

/* ------------------------------- Helpers -------------------------------- */

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

// try POST, then PUT, then PATCH
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

// small util for the Next proxy path
const apiBackend = (path: string) => `/api/backend${path}`;

/* ------------------------------ Types & utils ---------------------------- */

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
      const hit = ki.find((x) => /deadline|due|expire/i.test(String(x?.key ?? "")));
      if (hit?.value) return String(hit.value);
    }
  } catch {}
  return row.expires_at ?? row.deadline ?? null;
};

/* -------------------------------- Component ------------------------------ */

export default function MailArea({
  mails = [],
  onSelectionMetaChange,
}: {
  mails?: RawMailItem[];
  onSelectionMetaChange?: (meta: {
    selectedCount: number;
    onDeleteMarked: () => void; // becomes “Move to trash” when not in trash; “Restore” when in trash
    onSelectAll: () => void;
    onClear: () => void;
    isTrashView: boolean;
  }) => void;
}) {
  const [externalId, setExternalId] = useState<string | null>(null);

  // external_id: cookie -> localStorage fallback
  useEffect(() => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]) : null;
      const fromLS = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
      setExternalId(fromCookie || fromLS);
    }
  }, []);

  // ✅ Always read from local DB
  const swrKey = externalId
    ? `/api/hoxton/mail?external_id=${encodeURIComponent(externalId)}&source=db`
    : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const [items, setItems] = useState<MailItem[]>([]);
  useEffect(() => {
    // Provider: {results: [...]} ; DB: [...]
    const src: RawMailItem[] =
      Array.isArray((data as any)?.results) ? (data as any).results :
      Array.isArray(data) ? (data as any) :
      Array.isArray(mails) ? mails : [];

    const normalized = src.map((row: any) => {
      const status: MailItem["_status"] = row.status === "trash" ? "trash" : "active";
      return {
        id: String(row.id ?? crypto.randomUUID()),
        sender: pickSender(row),
        category: normalizeCategory(row),
        summary: row.summary ?? row.document_title ?? row.title ?? "",
        receivedAt: pickReceivedAt(row),
        expiresAt: pickExpiresAt(row),
        fileUrl: row.url ?? null,
        isRead: Boolean(row.is_read),
        _status: status,
      };
    });

    // newest first
    normalized.sort((a, b) => {
      const ta = new Date(a.receivedAt || 0).getTime();
      const tb = new Date(b.receivedAt || 0).getTime();
      return tb - ta;
    });

    setItems(normalized);
  }, [data, mails]);

  // filter/search/date
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

  // selection / bulk
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

  /* --------------------------- Actions → backend -------------------------- */

  const markAsRead = async (id: string) => {
    try {
      // optimistic
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      await reqWithFallback(apiBackend(`/mail/${encodeURIComponent(id)}/mark-read`));
      await mutate();
    } catch (e) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: false } : m)));
      console.error(e);
      alert("Mark as read failed.");
    }
  };

  const forwardMail = async (id: string) => {
    try {
      const body: any = { mail_id: id };
      if (externalId) body.external_id = externalId;
      await reqWithFallback(apiBackend(`/mail/forward`), body);
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Forward failed.");
    }
  };

  // Try several “trash” endpoints so it works with your backend variants
  async function moveToTrash(id: string) {
    const candidates = [
      apiBackend(`/mail/${encodeURIComponent(id)}/trash`),
      apiBackend(`/mail/${encodeURIComponent(id)}/move-to-trash`),
      apiBackend(`/mail/${encodeURIComponent(id)}`), // PATCH with body
    ];
    // optimistic
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, _status: "trash" } : m)));
    try {
      let ok = false;
      for (const url of candidates) {
        try {
          if (url.endsWith(`/mail/${encodeURIComponent(id)}`)) {
            await reqWithFallback(url, { status: "trash" });
          } else {
            await reqWithFallback(url);
          }
          ok = true;
          break;
        } catch {
          // try next
        }
      }
      if (!ok) throw new Error("No matching trash endpoint");
    } catch (e) {
      // revert
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, _status: "active" } : m)));
      console.error(e);
      alert("Move to trash failed.");
    } finally {
      await mutate();
    }
  }

  async function restoreFromTrash(id: string) {
    const candidates = [
      apiBackend(`/mail/${encodeURIComponent(id)}/restore`),
      apiBackend(`/mail/${encodeURIComponent(id)}/untrash`),
      apiBackend(`/mail/${encodeURIComponent(id)}`), // PATCH with body
    ];
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, _status: "active" } : m)));
    try {
      let ok = false;
      for (const url of candidates) {
        try {
          if (url.endsWith(`/mail/${encodeURIComponent(id)}`)) {
            await reqWithFallback(url, { status: "inbox" });
          } else {
            await reqWithFallback(url);
          }
          ok = true;
          break;
        } catch {}
      }
      if (!ok) throw new Error("No matching restore endpoint");
    } catch (e) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, _status: "trash" } : m)));
      console.error(e);
      alert("Restore failed.");
    } finally {
      await mutate();
    }
  }

  // bulk via per-item (works without a dedicated bulk API)
  const moveSelectedToTrash = async () => {
    if (!anySelected) return;
    const ids = Array.from(selected);
    onClear();
    // optimistic
    setItems(prev => prev.map(m => (ids.includes(m.id) ? { ...m, _status: "trash" } : m)));
    try {
      await Promise.all(ids.map(moveToTrash));
    } finally {
      await mutate();
    }
  };

  const restoreSelected = async () => {
    if (!anySelected) return;
    const ids = Array.from(selected);
    onClear();
    setItems(prev => prev.map(m => (ids.includes(m.id) ? { ...m, _status: "active" } : m)));
    try {
      await Promise.all(ids.map(restoreFromTrash));
    } finally {
      await mutate();
    }
  };

  // ✅ UPDATED: Clear trash = DB’den kalıcı sil
  const clearTrash = async () => {
    if (!externalId) return alert("external_id not found.");
    const snapshot = items;
    // optimistic: listedeki tüm trash öğelerini kaldır
    setItems((prev) => prev.filter((m) => m._status !== "trash"));
    onClear();
    try {
      await fetch(apiBackend(`/mail/trash?external_id=${encodeURIComponent(externalId)}`), {
        method: "DELETE",
      });
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Clear trash failed.");
      // rollback
      setItems(snapshot);
    }
  };

  // expose selection meta to the floating SelectionBar
  useEffect(() => {
    onSelectionMetaChange?.({
      selectedCount: anySelected ? selected.size : 0,
      onDeleteMarked: isTrashView ? restoreSelected : moveSelectedToTrash,
      onSelectAll,
      onClear,
      isTrashView,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anySelected, selected.size, isTrashView]);

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {isTrashView ? "Trash" : "Your scanned mail"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => mutate()}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15 dark:text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
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
                    : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/20",
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
              className="px-4 py-2 w-full sm:w-44 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-white/20 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full sm:w-auto dark:bg-transparent dark:border-white/20 dark:text-white"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full sm:w-auto dark:bg-transparent dark:border-white/20 dark:text-white"
            />
            {isTrashView && (
              <button
                onClick={clearTrash}
                className="ml-1 px-3 py-2 text-sm rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-400/20"
                title="Permanently remove all items from trash"
              >
                Clear trash
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="grid gap-3 max-h-[calc(100svh-260px)] overflow-y-auto pr-1 pb-2">
          {error ? (
            <div className="text-rose-600 dark:text-rose-300 text-center py-10">Failed to load mail.</div>
          ) : isLoading && !data ? (
            <div className="text-gray-500 dark:text-white/70 text-center py-10">Loading scanned mail...</div>
          ) : visibleItems.length > 0 ? (
            visibleItems.map((mail) => {
              const checked = selected.has(mail.id);
              const inTrash = mail._status === "trash";
              return (
                <div key={mail.id} className="flex items-start gap-3">
                  {/* Select checkbox (styled) */}
                  <label className="mt-2 inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(mail.id)}
                      className="peer sr-only"
                      aria-label={`Select ${mail.sender}`}
                    />
                    <span className="h-5 w-5 rounded-md border border-gray-300 bg-white shadow-sm
                                      peer-checked:bg-blue-600 peer-checked:border-blue-600
                                      dark:bg-transparent dark:border-white/25"></span>
                  </label>

                  {/* Card + quick actions */}
                  <div className="flex-1 min-w-0">
                    <MailCard mail={mail} />

                    {/* Single quick-action row (no duplicate Forward button elsewhere) */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!inTrash ? (
                        <>
                          <button
                            onClick={() => markAsRead(mail.id)}
                            className="px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/15 dark:text-white"
                          >
                            Mark as read
                          </button>
                          <button
                            onClick={() => moveToTrash(mail.id)}
                            className="px-2 py-1 text-xs rounded-md border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200"
                          >
                            Move to trash
                          </button>
                          <button
                            onClick={() => forwardMail(mail.id)}
                            className="px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/15 dark:text-white"
                          >
                            Forward
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => restoreFromTrash(mail.id)}
                          className="px-2 py-1 text-xs rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-400/30 dark:text-emerald-200"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 dark:text-white/70 text-center py-10">
              {isTrashView ? "Trash is empty." : "No mail found."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
