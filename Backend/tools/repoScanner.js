// tools/repoScanner.js

import fs from "fs";
import path from "path";

// A generic function to recursively find files matching a pattern
function findFiles(dir, pattern, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (['node_modules', '.git', 'dist', 'build'].includes(file)) {
      return;
    }
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, pattern, filelist);
    } else if (pattern.test(file)) {
      filelist.push(filePath);
    }
  });
  return filelist;
}

// The main scanning function, now with service structure detection
export function scanRepo(repoPath) {
  const metadata = {
    services: {},
    requiredServices: new Set(),
    type: "unknown",
  };

  // --- 1. Detect Project Structure (Services) ---
  // We find all package.json files, as each one typically represents a service.
  const packageJsonFiles = findFiles(repoPath, /package\.json$/);
  
  for (const pjsonPath of packageJsonFiles) {
    try {
      const pjsonContent = JSON.parse(fs.readFileSync(pjsonPath, "utf-8"));
      // Ignore packages with no name (can be workspace configs)
      if (!pjsonContent.name) continue;

      // Use the directory name as the service name for clarity (e.g., 'api', 'frontend')
      // but fall back to the package name if needed.
      const servicePath = path.dirname(pjsonPath);
      const serviceName = path.basename(servicePath);

      metadata.services[serviceName] = {
        name: pjsonContent.name,
        path: servicePath,
        entryPoint: pjsonContent.main || "index.js", // Best guess for entry point
        dependencies: Object.keys(pjsonContent.dependencies || {}),
      };
      console.log(`[SCANNER] Detected Service: '${serviceName}' at ${servicePath}`);
    } catch (e) {
      console.error(`Error processing package.json at ${pjsonPath}:`, e);
    }
  }

  // --- 2. Check Dependencies for Required Auxiliary Services ---
  // Now we iterate through the services we just found
  for (const service of Object.values(metadata.services)) {
    if (service.dependencies.some(dep => ['mongoose', 'mongodb'].includes(dep))) {
      metadata.requiredServices.add("MongoDB");
    }
    if (service.dependencies.some(dep => ['redis', 'ioredis'].includes(dep))) {
      metadata.requiredServices.add("Redis");
    }
    if (service.dependencies.includes('pg')) {
      metadata.requiredServices.add("PostgreSQL");
    }
  }

  // --- 3. Scan .env Files (for additional clues) ---
  const envFiles = findFiles(repoPath, /\.env(\..*)?$/);
  // (Regex checks for env files remain the same, they just add to the Set)
  for (const file of envFiles) {
    try {
        const content = fs.readFileSync(file, "utf-8");
        if (/^(MONGO|MONGODB|DATABASE)_URI\s*=\s*['"]?mongodb/im.test(content)) metadata.requiredServices.add("MongoDB");
        if (/^(REDIS_URL|REDIS_HOST)/im.test(content)) metadata.requiredServices.add("Redis");
        if (/^(POSTGRES_URL|DATABASE_URL\s*=\s*['"]?postgres)/im.test(content)) metadata.requiredServices.add("PostgreSQL");
    } catch (e) { /* Ignore read errors */ }
  }

  // --- 4. Scan File Content (Fallback) ---
  const jsFiles = findFiles(repoPath, /\.(js|mjs|ts)$/);
  for (const file of jsFiles) {
    try {
        const content = fs.readFileSync(file, "utf-8");
        if (/mongoose|mongodb(\+srv)?:\/\//i.test(content)) metadata.requiredServices.add("MongoDB");
    } catch (e) { /* Ignore read errors */ }
  }
  
  // --- Finalize Metadata ---
  metadata.requiredServices = Array.from(metadata.requiredServices);

  // The project type detection will now work correctly
  const serviceCount = Object.keys(metadata.services).length;
  if (serviceCount > 1) {
    metadata.type = "microservices";
  } else if (serviceCount === 1) {
    metadata.type = "monolith";
  }

  console.log('[SCANNER] Final Metadata:', JSON.stringify(metadata, null, 2));
  return metadata;
}