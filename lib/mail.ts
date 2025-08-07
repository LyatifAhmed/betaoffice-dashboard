import { db } from "@/lib/db"; // Prisma veya SQLAlchemy client'in varsa buradan bağlan
import { ScannedMail, Subscription } from "@/lib/models"; // ORM modellerin

// Mail verisini kaydeden fonksiyon
export async function saveScannedMail(payload: any) {
  const externalId = payload.external_id;
  if (!externalId) throw new Error("Missing external_id");

  const subscription = await db.subscription.findUnique({
    where: { external_id: externalId },
  });

  if (!subscription) throw new Error("Subscription not found");

  const ai = payload.ai_metadata || {};

  const savedMail = await db.scannedMail.create({
    data: {
      external_id: externalId,
      sender_name: ai.sender_name || "",
      document_title: ai.document_title || "",
      summary: ai.summary || "",
      url: payload.url,
      url_envelope_front: payload.url_envelope_front,
      url_envelope_back: payload.url_envelope_back,
      company_name: payload.company_name,
      received_at: payload.received_at
        ? new Date(payload.received_at)
        : new Date(),
      reference_number: ai.reference_number,
      industry: ai.industry,
      categories: ai.categories,
      sub_categories: ai.sub_categories,
      key_information: ai.key_information,
    },
  });

  return savedMail;
}
