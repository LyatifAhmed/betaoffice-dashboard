// pages/api/admin/owners.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  try {
    const owners = await prisma.companyMember.findMany(); // sadece raw veriler
    res.status(200).json(owners);
  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: "Beklenmedik hata oluştu" });
  }
}
