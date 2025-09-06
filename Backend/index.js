import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { scanRepo } from "./tools/repoScanner.js";
import { createDeployAgent, model } from "./agent.js";
import { scrapePlatform, ingestToRAG } from "./tools/docsScrapper.js";
import { connectDB } from "./database/db.js";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

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

// 🔹 Helper: write a standard .dockerignore
function writeDockerignore(targetDir) {
  const dockerignoreContent = `
# Ignore node modules and logs
node_modules
npm-debug.log
yarn-error.log

# Git & env
.git
.gitignore
.env

# Build artifacts
Dockerfile
docker-compose.yml

# Infra (not needed inside image)
infra/
.github/
`.trim();

  const dockerignorePath = path.join(targetDir, ".dockerignore");
  fs.writeFileSync(dockerignorePath, dockerignoreContent);
  return dockerignorePath;
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

app.post("/generate-devops", async (req, res) => {
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
    You are an expert DevOps engineer. Based on the repository metadata below, generate the following DevOps infrastructure and automation files:
    
    **Repository Metadata**
    - Services: ${JSON.stringify(metadata.services, null, 2)}
    - Required Auxiliary Services (databases, caches, queues, etc.): ${JSON.stringify(
      metadata.requiredServices,
      null,
      2
    )}
    - Project Type: ${metadata.type || "unknown"} (microservices or monolith)
    
    **Tasks**
  1. **Dockerfiles**
   - Generate one Dockerfile per service.
   - Optimize for development with multi-stage builds if needed.
   - Ensure CMD uses the correct entry point.
   - Add EXPOSE instructions for the service ports.
   - DO NOT include .dockerignore content here; .dockerignore will be handled separately.

    2. **docker-compose.yml**
       - Include all services and auxiliary infrastructure (databases, caches, queues).
       - Use env_file if the service has a .env.
       - Add named volumes for persistent databases.
       - Ensure all services can communicate correctly via service names.
    
    3. **GitHub Actions CI/CD Pipeline**
       - Generate a complete workflow at .github/workflows/ci.yml
       - Steps: install dependencies, run tests, build Docker images, push images, deploy to Kubernetes if manifests exist.
       - Include multi-service handling (each service is built/tested individually if microservices).
       - Do not generate placeholders, write full YAML content.
    
    4. **Kubernetes Manifests**
       - Generate a deployment, service, and ingress for each service.
       - Include aux services if detected (e.g., MongoDB, Redis, Postgres).
       - Place manifests under infra/kubernetes/<serviceName>/deployment.yaml, service.yaml, ingress.yaml.
       - Ensure container images, ports, and env variables match metadata.
    
    5. **Security & Optimization Report**
       - Analyze Dockerfiles, Kubernetes manifests, and pipeline.
       - Detect potential security issues (e.g., secrets in Dockerfiles, overly permissive ingress rules).
       - Provide best-practice suggestions for optimizations.
    
    **Output Format**
    Return a single JSON object only, nothing else:
    
    {
      "dockerfiles": {
        "serviceName1": "Dockerfile content...",
        "serviceName2": "Dockerfile content..."
      },
      "dockerCompose": "Full docker-compose.yml content...",
      "ciCdPipeline": "Full GitHub Actions workflow content...",
      "kubernetes": {
        "serviceName1": {
          "deployment": "Full deployment.yaml content...",
          "service": "Full service.yaml content...",
          "ingress": "Full ingress.yaml content..."
        },
        "serviceName2": { ... }
      },
      "securityReport": "Detailed report with issues and fixes"
    }
    
    **Important Notes**
    - Do NOT generate placeholders or file names only.
    - Ensure all outputs are complete and production-ready.
    - Include .dockerignore content for each service in dockerfiles output if needed.
    - Format YAML and JSON properly.
    `;

    const response = await model.invoke(prompt);

    let jsonString = response.content;
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }
    const generatedContent = JSON.parse(jsonString);

    const createdFiles = [];

    // 1. Write Dockerfiles + .dockerignore per service
    if (generatedContent.dockerfiles) {
      for (const [serviceName, dockerfileContent] of Object.entries(
        generatedContent.dockerfiles
      )) {
        const serviceInfo = metadata.services[serviceName];
        if (serviceInfo && serviceInfo.path && dockerfileContent) {
          const dockerfilePath = path.join(serviceInfo.path, "Dockerfile");
          fs.writeFileSync(dockerfilePath, dockerfileContent);
          createdFiles.push(dockerfilePath);

          // add .dockerignore
          const ignorePath = writeDockerignore(serviceInfo.path);
          createdFiles.push(ignorePath);
        }
      }
    }

    // 2. Write docker-compose + root .dockerignore
    if (generatedContent.dockerCompose) {
      const composePath = path.join(repoPath, "docker-compose.yml");
      fs.writeFileSync(composePath, generatedContent.dockerCompose);
      createdFiles.push(composePath);

      const ignorePath = writeDockerignore(repoPath);
      createdFiles.push(ignorePath);
    }

    // 3. Write CI/CD pipeline
    if (generatedContent.ciCdPipeline) {
      const ciDir = path.join(repoPath, ".github", "workflows");
      fs.mkdirSync(ciDir, { recursive: true });
      const ciPath = path.join(ciDir, "ci.yml");
      fs.writeFileSync(ciPath, generatedContent.ciCdPipeline);
      createdFiles.push(ciPath);
    }

    // 4. Write Kubernetes manifests
    if (generatedContent.kubernetes) {
      const k8sDir = path.join(repoPath, "infra", "kubernetes");
      fs.mkdirSync(k8sDir, { recursive: true });

      for (const [serviceName, manifests] of Object.entries(
        generatedContent.kubernetes
      )) {
        const serviceDir = path.join(k8sDir, serviceName);
        fs.mkdirSync(serviceDir, { recursive: true });

        for (const [manifestType, content] of Object.entries(manifests)) {
          if (content && typeof content === "string") {
            const filePath = path.join(serviceDir, `${manifestType}.yaml`);
            fs.writeFileSync(filePath, content);
            createdFiles.push(filePath);
          }
        }
      }
    }

    // 5. Write Security Report
    if (generatedContent.securityReport) {
      const reportPath = path.join(repoPath, "infra", "security-report.txt");
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, generatedContent.securityReport);
      createdFiles.push(reportPath);
    }

    res.json({
      message: "DevOps files generated and saved successfully!",
      createdFiles,
      generatedContent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error during DevOps generation",
      details: err.message,
    });
  }
});

app.post("/chat-security-report", async (req, res) => {
  try {
    const { repoPath } = req.body;

    if (!repoPath || !path.isAbsolute(repoPath)) {
      return res
        .status(400)
        .json({ error: "An absolute repoPath is required." });
    }
    if (!fs.existsSync(repoPath)) {
      return res.status(400).json({ error: "Repository path not found." });
    }

    // Repo scan again
    const metadata = scanRepo(repoPath);

    // Ensure report exists
    const reportPath = path.join(repoPath, "infra", "security-report.txt");
    if (!fs.existsSync(reportPath)) {
      return res
        .status(400)
        .json({
          error:
            "security-report.txt not found. Please run /generate-devops first.",
        });
    }

    // Read report content
    const reportContent = fs.readFileSync(reportPath, "utf-8");

    // Prompt for recommendations
    const prompt = `
    You are an expert DevOps security consultant. 
    Below is the repository metadata and the last generated security report.
    Based on both, recommend detailed fixes and improvements.

    **Repository Metadata**
    - Services: ${JSON.stringify(metadata.services, null, 2)}
    - Required Services: ${JSON.stringify(metadata.requiredServices, null, 2)}
    - Type: ${metadata.type || "unknown"}

    **Existing Security Report**
    ${reportContent}

    **Your Task**
    - Suggest fixes for all identified issues.
    - Recommend additional improvements (if any).
    - Do not repeat the same issues blindly; provide actionable steps.
    - If fixes require code/config changes (Dockerfile, CI/CD, K8s), provide concrete examples.
    `;

    const response = await model.invoke(prompt);

    // Extract plain text (avoid JSON since it's chat-like output)
    const recommendations = response.content;

    res.json({
      message: "Security recommendations generated successfully",
      recommendations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error generating recommendations",
      details: err.message,
    });
  }
});

app.listen(4000);
