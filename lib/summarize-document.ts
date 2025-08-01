import { OpenAI } from "@langchain/openai";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document"; // ✅ doğru path

const llm = new OpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.2,
});

export async function summarizeDocument(docs: Document[]) {
  const chain = await loadSummarizationChain(llm, {
    type: "map_reduce",
  });

  const result = await chain.invoke(docs);
  return result?.text || "Summary unavailable.";
}
