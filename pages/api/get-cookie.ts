// pages/api/get-cookie.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};

  const external_id = cookies.external_id;

  if (!external_id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  return res.status(200).json({ external_id });
}
