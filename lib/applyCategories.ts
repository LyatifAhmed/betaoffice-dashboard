// utils/applyCategories.ts
import { classifyMail } from "@/lib/classifyMail";

export async function applyCategories(mailItems: any[]) {
  const updatedItems = await Promise.all(
    mailItems.map(async (item) => {
      const category = await classifyMail(item.document_title || "", item.sender_name || "");
      return { ...item, category };
    })
  );
  return updatedItems;
}
