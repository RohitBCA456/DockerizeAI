import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function detectServiceType(folderPath) {
  if (fs.existsSync(path.join(folderPath, "package.json"))) return "node";
  if (fs.existsSync(path.join(folderPath, "requirements.txt"))) return "python";
  return "unknown";
}

function getNodeEntryPoint(folderPath) {
  const packageJsonPath = path.join(folderPath, "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.main) return packageJson.main;
  } catch (e) {
    /* Fallback below */
  }
  return "index.js";
}

// Detect dependencies
function detectDependencies(folderPath, type) {
  if (type === "node") {
    const packageJsonPath = path.join(folderPath, "package.json");
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      return Object.keys({
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      });
    } catch (e) {
      console.error(`Error parsing package.json in ${folderPath}`, e);
      return [];
    }
  }

  if (type === "python") {
    const requirementsPath = path.join(folderPath, "requirements.txt");
    try {
      if (fs.existsSync(requirementsPath)) {
        const requirements = fs.readFileSync(requirementsPath, "utf8");
        return requirements
          .split("\n")
          .map((line) => line.split("==")[0].trim())
          .filter((line) => line && !line.startsWith("#"));
      }
    } catch (e) {
      console.error(`Error parsing requirements.txt in ${folderPath}`, e);
    }
  }

  return [];
}

// Detect auxiliary services from .env
function detectAuxiliaryServices(folderPath) {
  const required = new Set();
  const envPath = path.join(folderPath, ".env");

  if (!fs.existsSync(envPath)) return [];

  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const envConfig = dotenv.parse(envContent);

    for (const key in envConfig) {
      const lowerKey = key.toLowerCase();
      const lowerValue = envConfig[key].toLowerCase();

      if (
        lowerKey.includes("postgres") ||
        lowerValue.includes("postgres://")
      ) {
        required.add("postgres");
      }
      if (lowerKey.includes("mongo") || lowerValue.includes("mongodb://")) {
        required.add("mongodb");
      }
      if (lowerKey.includes("redis")) {
        required.add("redis");
      }
      if (lowerKey.includes("rabbit") || lowerKey.includes("amqp")) {
        required.add("rabbitmq");
      }
    }
  } catch (e) {
    console.error(`Error parsing .env file in ${folderPath}`, e);
  }

  return Array.from(required);
}

export function scanRepo(repoPath) {
  const services = {};
  const allAuxiliaryServices = new Set();

  const folders = fs.readdirSync(repoPath, { withFileTypes: true });
  for (const folder of folders) {
    if (folder.isDirectory()) {
      const servicePath = path.join(repoPath, folder.name);
      const type = detectServiceType(servicePath);

      if (type !== "unknown") {
        const entryPoint =
          type === "node" ? getNodeEntryPoint(servicePath) : "app.py";
        const envConfig = dotenv.parse(
          fs.existsSync(path.join(servicePath, ".env"))
            ? fs.readFileSync(path.join(servicePath, ".env"))
            : ""
        );
        const auxServices = detectAuxiliaryServices(servicePath);
        const dependencies = detectDependencies(servicePath, type);

        auxServices.forEach((service) => allAuxiliaryServices.add(service));

        services[folder.name] = {
          path: servicePath,
          type,
          entryPoint,
          port: envConfig.PORT || null,
          hasEnvFile: fs.existsSync(path.join(servicePath, ".env")),
          dependencies,
        };
      }
    }
  }

  // 🆕 Decide structure type
  const serviceCount = Object.keys(services).length;
  const structure = serviceCount > 1 ? "microservices" : "monolith";

  return {
    structure, // "microservices" or "monolith"
    services,
    requiredServices: Array.from(allAuxiliaryServices),
  };
}
