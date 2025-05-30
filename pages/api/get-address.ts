// /pages/api/get-address.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid ID' });
  }

  try {
    const response = await fetch(`https://api.getAddress.io/get/${id}?api-key=${process.env.NEXT_PUBLIC_GETADDRESS_API_KEY}`);
    const data = await response.json();
    res.status(200).json({ address: data });
  } catch (error) {
    res.status(500).json({ error: 'Address lookup failed' });
  }
}
