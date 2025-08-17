// components/layout/MailArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import MailCard, { Mail as MailCardType } from "@/components/ui/MailCard";
import { Calendar, Filter, Check, Trash2, RotateCcw } from "lucide-react";
import React from "react";
import Checkbox from "@/components/ui/Checkbox";
import SelectionBar from "@/components/layout/SelectionBar";

/* ------------------------------- Helpers -------------------------------- */

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

async function reqWithFallback(url: string, body?: any) {
  const methods = ["POST", "PUT", "PATCH"];
  const headers = body ? { "Content-Type": "application/json" } : undefined;
  let lastErr: any = null;
  for (const m of methods) {
    try {
      const res = await fetch(url, { method: m, headers, body: body ? JSON.stringify(body) : undefined });
      if (res.ok) return res;
      if ([404, 405, 415].includes(res.status)) { lastErr = new Error(`${m} ${url} -> ${res.status}`); continue; }
      const txt = await res.text().catch(() => "");
      throw new Error(`${m} ${url} -> ${res.status}: ${txt}`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error(`All methods failed for ${url}`);
}

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
  const guess = row.category ?? row.industry ?? (Array.isArray(row.categories) ? row.categories[0] : null) ?? row.status ?? "other";
  const lower = String(guess ?? "other").toLowerCase();
  if (["bank", "government", "urgent"].includes(lower)) return lower as MailCategory;
  return "other";
};

const pickSender = (row: any) =>
  row.sender_name ?? row.from_name ?? row.sender ?? row.company_name ?? row.company ?? "Unknown sender";

const pickReceivedAt = (row: any) =>
  row.received_at ?? row.created_at ?? row.createdAt ?? row.date ?? new Date().toISOString();

const pickExpiresAt = (row: any) => {
  try {
    const ki = typeof row.key_information === "string" ? JSON.parse(row.key_information) : row.key_information;
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
    onDeleteMarked: () => void;
    onSelectAll: () => void;
    onClear: () => void;
    isTrashView: boolean;
  }) => void;
}) {
  const [externalId, setExternalId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]) : null;
      const fromLS = typeof window !== "undefined" ? localStorage.getItem("external_id") : null;
      setExternalId(fromCookie || fromLS);
    }
  }, []);

  const swrKey = externalId ? `/api/hoxton/mail?external_id=${encodeURIComponent(externalId)}&source=db` : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const [items, setItems] = useState<MailItem[]>([]);
  useEffect(() => {
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

    normalized.sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());
    setItems(normalized);
  }, [data, mails]);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const isTrashView = category === "trash";

  const filtered = useMemo(() => {
    const base = items.filter((m) => (isTrashView ? m._status === "trash" : m._status === "active"));
    return base.filter((mail) => {
      const catOk = category === "all" || category === "trash" || mail.category === category;
      const q = search.trim().toLowerCase();
      const textOk = !q || mail.sender.toLowerCase().includes(q) || mail.summary.toLowerCase().includes(q);
      const d = new Date(mail.receivedAt);
      const fromOk = fromDate ? d >= new Date(fromDate) : true;
      const toOk = toDate ? d <= new Date(toDate) : true;
      return catOk && textOk && fromOk && toOk;
    });
  }, [items, category, isTrashView, search, fromDate, toDate]);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  useEffect(() => { setPage(1); }, [search, category, fromDate, toDate]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = start + pageSize;
  const visibleItems = filtered.slice(start, end);

  // selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const anySelected = selected.size > 0;
  const onToggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const onSelectAll = () => {
    const n = new Set(selected);
    visibleItems.forEach((m) => n.add(m.id));
    setSelected(n);
  };
  const onClear = () => setSelected(new Set());

  /* --------------------------- Actions → backend -------------------------- */

  const markAsRead = async (id: string) => {
    try {
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

  async function moveToTrash(id: string) {
    const candidates = [
      apiBackend(`/mail/${encodeURIComponent(id)}/trash`),
      apiBackend(`/mail/${encodeURIComponent(id)}/move-to-trash`),
      apiBackend(`/mail/${encodeURIComponent(id)}`),
    ];
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
        } catch {}
      }
      if (!ok) throw new Error("No matching trash endpoint");
    } catch (e) {
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
      apiBackend(`/mail/${encodeURIComponent(id)}`),
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

  const moveSelectedToTrash = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    onClear();
    setItems(prev => prev.map(m => (ids.includes(m.id) ? { ...m, _status: "trash" } : m)));
    try {
      await Promise.all(ids.map(moveToTrash));
    } finally {
      await mutate();
    }
  };

  const restoreSelected = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    onClear();
    setItems(prev => prev.map(m => (ids.includes(m.id) ? { ...m, _status: "active" } : m)));
    try {
      await Promise.all(ids.map(restoreFromTrash));
    } finally {
      await mutate();
    }
  };

  const clearTrash = async () => {
    if (!externalId) return alert("external_id not found.");
    const snapshot = items;
    setItems((prev) => prev.filter((m) => m._status !== "trash"));
    onClear();
    try {
      await fetch(apiBackend(`/mail/trash?external_id=${encodeURIComponent(externalId)}`), { method: "DELETE" });
      await mutate();
    } catch (e) {
      console.error(e);
      alert("Clear trash failed.");
      setItems(snapshot);
    }
  };

  // üst parent bu bilgiyi istiyorsa yine gönderelim
  useEffect(() => {
    onSelectionMetaChange?.({
      selectedCount: selected.size,
      onDeleteMarked: isTrashView ? restoreSelected : moveSelectedToTrash,
      onSelectAll,
      onClear,
      isTrashView,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.size, isTrashView]);

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 lg:px-6 pt-14">
      <div className="w-full max-w-[92rem] space-y-3 relative">
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

        {/* Filtre bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); onClear(); }}
                className={[
                  "px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
                  category === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/20",
                ].join(" ")}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Search…"
              className="px-3 py-2 w-[160px] sm:w-[200px] text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-white/20 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <details className="relative">
              <summary className="list-none">
                <button
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/20 dark:text-white"
                  type="button"
                >
                  <Filter size={16} />
                  Filters
                </button>
              </summary>
              <div className="absolute right-0 mt-2 w-[260px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg z-20 dark:bg-[#0b1220] dark:border-white/15">
                <div className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Date range
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 w-full dark:bg-transparent dark:border-white/20 dark:text-white"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 w-full dark:bg-transparent dark:border-white/20 dark:text-white"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => { setFromDate(""); setToDate(""); }}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/20 dark:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </details>

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

        {/* Liste */}
        <div className="grid gap-2 max-h-[calc(100svh-240px)] overflow-y-auto pr-1 pb-2">
          {error ? (
            <div className="text-rose-600 dark:text-rose-300 text-center py-10">
              Failed to load mail.
            </div>
          ) : isLoading && !data ? (
            <div className="text-gray-500 dark:text-white/70 text-center py-10">
              Loading scanned mail...
            </div>
          ) : visibleItems.length > 0 ? (
            visibleItems.map((mail) => {
              const checked = selected.has(mail.id);
              const inTrash = mail._status === "trash";
              const mailForCard: MailCardType = {
                id: mail.id,
                sender: mail.sender,
                category: mail.category,
                summary: mail.summary,
                receivedAt: mail.receivedAt,
                expiresAt: mail.expiresAt ?? undefined,
                isRead: mail.isRead,
              };
              return (
                <div key={mail.id} className="flex items-start gap-2.5">
                  <Checkbox
                    checked={checked}
                    onChange={() => onToggle(mail.id)}
                    ariaLabel={`Select ${mail.sender}`}
                    className="mt-[9px] ml-0.5 shrink-0"
                  />

                  {/* Unread → vurgulu ring */}
                  <div className={`flex-1 min-w-0 ${mail.isRead ? "" : "ring-1 ring-blue-500/35 dark:ring-blue-400/35 rounded-xl"}`}>
                    <MailCard mail={mailForCard} size="compact" onForward={forwardMail} />

                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {!inTrash ? (
                        <>
                          <ActionBtn onClick={() => markAsRead(mail.id)} icon={<Check className="w-3.5 h-3.5" />}>
                            Mark as read
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => moveToTrash(mail.id)}
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            variant="danger"
                          >
                            Move to trash
                          </ActionBtn>
                        </>
                      ) : (
                        <ActionBtn
                          onClick={() => restoreFromTrash(mail.id)}
                          icon={<RotateCcw className="w-3.5 h-3.5" />}
                          variant="success"
                        >
                          Restore
                        </ActionBtn>
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

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-xs text-gray-600 dark:text-white/60">
            Showing <b>{visibleItems.length}</b> of <b>{total}</b>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:bg-white/10 dark:border-white/20 dark:text-white"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white disabled:opacity-50 dark:bg-white/10 dark:border-white/20 dark:text-white"
            >
              Prev
            </button>
            <span className="text-xs text-gray-600 dark:text-white/60">
              {pageSafe} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white disabled:opacity-50 dark:bg-white/10 dark:border-white/20 dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Küçük, mobil uyumlu aksiyon butonu */
function ActionBtn({
  onClick,
  icon,
  children,
  variant = "neutral",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "neutral" | "danger" | "success";
}) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition";
  const cls =
    variant === "danger"
      ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200"
      : variant === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-400/30 dark:text-emerald-200"
      : "border-gray-200 bg-white hover:bg-gray-50 dark:bg-white/10 dark:border-white/15 dark:text-white";
  return (
    <button onClick={onClick} className={`${base} ${cls}`}>
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
