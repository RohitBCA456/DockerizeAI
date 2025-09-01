import { scrapePlatform } from "./tools/docsScrapper.js";
import fs from "fs/promises";
import path from "path";

async function testScraping() {
  try {
    console.log("=== Testing Scraping Functionality ===");
    
    // Test scraping Netlify
    console.log("\n1. Testing Netlify scraping...");
    const result = await scrapePlatform("netlify");
    console.log(`Scraping result length: ${result.length}`);
    
    // Check if file was created
    const docsPath = path.join("docs", "netlify.md");
    console.log(`\n2. Checking if file exists: ${docsPath}`);
    
    try {
      await fs.access(docsPath);
      const stats = await fs.stat(docsPath);
      const content = await fs.readFile(docsPath, 'utf-8');
      
      console.log("File exists!");
      console.log(`File size: ${stats.size} bytes`);
      console.log(`Content length: ${content.length} characters`);
      console.log(`Last modified: ${stats.mtime}`);
      
      // Show first 200 characters
      console.log(`\nFirst 200 characters:`);
      console.log(content.substring(0, 200));
      
    } catch (error) {
      console.error("File does not exist or cannot be read:");
      console.error(error.message);
    }
    
    // List all files in docs directory
    console.log("\n3. Listing all files in docs directory:");
    try {
      const docsDir = path.join(process.cwd(), "docs");
      const files = await fs.readdir(docsDir);
      console.log(`Files in ${docsDir}:`);
      files.forEach(file => console.log(`  - ${file}`));
    } catch (error) {
      console.error("Error reading docs directory:", error.message);
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testScraping();

