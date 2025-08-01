"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import axios from "axios";

interface Props {
  pdfUrl: string;
}

export default function AISummaryButton({ pdfUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [internalUrl, setInternalUrl] = useState(pdfUrl); // refresh için

  const summarize = async (urlToUse: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToUse }),
      });

      if (!res.ok) throw new Error("Summary failed");
      const data = await res.json();
      return data.summary;
    } catch (err) {
      return null;
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    setSummary(null);

    // ⏳ İlk deneme
    const result = await summarize(internalUrl);

    if (result) {
      setSummary(result);
      setLoading(false);
      return;
    }

    // 🔄 Eğer ilk deneme başarısızsa → link expired olabilir → yeni mail datalarını çek
    try {
      const refreshed = await axios.get("/api/me", { withCredentials: true });
      const refreshedItems = refreshed.data.mailItems;
      const matched = refreshedItems.find((m: any) => m.url === pdfUrl || m.url_envelope_front === pdfUrl || m.url_envelope_back === pdfUrl);

      if (matched?.url) {
        setInternalUrl(matched.url);
        const retryResult = await summarize(matched.url);

        if (retryResult) {
          setSummary(retryResult);
        } else {
          alert("❌ AI summary failed after retrying.");
        }
      } else {
        alert("❌ Could not find document for AI summary.");
      }
    } catch (e) {
      console.error("Retry summary failed:", e);
      alert("❌ AI summary unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button variant="outline" size="sm" onClick={handleSummarize} disabled={loading}>
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? "Summarizing..." : "AI Summary"}
      </Button>

      {summary && (
        <div className="mt-3 text-sm bg-gray-100 p-3 rounded border">
          <strong>📄 Summary:</strong>
          <p className="mt-1 whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}
