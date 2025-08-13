// types/mail.ts
export type AiKeyValue = { key: string; value: string };

export type AiMetadata = {
  sender_name?: string;
  document_title?: string;
  reference_number?: string;
  summary?: string;
  industry?: string;
  categories?: string[];
  sub_categories?: string[];
  key_information?: AiKeyValue[];
};

export type MailItem = {
  id: string | number;
  external_id: string;
  url?: string;
  url_envelope_front?: string;
  url_envelope_back?: string;
  file_name?: string;
  created_at: string; // ISO
  ai_metadata?: AiMetadata;
};
