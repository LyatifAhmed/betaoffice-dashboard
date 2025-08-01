// lib/classifyMail.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function classifyMail(title: string, sender: string): Promise<string> {
  const prompt = `Classify the mail based on the sender "${sender}" and title "${title}".
Return one of the following categories: Invoice, Bank, Government, Personal, Legal, Marketing, Other.`;

  const res = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
  });

  return res.choices[0].message.content?.trim() || "Other";
}
