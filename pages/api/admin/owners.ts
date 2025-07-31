// pages/api/admin/owners.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  try {
    const owners = await prisma.companyMember.findMany({
      include: {
        subscription: {
          select: {
            company_name: true,
            review_status: true
          }
        }
      }
    });

    const mappedOwners = owners.map(owner => ({
      id: owner.id,
      name: `${owner.first_name} ${owner.last_name}`,
      email: owner.email,
      subscriptionId: owner.subscription_id,
      companyName: owner.subscription?.company_name ?? "-",
      reviewStatus: owner.subscription?.review_status ?? "UNKNOWN"
    }));

    res.status(200).json(mappedOwners);
  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: "Beklenmedik hata oluştu" });
  }
}
