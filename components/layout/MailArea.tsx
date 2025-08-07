"use client";

import { useState } from "react";
import MailCard from "@/components/ui/MailCard";

type MailCategory = "bank" | "government" | "urgent" | "other";

type RawMailItem = {
  id: string;
  sender: string;
  category: string; // raw gelen string
  summary: string;
  receivedAt: string;
  expiresAt: string;
  fileUrl: string | null;
};

type MailItem = {
  id: string;
  sender: string;
  category: MailCategory;
  summary: string;
  receivedAt: string;
  expiresAt: string;
  fileUrl: string | null;
};

const categoryLabels = {
  all: "All",
  bank: "Bank",
  government: "Government",
  urgent: "Urgent",
  other: "Other",
};

// ✅ Kategori normalize eden yardımcı fonksiyon
const normalizeCategory = (cat: string): MailCategory => {
  const lower = cat.toLowerCase();
  if (["bank", "government", "urgent"].includes(lower)) return lower as MailCategory;
  return "other";
};

export default function MailArea({ mails }: { mails: RawMailItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Normalize edilen mail listesi
  const normalizedMails: MailItem[] = mails.map((mail) => ({
    ...mail,
    category: normalizeCategory(mail.category),
  }));

  const filteredMails = normalizedMails.filter((mail) => {
    const matchesCategory = category === "all" || mail.category === category;

    const matchesSearch =
      mail.sender.toLowerCase().includes(search.toLowerCase()) ||
      mail.summary.toLowerCase().includes(search.toLowerCase());

    const mailDate = new Date(mail.receivedAt);
    const fromValid = fromDate ? mailDate >= new Date(fromDate) : true;
    const toValid = toDate ? mailDate <= new Date(toDate) : true;

    return matchesCategory && matchesSearch && fromValid && toValid;
  });

  return (
    <div className="w-full flex justify-center px-1 sm:px-6 lg:px-3">
      <div className="w-full max-w-[92rem] space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
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

          <div className="flex flex-wrap gap-2 items-center justify-end">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 w-40 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300"
            />
          </div>
        </div>

        {/* Mail list */}
        <div className="grid gap-3 max-h-[72vh] overflow-y-auto pr-1 pb-2">
          {filteredMails.length > 0 ? (
            filteredMails.map((mail) => (
              <MailCard key={mail.id} mail={mail} />
            ))
          ) : (
            <div className="text-gray-500 text-center py-10">No mail found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
