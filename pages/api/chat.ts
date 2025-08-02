// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ✅ burada değişiklik yaptık
      messages: [{ role: "user", content: message }],
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (err: any) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
