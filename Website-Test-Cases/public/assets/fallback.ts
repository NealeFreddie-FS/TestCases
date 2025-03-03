import * as PIXI from "pixi.js";

/**
 * Generate a fallback texture with a warning pattern
 * This is used when an asset fails to load
 */
export function generateFallbackTexture(app: PIXI.Application): PIXI.Texture {
  // Create graphics for the fallback texture
  const graphics = new PIXI.Graphics();

  // Draw a checkered pattern with warning colors
  const size = 32;
  const halfSize = size / 2;

  // Background
  graphics.beginFill(0x222222);
  graphics.drawRect(0, 0, size, size);
  graphics.endFill();

  // Warning pattern
  graphics.beginFill(0xffcc00);
  graphics.drawRect(0, 0, halfSize, halfSize);
  graphics.drawRect(halfSize, halfSize, halfSize, halfSize);
  graphics.endFill();

  // Add warning text (?) in the center
  const warning = new PIXI.Text("?", {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xff0000,
    align: "center",
  });
  warning.anchor.set(0.5);
  warning.position.set(size / 2, size / 2);

  // Create container to hold graphics and text
  const container = new PIXI.Container();
  container.addChild(graphics);
  container.addChild(warning);

  // Generate texture from the container
  return app.renderer.generateTexture(container);
}

/**
 * Creates a basic fallback texture without requiring PIXI
 * This can be used in a data URL format when needed
 */
export function getFallbackTextureURL(): string {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAnklEQVR42mNkGAWjYBSMglEwCkbBKBgFo2AUjAIyASO1LH7//v3/z58/47Xo9+/fjMzMzIy41WHT/P37d0Z2dnbGT58+EWXRr1+/GFlYWBhRQoiUEGBiYmKE+Z4oi/7+/cvIxsbGCPM9Pj8TC0bKAPa1tbU4Y+Hs2bOMM2bMINoCEPjy5QsjCwsLcRb9//+f8efPn0RbxMTERLFFFAOKUgAAHRtkXBGv9FUAAAAASUVORK5CYII=";
}

/**
 * Register a fallback texture with PIXI Assets
 */
export function registerFallbackTexture(app: PIXI.Application): PIXI.Texture {
  try {
    // Generate the fallback texture
    const fallbackTexture = generateFallbackTexture(app);

    // In PIXI v8, we can't directly set a default fallback texture,
    // so instead we'll add it as a named asset
    PIXI.Assets.add("fallback", fallbackTexture);

    console.log('Fallback texture registered as "fallback"');
    return fallbackTexture;
  } catch (error) {
    console.error("Failed to register fallback texture:", error);
    return PIXI.Texture.WHITE;
  }
}
