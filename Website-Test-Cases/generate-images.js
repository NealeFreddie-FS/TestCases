const fs = require("fs");
const path = require("path");

// Function to create a simple placeholder image
function createPlaceholderImage(filePath, width, height, color, text) {
  // Create a simple SVG image
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${color}" />
    <text x="${width / 2}" y="${height / 2}" 
      font-family="Arial" font-size="${height / 10}px" fill="white" 
      text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;

  fs.writeFileSync(filePath, svg);
  console.log(`Created: ${filePath}`);
}

// Create directories if they don't exist
const publicDir = path.join(process.cwd(), "public");
const assetsDir = path.join(publicDir, "assets");
const enemiesDir = path.join(assetsDir, "enemies");

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
if (!fs.existsSync(enemiesDir)) fs.mkdirSync(enemiesDir);

// Create placeholder images
createPlaceholderImage(path.join(enemiesDir, "default.svg"), 16, 16, "red", "");

createPlaceholderImage(
  path.join(assetsDir, "menu-bg.svg"),
  800,
  600,
  "#123456",
  "Menu Background"
);

createPlaceholderImage(
  path.join(assetsDir, "character-bg.svg"),
  800,
  600,
  "#553300",
  "Character Background"
);

createPlaceholderImage(
  path.join(publicDir, "favicon.svg"),
  32,
  32,
  "#772211",
  ""
);

console.log("All placeholder images created successfully!");
console.log(
  "Note: Since these are SVG files, you may need to update your code to use .svg extension instead of .jpg or .png"
);
