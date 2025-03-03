"use client";

import * as PIXI from "pixi.js";

export type TileType =
  | "grass"
  | "water"
  | "forest"
  | "mountain"
  | "path"
  | "sand"
  | "snow"
  | "lava";

export class Tile {
  type: TileType;
  x: number;
  y: number;
  walkable: boolean;
  sprite: PIXI.Sprite | null = null;
  debugId: string;

  constructor(type: TileType, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.debugId = `tile_${x}_${y}_${type}`;

    // Don't create the sprite here, we'll create it in init()
    this.sprite = null;

    // Set walkable property based on tile type
    this.walkable = ["grass", "path", "sand"].includes(type);
  }

  async init() {
    console.log(`Initializing tile: ${this.debugId}`);

    try {
      // Try to get the texture from the asset manager first
      let texture: PIXI.Texture;

      // Check if we can access the asset manager through the global window object
      const assetManager =
        typeof window !== "undefined" ? (window as any).gameAssetManager : null;

      if (assetManager && typeof assetManager.getTexture === "function") {
        // Get the texture from the asset manager
        const textureName = `tile_${this.type}`;
        texture = assetManager.getTexture(textureName);

        // Create sprite from texture
        this.sprite = new PIXI.Sprite(texture);
      } else {
        // Fallback to generating a colored rectangle
        this.sprite = new PIXI.Sprite();
        const graphics = this.createTileGraphics();
        this.sprite.addChild(graphics);
      }

      // Set size explicitly
      this.sprite.width = 32;
      this.sprite.height = 32;

      // Set anchor to center for easier positioning
      this.sprite.anchor.set(0.5, 0.5);

      // Make sure it's visible
      this.sprite.visible = true;
      this.sprite.alpha = 1;

      console.log(`Tile ${this.debugId} sprite created successfully`);
    } catch (error) {
      console.error(`Error creating tile ${this.debugId}:`, error);

      // Create a fallback colored rectangle if everything else fails
      this.createFallbackSprite();
    }

    return this;
  }

  // Create a simple colored rectangle for the tile
  private createTileGraphics(): PIXI.Graphics {
    const graphics = new PIXI.Graphics();

    // Fill with the tile color
    const color = this.getTileColor();
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, 32, 32);
    graphics.endFill();

    // Add noise texture for a more natural look
    this.addNoiseToGraphics(graphics, color);

    return graphics;
  }

  // Create an emergency fallback sprite if all else fails
  private createFallbackSprite() {
    try {
      this.sprite = new PIXI.Sprite();
      const graphics = new PIXI.Graphics();

      // Simple colored rectangle with an X to indicate it's a fallback
      const color = this.getTileColor();
      graphics.beginFill(color, 1);
      graphics.drawRect(0, 0, 32, 32);
      graphics.endFill();

      // Add an X to indicate it's a fallback
      graphics.lineStyle(2, 0xff0000);
      graphics.moveTo(0, 0);
      graphics.lineTo(32, 32);
      graphics.moveTo(32, 0);
      graphics.lineTo(0, 32);

      this.sprite.addChild(graphics);

      // Set standard properties
      this.sprite.width = 32;
      this.sprite.height = 32;
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.visible = true;
      this.sprite.alpha = 1;
    } catch (e) {
      console.error(
        `Failed to create even a fallback sprite for ${this.debugId}:`,
        e
      );
    }
  }

  private addNoiseToGraphics(graphics: PIXI.Graphics, baseColor: number) {
    // Add a subtle noise pattern for texture with better visual performance
    const noise = 0.08; // Noise intensity
    const gridSize = 8; // Larger grid = fewer operations = better performance

    for (let y = 0; y < 32; y += gridSize) {
      for (let x = 0; x < 32; x += gridSize) {
        // Apply random darker or lighter spots
        const variation = Math.random() * noise * 2 - noise;

        // Calculate the new color with variation (simplified)
        let colorInt = baseColor;
        if (variation > 0) {
          // Lighten
          colorInt = this.lightenColor(baseColor, variation * 100);
        } else if (variation < 0) {
          // Darken
          colorInt = this.darkenColor(baseColor, -variation * 100);
        }

        // Draw a grid-sized rectangle with the varied color
        graphics.beginFill(colorInt, 0.5);
        graphics.drawRect(x, y, gridSize, gridSize);
        graphics.endFill();
      }
    }
  }

  // Helper method to lighten a color
  private lightenColor(color: number, percent: number): number {
    // Extract RGB
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // Lighten each component
    const newR = Math.min(255, r + (255 - r) * (percent / 100));
    const newG = Math.min(255, g + (255 - g) * (percent / 100));
    const newB = Math.min(255, b + (255 - b) * (percent / 100));

    // Recombine
    return (
      (Math.round(newR) << 16) | (Math.round(newG) << 8) | Math.round(newB)
    );
  }

  // Helper method to darken a color
  private darkenColor(color: number, percent: number): number {
    // Extract RGB
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // Darken each component
    const newR = r * (1 - percent / 100);
    const newG = g * (1 - percent / 100);
    const newB = b * (1 - percent / 100);

    // Recombine
    return (
      (Math.round(newR) << 16) | (Math.round(newG) << 8) | Math.round(newB)
    );
  }

  getTileColor(): number {
    // Get tile color in hex format
    switch (this.type) {
      case "grass":
        return 0x4ca64c;
      case "water":
        return 0x4aa1f3;
      case "forest":
        return 0x267326;
      case "mountain":
        return 0x8a8a8a;
      case "path":
        return 0xc9a959;
      case "sand":
        return 0xf0e68c;
      case "snow":
        return 0xf0f0f0;
      case "lava":
        return 0x992200;
      default:
        return 0xcccccc;
    }
  }

  getTileColorString(): string {
    // Get tile color in CSS format
    switch (this.type) {
      case "grass":
        return "#4ca64c";
      case "water":
        return "#4aa1f3";
      case "forest":
        return "#267326";
      case "mountain":
        return "#8a8a8a";
      case "path":
        return "#c9a959";
      case "sand":
        return "#f0e68c";
      case "snow":
        return "#f0f0f0";
      case "lava":
        return "#992200";
      default:
        return "#cccccc";
    }
  }
}
