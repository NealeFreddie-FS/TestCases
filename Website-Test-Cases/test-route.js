// Simple script to test if Next.js is correctly recognizing routes
const fs = require("fs");
const path = require("path");

console.log("Checking directory structure...");

// Check if the new-game directory exists
const newGamePath = path.join(__dirname, "app", "new-game");
console.log(`Checking path: ${newGamePath}`);
const exists = fs.existsSync(newGamePath);
console.log(`new-game directory exists: ${exists}`);

if (exists) {
  // List files in the directory
  const files = fs.readdirSync(newGamePath);
  console.log("Files in new-game directory:");
  files.forEach((file) => {
    console.log(` - ${file}`);
  });
}

// Check if page.tsx exists
const pagePath = path.join(newGamePath, "page.tsx");
console.log(`Checking for page.tsx: ${fs.existsSync(pagePath)}`);

console.log("Test complete");
