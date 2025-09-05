import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DocsRetrieverTool } from "./tools/docsRetriever.js";
import dotenv from "dotenv";
dotenv.config();

export const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function createDeployAgent(vectorStore) {
  const tools = [];

  if (vectorStore) {
    tools.push(new DocsRetrieverTool(vectorStore));
  }

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  return executor;
}
