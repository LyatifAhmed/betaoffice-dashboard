// utils/chat-context.ts
"use client";

import { useEffect, type ReactNode } from "react";
import { useChatStore, type ChatScope } from "@/stores/chat-store";

/** Basit provider – Zustand global; burada sadece children'ı döndürüyoruz. */
export function ChatProvider({ children }: { children: ReactNode }) {
  return children;
}

/** Route/sekme bağlamını store ile senkronize eder. */
export function useSyncChatContext(scope: ChatScope) {
  const setScope = useChatStore((s) => s.setScope);
  useEffect(() => {
    setScope(scope);
  }, [scope, setScope]);
}
