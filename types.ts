// types.ts

export type RawMailItem = {
  id: string;
  sender: string;
  category: string;
  summary: string;
  receivedAt: string;
  expiresAt: string;
  fileUrl: string | null;
};
