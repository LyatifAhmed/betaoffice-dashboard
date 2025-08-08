"use client";

import { useMemo, useState } from "react";
import MailCard from "@/components/ui/MailCard";

export type MailCategory = "bank" | "government" | "urgent" | "invoice" | "other";

export type RawMailItem = {
  id: string;
  sender: string;
  category: string;
  summary: string;
  receivedAt: string;
  expiresAt: string;
  fileUrl: string | null;
};

type MailItem = Omit<RawMailItem, "category"> & { category: MailCategory };

const categoryLabels = {
  all: "All",
  bank: "Bank",
  government: "Government",
  urgent: "Urgent",
  invoice: "Invoice",
  other: "Other",
};

const normalizeCategory = (cat: string): MailCategory => {
  const lower = cat.toLowerCase();
  if (["bank", "government", "urgent", "invoice"].includes(lower)) return lower as MailCategory;
  return "other";
};

export default function MailArea({ mails = [] as RawMailItem[] }: { mails?: RawMailItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const normalizedMails = useMemo<MailItem[]>(
    () => mails.map((m) => ({ ...m, category: normalizeCategory(m.category) })),
    [mails]
  );

  const filteredMails = normalizedMails.filter((mail) => {
    const matchesCategory = category === "all" || mail.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || mail.sender.toLowerCase().includes(q) || mail.summary.toLowerCase().includes(q);
    const d = new Date(mail.receivedAt).getTime();
    const fromValid = fromDate ? d >= new Date(fromDate).getTime() : true;
    const toValid = toDate ? d <= new Date(toDate).getTime() : true;
    return matchesCategory && matchesSearch && fromValid && toValid;
  });

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 lg:px-6 pt-16">
      <div className="w-full max-w-[92rem] space-y-4">
        {/* Filtre barı */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kategoriler */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  category === cat ? "bg-blue-600 text-white" : "bg-white/70 hover:bg-blue-100 text-gray-700"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Search + tarih */}
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
          </div>
        </div>

        {/* Başlık */}
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Your scanned mail</h2>

        {/* Liste */}
        <div className="grid gap-3 max-h-[72vh] overflow-y-auto pr-1 pb-2">
          {filteredMails.length ? (
            filteredMails.map((m) => <MailCard key={m.id} mail={m} />)
          ) : (
            <div className="text-gray-500 text-center py-10">No mail found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
