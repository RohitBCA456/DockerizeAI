// index.js

// 🔹 Top-level error handlers to catch critical failures
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "CRITICAL: Unhandled Rejection at:",
    promise,
    "reason:",
    reason
  );
  process.exit(1);
});

process.on("uncaughtException", (err, origin) => {
  console.error(
    "CRITICAL: Caught exception:",
    err,
    "Exception origin:",
    origin
  );
  process.exit(1);
});

// --- Core Imports ---
import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import cors from "cors";

// --- Local Imports ---
import "./config/passport-setup.js"; // Your Passport configuration
import { connectDB } from "./database/db.js";
import { scanRepo } from "./tools/repoScanner.js";
import { createDeployAgent, model } from "./agent.js";
import { scrapePlatform, ingestToRAG } from "./tools/docsScrapper.js";

// --- Basic Setup ---
dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors({
    origin: true, // Allows requests from any origin, including your Electron app
    credentials: true,
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a_very_secure_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- Authentication Middleware ---
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "User not authenticated. Please log in." });
};

// --- Authentication Routes ---
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    // This script closes the popup window opened for Google login
    res.send("<script>window.close();</script>");
  }
);

app.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logout successful" });
  });
});

app.get("/api/current_user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// --- State Management and Helper Functions ---
let executor;
let vectorStore;
const ingestedPlatforms = new Set();
const docsDir = path.join(process.cwd(), "docs");

function detectPlatform(query) {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("vercel")) return "vercel";
  if (lowerQuery.includes("netlify")) return "netlify";
  if (lowerQuery.includes("docker")) return "docker";
  if (lowerQuery.includes("heroku")) return "heroku";
  return null;
}

function writeDockerignore(targetDir) {
  const dockerignoreContent = `
# System files
.DS_Store
# Node.js
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
# Git & environment variables
.git
.gitignore
.env
.env*.local
# Build artifacts and configurations
Dockerfile
docker-compose.yml
# Project specific (can be customized)
infra/
.github/
dist/
build/
  `.trim();
  const dockerignorePath = path.join(targetDir, ".dockerignore");
  fs.writeFileSync(dockerignorePath, dockerignoreContent);
  return dockerignorePath;
}

// --- Core API Routes ---

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/scrape-and-query", ensureAuthenticated, async (req, res) => {
  const { query: userQuery } = req.query;
  if (!userQuery) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const platform = detectPlatform(userQuery);
    if (!platform) {
      return res.status(400).json({
        error: "Could not detect a deployment platform (e.g., Vercel, Docker) in your query.",
      });
    }

    const platformDocsPath = path.join(docsDir, `${platform}.md`);
    if (!fs.existsSync(platformDocsPath)) {
      console.log(`[ACTION] Scraping docs for ${platform}...`);
      await scrapePlatform(platform);
    } else {
      console.log(`[CACHE] Found ${platform}.md on disk.`);
    }

    if (!ingestedPlatforms.has(platform)) {
      console.log(`[ACTION] Ingesting ${platform} docs and configuring agent...`);
      vectorStore = await ingestToRAG(platform, vectorStore);
      executor = await createDeployAgent(vectorStore);
      ingestedPlatforms.add(platform);
      console.log(`[SUCCESS] Agent is ready and configured for ${platform}.`);
    } else {
      console.log(`[CACHE] ${platform} docs already loaded in agent.`);
    }

    if (!executor) {
      return res.status(500).json({ error: "Agent is not initialized. Please try the query again." });
    }

    const result = await executor.call({
      input: `Using the provided ${platform} documentation, answer the following question: ${userQuery}`,
    });

    res.json({ response: result.output });
  } catch (err) {
    console.error("Error in /scrape-and-query:", err);
    res.status(500).json({ error: "Failed to process your question.", details: err.message });
  }
});

app.post("/generate-devops", ensureAuthenticated, async (req, res) => {
  try {
    const { repoPath } = req.body;
    if (!repoPath || !path.isAbsolute(repoPath)) {
      return res.status(400).json({ error: "An absolute repository path is required." });
    }
    if (!fs.existsSync(repoPath)) {
      return res.status(400).json({ error: "The provided repository path was not found." });
    }

    const metadata = scanRepo(repoPath);

    const prompt = `
        You are a world-class DevOps engineer specializing exclusively in the **Node.js and JavaScript/TypeScript ecosystem**. 
        Your task is to generate production-ready infrastructure files for a Node.js project based on the provided metadata.

        **Crucial Rule: All generated code, commands, and configurations MUST be for a Node.js environment. Do NOT generate any Python code, \`requirements.txt\` files, or use Python-related commands like \`pip\` or \`gunicorn\`. The project is strictly JavaScript/TypeScript.**

        **Repository Metadata:**
        - Services: ${JSON.stringify(metadata.services, null, 2)}
        - Required Auxiliary Services: ${JSON.stringify(metadata.requiredServices, null, 2)}
        - Project Type: ${metadata.type || "unknown"}
        - Service Entry Points: ${JSON.stringify(Object.fromEntries(Object.entries(metadata.services).map(([name, svc]) => [name, svc.entryPoint])))}

        **Your Tasks:**
        1.  **Dockerfiles:** Generate an optimized, multi-stage Dockerfile for each Node.js service. Use an official Node.js base image (e.g., \`node:20-alpine\`). Follow Node.js best practices.
        2.  **docker-compose.yml:** Create a complete docker-compose file for local development, including all services and auxiliary infrastructure.
        3.  **GitHub Actions CI/CD Pipeline:** Generate a complete workflow for \`.github/workflows/ci.yml\`. It must be for a Node.js project, using \`actions/setup-node\` and \`npm\` or \`yarn\`.
        4.  **Kubernetes Manifests:** For each service, generate a Deployment, Service, and Ingress manifest.
        5.  **Security & Optimization Report:** Provide a detailed report analyzing the generated files, focusing on Node.js-specific security and best practices.

        **Output Format & Rules:**
        1.  You MUST return a single, valid JSON object. Do not include any other text, explanations, or markdown formatting outside of the JSON object.
        2.  **JSON SYNTAX IS CRITICAL:**
            - Every key and string value must be enclosed in double quotes ("").
            - **All double quotes (") inside string values MUST be escaped with a backslash (\\"). For example: "echo \\"Hello World\\""**.
            - Do not use trailing commas.
            - Ensure all brackets ({}, []) and quotes are correctly matched and closed.

        **Final JSON Structure:**
        {
          "dockerfiles": { "serviceName1": "...", "serviceName2": "..." },
          "dockerCompose": "...",
          "ciCdPipeline": "...",
          "kubernetes": { "serviceName1": { "deployment": "...", "service": "...", "ingress": "..." } },
          "securityReport": "..."
        }
        `;

    const response = await model.invoke(prompt);
    let jsonString = response.content.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    // Log the raw string from the AI for debugging JSON errors
    console.log("--- AI RAW OUTPUT --- \n", jsonString);
    const generatedContent = JSON.parse(jsonString);

    const createdFiles = [];
    const writeAndTrack = (filePath, content) => {
      if (content && typeof content === "string" && content.trim() !== "") {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        createdFiles.push(filePath);
      }
    };

    if (generatedContent.dockerfiles) {
      for (const [serviceName, content] of Object.entries(generatedContent.dockerfiles)) {
        const serviceInfo = metadata.services[serviceName];
        if (serviceInfo?.path) {
          writeAndTrack(path.join(serviceInfo.path, "Dockerfile"), content);
          createdFiles.push(writeDockerignore(serviceInfo.path));
        }
      }
    }
    if (generatedContent.dockerCompose) {
      writeAndTrack(path.join(repoPath, "docker-compose.yml"), generatedContent.dockerCompose);
      createdFiles.push(writeDockerignore(repoPath));
    }
    if (generatedContent.ciCdPipeline) {
      writeAndTrack(path.join(repoPath, ".github", "workflows", "ci.yml"), generatedContent.ciCdPipeline);
    }
    if (generatedContent.kubernetes) {
      for (const [serviceName, manifests] of Object.entries(generatedContent.kubernetes)) {
        for (const [type, content] of Object.entries(manifests)) {
          const manifestPath = path.join(repoPath, "infra", "kubernetes", serviceName, `${type}.yaml`);
          writeAndTrack(manifestPath, content);
        }
      }
    }
    if (generatedContent.securityReport) {
      writeAndTrack(path.join(repoPath, "infra", "security-report.md"), generatedContent.securityReport);
    }

    res.json({
      message: "DevOps files generated successfully!",
      createdFiles,
      generatedContent,
      metadata,
    });
  } catch (err) {
    console.error("Error in /generate-devops:", err);
    res.status(500).json({ error: "Error during DevOps file generation.", details: err.message });
  }
});

// index.js (add this endpoint after the /chat-security-report endpoint)

// index.js (add this endpoint at the end of the Core API Routes section)

app.post("/chat-security-report", ensureAuthenticated, async (req, res) => {
  try {
    const { repoPath, question } = req.body;
    if (!repoPath || !path.isAbsolute(repoPath)) return res.status(400).json({ error: "An absolute repoPath is required." });
    if (!question) return res.status(400).json({ error: "A question is required for the chat." });
    
    const reportPath = path.join(repoPath, "infra", "security-report.md");
    if (!fs.existsSync(reportPath)) return res.status(404).json({ error: "security-report.md not found." });

    const reportContent = fs.readFileSync(reportPath, "utf-8");
    const metadata = scanRepo(repoPath);

    const prompt = `
        You are a principal DevOps security consultant acting as a helpful chatbot.
        Your goal is to discuss the provided security report with the user and answer their questions.

        **Repository Metadata:**
        - Services: ${JSON.stringify(metadata.services, null, 2)}
        - Project Type: ${metadata.type || "unknown"}

        **Existing Security Report:**
        ---
        ${reportContent}
        ---

        **User's Question:** "${question}"

        **Your Task:**
        Based on all the context above, provide a helpful, conversational answer to the user's question. If they ask for a fix, provide a clear code snippet.
        `;

    const response = await model.invoke(prompt);
    res.json({
      message: "Response generated successfully.",
      recommendations: response.content,
    });
  } catch (err) {
    console.error("Error in /chat-security-report:", err);
    res.status(500).json({ error: "Error generating security recommendations.", details: err.message });
  }
});

// --- Server Startup ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Deployment Agent running on http://localhost:${PORT}`);
  console.log("Agent will be initialized on the first query.");
});