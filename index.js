import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { scanRepo } from "./tools/repoScanner.js";
import { createDeployAgent, model } from "./agent.js";
import { scrapePlatform, ingestToRAG } from "./tools/docsScrapper.js";

dotenv.config();
const app = express();
app.use(express.json());

let executor;
let vectorStore;
const ingestedPlatforms = new Set();
const docsDir = path.join(process.cwd(), "docs");

console.log("Agent is ready.");
console.log("Deployment Agent running on http://localhost:4000");

function detectPlatform(query) {
  query = query.toLowerCase();
  if (query.includes("vercel")) return "vercel";
  if (query.includes("netlify")) return "netlify";
  if (query.includes("docker")) return "docker";
  if (query.includes("heroku")) return "heroku";
  return null;
}

app.get("/scrape-and-query", async (req, res) => {
  const userQuery = req.query.query;
  if (!userQuery)
    return res.status(400).json({ error: "Query parameter is required" });

  try {
    const platform = detectPlatform(userQuery);
    if (!platform)
      return res
        .status(400)
        .json({ error: "Could not detect platform from query" });

    const platformDocsPath = path.join(docsDir, `${platform}.md`);
    if (fs.existsSync(platformDocsPath)) {
      console.log(`[CACHE] Found ${platform}.md on disk. Skipping scrape.`);
    } else {
      console.log(`[CACHE] ${platform}.md not found. Scraping...`);
      await scrapePlatform(platform);
    }

    if (ingestedPlatforms.has(platform)) {
      console.log(
        `[CACHE] ${platform} docs already in vector store. Skipping ingestion.`
      );
    } else {
      console.log(`[CACHE] Ingesting ${platform} docs into vector store...`);
      vectorStore = await ingestToRAG(platform, vectorStore);
      ingestedPlatforms.add(platform);
      console.log(`[CACHE] Ingestion complete for ${platform}.`);
    }

    executor = await createDeployAgent(vectorStore);
    console.log("Gemini agent is ready.");

    const result = await executor.call({
      input: `Using the latest ${platform} documentation, answer the following question:\n${userQuery}`,
    });

    res.json({ response: result.output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/generate-docker", async (req, res) => {
  try {
    const { repoPath } = req.body;

    if (!repoPath || !path.isAbsolute(repoPath)) {
      return res.status(400).json({ error: "An absolute path is required." });
    }
    if (!fs.existsSync(repoPath)) {
      return res.status(400).json({ error: "Repository path not found." });
    }

    const metadata = scanRepo(repoPath);

    const prompt = `
            You are an expert DevOps engineer. Your task is to containerize a user's project based on metadata detected from its files.
    
            **Detected Metadata:**
            - Primary Services: ${JSON.stringify(metadata.services, null, 2)}
            - Required Auxiliary Services (detected from .env files): ${JSON.stringify(
              metadata.requiredServices
            )}
    
            **Your Tasks:**
    
            **1. Generate Dockerfiles:**
            - For each primary service, create a simple, single-stage Dockerfile optimized for development.
            - Pay attention to the 'dependencies' list. If you see specific frameworks like 'next', 'nodemon', or 'gunicorn', adjust the Dockerfile 'RUN' and 'CMD' steps accordingly for best practices. For example, a python project with 'gunicorn' should use it in the CMD. A node project with 'nodemon' should use it in the CMD for development.
            - The final \`CMD\` instruction MUST use the \`entryPoint\` value from the service's metadata (e.g., \`CMD ["node", "server.js"]\`).
            - \`EXPOSE\` the \`port\` specified in the metadata.
    
            **2. Generate Docker Compose File:**
            - Create a single \`docker-compose.yml\` file.
            - For each primary service where \`hasEnvFile\` is true, you MUST add an \`env_file\` property pointing to that service's .env file (e.g., \`./backend/.env\`).
            - For each service listed in \`requiredServices\`, add a complete service definition using a standard public image (e.g., \`mongo:latest\`, \`redis:alpine\`).
            - Add named volumes for any database to ensure data persistence.
    
            **Output Format:**
            Return a single, valid JSON object and nothing else.
            {
              "dockerfiles": {
                "serviceName1": "Dockerfile content..."
              },
              "dockerCompose": "docker-compose.yml content..."
            }
            `;

    const response = await model.invoke(prompt);

    let jsonString = response.content;
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }
    const generatedContent = JSON.parse(jsonString);

    const createdFiles = [];
    for (const [serviceName, dockerfileContent] of Object.entries(
      generatedContent.dockerfiles
    )) {
      const serviceInfo = metadata.services[serviceName];
      if (serviceInfo && serviceInfo.path) {
        const dockerfilePath = path.join(serviceInfo.path, "Dockerfile");
        fs.writeFileSync(dockerfilePath, dockerfileContent);
        createdFiles.push(dockerfilePath);
        console.log(`[FILE WROTE] Created Dockerfile at: ${dockerfilePath}`);
      }
    }

    if (generatedContent.dockerCompose) {
      const composePath = path.join(repoPath, "docker-compose.yml");
      fs.writeFileSync(composePath, generatedContent.dockerCompose);
      createdFiles.push(composePath);
      console.log(`[FILE WROTE] Created docker-compose.yml at: ${composePath}`);
    }

    res.json({
      message: "Docker files generated and saved successfully!",
      createdFiles,
      generatedContent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error during Docker file generation",
      details: err.message,
      });
  }
});

app.listen(4000);
