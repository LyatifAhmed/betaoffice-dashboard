// pages/api/admin/owners.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type CompanyMemberWithSubscription = Awaited<ReturnType<typeof prisma.companyMember.findMany>>[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  try {
    const owners = await prisma.companyMember.findMany({
      include: {
        subscription: {
          select: {
            external_id: true,
            company_name: true,
          },
        },
      },
    });

    const formatted = owners.map((member: CompanyMemberWithSubscription) => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      subscriptionId: member.subscription_id,
      companyName: member.subscription?.company_name ?? "N/A",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch owners:", error);
    res.status(500).json({ error: "Failed to load owners" });
  }
}
