/**
 * Batch converts all sauna text files in /input into standardized JSON files in /output.
 * This SCript is a custom script to convert the word document into a JSON file for the sauna.
 * Convert Saunas in .docx file to individual .txt file eg purecube572.txt
 * it is meant to be a tmesaver to convert .docx to .json
 * the final file will then have to be inspected and updated before pushing to the DB
 *
 * This script:
 * - Reads all `.txt` sauna descriptions in /input
 * - Extracts structured data such as cost, features, dimensions, etc.
 * - Outputs a formatted `.json` version for each text file
 *
 * Usage:
 *   node batchConvertSaunas.js
 */

import fs from "fs"; // Node's built-in file system module for reading/writing files
import path from "path"; // Node's path module for handling file and directory paths

// Define where input text files are and where to save the generated JSON files
const inputDir = "./input";
const outputDir = "./output";

// ✅ Create the /output folder if it doesn’t already exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

/**
 * 🧩 parseSaunaDescription()
 * Takes the raw text of a sauna file and converts it into a structured JavaScript object.
 */
function parseSaunaDescription(text) {
  // Split text into lines, trim whitespace, and remove empty lines
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /**
   * Helper: Extracts a numeric value that follows a label (e.g., "Base Cost: $9000")
   */
  const getValue = (label) => {
    const regex = new RegExp(`${label}:\\s*\\$?([\\d,\\.]+)`, "i"); // Regex to find label + numeric value
    const match = text.match(regex);
    return match ? parseFloat(match[1].replace(/,/g, "")) : null; // Convert "9,000" → 9000
  };

  /**
   * Helper: Extracts a text section following a label until another label or end of file
   */
  const getSection = (label) => {
    const regex = new RegExp(
      `${label}:([\\s\\S]*?)(?=\\n[A-Z][^:\\n]+:|$)`,
      "i"
    );
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  // Find the product name (usually on its own line in title case)
  const nameMatch = lines.find((l) => /^[A-Z][A-Za-z0-9\s\-]+$/.test(l));
  const name = nameMatch || "Unknown Sauna";

  // Extract the main numeric fields
  const baseCost = getValue("Base Cost") || 0;
  const clearCedarCost = getValue("Clear Cedar Upgrade Cost") || 0;
  const delivery = getValue("Delivery") || 0;
  const install = getValue("Professional Install Cost") || 0;
  const wifi = getValue("Wifi Controller") || 0;

  // Extract long text sections
  const description = getSection("Description");

  // Parse bullet-pointed features
  const features = description
    .split("•")
    .slice(1) // Skip text before the first bullet
    .map((f) => f.replace(/\*?\s*$/, "").trim())
    .filter(Boolean);

  // 🔥 Parse Stove Options and their prices
  const stoveSection = getSection("Stove Options");
  const stoveLines = stoveSection.split("\n").filter(Boolean);
  const stove_type = {};
  stoveLines.forEach((line) => {
    const match = line.match(/(.+?)\s*\$([\d,\.]+)/); // e.g., "Harvia M3 Wood Stove $1400"
    if (match)
      stove_type[match[1].trim()] = {
        price: parseFloat(match[2].replace(/,/g, "")),
      };
  });

  // 🔧 Parse Additional Upgrades
  const addOnSection = getSection("Additional Upgrades");
  const addOnLines = addOnSection.split("\n").filter(Boolean);
  const additional_upgrades = addOnLines
    .map((line) => {
      const match = line.match(/(.+?):?\s*\$([\d,\.]+)/);
      return match
        ? {
            name: match[1].trim(),
            price: parseFloat(match[2].replace(/,/g, "")),
          }
        : null;
    })
    .filter(Boolean);

  // 📏 Extract dimensions like 6"x8"x7"
  const dimensionMatch = text.match(/(\d+)"\s*[xX]\s*(\d+)"\s*[xX]\s*(\d+)"/);
  const dimensions = dimensionMatch
    ? {
        width: parseInt(dimensionMatch[2]),
        depth: parseInt(dimensionMatch[1]),
        height: parseInt(dimensionMatch[3]),
        unit: "in",
        type: "exterior",
      }
    : null;

  // 🧱 Return a structured object suitable for seeding or uploading to a DB
  return {
    owner: "torontosaunco",
    name,
    type: "Outdoor Sauna",
    collectionType: "Cube",
    series: name,
    description,
    baseCost,
    price: baseCost,
    dimensions,
    features,
    wood_type: {
      "Knotty Cedar": { price: 0 },
      "Clear Cedar (Upgrade)": { price: clearCedarCost },
    },
    stove_type,
    wifi_controller: {
      price: wifi,
      description: "Optional Wifi Controller for compatible electric heaters",
    },
    additional_upgrades,
    delivery: {
      cost: delivery,
      included: false,
      description: "Delivery charge",
    },
    installation: {
      DIY: { price: 0 },
      "Professional Install": { price: install },
    },
    seller_info: {
      name: "John Doe",
      email: "john@gmail.com",
      phone: "617-555-5555",
    },
    images: [], // can be populated later
    is_featured: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

/**
 * 🚀 processAllFiles()
 * Reads all .txt files from /input, parses each one,
 * and saves the resulting JSON to /output.
 */
function processAllFiles() {
  // Get all files in /input that end with ".txt"
  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".txt"));

  // Warn if the folder is empty
  if (files.length === 0) {
    console.log("⚠️  No .txt files found in /input folder.");
    return;
  }

  // Loop through every text file
  files.forEach((file) => {
    const filePath = path.join(inputDir, file); // full path of input file
    const text = fs.readFileSync(filePath, "utf8"); // read file content as text
    const jsonData = parseSaunaDescription(text); // convert it into structured JSON
    const outputFile = path.join(outputDir, file.replace(".txt", ".json")); // output file path

    // Save the parsed data as a formatted JSON file
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Converted: ${file} → ${path.basename(outputFile)}`);
  });

  console.log("\n✨ All sauna files processed successfully!");
}

// 🏁 Run the batch conversion
processAllFiles();
