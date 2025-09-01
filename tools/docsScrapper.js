// tools/docsScrapper.js
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import TurndownService from "turndown";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // Gemini embeddings

const turndownService = new TurndownService();

// Docs URLs
const docs = {
  vercel: [
    "https://vercel.com/docs",
    "https://vercel.com/docs/deployments",
    "https://vercel.com/docs/environment-variables"
  ],
  netlify: [
    "https://docs.netlify.com",
    "https://docs.netlify.com/configure-builds/environment-variables/",
    "https://docs.netlify.com/site-deploys/overview/"
  ],
  docker: [
    "https://docs.docker.com/get-started/",
    "https://docs.docker.com/engine/reference/builder/",
    "https://docs.docker.com/compose/"
  ],
  heroku: [
    "https://devcenter.heroku.com/articles/getting-started-with-nodejs",
    "https://devcenter.heroku.com/articles/config-vars",
    "https://devcenter.heroku.com/articles/deploying-nodejs"
  ]
};

// Ensure docs folder exists
const docsDir = path.join(process.cwd(), "docs");
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
  console.log("Created docs folder");
}

// Scrape a single page
async function scrapePage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let mainContent = $("main, .markdown, article").first();
    if (!mainContent || mainContent.length === 0) mainContent = $("body");

    return turndownService.turndown(mainContent.html() || "");
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return "";
  }
}

// Scrape and save platform docs
export async function scrapePlatform(platform) {
  if (!docs[platform]) throw new Error("Platform not supported");

  let fullMarkdown = "";
  for (const url of docs[platform]) {
    console.log(`Scraping ${url}...`);
    const md = await scrapePage(url);
    fullMarkdown += `\n\n# Source: ${url}\n\n${md}`;
  }

  // Save to Markdown file
  const filePath = path.join(docsDir, `${platform}.md`);
  fs.writeFileSync(filePath, fullMarkdown, "utf-8");
  console.log(`Saved ${filePath}`);

  return fullMarkdown;
}

// Ingest Markdown into RAG using Gemini embeddings
export async function ingestToRAG(platform, vectorStore) {
  const filePath = path.join(docsDir, `${platform}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`${platform}.md not found`);

  const text = fs.readFileSync(filePath, "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
  });

  const chunks = await splitter.splitText(text);

  await FaissStore.fromDocuments(
    chunks.map(c => ({ pageContent: c })),
    new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GEMINI_API_KEY }),
    { faissIndex: vectorStore }
  );

  console.log(`Ingested ${platform} docs into vector store`);
}
