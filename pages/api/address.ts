import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postcode } = req.query;

  if (!postcode || typeof postcode !== 'string') {
    return res.status(400).json({ error: 'Postcode is required' });
  }

  try {
    const response = await axios.get(`https://api.getaddress.io/find/${postcode}`, {
      params: {
        expand: true,
      },
      headers: {
        Authorization: `Bearer ${process.env.GETADDRESS_DOMAIN_TOKEN}`,
      },
    });

    res.status(200).json({ addresses: response.data.addresses });
  } catch (error: any) {
    console.error('[GETADDRESS ERROR]', error.response?.data || error);
    res.status(error.response?.status || 500).json({ error: 'Address lookup failed' });
  }
}
