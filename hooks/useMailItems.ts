// hooks/useMailItems.ts:
import useSWR from 'swr'
import type { MailItem } from '@/types/mail'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to load mail items');
  return r.json();
});

export function useMailItems(externalId: string, source: 'remote' | 'db' = 'remote') {
  const shouldFetch = Boolean(externalId);
  const { data, error, isLoading, mutate } = useSWR<MailItem[] | undefined>(
    shouldFetch ? `/api/hoxton/mail?external_id=${encodeURIComponent(externalId)}&source=${source}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    items: (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    isLoading,
    error,
    refresh: mutate,
  };
}