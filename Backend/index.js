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

// --- LangChain Core Imports ---
import { PromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages"; // ✅ Added for chat history
import {
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

// --- Local Imports ---
import "./config/passport-setup.js"; // Your Passport configuration
import { connectDB } from "./database/db.js";
import { scanRepo } from "./tools/repoScanner.js";
import { createDeployAgent, model } from "./agent.js";
import { ChatMessage } from "./model/ChatMessage.js"; // ✅ Import the new model

// --- Basic Setup ---
dotenv.config();
const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
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
// ... (No changes to your auth routes)
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
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
// ... (No changes to helper functions)
let executor;
const docsDir = path.join(process.cwd(), "docs");

const writeDockerignore = (dirPath) => {
  const content = `
# Dependency directories
node_modules/

# Build output
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.*
!.env.example

# Git directory
.git

# IDE configs
.vscode/
.idea/
  `.trim();

  const filePath = path.join(dirPath, ".dockerignore");

  // Only write the file if it doesn't already exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }

  return filePath; // Return the path for the tracking array
};

// --- Core API Routes ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ NEW: Endpoint to fetch chat history for the authenticated user
app.get("/api/chat-history", ensureAuthenticated, async (req, res) => {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const messages = await ChatMessage.find({
      userId: req.user.id,
      timestamp: { $gte: fiveDaysAgo },
    }).sort({ timestamp: "asc" });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

// ✅ UPDATED: DevOps Chatbot now uses history and relies on existing docs
app.get("/api/chat-history", ensureAuthenticated, async (req, res) => {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const messages = await ChatMessage.find({
      userId: req.user.id,
      timestamp: { $gte: fiveDaysAgo },
    }).sort({ timestamp: "asc" });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

// The main chatbot endpoint with conversation history
app.post("/devops-chatbot", ensureAuthenticated, async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    // Initialize the agent on the first request and reuse it for subsequent requests.
    // This now creates the agent WITH the web search tool included.
    if (!executor) {
      console.log("[INFO] Initializing agent for the first time...");
      executor = await createDeployAgent(); // You can pass a vectorStore here if needed
      console.log(
        "[INFO] Agent initialized successfully with web search capabilities."
      );
    }

    // 1. Fetch recent chat history from the database for the current user.
    const recentMessages = await ChatMessage.find({
      userId: req.user.id,
    })
      .sort({ timestamp: -1 })
      .limit(10); // Get the last 10 messages (5 turns)

    // 2. Format history for the LangChain agent.
    // The order must be oldest to newest, so we reverse the DB query result.
    const chatHistory = recentMessages
      .reverse()
      .map((msg) =>
        msg.role === "human"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

    // 3. Invoke the agent with the new question and the conversation history.
    // The agent will autonomously decide whether to use its search tool.
    const result = await executor.invoke({
      input: question,
      chat_history: chatHistory,
    });
    const aiResponse = result.output;

    // 4. Save the new conversation turn to the database.
    await ChatMessage.insertMany([
      { userId: req.user.id, role: "human", content: question },
      { userId: req.user.id, role: "ai", content: aiResponse },
    ]);

    // 5. Send the response back to the client.
    res.json({ response: aiResponse });
  } catch (err) {
    console.error("Error in /devops-chatbot route:", err);
    res.status(500).json({
      error: "Failed to process your question.",
      details: err.message,
    });
  }
});

app.post("/generate-devops", ensureAuthenticated, async (req, res) => {
  try {
    const { repoPath } = req.body;
    if (!repoPath || !path.isAbsolute(repoPath)) {
      return res
        .status(400)
        .json({ error: "An absolute repository path is required." });
    }
    if (!fs.existsSync(repoPath)) {
      return res
        .status(400)
        .json({ error: "The provided repository path was not found." });
    }

    const metadata = scanRepo(repoPath);

    const promptTemplate = PromptTemplate.fromTemplate(`
        You are a world-class DevOps engineer specializing exclusively in the **Node.js and JavaScript/TypeScript ecosystem**. 
        Your task is to generate production-ready infrastructure files for a Node.js project based on the provided metadata.

        **Crucial Rule: All generated code, commands, and configurations MUST be for a Node.js environment. Do NOT generate any Python code, \`requirements.txt\` files, or use Python-related commands like \`pip\` or \`gunicorn\`. The project is strictly JavaScript/TypeScript.**

        **Repository Metadata:**
        - Services: {services}
        - Required Auxiliary Services: {requiredServices}
        - Project Type: {projectType}
        - Service Entry Points: {entryPoints}

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
            - Ensure all brackets ({{}}, []) and quotes are correctly matched and closed.

        **Final JSON Structure:**
        {{
          "dockerfiles": {{ "serviceName1": "...", "serviceName2": "..." }},
          "dockerCompose": "...",
          "ciCdPipeline": "...",
          "kubernetes": {{ "serviceName1": {{ "deployment": "...", "service": "...", "ingress": "..." }} }},
          "securityReport": "..."
        }}
    `);

    const generationChain = promptTemplate
      .pipe(model)
      .pipe(new JsonOutputParser());

    const generatedContent = await generationChain.invoke({
      services: JSON.stringify(metadata.services, null, 2),
      requiredServices: JSON.stringify(metadata.requiredServices, null, 2),
      projectType: metadata.type || "unknown",
      entryPoints: JSON.stringify(
        Object.fromEntries(
          Object.entries(metadata.services).map(([name, svc]) => [
            name,
            svc.entryPoint,
          ])
        )
      ),
    });

    const createdFiles = [];
    const writeAndTrack = (filePath, content) => {
      if (content && typeof content === "string" && content.trim() !== "") {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        createdFiles.push(filePath);
      }
    };

    if (generatedContent.dockerfiles) {
      for (const [serviceName, content] of Object.entries(
        generatedContent.dockerfiles
      )) {
        const serviceInfo = metadata.services[serviceName];
        if (serviceInfo?.path) {
          writeAndTrack(path.join(serviceInfo.path, "Dockerfile"), content);
          createdFiles.push(writeDockerignore(serviceInfo.path));
        }
      }
    }
    if (generatedContent.dockerCompose) {
      writeAndTrack(
        path.join(repoPath, "docker-compose.yml"),
        generatedContent.dockerCompose
      );
      createdFiles.push(writeDockerignore(repoPath));
    }
    if (generatedContent.ciCdPipeline) {
      writeAndTrack(
        path.join(repoPath, ".github", "workflows", "ci.yml"),
        generatedContent.ciCdPipeline
      );
    }
    if (generatedContent.kubernetes) {
      for (const [serviceName, manifests] of Object.entries(
        generatedContent.kubernetes
      )) {
        for (const [type, content] of Object.entries(manifests)) {
          const manifestPath = path.join(
            repoPath,
            "infra",
            "kubernetes",
            serviceName,
            `${type}.yaml`
          );
          writeAndTrack(manifestPath, content);
        }
      }
    }
    if (generatedContent.securityReport) {
      writeAndTrack(
        path.join(repoPath, "infra", "security-report.md"),
        generatedContent.securityReport
      );
    }

    res.json({
      message: "DevOps files generated successfully!",
      createdFiles,
      generatedContent,
      metadata,
    });
  } catch (err) {
    console.error("Error in /generate-devops:", err);
    res.status(500).json({
      error: "Error during DevOps file generation.",
      details: err.message,
    });
  }
});

app.post("/chat-security-report", ensureAuthenticated, async (req, res) => {
  try {
    const { repoPath, question } = req.body;
    if (!repoPath || !path.isAbsolute(repoPath))
      return res
        .status(400)
        .json({ error: "An absolute repoPath is required." });
    if (!question)
      return res
        .status(400)
        .json({ error: "A question is required for the chat." });

    const reportPath = path.join(repoPath, "infra", "security-report.md");
    if (!fs.existsSync(reportPath))
      return res.status(404).json({ error: "security-report.md not found." });

    const reportContent = fs.readFileSync(reportPath, "utf-8");
    const metadata = scanRepo(repoPath);

    // ✅ FIX: Removed quotes from around the {question} variable
    const promptTemplate = PromptTemplate.fromTemplate(`
        You are a principal DevOps security consultant acting as a helpful chatbot.
        Your goal is to discuss the provided security report with the user and answer their questions.

        **Repository Metadata:**
        - Services: {services}
        - Project Type: {projectType}

        **Existing Security Report:**
        ---
        {reportContent}
        ---

        **User's Question:** {question}

        **Your Task:**
        Based on all the context above, provide a helpful, conversational answer to the user's question. If they ask for a fix, provide a clear code snippet.
    `);

    const chatChain = promptTemplate.pipe(model).pipe(new StringOutputParser());

    const recommendations = await chatChain.invoke({
      services: JSON.stringify(metadata.services, null, 2),
      projectType: metadata.type || "unknown",
      reportContent: reportContent,
      question: question,
    });

    res.json({
      message: "Response generated successfully.",
      recommendations: recommendations,
    });
  } catch (err) {
    console.error("Error in /chat-security-report:", err);
    res.status(500).json({
      error: "Error generating security recommendations.",
      details: err.message,
    });
  }
});

// --- Server Startup ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Deployment Agent running on http://localhost:${PORT}`);
  console.log("Agent will be initialized on the first query.");
});
