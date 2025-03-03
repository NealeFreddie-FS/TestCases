import * as PIXI from "pixi.js";
import { GameEngine } from "../GameEngine";

// Define a type for loading progress callback
export type ProgressCallback = (progressData: {
  progress: number;
  message: string;
}) => void;

export class AssetManager {
  private engine: GameEngine;
  private assetsLoaded: boolean = false;
  private loadedAssets: Map<string, any> = new Map();
  private totalAssets: number = 0;
  private loadedCount: number = 0;

  // Texture bundles for different asset types
  private tileTextures: Record<string, PIXI.Texture> = {};
  private uiTextures: Record<string, PIXI.Texture> = {};
  private characterTextures: Record<string, PIXI.Texture> = {};
  private effectTextures: Record<string, PIXI.Texture> = {};

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  /**
   * Preload all game assets and report progress
   */
  async preloadAssets(onProgress: ProgressCallback): Promise<boolean> {
    try {
      // Update progress with consistent object format
      const updateProgressStatus = (progress: number, message: string) => {
        onProgress({ progress, message });
      };

      updateProgressStatus(0, "Starting asset preload...");

      // Create fallback texture first
      const fallbackTexture = this.createFallbackTexture();
      console.log("Fallback texture created");

      // Define all assets to preload
      const assetManifest = this.getAssetManifest();
      this.totalAssets = assetManifest.length;

      // Create a PIXI loader for textures
      const assets = PIXI.Assets;

      // Add all assets to the queue
      for (const asset of assetManifest) {
        try {
          assets.add({ alias: asset.name, src: asset.url });
        } catch (error) {
          console.warn(
            `Could not add asset ${asset.name} to load queue:`,
            error
          );
        }
      }

      // Load everything with progress tracking
      try {
        // In PIXI v8, load method only takes bundle name or array of asset names
        const assetNames = assetManifest.map((a) => a.name);

        // Track progress manually since we can't pass a progress callback directly
        let currentProgress = 0;
        const updateProgress = () => {
          currentProgress += 1;
          const progress = currentProgress / this.totalAssets;
          const progressPercent = Math.round(progress * 100);
          this.loadedCount = currentProgress;
          updateProgressStatus(
            progressPercent,
            `Loading assets: ${this.loadedCount}/${this.totalAssets}`
          );
        };

        // Load each asset individually to track progress
        for (const assetName of assetNames) {
          try {
            const loadedAsset = await assets.load(assetName);
            // Store the loaded asset in our map
            this.loadedAssets.set(assetName, loadedAsset);
          } catch (assetError) {
            console.warn(`Failed to load asset: ${assetName}, using fallback`);
            // Use the fallback texture for this asset
            this.loadedAssets.set(assetName, fallbackTexture);
          }
          updateProgress();
        }
      } catch (error) {
        console.error("Error in PIXI asset loading:", error);
        updateProgressStatus(0, `Asset loading error: ${error}`);
        return false;
      }

      // Sort loaded assets into appropriate categories
      await this.processLoadedAssets();

      this.assetsLoaded = true;
      updateProgressStatus(100, "Assets loaded successfully!");

      return true;
    } catch (error) {
      console.error("Error loading assets:", error);
      onProgress({ progress: 0, message: `Asset loading failed: ${error}` });
      return false;
    }
  }

  /**
   * Process all loaded assets and organize them by type
   */
  private async processLoadedAssets() {
    // Process tile textures
    this.tileTextures = {
      grass: await PIXI.Assets.get("tile_grass"),
      water: await PIXI.Assets.get("tile_water"),
      path: await PIXI.Assets.get("tile_path"),
      sand: await PIXI.Assets.get("tile_sand"),
      // Add more tile textures here
    };

    // Process UI textures
    this.uiTextures = {
      button: await PIXI.Assets.get("ui_button"),
      panel: await PIXI.Assets.get("ui_panel"),
      // Add more UI textures here
    };

    // Process character textures
    this.characterTextures = {
      player: await PIXI.Assets.get("char_player"),
      // Add more character textures here
    };

    console.log("Asset processing complete");
  }

  /**
   * Define all assets to be loaded
   */
  private getAssetManifest(): Array<{ name: string; url: string }> {
    return [
      // Tile textures
      { name: "tile_grass", url: "/assets/tiles/grass.png" },
      { name: "tile_water", url: "/assets/tiles/water.png" },
      { name: "tile_path", url: "/assets/tiles/path.png" },
      { name: "tile_sand", url: "/assets/tiles/sand.png" },

      // UI textures
      {
        name: "ui_button",
        url: "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/1.png",
      },
      {
        name: "ui_panel",
        url: "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png",
      },

      // Character textures
      { name: "char_player", url: "/assets/characters/player.png" },

      // Fallback texture (used when a texture fails to load)
      { name: "fallback", url: "/assets/fallback.png" },
    ];
  }

  /**
   * Get a loaded texture by name with fallback
   */
  getTexture(name: string): PIXI.Texture {
    // Try to get the texture from our loaded assets map first
    const texture = this.loadedAssets.get(name);

    if (texture) {
      return texture as PIXI.Texture;
    }

    // If not found in our map, try to get it from PIXI Assets
    try {
      const pixiTexture = PIXI.Assets.get(name);
      if (pixiTexture) {
        // Cache it in our map for future use
        this.loadedAssets.set(name, pixiTexture);
        return pixiTexture;
      }
    } catch (error) {
      // Ignore errors from PIXI Assets
    }

    // If still not found, get the fallback texture
    const fallback = this.loadedAssets.get("fallback");
    if (fallback) {
      console.warn(`Texture not found: ${name}, using fallback`);
      return fallback as PIXI.Texture;
    }

    // Last resort: return PIXI.Texture.WHITE
    console.warn(
      `Texture not found: ${name}, fallback not available, using WHITE`
    );
    return PIXI.Texture.WHITE;
  }

  /**
   * Generate a colored rectangle texture (for tiles without images)
   */
  generateColorTexture(
    color: number,
    width: number = 32,
    height: number = 32
  ): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    // Add noise for a more natural look
    this.addNoiseToGraphics(graphics, color, width, height);

    // Generate a texture from the graphics
    return this.engine.app.renderer.generateTexture(graphics);
  }

  /**
   * Add a noise pattern to graphics for more natural look
   */
  private addNoiseToGraphics(
    graphics: PIXI.Graphics,
    baseColor: number,
    width: number,
    height: number
  ) {
    const noise = 0.08; // Noise intensity
    const gridSize = 8; // Larger grid = fewer operations = better performance

    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
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

  /**
   * Helper method to lighten a color
   */
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

  /**
   * Helper method to darken a color
   */
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

  /**
   * Check if all assets are loaded
   */
  isLoaded(): boolean {
    return this.assetsLoaded;
  }

  /**
   * Get loading progress (0-100)
   */
  getLoadingProgress(): number {
    if (this.totalAssets === 0) return 0;
    return Math.round((this.loadedCount / this.totalAssets) * 100);
  }

  /**
   * Create a fallback texture to use when assets fail to load
   */
  createFallbackTexture(): PIXI.Texture {
    try {
      // Create a warning pattern
      const graphics = new PIXI.Graphics();
      const size = 32;

      // Draw checkerboard pattern
      graphics.beginFill(0x222222);
      graphics.drawRect(0, 0, size, size);
      graphics.endFill();

      graphics.beginFill(0xff5555);
      graphics.drawRect(0, 0, size / 2, size / 2);
      graphics.drawRect(size / 2, size / 2, size / 2, size / 2);
      graphics.endFill();

      // Create texture
      const texture = this.engine.app.renderer.generateTexture(graphics);

      // Register it as a named asset - we'll use it directly rather than through Assets.add
      this.loadedAssets.set("fallback", texture);

      return texture;
    } catch (error) {
      console.error("Failed to create fallback texture:", error);
      return PIXI.Texture.WHITE;
    }
  }
}
