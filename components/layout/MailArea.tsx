// components/layout/MailArea.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import MailCard from "@/components/ui/MailCard";

export type MailCategory = "bank" | "government" | "urgent" | "other";
export type RawMailItem = {
  id: string;
  sender: string;
  category: string;
  summary: string;
  receivedAt: string;
  expiresAt: string;
  fileUrl: string | null;
};

// İçeride soft-delete için status ekliyoruz
type MailItem = RawMailItem & {
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

const normalizeCategory = (cat: string): MailCategory => {
  const lower = cat.toLowerCase();
  if (["bank", "government", "urgent"].includes(lower)) return lower as MailCategory;
  return "other";
};

export default function MailArea({ mails = [] as RawMailItem[] }: { mails?: RawMailItem[] }) {
  // Gelen mailleri local state’e alalım ki soft-delete/restore yapabilelim
  const [items, setItems] = useState<MailItem[]>([]);
  useEffect(() => {
    setItems(
      (mails || []).map((m) => ({
        ...m,
        category: normalizeCategory(m.category),
        _status: "active",
      }))
    );
  }, [mails]);

  // Filtre/Arama/Seleksiyon
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isTrashView = category === "trash";

  const visibleItems = useMemo(() => {
    const base = items.filter((m) =>
      isTrashView ? m._status === "trash" : m._status === "active"
    );
    return base.filter((mail) => {
      const matchesCategory =
        category === "all" || category === "trash" || mail.category === category;
      const matchesSearch =
        mail.sender.toLowerCase().includes(search.toLowerCase()) ||
        mail.summary.toLowerCase().includes(search.toLowerCase());
      const mailDate = new Date(mail.receivedAt);
      const fromValid = fromDate ? mailDate >= new Date(fromDate) : true;
      const toValid = toDate ? mailDate <= new Date(toDate) : true;
      return matchesCategory && matchesSearch && fromValid && toValid;
    });
  }, [items, category, isTrashView, search, fromDate, toDate]);

  // Top bulk bar’daki aksiyonlar
  const anySelected = selected.size > 0;
  const inSelectionOnScreen = visibleItems.some((m) => selected.has(m.id));

  const selectAllOnScreen = () => {
    const next = new Set(selected);
    visibleItems.forEach((m) => next.add(m.id));
    setSelected(next);
  };
  const clearSelection = () => setSelected(new Set());

  const moveSelectedToTrash = () => {
    if (!anySelected) return;
    setItems((prev) =>
      prev.map((m) => (selected.has(m.id) ? { ...m, _status: "trash" } : m))
    );
    clearSelection();
  };
  const restoreSelected = () => {
    if (!anySelected) return;
    setItems((prev) =>
      prev.map((m) => (selected.has(m.id) ? { ...m, _status: "active" } : m))
    );
    clearSelection();
  };
  const clearTrash = () => {
    setItems((prev) => prev.filter((m) => m._status !== "trash"));
    clearSelection();
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        {/* Banner başlık */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {isTrashView ? "Trash" : "Your scanned mail"}
          </h2>

          {/* Seçim barı – yalnızca bir şey seçiliyse */}
          {anySelected && inSelectionOnScreen && (
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-full px-2 py-1 shadow-sm">
              {!isTrashView ? (
                <>
                  <button
                    onClick={moveSelectedToTrash}
                    className="px-3 py-1 text-xs rounded-full bg-rose-200 text-rose-900 hover:bg-rose-300 transition"
                  >
                    Delete marked
                  </button>
                  <span className="text-xs text-gray-600 hidden sm:inline">
                    ({selected.size} selected)
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={restoreSelected}
                    className="px-3 py-1 text-xs rounded-full bg-emerald-200 text-emerald-900 hover:bg-emerald-300 transition"
                  >
                    Restore marked
                  </button>
                  <span className="text-xs text-gray-600 hidden sm:inline">
                    ({selected.size} selected)
                  </span>
                </>
              )}
              <div className="w-px h-5 bg-gray-300/60" />
              <button
                onClick={selectAllOnScreen}
                className="px-2 py-1 text-xs rounded-md hover:bg-white/60"
              >
                Select all (page)
              </button>
              <button
                onClick={clearSelection}
                className="px-2 py-1 text-xs rounded-md hover:bg-white/60"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Kategori/Arama satırı */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  clearSelection();
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white/70 hover:bg-blue-100 text-gray-700"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 w-full sm:w-40 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Liste */}
        <div className="grid gap-3 max-h-[72vh] overflow-y-auto pr-1 pb-2">
          {visibleItems.length > 0 ? (
            visibleItems.map((mail) => {
              const checked = selected.has(mail.id);
              return (
                <div key={mail.id} className="flex items-start gap-3">
                  {/* Checkbox – mobilde de rahat dokunulsun */}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOne(mail.id)}
                    className="mt-2 h-4 w-4 sm:h-5 sm:w-5 accent-blue-600 cursor-pointer"
                    aria-label={`Select ${mail.sender}`}
                  />
                  <div className="flex-1 min-w-0">
                    <MailCard mail={mail} />
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
