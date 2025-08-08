// pages/dashboard.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";


// Dummy mail verileri
const dummyMails = Array.from({ length: 120 }, (_, i) => {
  const daysAgo = i + 1;
  return {
    id: `${i + 1}`,
    sender: ["HMRC", "Barclays", "DVLA", "Santander", "PayPal"][i % 5],
    category: ["government", "bank", "urgent", "invoice", "other"][i % 5],
    summary: `Mail summary example #${i + 1}`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (30 - daysAgo)).toISOString(),
    fileUrl: i % 4 === 0 ? null : "https://example.com/fake.pdf",
  };
});


export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const startIndex = (page - 1) * pageSize;
  const pagedMails = dummyMails.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(dummyMails.length / pageSize);

  return (
    <DashboardLayout mailItems={pagedMails}>
      {/* Eğer children kullanıyorsan buraya ekleyebilirsin */}
      <div className="flex justify-center items-center gap-2 mt-6 text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ◀ Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>
    </DashboardLayout>
  );
}
