// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type MeResponse = {
  external_id: string | null;
  company?: any | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) external_id cookie veya header/query’den
  const cookieExt =
    (req.cookies?.external_id as string | undefined) ||
    (req.headers["x-external-id"] as string | undefined) ||
    (req.query.external_id as string | undefined) ||
    null;

  const external_id = cookieExt ?? null;
  // Log (geliştirme için)
  console.log("🍪 Parsed external_id in /api/me:", external_id);

  // 2) external_id yoksa yine de 200 dön (UI kırılmasın)
  if (!external_id) {
    return res.status(200).json({ external_id: null });
  }

  // 3) Backend’de olası şirket detay endpoint’lerini sırayla dene.
  //    Hangisi varsa onu kullan; hiçbiri yoksa 200 + external_id ile dön.
  const tryUrls = [
    `${API}/company?external_id=${encodeURIComponent(external_id)}`,
    `${API}/account/details?external_id=${encodeURIComponent(external_id)}`,
    `${API}/customer?external_id=${encodeURIComponent(external_id)}`,
  ];

  let company: any | null = null;

  for (const url of tryUrls) {
    try {
      const r = await axios.get(url, { timeout: 8000 });
      if (r.status >= 200 && r.status < 300) {
        company = r.data;
        break;
      }
    } catch (err: any) {
      // Sadece 404 ise sessiz geç; diğer durumları logla ama UI’yı kırma
      const status = err?.response?.status;
      if (status && status !== 404) {
        console.warn("⚠️ Backend fetch warn:", { url, status, data: err?.response?.data });
      }
      // 404 → bir sonraki URL’yi dene
    }
  }

  // 4) Her durumda 200 döndür (UI’nın 500 ile patlamasını engelle)
  const payload: MeResponse = { external_id, company };
  return res.status(200).json(payload);
}
