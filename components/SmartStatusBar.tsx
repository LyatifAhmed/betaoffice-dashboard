import { useState } from "react";
import { CheckCircle2, Loader2, MailWarning, ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { icon: JSX.Element; color: string; message: string }> = {
  ACTIVE: {
    icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
    color: "bg-green-200 text-green-800",
    message: "ID verified. All features unlocked.",
  },
  PENDING: {
    icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
    color: "bg-yellow-200 text-yellow-800",
    message: "ID verification in progress...",
  },
  NO_ID: {
    icon: <MailWarning className="w-4 h-4 mr-2" />,
    color: "bg-blue-200 text-blue-800",
    message: "Awaiting ID verification. Check your inbox.",
  },
  CANCELLED: {
    icon: <ShieldAlert className="w-4 h-4 mr-2" />,
    color: "bg-red-200 text-red-800",
    message: "Subscription cancelled.",
  },
  UNKNOWN: {
    icon: <Info className="w-4 h-4 mr-2" />,
    color: "bg-gray-200 text-gray-800",
    message: "Status unknown.",
  },
};

type SmartStatusBarProps = {
  status: "ACTIVE" | "PENDING" | "NO_ID" | "CANCELLED" | "UNKNOWN";
  newMail: boolean;
  isFirstWeek: boolean;
};

const SmartStatusBar: React.FC<SmartStatusBarProps> = ({ status, newMail, isFirstWeek }) => {
  const [expanded, setExpanded] = useState(false);

  const config = statusConfig[status] || statusConfig.UNKNOWN;
  const dynamicMessage = newMail
    ? "📬 New mail has arrived."
    : isFirstWeek
    ? "🎉 Welcome! Explore all BetaOffice features."
    : config.message;

  return (
    <div
      className={cn(
        "w-full z-50 px-4 py-2 flex items-center justify-between text-sm font-medium rounded-b-xl shadow-md backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer",
        config.color,
        expanded ? "h-auto" : "h-[44px] overflow-hidden"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center">
        {config.icon}
        <span className="truncate max-w-[80vw]">{dynamicMessage}</span>
      </div>
      <div className="ml-2 text-xs opacity-60">{expanded ? "Close" : "Tap for details"}</div>
    </div>
  );
};

export default SmartStatusBar;
