// lib/get-external.ts
import type { NextApiRequest } from "next";

// external_id'i cookie, header veya query'den yakala:
export function getExternalId(req: NextApiRequest): string | null {
  const cookieExt =
    (req.cookies?.external_id as string | undefined) ||
    (req.headers["x-external-id"] as string | undefined) ||
    (req.query.external_id as string | undefined) ||
    null;
  return cookieExt ?? null;
}
