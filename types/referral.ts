// types/referral.ts
export type ReferralSummary = {
  code: string;
  clicks: number;
  signups: number;
  earnings_pennies: number;
  earnings_paid_pennies?: number;
  created_at?: string;
};

export type ReferralLedgerItem = {
  id: string;
  type: "click" | "signup" | "earning" | "payout";
  amount_pennies?: number;
  referee_email?: string;
  status?: "pending" | "paid";
  created_at: string; // ISO
  note?: string;
};

export type LeaderboardRow = {
  rank: number;
  user?: string;
  clicks: number;
  signups: number;
  earnings_pennies: number;
};
