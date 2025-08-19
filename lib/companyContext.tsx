// lib/companyContext.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
import useSWR from "swr";

type CompanyContextType = {
  externalId: string | null;
  customerEmail: string | null;
  company: any | null;
  balanceGBP: number;                 // ✅ add
  loading: boolean;
  error: string | null;
  mutate: () => Promise<any>;
};

const CompanyContext = createContext<CompanyContextType>({
  externalId: null,
  customerEmail: null,
  company: null,
  balanceGBP: 0,
  loading: false,
  error: null,
  mutate: async () => {},
});

const fetcher = async (url: string) => {
  const r = await fetch(url, { cache: "no-store", credentials: "include" });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};

const getExternalId = (): string | null => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )external_id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : localStorage.getItem("external_id");
};

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const externalId = useMemo(getExternalId, []);
  const meUrl = externalId ? `/api/backend/api/me?external_id=${encodeURIComponent(externalId)}` : null;

  const { data, isLoading, error, mutate } = useSWR(meUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const value = useMemo<CompanyContextType>(() => {
    const walletPennies = Number(data?.wallet?.balance_pennies ?? 0);
    const balanceGBP = Number.isFinite(walletPennies) ? walletPennies / 100 : 0;
    const customerEmail: string | null = data?.company?.customer_email ?? null;

    return {
      externalId: data?.external_id ?? externalId ?? null,
      customerEmail,
      company: data?.company ?? null,
      balanceGBP,
      loading: !!meUrl && isLoading,
      error: error ? (error as Error).message : null,
      mutate,
    };
  }, [data, isLoading, error, mutate, externalId, meUrl]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export const useCompany = () => useContext(CompanyContext);
