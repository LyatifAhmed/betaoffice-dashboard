// pages/api/admin/test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const test = await prisma.$queryRaw`SELECT current_database()`;
    res.status(200).json({ dbName: test });
  } catch (e) {
    res.status(500).json({ error: "DB error", details: e });
  }
}
