import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { term } = req.query;

  if (!term || typeof term !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid search term' });
  }

  try {
    const response = await fetch(`https://api.getAddress.io/autocomplete/${term}?api-key=${process.env.NEXT_PUBLIC_GETADDRESS_API_KEY}`);
    const data = await response.json();
    res.status(200).json({ suggestions: data.suggestions || [] });
  } catch (error) {
    res.status(500).json({ error: 'Autocomplete fetch failed' });
  }
}
