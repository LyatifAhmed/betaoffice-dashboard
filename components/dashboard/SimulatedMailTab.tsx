"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const simulatedLetters = [
  { id: 1, sender: "HMRC", subject: "Tax Letter #1", date: "2025-08-10", category: "Government", summary: "Details of your tax obligations." },
  { id: 2, sender: "Barclays Bank", subject: "Account Statement", date: "2025-08-11", category: "Bank", summary: "Monthly account summary." },
  { id: 3, sender: "DVLA", subject: "Vehicle Tax Reminder", date: "2025-08-12", category: "Government", summary: "Reminder to renew your vehicle tax." },
  { id: 4, sender: "HMRC", subject: "Tax Letter #2", date: "2025-08-13", category: "Government", summary: "Updated tax payment instructions." },
  { id: 5, sender: "Amazon UK", subject: "Invoice for July", date: "2025-08-14", category: "Invoice", summary: "Your July invoice details." },
  { id: 6, sender: "Wise", subject: "Monthly Report", date: "2025-08-15", category: "Bank", summary: "Transaction summary report." },
  { id: 7, sender: "Companies House", subject: "Filing Reminder", date: "2025-08-16", category: "Government", summary: "Annual filing reminder." },
  { id: 8, sender: "Stripe", subject: "Invoice Payment", date: "2025-08-17", category: "Invoice", summary: "Your invoice #8291 has been paid." },
  { id: 9, sender: "HMRC", subject: "Tax Letter #3", date: "2025-08-18", category: "Government", summary: "Further tax notice." },
  { id: 10, sender: "Payoneer", subject: "Payment Received", date: "2025-08-19", category: "Bank", summary: "Payment has been credited." },
  { id: 11, sender: "DVLA", subject: "MOT Reminder", date: "2025-08-20", category: "Government", summary: "MOT test due soon." },
  { id: 12, sender: "Amazon UK", subject: "Order Confirmation", date: "2025-08-21", category: "Invoice", summary: "Order confirmation details." }
];

const categories: Record<string, string> = {
  Bank: "bg-[#00f0ff1a] text-[#00f0ff] border border-[#00f0ff66]",
  Government: "bg-[#00ff9e1a] text-[#00ff9e] border border-[#00ff9e66]",
  Invoice: "bg-[#ff00ea1a] text-[#ff00ea] border border-[#ff00ea66]",
};

const categoryTabs = ["All", "Bank", "Government", "Invoice"];

export default function SimulatedMailTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const perPage = 10;

  const filtered = simulatedLetters
    .filter((mail) => {
      const matchesSearch =
        mail.sender.toLowerCase().includes(search.toLowerCase()) ||
        mail.subject.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || mail.category === selectedCategory;
      const matchesDate =
        (!fromDate || new Date(mail.date) >= new Date(fromDate)) &&
        (!toDate || new Date(mail.date) <= new Date(toDate));
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`text-sm font-medium rounded-full px-4 py-1 transition-all duration-200 border shadow-sm ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white"
                  : "bg-white/10 text-gray-400 hover:text-white border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Input
          type="text"
          placeholder="Search mail..."
          className="max-w-sm"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-fuchsia-500 hover:underline"
        >
          {showFilters ? "Hide Filters" : "🔍 Advanced Filters"}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="flex flex-wrap gap-4 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </motion.div>
        )}
      </AnimatePresence>

      {paginated.map((mail) => {
        const daysSinceReceived = Math.floor((new Date().getTime() - new Date(mail.date).getTime()) / (1000 * 3600 * 24));
        const daysLeft = 30 - daysSinceReceived;

        return (
          <Card key={mail.id} className="glass-card">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-semibold text-gray-900 cursor-pointer hover:underline">{mail.sender}</div>
                <div className="text-sm text-gray-600">{mail.subject}</div>
                <div className="text-xs text-gray-400 mt-1">Received: {format(new Date(mail.date), "yyyy-MM-dd")}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${categories[mail.category as keyof typeof categories] || "bg-gray-100 text-gray-800"}`}>{mail.category}</Badge>

                <motion.div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="rounded-md text-xs px-3 py-1 border border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 shadow-inner transition-all duration-300"
                  >
                    ✨
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute hidden group-hover:block right-0 top-full mt-2 p-3 w-64 text-sm bg-fuchsia-100/70 backdrop-blur-lg text-fuchsia-800 shadow-lg rounded-xl z-50"
                  >
                    <strong>💡 AI Summary:</strong> {mail.summary || "AI summary will appear here."}
                  </motion.div>
                </motion.div>

                <motion.div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="rounded-md text-xs px-3 py-1 border border-blue-500 bg-blue-50 text-blue-700 shadow-inner transition-all duration-300"
                  >
                    📤
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 text-xs bg-white/70 backdrop-blur-md text-blue-700 border border-blue-300 shadow-md rounded-full z-50"
                  >
                    Forwardable for {daysLeft > 0 ? daysLeft : 0} days
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between items-center text-sm text-gray-500 mt-6">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ‹ Previous
        </Button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ›
        </Button>
      </div>
    </div>
  );
}
