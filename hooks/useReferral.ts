// hooks/useReferral.ts
import useSWR from "swr";
import type { ReferralSummary, ReferralLedgerItem, LeaderboardRow } from "@/types/referral";

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

export function useReferral(externalId: string | null | undefined) {
  const enabled = Boolean(externalId);

  const { data: summary, error: sErr, isLoading: sLoad, mutate: refetchSummary } =
    useSWR<ReferralSummary>(enabled ? `/api/referral?external_id=${encodeURIComponent(externalId!)}` : null, fetcher);

  const { data: ledger, error: lErr } =
    useSWR<ReferralLedgerItem[]>(
      enabled ? `/api/referral/ledger?external_id=${encodeURIComponent(externalId!)}` : null,
      fetcher,
      { shouldRetryOnError: false }
    );

  const { data: leaderboard, error: bErr } =
    useSWR<LeaderboardRow[]>(`/api/referral/leaderboard`, fetcher, { shouldRetryOnError: false });

  return {
    summary,
    ledger: Array.isArray(ledger) ? ledger : undefined,
    leaderboard: Array.isArray(leaderboard) ? leaderboard : undefined,
    isLoading: sLoad,
    error: sErr,
    refetch: refetchSummary,
    optionalErrors: { ledger: lErr, leaderboard: bErr },
  };
}
