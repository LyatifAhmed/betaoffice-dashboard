// stores/chat-store.ts
import { create } from "zustand";

/** Sayfaya göre chat bağlamı */
export type ChatScope =
  | "landing"
  | "kyc"
  | "dashboard:mail"
  | "dashboard:details"
  | "dashboard:billing"
  | "dashboard:affiliate"
  | "dashboard:referral";

export type ChatRole =
  | "landing-sales"
  | "kyc-helper"
  | "dashboard-mail"
  | "dashboard-settings"
  | "dashboard-billing"
  | "dashboard-affiliate"
  | "dashboard-referral";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type Histories = Record<string, ChatMessage[]>;

function roleFromScope(scope: ChatScope): ChatRole {
  switch (scope) {
    case "landing":
      return "landing-sales";
    case "kyc":
      return "kyc-helper";
    case "dashboard:details":
      return "dashboard-settings";
    case "dashboard:billing":
      return "dashboard-billing";
    case "dashboard:affiliate":
      return "dashboard-affiliate";
    case "dashboard:referral":
      return "dashboard-referral";
    case "dashboard:mail":
    default:
      return "dashboard-mail";
  }
}

type ChatState = {
  /** Aktif bağlam (thread anahtarı olarak da kullanıyoruz) */
  scope: ChatScope;
  /** Backend’e gönderilecek rol etiketi */
  role: ChatRole;
  /** UI durumu */
  isOpen: boolean;
  isMinimized: boolean;

  /** Tüm konuşma geçmişleri (scope -> messages) */
  histories: Histories;

  // --- actions ---
  setScope: (scope: ChatScope) => void;
  open: () => void;
  minimize: () => void;
  closeAndForget: () => void;

  push: (msg: ChatMessage) => void;
  replaceHistory: (msgs: ChatMessage[]) => void;
  resetScope: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  scope: "landing",
  role: roleFromScope("landing"),
  isOpen: false,
  isMinimized: false,
  histories: {},

  setScope: (scope) =>
    set((s) => {
      const role = roleFromScope(scope);
      // history yoksa boş başlat
      if (!s.histories[scope]) s.histories[scope] = [];
      return { scope, role, histories: { ...s.histories } };
    }),

  open: () => set({ isOpen: true, isMinimized: false }),
  minimize: () => set({ isMinimized: true, isOpen: false }),

  closeAndForget: () =>
    set((s) => {
      const h = { ...s.histories };
      delete h[s.scope]; // mevcut sohbeti temizle
      return { histories: h, isOpen: false, isMinimized: false };
    }),

  push: (msg) =>
    set((s) => {
      const key = s.scope;
      const arr = s.histories[key] ? [...s.histories[key]] : [];
      arr.push(msg);
      return { histories: { ...s.histories, [key]: arr } };
    }),

  replaceHistory: (msgs) =>
    set((s) => ({
      histories: { ...s.histories, [s.scope]: [...msgs] },
    })),

  resetScope: () =>
    set((s) => {
      const key = s.scope;
      return { histories: { ...s.histories, [key]: [] } };
    }),
}));
