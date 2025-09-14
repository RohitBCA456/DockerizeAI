// tools/docsScrapper.js

// 🔹 Updated import paths for modular LangChain packages
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// 🔹 These core imports are typically fine but are shown for completeness
import { MarkdownTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import fs from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "docs");

// This function's logic does not need to change
export async function scrapePlatform(platform) {
    // This is an example URL structure, ensure it matches what you need
    const loader = new CheerioWebBaseLoader(`https://docs.render.com/deploy-${platform}`);
    const docs = await loader.load();
    fs.writeFileSync(path.join(docsDir, `${platform}.md`), docs.map(d => d.pageContent).join('\n\n'));
    console.log(`${platform} docs scraped and saved.`);
}

// This function's logic does not need to change
export const ingestToRAG = async (platform, existingStore) => {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        taskType: "retrieval_document",
    });

    if (!platform) {
        return existingStore || new MemoryVectorStore(embeddings);
    }
    
    console.log(`Loading docs for ${platform}...`);
    const platformDocsPath = path.join(docsDir, `${platform}.md`);
    
    if (!fs.existsSync(platformDocsPath)) {
        throw new Error(`${platform}.md not found`);
    }

    const fileContent = fs.readFileSync(platformDocsPath, "utf-8");
    
    const splitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });
    
    const documents = await splitter.createDocuments([fileContent]);
    
    if (existingStore) {
        console.log(`Adding new documents to existing vector store...`);
        await existingStore.addDocuments(documents);
        return existingStore;
    } else {
        console.log(`Creating new vector store...`);
        return await MemoryVectorStore.fromDocuments(documents, embeddings);
    }
};