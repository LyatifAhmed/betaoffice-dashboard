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
          },
        },
      },
    });

    console.log("📦 Owners from DB:", owners); // ← BURASI

    const formatted = owners.map((m) => ({
      name: `${m.first_name} ${m.last_name}`,
      email: m.email,
      company: m.subscription?.company_name || "N/A",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
