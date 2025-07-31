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
            external_id: true
          }
        }
      }
    });

    const formatted = owners.map((member) => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      subscriptionId: member.subscription_id,
      companyName: member.subscription?.company_name || "N/A",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: "Beklenmedik hata oluştu" });
  }
}

