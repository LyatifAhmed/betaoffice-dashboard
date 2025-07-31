import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const dbName = await prisma.$queryRawUnsafe(`SELECT current_database()`);
    res.status(200).json({ dbName });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
