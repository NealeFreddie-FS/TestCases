const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

// Make sure the output directory exists
const assetsDir = path.join(__dirname, "../public/assets/icons");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to convert pixel art JSON to PNG
function convertJsonToPng(jsonFilePath, outputFilePath, scale = 4) {
  try {
    // Read and parse the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    const { width, height, pixels, colors } = jsonData;

    // Create canvas with the specified dimensions, scaled up
    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext("2d");

    // Draw each pixel
    for (let y = 0; y < pixels.length; y++) {
      const row = pixels[y];
      for (let x = 0; x < row.length; x++) {
        const pixelChar = row[x];
        const color = colors[pixelChar];

        if (color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    // Save the PNG file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputFilePath, buffer);

    console.log(`Converted ${jsonFilePath} to ${outputFilePath}`);
  } catch (error) {
    console.error(`Error converting ${jsonFilePath}:`, error);
  }
}

// Process all JSON files in the icons directory
function processAllJsonFiles() {
  const jsonDir = path.join(__dirname, "../public/assets/icons");
  const files = fs.readdirSync(jsonDir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const jsonFilePath = path.join(jsonDir, file);
      const outputFilePath = path.join(jsonDir, file.replace(".json", ".png"));

      convertJsonToPng(jsonFilePath, outputFilePath);
    }
  }
}

// Convert a specific file if provided as argument, otherwise process all files
const specificFile = process.argv[2];
if (specificFile) {
  const jsonFilePath = path.join(
    __dirname,
    "../public/assets/icons",
    specificFile
  );
  const outputFilePath = path.join(
    __dirname,
    "../public/assets/icons",
    specificFile.replace(".json", ".png")
  );

  convertJsonToPng(jsonFilePath, outputFilePath);
} else {
  processAllJsonFiles();
}
