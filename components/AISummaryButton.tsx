"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type Props = {
  mailId: number;
  onComplete: (summary: string) => void;
};

export default function AISummaryButton({ mailId, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-summary?mailId=${mailId}`);
      const data = await res.json();
      if (data.summary) {
        onComplete(data.summary);
        toast.success("🧠 AI summary generated!");
      } else {
        toast.error("❌ Could not generate summary");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generateSummary}
      disabled={loading}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-white/10 border border-white/20 backdrop-blur-md transition-all hover:scale-105 hover:shadow-xl hover:border-blue-400 hover:bg-white/20 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 text-blue-300 group-hover:text-white" />
      )}
      {loading ? "Summarizing..." : "Summarize with AI"}
    </button>
  );
}
