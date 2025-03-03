"use client";

import { TileType, Tile } from "../entities/Tile";

type MapOptions = {
  seed?: number;
  biomes?: string[];
  structures?: string[];
};

// Simple noise function for map generation
function noise(nx: number, ny: number, seed: number = 123): number {
  // Simple pseudo-random noise function
  const x = nx + seed * 0.3;
  const y = ny + seed * 0.7;
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
}

export function generateTilemap(
  width: number,
  height: number,
  options: MapOptions = {}
): Tile[][] {
  const tilemap: Tile[][] = [];
  const seed = options.seed || Math.random() * 1000;

  // First, create the base terrain
  for (let y = 0; y < height; y++) {
    tilemap[y] = [];

    for (let x = 0; x < width; x++) {
      // Generate a noise value for this coordinate
      const nx = x / width;
      const ny = y / height;
      const n = noise(nx, ny, seed);

      // Determine tile type based on noise value
      let tileType: TileType;

      if (n < 0.2) {
        tileType = "water";
      } else if (n < 0.4) {
        tileType = "sand";
      } else if (n < 0.7) {
        tileType = "grass";
      } else if (n < 0.8) {
        tileType = "forest";
      } else {
        tileType = "mountain";
      }

      // Create tile
      const tile = new Tile(tileType, x, y);
      tilemap[y][x] = tile;

      // Initialize the tile - we need to await this for proper texture generation
      tile
        .init()
        .catch((err) => console.error("Error initializing tile:", err));
    }
  }

  // Add paths connecting areas
  addPaths(tilemap, width, height, seed);

  // Add special structures if requested
  if (options.structures?.includes("village")) {
    addVillage(tilemap, width, height, seed);
  }

  if (options.structures?.includes("dungeon")) {
    addDungeon(tilemap, width, height, seed);
  }

  return tilemap;
}

function addPaths(
  tilemap: Tile[][],
  width: number,
  height: number,
  seed: number
) {
  // Simplified path generation - just a straight path for demo
  const pathY = Math.floor(height / 2);

  for (let x = 0; x < width; x++) {
    if (tilemap[pathY][x].type !== "water") {
      tilemap[pathY][x].type = "path";
      tilemap[pathY][x].walkable = true;
    }
  }

  // Add a vertical path
  const pathX = Math.floor(width / 2);
  for (let y = 0; y < height; y++) {
    if (tilemap[y][pathX].type !== "water") {
      tilemap[y][pathX].type = "path";
      tilemap[y][pathX].walkable = true;
    }
  }
}

function addVillage(
  tilemap: Tile[][],
  width: number,
  height: number,
  seed: number
) {
  // Find a suitable location for a village (on grass or path)
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  // Create a small cluster of paths for the village
  for (let y = centerY - 2; y <= centerY + 2; y++) {
    for (let x = centerX - 2; x <= centerX + 2; x++) {
      if (
        y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width &&
        tilemap[y][x].type !== "water" &&
        tilemap[y][x].type !== "mountain"
      ) {
        tilemap[y][x].type = "path";
        tilemap[y][x].walkable = true;
      }
    }
  }
}

function addDungeon(
  tilemap: Tile[][],
  width: number,
  height: number,
  seed: number
) {
  // Find a suitable location for a dungeon (on mountains)
  let dungeonX = 0;
  let dungeonY = 0;
  let found = false;

  // Try to find a mountain tile
  for (let attempt = 0; attempt < 100 && !found; attempt++) {
    const x = Math.floor(noise(attempt, seed) * width);
    const y = Math.floor(noise(seed, attempt) * height);

    if (
      y >= 0 &&
      y < height &&
      x >= 0 &&
      x < width &&
      tilemap[y][x].type === "mountain"
    ) {
      dungeonX = x;
      dungeonY = y;
      found = true;

      // Mark the dungeon entrance
      tilemap[y][x].type = "path";
      tilemap[y][x].walkable = true;
    }
  }
}
