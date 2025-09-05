import { Tool } from "langchain/tools";
import fs from "fs/promises";
import path from "path";

export class DocsRetrieverTool extends Tool {
  constructor() {
    super();
    this.name = "docs-retriever";
    this.description =
      "Retrieves deployment instructions fromz docs knowledge base";
  }
}

// Reads the docs markdown file for a platform and returns its content
export async function docsRetriever(platform) {
  const docsPath = path.join("docs", `${platform}.md`);
  try {
    const content = await fs.readFile(docsPath, "utf-8");
    return content;
  } catch (err) {
    throw new Error(`Documentation for ${platform} not found.`);
  }
}

// New initDocs function
export async function initDocs() {
  // Example: initialize vector store or load docs
  console.log("DocsRetrieverTool initialized");
  return new DocsRetrieverTool();
}
