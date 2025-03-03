"use client";

import * as PIXI from "pixi.js";
import { GameEngine } from "./GameEngine";
import { PlayerCharacter } from "./entities/PlayerCharacter";
import { Tile, TileType } from "./entities/Tile";
import { Hour, Day, Week, Month, Year, Century } from "./managers/TimeManager";

export class World {
  engine: GameEngine;
  container: PIXI.Container;
  tiles: Tile[] = [];
  entities: any[] = [];
  npcs: any[] = [];
  interactionPoints: any[] = [];

  // Containers for time-specific elements
  timeEffectsContainer: PIXI.Container;
  skyFilter: PIXI.ColorMatrixFilter | null = null;
  lightingContainer: PIXI.Container;

  // Store ticker callbacks so we can remove them later
  tickerCallbacks = new Map<string, (delta: number) => void>();

  // Flag to track first update
  private static firstUpdateDone = false;

  // Performance optimization flags
  disableLighting: boolean = true;
  reduceParticles: boolean = true;

  // Camera culling for terrain
  cameraX: number = 400;
  cameraY: number = 400;
  cameraWidth: number = 800;
  cameraHeight: number = 600;
  cullingEnabled: boolean = true;
  cullingPadding: number = 128; // Extra padding around camera for smooth scrolling

  constructor(engine: GameEngine) {
    this.engine = engine;

    // Set optimization flags for better performance
    this.disableLighting = true;
    this.reduceParticles = true;

    // Create main container
    this.container = new PIXI.Container();
    console.log("World container created");

    // Make sure container is visible and properly positioned
    this.container.visible = true;
    this.container.alpha = 1;

    // Position the container at the center of the viewport
    this.container.position.set(0, 0);

    // Explicitly set Z position to ensure correct rendering order
    this.container.zIndex = 0;

    // Create containers for time-specific visual elements ONCE
    this.timeEffectsContainer = new PIXI.Container();
    this.lightingContainer = new PIXI.Container();

    // Add containers to the world
    this.container.addChild(this.timeEffectsContainer);
    this.container.addChild(this.lightingContainer);

    // Create a reusable skyFilter that will be modified by time changes
    this.skyFilter = new PIXI.ColorMatrixFilter();

    // Store ticker callbacks so we can remove them later
    this.tickerCallbacks = new Map();

    console.log("World constructor completed");
  }

  async init() {
    console.log("World initialization started");

    // Create the world tiles
    await this.createTiles();

    // Create interaction points
    this.createInteractionPoints();

    // Create the crossroads environment with atmosphere
    this.createCrossroads();

    // Apply atmospheric effects
    this.applyAtmosphericEffects();

    // Initialize time effects
    this.initializeTimeEffects();

    // Add debug visualization if needed
    if (process.env.NODE_ENV === "development") {
      this.createDebugVisualization();
    }

    // Log the final state of the world
    console.log("World initialization completed");
    console.log("World container children:", this.container.children.length);
    console.log("World entities:", this.entities.length);
    console.log("World container visible:", this.container.visible);
    console.log("World container alpha:", this.container.alpha);
    console.log(
      "World container position:",
      this.container.x,
      this.container.y
    );
    console.log(
      "World container scale:",
      this.container.scale.x,
      this.container.scale.y
    );

    return this;
  }

  async createTiles() {
    // Generate a simple grid of tiles
    const mapSize = 40; // Larger map to accommodate regions
    console.log(`Creating ${mapSize}x${mapSize} tile grid`);

    let tilesCreated = 0;
    let tilesAddedToContainer = 0;
    let visibleTiles = 0;

    // Define initial view area for culling during creation
    const viewLeft = this.cameraX - this.cameraWidth / 2 - this.cullingPadding;
    const viewRight = this.cameraX + this.cameraWidth / 2 + this.cullingPadding;
    const viewTop = this.cameraY - this.cameraHeight / 2 - this.cullingPadding;
    const viewBottom =
      this.cameraY + this.cameraHeight / 2 + this.cullingPadding;

    // Create base grass tiles
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        // Default to grass
        let tileType: TileType = "grass";

        // Create the tile
        const tile = new Tile(tileType, x, y);
        await tile.init();
        tilesCreated++;

        // Only add to container if sprite exists
        if (tile.sprite) {
          // Calculate world position
          const worldX = (x - mapSize / 2) * 32 + 400;
          const worldY = (y - mapSize / 2) * 32 + 400;

          // Set the sprite position
          tile.sprite.x = worldX;
          tile.sprite.y = worldY;

          // Set visibility based on camera position if culling is enabled
          const isVisible =
            !this.cullingEnabled ||
            (worldX + 32 >= viewLeft &&
              worldX - 32 <= viewRight &&
              worldY + 32 >= viewTop &&
              worldY - 32 <= viewBottom);

          tile.sprite.visible = isVisible;
          if (isVisible) visibleTiles++;

          // Add to container
          this.container.addChild(tile.sprite);
          tilesAddedToContainer++;
        }

        // Store in tiles array
        this.tiles.push(tile);
      }
    }

    console.log(
      `Created ${tilesCreated} tiles, added ${tilesAddedToContainer} tiles to container, ${visibleTiles} initially visible`
    );
    console.log(`Container now has ${this.container.children.length} children`);
  }

  createCrossroads() {
    // Create a larger, desolate crossroads at the center of the map
    const centerX = 400;
    const centerY = 400;
    const crossroadsSize = 600; // Expanded size for more atmosphere

    // Create the container for all crossroads elements
    const crossroadsContainer = new PIXI.Container();

    // Ensure the container is positioned at the same location as the tiles
    crossroadsContainer.position.set(0, 0);
    crossroadsContainer.zIndex = 1; // Above the base tiles

    // Debug
    console.log(
      "Creating crossroads at",
      centerX,
      centerY,
      "with size",
      crossroadsSize
    );

    // Create the misty ground base
    const groundBase = new PIXI.Graphics();
    groundBase.beginFill(0x111111, 0.8); // Very dark base with transparency so tiles show through
    groundBase.drawRect(
      centerX - crossroadsSize / 2,
      centerY - crossroadsSize / 2,
      crossroadsSize,
      crossroadsSize
    );
    groundBase.endFill();
    crossroadsContainer.addChild(groundBase);

    // Create paths with worn, cracked texture
    const pathGraphics = new PIXI.Graphics();

    // Horizontal path (east-west) - make it uneven and worn
    pathGraphics.beginFill(0x1a1a1a, 0.9); // Dark path with high opacity
    pathGraphics.drawRect(
      centerX - crossroadsSize / 2,
      centerY - 30,
      crossroadsSize,
      60
    );
    pathGraphics.endFill();

    // Vertical path (north-south)
    pathGraphics.beginFill(0x1a1a1a, 0.9); // Dark path
    pathGraphics.drawRect(
      centerX - 30,
      centerY - crossroadsSize / 2,
      60,
      crossroadsSize
    );
    pathGraphics.endFill();

    // Center circle - slightly raised
    pathGraphics.beginFill(0x222222, 1.0); // Slightly lighter for the center, fully opaque
    pathGraphics.drawCircle(centerX, centerY, 40);
    pathGraphics.endFill();

    crossroadsContainer.addChild(pathGraphics);

    // Add cracks and details to the paths
    this.addPathDetails(centerX, centerY, crossroadsSize, crossroadsContainer);

    // Add scattered stones and debris
    this.addDebris(centerX, centerY, crossroadsSize, crossroadsContainer);

    // Add dead trees and twisted vegetation
    this.addDeadVegetation(
      centerX,
      centerY,
      crossroadsSize,
      crossroadsContainer
    );

    // Add the central lamp post with light
    this.createLampPost(centerX, centerY, crossroadsContainer);

    // Add signposts - make them old and tilted
    this.createAgedSignpost(
      centerX,
      centerY - 100,
      "North",
      "The Castle",
      -5,
      crossroadsContainer
    );
    this.createAgedSignpost(
      centerX + 100,
      centerY,
      "East",
      "The Village",
      3,
      crossroadsContainer
    );
    this.createAgedSignpost(
      centerX,
      centerY + 100,
      "South",
      "The Sea",
      -2,
      crossroadsContainer
    );
    this.createAgedSignpost(
      centerX - 100,
      centerY,
      "West",
      "The Forest",
      7,
      crossroadsContainer
    );

    // Add to world container
    this.container.addChild(crossroadsContainer);

    console.log(
      "Crossroads created with",
      crossroadsContainer.children.length,
      "elements"
    );
  }

  // Create an aged, weathered signpost with a slight tilt for atmosphere
  createAgedSignpost(
    x: number,
    y: number,
    direction: string,
    locationName: string,
    tiltAngle: number, // Angle in degrees for that weathered look
    container: PIXI.Container
  ) {
    const signpost = new PIXI.Container();

    // Create the post - make it look old and weathered
    const post = new PIXI.Graphics();
    post.fill({ color: 0x473225 }); // Darker, aged wood color
    post.rect(-3, 0, 6, 40); // Thinner post

    // Add wood grain details
    post.fill({ color: 0x3d2a1e, alpha: 0.7 });
    post.rect(-3, 5, 6, 2);
    post.rect(-3, 15, 6, 1);
    post.rect(-3, 25, 6, 2);
    post.rect(-3, 35, 6, 1);

    // Create the sign board - weathered and damaged
    const sign = new PIXI.Graphics();
    sign.fill({ color: 0x473225 }); // Dark wood

    // Main sign with uneven edges for wear
    sign.beginPath();
    sign.moveTo(-25, -18);
    sign.lineTo(25, -20);
    sign.lineTo(26, 0);
    sign.lineTo(24, 2);
    sign.lineTo(-26, 0);
    sign.lineTo(-25, -18);
    sign.closePath();
    sign.fill();

    sign.y = -38;

    // Add text with a slight shadow for better readability in the dark
    const directionText = new PIXI.Text(direction, {
      fontFamily: "Arial",
      fontSize: 10,
      fill: 0xc0c0c0, // Faded silver color
      align: "center",
      dropShadow: {
        alpha: 0.5,
        angle: Math.PI / 4,
        blur: 2,
        color: 0x000000,
        distance: 1,
      },
    });
    directionText.anchor.set(0.5);
    directionText.y = -50;

    const locationText = new PIXI.Text(locationName, {
      fontFamily: "Arial",
      fontSize: 8,
      fill: 0xaaaaaa, // Faded text
      align: "center",
      dropShadow: {
        alpha: 0.5,
        angle: Math.PI / 4,
        blur: 2,
        color: 0x000000,
        distance: 1,
      },
    });
    locationText.anchor.set(0.5);
    locationText.y = -40;

    // Add all elements to the signpost container
    signpost.addChild(post);
    signpost.addChild(sign);
    signpost.addChild(directionText);
    signpost.addChild(locationText);

    // Position the signpost and apply tilt for that eerie, abandoned look
    signpost.position.set(x, y);
    signpost.angle = tiltAngle;

    // Add to container
    container.addChild(signpost);
  }

  // Add weathered details to the paths
  addPathDetails(
    centerX: number,
    centerY: number,
    size: number,
    container: PIXI.Container
  ) {
    const pathDetails = new PIXI.Graphics();

    // Add cracks in the paths - random patterns
    pathDetails.beginFill(0x0a0a0a, 0.7); // Dark cracks

    // Horizontal path cracks
    for (let i = 0; i < 20; i++) {
      const crackX = centerX - size / 2 + Math.random() * size;
      const crackY = centerY - 20 + Math.random() * 40;
      const crackLength = 5 + Math.random() * 20;
      const crackWidth = 1 + Math.random() * 2;

      pathDetails.drawRect(crackX, crackY, crackLength, crackWidth);
    }

    // Vertical path cracks
    for (let i = 0; i < 20; i++) {
      const crackX = centerX - 20 + Math.random() * 40;
      const crackY = centerY - size / 2 + Math.random() * size;
      const crackLength = 1 + Math.random() * 2;
      const crackWidth = 5 + Math.random() * 20;

      pathDetails.drawRect(crackX, crackY, crackLength, crackWidth);
    }

    pathDetails.endFill();
    container.addChild(pathDetails);
  }

  // Add scattered debris to enhance the desolate atmosphere
  addDebris(
    centerX: number,
    centerY: number,
    size: number,
    container: PIXI.Container
  ) {
    const debris = new PIXI.Graphics();

    // Add small stones and debris scattered around
    for (let i = 0; i < 50; i++) {
      const x = centerX - size / 2 + Math.random() * size;
      const y = centerY - size / 2 + Math.random() * size;

      // Don't place debris directly on the center of paths
      if (
        (Math.abs(x - centerX) < 20 && Math.abs(y - centerY) < 100) ||
        (Math.abs(y - centerY) < 20 && Math.abs(x - centerX) < 100)
      ) {
        continue;
      }

      // Random stone/debris
      const stoneSize = 1 + Math.random() * 3;
      const stoneColor = 0x333333 + Math.floor(Math.random() * 0x222222);

      debris.beginFill(stoneColor);
      if (Math.random() > 0.5) {
        // Circle stone
        debris.drawCircle(x, y, stoneSize);
      } else {
        // Angular rock
        debris.beginPath();
        debris.moveTo(x, y - stoneSize);
        debris.lineTo(x + stoneSize, y);
        debris.lineTo(x, y + stoneSize);
        debris.lineTo(x - stoneSize, y);
        debris.closePath();
      }
      debris.endFill();
    }

    container.addChild(debris);
  }

  // Add dead trees and twisted vegetation for atmosphere
  addDeadVegetation(
    centerX: number,
    centerY: number,
    size: number,
    container: PIXI.Container
  ) {
    // Add some dead trees around the crossroads
    for (let i = 0; i < 8; i++) {
      // Position trees at the corners and midpoints of the crossroads area
      let treeX, treeY;

      // Calculate positions around the perimeter
      const distance = size * 0.4;
      const angle = (i * Math.PI) / 4 + (Math.random() * 0.2 - 0.1);

      treeX = centerX + Math.cos(angle) * distance;
      treeY = centerY + Math.sin(angle) * distance;

      // Don't place trees directly on paths
      if (
        (Math.abs(treeX - centerX) < 50 && Math.abs(treeY - centerY) < 150) ||
        (Math.abs(treeY - centerY) < 50 && Math.abs(treeX - centerX) < 150)
      ) {
        continue;
      }

      this.createDeadTree(treeX, treeY, container);
    }

    // Add some sparse, dead grass patches
    for (let i = 0; i < 30; i++) {
      const grassX = centerX - size / 2 + Math.random() * size;
      const grassY = centerY - size / 2 + Math.random() * size;

      // Don't place grass directly on paths
      if (
        (Math.abs(grassX - centerX) < 30 && Math.abs(grassY - centerY) < 120) ||
        (Math.abs(grassY - centerY) < 30 && Math.abs(grassX - centerX) < 120)
      ) {
        continue;
      }

      this.createDeadGrass(grassX, grassY, container);
    }
  }

  // Create a dead, twisted tree
  createDeadTree(x: number, y: number, container: PIXI.Container) {
    const treeGraphics = new PIXI.Graphics();

    // Draw twisted trunk
    treeGraphics.fill({ color: 0x302010 }); // Very dark brown

    // Main trunk
    treeGraphics.beginPath();
    treeGraphics.moveTo(-5, 0);
    treeGraphics.lineTo(5, 0);
    treeGraphics.lineTo(3, -30);
    treeGraphics.lineTo(-2, -30);
    treeGraphics.closePath();
    treeGraphics.fill();

    // Branches - twisted and sparse
    treeGraphics.fill({ color: 0x251a0a });

    // Branch 1
    treeGraphics.beginPath();
    treeGraphics.moveTo(0, -25);
    treeGraphics.lineTo(12, -35);
    treeGraphics.lineTo(10, -37);
    treeGraphics.lineTo(-1, -27);
    treeGraphics.closePath();
    treeGraphics.fill();

    // Branch 2
    treeGraphics.beginPath();
    treeGraphics.moveTo(0, -20);
    treeGraphics.lineTo(-15, -32);
    treeGraphics.lineTo(-13, -34);
    treeGraphics.lineTo(1, -22);
    treeGraphics.closePath();
    treeGraphics.fill();

    // Branch 3
    treeGraphics.beginPath();
    treeGraphics.moveTo(2, -15);
    treeGraphics.lineTo(8, -18);
    treeGraphics.lineTo(6, -20);
    treeGraphics.lineTo(1, -17);
    treeGraphics.closePath();
    treeGraphics.fill();

    // Position the tree
    treeGraphics.position.set(x, y);
    // Add a slight random rotation for variety
    treeGraphics.rotation = (Math.random() - 0.5) * 0.2;

    container.addChild(treeGraphics);
  }

  // Create patches of dead grass
  createDeadGrass(x: number, y: number, container: PIXI.Container) {
    const grassGraphics = new PIXI.Graphics();

    // Create several blades of dead grass
    const bladesCount = 3 + Math.floor(Math.random() * 5);
    const color = 0x5a4a30; // Brownish dead grass color

    grassGraphics.fill({ color });

    for (let i = 0; i < bladesCount; i++) {
      const angle = Math.random() * Math.PI;
      const length = 4 + Math.random() * 3;

      const x1 = Math.cos(angle) * length;
      const y1 = Math.sin(angle) * length;

      grassGraphics.beginPath();
      grassGraphics.moveTo(0, 0);
      grassGraphics.lineTo(x1, -y1);
      grassGraphics.lineTo(x1 + 1, -y1);
      grassGraphics.lineTo(1, 0);
      grassGraphics.closePath();
      grassGraphics.fill();
    }

    grassGraphics.position.set(x, y);
    container.addChild(grassGraphics);
  }

  // Create a lamp post that illuminates the crossroads
  createLampPost(x: number, y: number, container: PIXI.Container) {
    const lampContainer = new PIXI.Container();

    // Create the post - more ornate and detailed
    const post = new PIXI.Graphics();
    post.fill({ color: 0x202020 }); // Dark metal color
    post.rect(-3, -80, 6, 80); // Tall lamp post

    // Add decorative elements to the post
    post.fill({ color: 0x252525 });
    post.rect(-4, -75, 8, 3); // Upper band
    post.rect(-4, -40, 8, 3); // Middle band
    post.rect(-4, -5, 8, 3); // Lower band

    // Base of the post - more detailed
    post.fill({ color: 0x303030 });
    post.circle(0, 0, 6);
    post.fill({ color: 0x252525 });
    post.circle(0, 0, 9);
    post.fill({ color: 0x303030 });
    post.circle(0, 0, 12);

    // Create the lamp fixture at the top - more ornate
    const lampFixture = new PIXI.Graphics();
    lampFixture.fill({ color: 0x303030 }); // Dark metal
    lampFixture.circle(0, -80, 5); // Base attachment

    // Decorative elements on fixture
    lampFixture.fill({ color: 0x252525 });
    lampFixture.rect(-9, -85, 18, 3);

    // Lamp housing with more detail
    lampFixture.fill({ color: 0x202020 });
    lampFixture.rect(-9, -98, 18, 15);

    // Decorative top
    lampFixture.fill({ color: 0x252525 });
    lampFixture.rect(-11, -100, 22, 3);

    // Add small spikes on top
    lampFixture.fill({ color: 0x202020 });
    lampFixture.moveTo(-8, -100);
    lampFixture.lineTo(-6, -105);
    lampFixture.lineTo(-4, -100);
    lampFixture.fill();

    lampFixture.moveTo(0, -100);
    lampFixture.lineTo(0, -107);
    lampFixture.lineTo(2, -100);
    lampFixture.fill();

    lampFixture.moveTo(6, -100);
    lampFixture.lineTo(8, -105);
    lampFixture.lineTo(10, -100);
    lampFixture.fill();

    // Lamp glass - brighter glow
    lampFixture.fill({ color: 0xffffa0, alpha: 0.5 }); // Brighter yellowish glow
    lampFixture.rect(-8, -97, 16, 13);

    // Create enhanced glow effect for the lamp
    const glow = new PIXI.Graphics();
    glow.fill({ color: 0xffffa0, alpha: 0.2 });
    glow.circle(0, -88, 100); // Larger outer glow

    // Stronger mid glow
    glow.fill({ color: 0xffffa0, alpha: 0.3 });
    glow.circle(0, -88, 60);

    // Strong inner glow
    glow.fill({ color: 0xffffa0, alpha: 0.4 });
    glow.circle(0, -88, 30);

    // Brightest inner glow
    glow.fill({ color: 0xffffa0, alpha: 0.5 });
    glow.circle(0, -88, 15);

    // Add all elements to the lamp container
    lampContainer.addChild(glow);
    lampContainer.addChild(post);
    lampContainer.addChild(lampFixture);

    // Position the lamp
    lampContainer.position.set(x, y);

    // Create a soft light filter effect if lighting is enabled
    if (!this.disableLighting) {
      this.createEnhancedLightFilter(lampContainer, x, y - 88, 200);
    }

    // Add the lamp to the container
    container.addChild(lampContainer);

    // Create dynamic light flicker effect - only if lighting is not disabled
    if (!this.disableLighting) {
      const flickerCallback = (delta: number) => {
        // More variable flicker
        const flickerIntensity = 0.92 + Math.random() * 0.16;
        glow.scale.set(flickerIntensity);

        // Occasional bigger flickers
        if (Math.random() < 0.01) {
          // Quick dramatic flicker
          glow.scale.set(0.7 + Math.random() * 0.6);

          // Schedule return to normal
          setTimeout(() => {
            glow.scale.set(0.95 + Math.random() * 0.1);
          }, 100 + Math.random() * 150);
        }
      };

      this.engine.app.ticker.add(flickerCallback);
      this.tickerCallbacks.set(`lampFlicker_${x}_${y}`, flickerCallback);
    }
  }

  // Create an enhanced light filter effect
  createEnhancedLightFilter(
    target: PIXI.Container,
    x: number,
    y: number,
    radius: number
  ) {
    try {
      // Only apply if we have access to filters
      if (!this.engine.app.renderer || !PIXI.Filter) {
        return;
      }

      // Create a radial gradient for the light
      const lightTexture = this.createEnhancedLightTexture(radius);
      const lightSprite = new PIXI.Sprite(lightTexture);
      lightSprite.anchor.set(0.5);
      lightSprite.position.set(0, -88); // Position at the light source
      // Use a simple string blend mode to avoid PixiJS version issues
      lightSprite.blendMode = "screen" as any;

      // Add a second, softer light layer
      const softLightTexture = this.createEnhancedLightTexture(radius * 1.5);
      const softLightSprite = new PIXI.Sprite(softLightTexture);
      softLightSprite.anchor.set(0.5);
      softLightSprite.position.set(0, -88);
      softLightSprite.blendMode = "screen" as any;
      softLightSprite.alpha = 0.3;

      target.addChild(softLightSprite);
      target.addChild(lightSprite);

      // Create light rays for dramatic effect
      this.createLightRays(target, 0, -88, radius);
    } catch (e) {
      console.warn("Could not create enhanced light filter", e);
    }
  }

  // Create light rays for dramatic effect - optimized version
  createLightRays(
    target: PIXI.Container,
    x: number,
    y: number,
    radius: number
  ) {
    // Skip if lighting effects are disabled
    if (this.disableLighting) {
      return;
    }

    const rays = new PIXI.Container();
    // Reduce ray count for better performance
    const rayCount = this.reduceParticles ? 4 : 6; // Further reduced from 6

    // Define the type for ray data to fix implicit any[] error
    interface RayData {
      ray: PIXI.Graphics;
      angle: number;
      speed: number;
      length: number;
    }

    const rayData: RayData[] = [];

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const ray = new PIXI.Graphics();

      ray.fill({ color: 0xffffa0, alpha: 0.1 });

      // Create a triangular ray
      ray.beginPath();
      ray.moveTo(0, 0);
      ray.lineTo(
        Math.cos(angle - 0.1) * radius,
        Math.sin(angle - 0.1) * radius
      );
      ray.lineTo(
        Math.cos(angle + 0.1) * radius,
        Math.sin(angle + 0.1) * radius
      );
      ray.closePath();
      ray.fill();

      rays.addChild(ray);

      // Store ray data for animation in a separate array instead of on the ray object
      rayData.push({
        ray,
        angle,
        speed: 0.001 + Math.random() * 0.001, // Reduced max speed
        length: 0.7 + Math.random() * 0.3,
      });
    }

    rays.position.set(x, y);
    rays.blendMode = "screen" as any;
    target.addChild(rays);

    // Animate the rays with a single function
    const animateRays = (delta: number) => {
      for (let i = 0; i < rayCount; i++) {
        const data = rayData[i];
        const ray = data.ray;

        // Rotate the rays slowly - use delta for frame-independence
        data.angle += data.speed * delta;

        // Redraw the ray at the new angle
        const angle = data.angle;
        const length = data.length * radius;

        ray.clear();
        ray.fill({ color: 0xffffa0, alpha: 0.1 });
        ray.beginPath();
        ray.moveTo(0, 0);
        ray.lineTo(
          Math.cos(angle - 0.1) * length,
          Math.sin(angle - 0.1) * length
        );
        ray.lineTo(
          Math.cos(angle + 0.1) * length,
          Math.sin(angle + 0.1) * length
        );
        ray.closePath();
        ray.fill();
      }
    };

    // Add animation to ticker and store for cleanup
    this.engine.app.ticker.add(animateRays);
    this.tickerCallbacks.set(`lightRays_${x}_${y}`, animateRays);
  }

  // Create a texture for the enhanced light effect - cached for performance
  createEnhancedLightTexture(radius: number): PIXI.Texture {
    // Check if we already have a texture of this size cached
    const cacheKey = `lightTexture_${radius}`;
    const cachedTexture = (this as any)[cacheKey];

    if (cachedTexture) {
      return cachedTexture;
    }

    // Create a new texture if not cached
    const graphics = new PIXI.Graphics();
    // Reduce gradient steps for better performance
    const gradientSteps = 8; // Reduced from 12

    // Create a radial gradient from the center
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const alpha = 0.5 * (1 - ratio);
      const color = 0xffffa0; // Yellowish light

      graphics.fill({ color, alpha });
      graphics.circle(radius, radius, radius * (1 - ratio));
    }

    // Generate texture
    const texture = this.engine.app.renderer.generateTexture(graphics);

    // Cache the texture for reuse
    (this as any)[cacheKey] = texture;

    return texture;
  }

  // Apply atmospheric fog and lighting effects to the entire scene
  applyAtmosphericEffects() {
    // Skip all lighting effects if disabled
    if (this.disableLighting) {
      console.log("Lighting effects disabled for performance optimization");
      return;
    }

    try {
      // Only apply if we have access to the renderer and filters
      if (!this.engine.app.renderer || !PIXI.Filter) {
        return;
      }

      // Create a fog overlay for the entire scene - thicker, darker fog
      const fogOverlay = new PIXI.Graphics();
      fogOverlay.fill({ color: 0x000033, alpha: 0.6 }); // Increased opacity for darker fog

      // Cover the entire visible area with some margin
      const width = this.engine.app.screen.width;
      const height = this.engine.app.screen.height;
      fogOverlay.rect(-width, -height, width * 3, height * 3);

      // Add the fog as a separate layer above everything
      const fogContainer = new PIXI.Container();
      fogContainer.addChild(fogOverlay);
      fogContainer.zIndex = 1000; // Place above other elements
      this.container.addChild(fogContainer);

      // Create dynamic fog particles for a more dynamic effect - increased numbers
      this.createFogParticles();

      // Create secondary swirling fog effects for added atmosphere
      this.createSwirlingFogEffects();

      // Apply color adjustment to the entire scene for a cooler, night-time feel
      this.applyColorAdjustment();

      // Add occasional ambient sounds if available
      this.setupAmbientSounds();
    } catch (e) {
      console.warn("Could not apply atmospheric effects", e);
    }
  }

  // Create dynamic fog particles - enhanced with more particles and variation
  createFogParticles() {
    // Skip if lighting is disabled
    if (this.disableLighting) {
      return;
    }

    // Reduce particle count for better performance
    const particleCount = this.reduceParticles ? 20 : 40;
    const particleContainer = new PIXI.Container();
    const particles: PIXI.Graphics[] = [];

    // Create individual fog particles
    for (let i = 0; i < particleCount; i++) {
      const size = 50 + Math.random() * 150; // Slightly reduced max size
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const alpha = 0.05 + Math.random() * 0.15; // Slightly reduced max opacity

      // Create fog particle
      const particle = new PIXI.Graphics();
      particle.fill({ color: 0xaaaacc, alpha });

      // Use simpler circles for all particles to improve performance
      particle.circle(0, 0, size);

      particle.position.set(x, y);

      particleContainer.addChild(particle);
      particles.push(particle);

      // Store velocity for animation - more varied speeds
      (particle as any).vx = (Math.random() - 0.5) * 0.2; // Reduced speed
      (particle as any).vy = (Math.random() - 0.5) * 0.1;
    }

    // Add particle container to the scene
    particleContainer.zIndex = 999; // Just below the fog overlay
    this.container.addChild(particleContainer);

    // Create a single animation function for all particles
    const animateFog = (delta: number) => {
      for (const particle of particles) {
        // Move particles
        particle.x += (particle as any).vx * delta;
        particle.y += (particle as any).vy * delta;

        // Wrap around the screen
        const pad = 300;
        if (particle.x < -1000 - pad) particle.x = 1000 + pad;
        if (particle.x > 1000 + pad) particle.x = -1000 - pad;
        if (particle.y < -1000 - pad) particle.y = 1000 + pad;
        if (particle.y > 1000 + pad) particle.y = -1000 - pad;
      }
    };

    // Add the animation to ticker and store for cleanup
    this.engine.app.ticker.add(animateFog);
    this.tickerCallbacks.set("fogParticles", animateFog);
  }

  // Create swirling fog effects for added atmosphere
  createSwirlingFogEffects() {
    // Skip if lighting is disabled
    if (this.disableLighting) {
      return;
    }

    // Create fewer fog patches for better performance (5 instead of ~10)
    const fogPatchLocations = [
      { x: 400, y: 400, radius: 100 }, // At the crossroads center
      { x: 300, y: 300, radius: 80 }, // Northwest
      { x: 500, y: 300, radius: 70 }, // Northeast
      { x: 300, y: 500, radius: 90 }, // Southwest
      { x: 500, y: 500, radius: 75 }, // Southeast
    ];

    // Create localized swirling fog patches in key areas
    const createFogPatch = (x: number, y: number, radius: number) => {
      const swirl = new PIXI.Container();
      // Reduced particle count per swirl (from 8-15 to 4-8)
      const particleCount = 4 + Math.floor(Math.random() * 4);
      const particles: PIXI.Graphics[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = radius * 0.5 * Math.random();
        const size = 20 + Math.random() * 30; // Reduced max size

        const particle = new PIXI.Graphics();
        particle.fill({ color: 0xccccdd, alpha: 0.15 });
        particle.circle(0, 0, size);
        particle.x = Math.cos(angle) * distance;
        particle.y = Math.sin(angle) * distance;

        swirl.addChild(particle);
        particles.push(particle);

        // Store animation parameters
        (particle as any).angle = angle;
        (particle as any).radius = distance;
        (particle as any).angleSpeed = 0.002 + Math.random() * 0.003; // Reduced max speed
        (particle as any).pulseSpeed = 0.03 + Math.random() * 0.03; // Reduced pulse speed
        (particle as any).pulseTime = Math.random() * Math.PI * 2;
      }

      swirl.position.set(x, y);
      swirl.zIndex = 998;
      this.container.addChild(swirl);

      // Create single animation function for all particles in this swirl
      const animateSwirl = (delta: number) => {
        for (const particle of particles) {
          // Update angle for circular motion - apply delta for frame-rate independence
          (particle as any).angle += (particle as any).angleSpeed * delta;

          // Update pulse time for breathing effect
          (particle as any).pulseTime += (particle as any).pulseSpeed * delta;

          // Calculate position on the circle
          particle.x =
            Math.cos((particle as any).angle) * (particle as any).radius;
          particle.y =
            Math.sin((particle as any).angle) * (particle as any).radius;

          // Add pulsing size effect
          const pulse = Math.sin((particle as any).pulseTime) * 0.2 + 0.8;
          particle.scale.set(pulse);
        }
      };

      // Add animation to ticker and store for cleanup
      this.engine.app.ticker.add(animateSwirl);
      this.tickerCallbacks.set(`swirl_${x}_${y}`, animateSwirl);
    };

    // Create fog patches at key locations
    for (const location of fogPatchLocations) {
      createFogPatch(location.x, location.y, location.radius);
    }
  }

  // Apply color adjustment to create a night-time atmosphere - enhanced for more dramatic effect
  applyColorAdjustment() {
    try {
      // Try to create a filter for color adjustment if supported
      if (PIXI.ColorMatrixFilter) {
        const colorMatrix = new PIXI.ColorMatrixFilter();

        // Adjust to create a cooler, darker night look
        colorMatrix.brightness(0.7, false); // Darker than before
        colorMatrix.contrast(1.2, false); // More contrast for dramatic effect

        // Add stronger blue tint for eerie night
        colorMatrix.tint(0x0a1a3a, false); // Bluer tint

        // Apply the filter to the world container
        if (this.container.filters) {
          // If filters already exist, add the new one - using type assertion for type safety
          const existingFilters = this.container.filters as PIXI.Filter[];
          this.container.filters = [...existingFilters, colorMatrix];
        } else {
          // Otherwise, create a new array
          this.container.filters = [colorMatrix];
        }
      }
    } catch (e) {
      console.warn("Could not apply color adjustment", e);
    }
  }

  // Add ambient sound effects if supported
  setupAmbientSounds() {
    // This would normally connect to an audio system
    // For now, we'll just log that it would play sounds
    console.log(
      "Atmospheric sounds would play: wind howling, distant owl hoots"
    );
  }

  createInteractionPoints() {
    // Create interaction points at specific locations
    const interactionPoints = [
      {
        type: "npc",
        id: "villager1",
        x: 300,
        y: 300,
        data: {
          type: "npc",
          id: "villager1",
          name: "Village Elder",
          dialog: [
            "Welcome to our village, traveler.",
            "Beware of the monsters in the forest.",
            "You might find useful items in chests around the area.",
          ],
        },
      },
      {
        type: "shop",
        id: "blacksmith",
        x: 500,
        y: 200,
        data: {
          type: "shop",
          id: "blacksmith",
          name: "Blacksmith",
          items: [
            { id: "sword", name: "Iron Sword", price: 100 },
            { id: "shield", name: "Wooden Shield", price: 50 },
          ],
        },
      },
      {
        type: "quest",
        id: "quest1",
        x: 700,
        y: 400,
        data: {
          type: "quest",
          id: "quest1",
          name: "Forest Cleansing",
          description: "Clear the forest of monsters",
          reward: { gold: 200, xp: 300 },
        },
      },
      {
        type: "chest",
        id: "chest1",
        x: 900,
        y: 300,
        data: {
          type: "chest",
          id: "chest1",
          contents: { item: "health_potion", quantity: 2 },
        },
      },
      {
        type: "item",
        id: "item1",
        x: 1100,
        y: 500,
        data: {
          type: "item",
          id: "mana_potion",
          name: "Mana Potion",
          effect: { mana: 30 },
        },
      },
    ];

    // Create visual indicators for each interaction point
    for (const point of interactionPoints) {
      const graphics = new PIXI.Graphics();

      if (point.type === "npc") {
        // NPC indicator
        graphics.fill({ color: 0xffcc00, alpha: 0.8 });
        graphics.circle(0, 0, 20);
      } else if (point.type === "shop") {
        // Shop indicator
        graphics.fill({ color: 0x00ccff, alpha: 0.8 });
        graphics.rect(-15, -15, 30, 30);
      } else if (point.type === "quest") {
        // Quest indicator
        graphics.fill({ color: 0xff6600, alpha: 0.8 });
        graphics.star(0, 0, 5, 20, 10);
      } else if (point.type === "item") {
        // Item indicator
        graphics.fill({ color: 0x00ff00, alpha: 0.8 });
        graphics.circle(0, 0, 15);
      }
      // Create texture from graphics - use engine.app instead of this.app
      const texture = this.engine.app.renderer.generateTexture(graphics);
      const sprite = new PIXI.Sprite(texture);
      sprite.x = point.x;
      sprite.y = point.y;
      sprite.anchor.set(0.5);

      // Store data and sprite in the interaction point
      const interactionPoint = {
        ...point,
        position: { x: point.x, y: point.y },
        sprite,
      };

      // Add to world
      this.container.addChild(sprite);
      this.interactionPoints.push(interactionPoint);
    }
  }

  addEntity(entity: any) {
    if (!entity.sprite) {
      console.error("Cannot add entity without sprite to world:", entity);
      return;
    }

    try {
      // Ensure entity sprite is properly set up
      entity.sprite.visible = true;
      entity.sprite.alpha = 1;

      // Make sure it has a reasonable size if none is set
      if (!entity.sprite.width || !entity.sprite.height) {
        entity.sprite.width = entity.sprite.width || 32;
        entity.sprite.height = entity.sprite.height || 32;
      }

      // Add to container
      this.container.addChild(entity.sprite);

      // Set initial depth sorting if not already set
      entity.sprite.zIndex = entity.sprite.zIndex || 10; // Default higher than tiles

      // Register in the entities array
      this.entities.push(entity);

      console.log(
        `Added entity to world: ${entity.id || "unnamed entity"} at position ${
          entity.sprite.x
        }, ${entity.sprite.y}`
      );
    } catch (error) {
      console.error("Error adding entity to world:", error);
    }
  }

  removeEntity(entity: any) {
    if (!entity.sprite) return;

    // Remove from container
    this.container.removeChild(entity.sprite);

    // Remove from entities array
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  checkInteractions(player: PlayerCharacter) {
    if (!player || !this.interactionPoints) return;

    const playerX = player.sprite.x;
    const playerY = player.sprite.y;

    // Check if player is near any interaction points
    for (const point of this.interactionPoints) {
      const distance = Math.sqrt(
        Math.pow(playerX - point.x, 2) + Math.pow(playerY - point.y, 2)
      );

      // Check for active sign prompt
      if (distance < 60) {
        // When player is within range
        if (!point.isActive) {
          point.isActive = true;
          this.handleInteraction(point);
        }
      } else if (point.isActive) {
        point.isActive = false;
      }
    }
  }

  handleInteraction(interactionPoint: any) {
    if (!interactionPoint) return;

    // Handle different types of interactions
    switch (interactionPoint.type) {
      case "npc":
        // Start dialog with NPC
        if (this.engine.dialogManager) {
          this.engine.dialogManager.startDialog(interactionPoint.id);
        }
        break;

      case "shop":
        // Open shop
        if (this.engine.shopManager) {
          this.engine.shopManager.openShop();
        }
        break;

      case "quest":
        // Interact with quest giver
        if (this.engine.questManager) {
          this.engine.questManager.interactWithNPC(interactionPoint.id);
        }
        break;

      case "item":
        // Pick up item
        if (this.engine.inventoryManager) {
          this.engine.inventoryManager.addItem(interactionPoint.id);

          // Remove the item from the world
          this.container.removeChild(interactionPoint.sprite);
          const index = this.interactionPoints.indexOf(interactionPoint);
          if (index !== -1) {
            this.interactionPoints.splice(index, 1);
          }
        }
        break;
    }
  }

  update(delta: number) {
    try {
      // Log the world state in the first update
      if (!World.firstUpdateDone) {
        console.log("First world update call");
        console.log("World container visible:", this.container.visible);
        console.log("World container alpha:", this.container.alpha);
        console.log(
          "World container children:",
          this.container.children.length
        );
        console.log("App renderer:", this.engine.app.renderer);
        console.log("Lighting disabled:", this.disableLighting);
        console.log("Particles reduced:", this.reduceParticles);
        console.log("Culling enabled:", this.cullingEnabled);
        World.firstUpdateDone = true;
      }

      // Update camera position based on player or viewport position
      this.updateCameraPosition();

      // Perform camera culling if enabled
      if (this.cullingEnabled) {
        this.updateTileVisibility();
      }

      // Update existing entities - optimize by reducing updates for far-away entities
      for (const entity of this.entities) {
        // Only update entities if they have an update method
        if (entity.update) {
          entity.update(delta);
        }
      }
    } catch (error) {
      console.error("Error in world update:", error);
    }
  }

  // Update camera position based on player position
  private updateCameraPosition() {
    // Get the player position if available
    if (this.engine.player && this.engine.player.sprite) {
      this.cameraX = this.engine.player.sprite.x;
      this.cameraY = this.engine.player.sprite.y;
    }

    // Get screen dimensions from the renderer if available
    if (this.engine.app && this.engine.app.renderer) {
      this.cameraWidth = this.engine.app.renderer.width;
      this.cameraHeight = this.engine.app.renderer.height;
    }
  }

  // Update tile visibility based on camera culling
  private updateTileVisibility() {
    // Define the visible area with padding
    const viewLeft = this.cameraX - this.cameraWidth / 2 - this.cullingPadding;
    const viewRight = this.cameraX + this.cameraWidth / 2 + this.cullingPadding;
    const viewTop = this.cameraY - this.cameraHeight / 2 - this.cullingPadding;
    const viewBottom =
      this.cameraY + this.cameraHeight / 2 + this.cullingPadding;

    // Cull tiles that are outside the view
    for (const tile of this.tiles) {
      if (!tile.sprite) continue;

      // Check if the tile is within the view
      const isVisible =
        tile.sprite.x + 32 >= viewLeft &&
        tile.sprite.x - 32 <= viewRight &&
        tile.sprite.y + 32 >= viewTop &&
        tile.sprite.y - 32 <= viewBottom;

      // Set visibility only if it's changing to avoid unnecessary updates
      if (tile.sprite.visible !== isVisible) {
        tile.sprite.visible = isVisible;
      }
    }
  }

  get app() {
    return this.engine.app;
  }

  // Add method to get all interactable objects in the world
  getInteractableObjects() {
    // Return all objects that can be interacted with (chests, NPCs, etc.)
    return [
      ...this.interactionPoints,
      ...this.npcs.filter((npc) => npc.canInteract),
    ];
  }

  // Add method to get all enemies in the world
  getEnemies() {
    // Return all enemy entities
    const enemies = this.entities.filter(
      (entity) =>
        entity.id &&
        entity.id.includes("enemy") &&
        typeof entity.takeDamage === "function"
    );

    console.log(
      `Found ${enemies.length} enemies in the world. Entity count: ${this.entities.length}`
    );

    return enemies;
  }

  // Add method to handle chest opening
  openChest(chestId: string) {
    const chest = this.interactionPoints.find(
      (ip) => ip.data && ip.data.type === "chest" && ip.data.id === chestId
    );

    if (chest) {
      console.log(`Chest ${chestId} opened!`);
      // Add chest opening visual/logic here

      // Remove chest from interactable objects
      const index = this.interactionPoints.indexOf(chest);
      if (index !== -1) {
        this.interactionPoints.splice(index, 1);
      }
    }
  }

  // Helper to create a test enemy for debugging
  createTestEnemy() {
    try {
      // Import the Enemy class and related types
      import("./entities/Enemy")
        .then(({ Enemy, EnemyType, MovementPattern }) => {
          // Create a test enemy
          const enemy = new Enemy(
            "enemy_test",
            EnemyType.OCTOROK,
            400,
            400,
            2,
            0.5,
            MovementPattern.RANDOM
          );

          // Add to the world
          this.addEntity(enemy);

          console.log("Test enemy created and added to world");
        })
        .catch((error) => {
          console.error("Failed to import Enemy:", error);
        });
    } catch (error) {
      console.error("Error creating test enemy:", error);
    }
  }

  // Initialize time-based visual effects
  initializeTimeEffects() {
    try {
      // We don't need to create containers again as they're created in constructor
      // Just apply the skyFilter to the container if not already applied
      if (this.skyFilter && this.container) {
        // Check if skyFilter is already applied
        const hasFilter = this.container.filters
          ? Array.isArray(this.container.filters)
            ? this.container.filters.includes(this.skyFilter)
            : this.container.filters === this.skyFilter
          : false;

        if (!hasFilter) {
          // Add skyFilter to container.filters safely
          const currentFilters = this.container.filters || [];
          this.container.filters = Array.isArray(currentFilters)
            ? [...currentFilters, this.skyFilter]
            : [this.skyFilter];
        }
      }

      // Set up time change listener
      if (this.engine.timeManager) {
        this.engine.timeManager.onTimeChange((timeState) => {
          this.applyTimeEffects(timeState.hour);
        });

        // Apply initial time effects
        this.applyTimeEffects(this.engine.timeManager.getTimeState().hour);
      } else {
        console.warn(
          "TimeManager not available, time effects will not be applied"
        );
      }
    } catch (error) {
      console.error("Error initializing time effects:", error);
    }
  }

  // Apply visual effects based on time of day
  applyTimeEffects(hour: Hour) {
    console.log(`Applying visual effects for ${hour}`);

    // Clean up previous time-specific effects
    this.cleanupTimeEffects();

    // Apply new effects for the current hour
    this.addTimeSpecificEffects(hour);

    // Update sky filters based on time
    this.updateSkyFilters(hour);
  }

  // Clean up all time-specific effects to prevent memory leaks
  cleanupTimeEffects() {
    // Remove all children from time effects containers
    if (this.timeEffectsContainer) {
      this.timeEffectsContainer.removeChildren();
    }

    if (this.lightingContainer) {
      this.lightingContainer.removeChildren();
    }

    // Remove all ticker callbacks related to time effects
    this.tickerCallbacks.forEach((callback, id) => {
      this.engine.app.ticker.remove(callback);
    });

    // Clear the callbacks map
    this.tickerCallbacks.clear();

    // Reset filters on the timeEffectsContainer to an empty array, not null
    if (this.timeEffectsContainer) {
      this.timeEffectsContainer.filters = [];
    }
  }

  // Update sky colors and filters based on time
  updateSkyFilters(hour: Hour): void {
    // Apply default sky filter
    this.applySkyFilter();

    // Only apply if skyFilter exists
    if (this.skyFilter) {
      // Adjust sky color based on time of day
      switch (hour) {
        case Hour.DAWN: // Morning
          // Warm sunrise colors
          this.skyFilter.tint(0xffe8c4, true);
          this.skyFilter.brightness(1.2, true);
          break;

        case Hour.ZENITH: // Afternoon
          // Bright daylight
          this.skyFilter.tint(0xf8f8ff, true);
          this.skyFilter.brightness(1.5, true);
          this.skyFilter.contrast(1.1, true);
          break;

        case Hour.DUSK: // Evening
          // Sunset orange/purple
          this.skyFilter.tint(0xff7f50, true);
          this.skyFilter.brightness(0.9, true);
          break;

        case Hour.MIDNIGHT: // Night
          // Deep blue night
          this.skyFilter.tint(0x0a1a3f, true);
          this.skyFilter.brightness(0.5, true);
          this.skyFilter.contrast(1.2, true);
          break;
      }
    }
  }

  // Add visual elements specific to the time of day
  addTimeSpecificEffects(hour: Hour) {
    const centerX = 400;
    const centerY = 400;

    // Check if we're at the prophetic time
    const isPropheticTime = this.isPropheticTimeActive();

    switch (hour) {
      case Hour.DAWN: // Morning
        // Add sun rising
        this.createSunOrMoon(centerX - 300, centerY - 200, 40, 0xffd700, 0.8);

        // Add morning mist
        this.createMorningMist();

        // Add prophecy effects if active
        if (isPropheticTime) this.addProphecyEffects();
        break;

      case Hour.ZENITH: // Afternoon
        // Add bright sun
        this.createSunOrMoon(centerX, centerY - 250, 60, 0xffffff, 1.0);

        // Add sun rays
        this.createLightRays(
          this.timeEffectsContainer,
          centerX,
          centerY - 250,
          200
        );

        // Add prophecy effects if active
        if (isPropheticTime) this.addProphecyEffects();
        break;

      case Hour.DUSK: // Evening
        // Add setting sun
        this.createSunOrMoon(centerX + 300, centerY - 150, 50, 0xff6347, 0.9);

        // Add evening stars starting to appear
        this.createStars(20, 0.3);

        // Add prophecy effects if active
        if (isPropheticTime) this.addProphecyEffects();
        break;

      case Hour.MIDNIGHT: // Night
        // Add moon
        this.createSunOrMoon(centerX + 100, centerY - 220, 35, 0xe6e6fa, 0.85);

        // Add stars
        this.createStars(100, 0.8);

        // Add lamp lights
        this.addNightLamps();

        // Add prophecy effects if active (with stronger effect at midnight)
        if (isPropheticTime) this.addProphecyEffects(true);
        break;
    }
  }

  // Check if we're at the prophetic time
  isPropheticTimeActive(): boolean {
    if (!this.engine.timeManager) return false;

    const time = this.engine.timeManager.getTimeState();
    return (
      time.hour === Hour.MIDNIGHT &&
      time.day === Day.VOIDUS &&
      time.week === Week.ZEPHYRWIND &&
      time.month === Month.AMBERFALL &&
      time.year === Year.GRIFFIN &&
      time.century === Century.SHADOW
    );
  }

  // Add special visual effects for the prophetic time
  addProphecyEffects(isStronger: boolean = false) {
    const centerX = 400;
    const centerY = 400;

    try {
      // Create a new container for prophecy effects
      const prophecyContainer = new PIXI.Container();

      // Mystical runes appearing on the ground at the crossroads
      this.createPropheticRunes(
        prophecyContainer,
        centerX,
        centerY,
        isStronger
      );

      // Swirling energy in the sky
      this.createCelestialVortex(
        prophecyContainer,
        centerX,
        centerY - 200,
        isStronger
      );

      // Glowing lines connecting the cardinal directions
      this.createLeyLines(prophecyContainer, centerX, centerY, isStronger);

      // Add the prophecy container to the time effects
      this.timeEffectsContainer.addChild(prophecyContainer);

      // Add screen post-processing effects
      if (this.engine.app.renderer && PIXI.Filter) {
        try {
          // Pulsing effect over the entire screen
          const pulseFilter = new PIXI.ColorMatrixFilter();
          pulseFilter.brightness(1.05, false);

          // Create a pulse animation function that we'll store for cleanup
          const pulseAnimation = (delta: number) => {
            const intensity = 1 + Math.sin(Date.now() * 0.001) * 0.05;
            pulseFilter.brightness(intensity, false);
          };

          // Add pulse animation to ticker
          this.engine.app.ticker.add(pulseAnimation);

          // Store the callback in our map for later cleanup
          this.tickerCallbacks.set("prophecyPulse", pulseAnimation);

          // Create a new array for filters
          const currentFilters = Array.isArray(
            this.timeEffectsContainer.filters
          )
            ? [...this.timeEffectsContainer.filters]
            : this.timeEffectsContainer.filters
            ? [this.timeEffectsContainer.filters]
            : [];

          // Create a new array instead of pushing to potentially frozen array
          this.timeEffectsContainer.filters = [...currentFilters, pulseFilter];
        } catch (e) {
          console.warn("Could not create prophecy screen effects", e);
        }
      }
    } catch (error) {
      console.error("Error applying prophecy effects:", error);
    }
  }

  // Create sun or moon based on parameters
  createSunOrMoon(
    x: number,
    y: number,
    radius: number,
    color: number,
    alpha: number
  ) {
    // Create the basic circle for sun/moon
    const celestialBody = new PIXI.Graphics();
    celestialBody.beginFill(color, alpha);
    celestialBody.drawCircle(0, 0, radius);
    celestialBody.endFill();

    // Add glow effect
    const glowRadius = radius * 1.5;
    const glow = new PIXI.Graphics();
    glow.beginFill(color, alpha * 0.5);
    glow.drawCircle(0, 0, glowRadius);
    glow.endFill();

    // Create a container for the celestial body
    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(celestialBody);

    // Position the container
    container.x = x;
    container.y = y;

    // Add to time effects container
    this.timeEffectsContainer.addChild(container);

    return container;
  }

  // Create stars for night sky
  createStars(count: number, brightness: number) {
    // Create stars as small white dots with varying sizes
    for (let i = 0; i < count; i++) {
      const star = new PIXI.Graphics();

      // Random star properties
      const x = Math.random() * 1200 - 200; // Position across screen
      const y = Math.random() * 300; // Only in top portion of screen
      const size = Math.random() * 2 + 1; // Size between 1-3
      const alpha = Math.random() * 0.5 + brightness * 0.5; // Varying brightness

      // Draw star
      star.beginFill(0xffffff, alpha);
      star.drawCircle(0, 0, size);
      star.endFill();

      // Position
      star.x = x;
      star.y = y;

      // Add twinkle animation for some stars
      if (Math.random() > 0.7) {
        const twinkleSpeed = Math.random() * 0.02 + 0.01;
        star.addEventListener("added", () => {
          this.engine.app.ticker.add((delta: number) => {
            star.alpha =
              alpha * (0.7 + Math.sin(Date.now() * twinkleSpeed) * 0.3);
          });
        });
      }

      // Add to container
      this.timeEffectsContainer.addChild(star);
    }
  }

  // Create morning mist effect
  createMorningMist() {
    // Create a container for the mist
    const mistContainer = new PIXI.Container();

    // Create several mist patches
    for (let i = 0; i < 15; i++) {
      const mistPatch = new PIXI.Graphics();

      // Random position near the ground
      const x = Math.random() * 1000 - 100;
      const y = Math.random() * 200 + 300; // Lower on the screen

      // Random dimensions for the mist
      const width = Math.random() * 200 + 100;
      const height = Math.random() * 50 + 20;

      // Create mist as a soft, partially transparent white
      const alpha = 0.1 + Math.random() * 0.1;
      mistPatch.beginFill(0xffffff, alpha);
      mistPatch.drawEllipse(0, 0, width, height);
      mistPatch.endFill();

      // Position
      mistPatch.x = x;
      mistPatch.y = y;

      // Add slow drift animation
      const driftSpeed = Math.random() * 0.1 + 0.05;
      mistPatch.addEventListener("added", () => {
        this.engine.app.ticker.add((delta: number) => {
          mistPatch.x += Math.sin(Date.now() * 0.001) * driftSpeed * delta;
        });
      });

      // Add to container
      mistContainer.addChild(mistPatch);
    }
  }

  // Add a light effect at a lamp position
  addLampLight(
    x: number,
    y: number,
    radius: number,
    color: number,
    intensity: number
  ) {
    try {
      // Create the light as a radial gradient simulation
      const light = new PIXI.Graphics();

      // For a simple light effect
      light.beginFill(color, intensity);
      light.drawCircle(0, 0, radius);
      light.endFill();

      // Position
      light.x = x;
      light.y = y;

      // Add flickering effect for fire-based lights
      const baseIntensity = intensity;
      light.addEventListener("added", () => {
        this.engine.app.ticker.add((delta: number) => {
          // Subtle random flickering
          const flicker = baseIntensity * (0.9 + Math.random() * 0.2);
          light.alpha = flicker;
        });
      });

      // Add to lighting container - no blend mode
      this.lightingContainer.addChild(light);
    } catch (e) {
      console.warn("Error creating lamp light:", e);
    }
  }

  // Apply a sky color filter
  applySkyFilter() {
    try {
      // Create new color matrix filter if it doesn't exist
      if (!this.skyFilter) {
        this.skyFilter = new PIXI.ColorMatrixFilter();
      }

      // Apply to the container
      if (this.container) {
        // Using a simple approach - create a fresh array of filters
        const newFilters = [];

        // Add existing filters if any (safely)
        if (this.container.filters) {
          // Handle different filter types without spread operator
          if (Array.isArray(this.container.filters)) {
            for (let i = 0; i < this.container.filters.length; i++) {
              newFilters.push(this.container.filters[i]);
            }
          } else {
            // Single filter
            newFilters.push(this.container.filters);
          }
        }

        // Add our sky filter
        newFilters.push(this.skyFilter);

        // Assign the filters
        this.container.filters = newFilters;
      }
    } catch (e) {
      console.warn("Error applying sky filter:", e);
    }
  }

  // Add night-time lamp lighting
  addNightLamps() {
    try {
      // Find all lamp posts and add light
      const centerX = 400;
      const centerY = 400;

      // Add light to the crossroads lamps
      this.addLampLight(centerX - 150, centerY - 80, 100, 0xffd700, 0.4);
      this.addLampLight(centerX + 150, centerY - 80, 100, 0xffd700, 0.4);
      this.addLampLight(centerX - 80, centerY + 150, 100, 0xffd700, 0.4);
      this.addLampLight(centerX + 80, centerY + 150, 100, 0xffd700, 0.4);
    } catch (e) {
      console.warn("Error adding night lamps:", e);
    }
  }

  // Create mystical runes at the crossroads - stub implementation
  createPropheticRunes(
    container: PIXI.Container,
    centerX: number,
    centerY: number,
    isStronger: boolean
  ) {
    try {
      // Create a simple rune circle
      const circle = new PIXI.Graphics();
      circle.beginFill(0x9966ff, 0.5);
      circle.drawCircle(centerX, centerY, isStronger ? 100 : 80);
      circle.endFill();
      container.addChild(circle);
    } catch (e) {
      console.warn("Error creating prophetic runes:", e);
    }
  }

  // Create a swirling energy vortex in the sky - stub implementation
  createCelestialVortex(
    container: PIXI.Container,
    centerX: number,
    centerY: number,
    isStronger: boolean
  ) {
    try {
      // Create a simple vortex effect
      const vortex = new PIXI.Graphics();
      vortex.beginFill(0x3311aa, 0.3);
      vortex.drawCircle(centerX, centerY, isStronger ? 150 : 120);
      vortex.endFill();
      container.addChild(vortex);
    } catch (e) {
      console.warn("Error creating celestial vortex:", e);
    }
  }

  // Create glowing lines connecting the cardinal directions - stub implementation
  createLeyLines(
    container: PIXI.Container,
    centerX: number,
    centerY: number,
    isStronger: boolean
  ) {
    try {
      // Create simple lines to cardinal directions
      const directions = [
        { x: 0, y: -1 }, // North
        { x: 1, y: 0 }, // East
        { x: 0, y: 1 }, // South
        { x: -1, y: 0 }, // West
      ];

      const lineLength = 300;
      const line = new PIXI.Graphics();
      line.lineStyle(isStronger ? 6 : 4, 0x9966ff, 0.7);

      for (const dir of directions) {
        const targetX = centerX + dir.x * lineLength;
        const targetY = centerY + dir.y * lineLength;
        line.moveTo(centerX, centerY);
        line.lineTo(targetX, targetY);
      }

      container.addChild(line);
    } catch (e) {
      console.warn("Error creating ley lines:", e);
    }
  }

  // Helper method for flowing particles - stub implementation
  createFlowingParticles(
    container: PIXI.Container,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    // Empty stub implementation
  }

  // Clean up all resources when the world is destroyed
  destroy() {
    console.log("Destroying world and cleaning up resources");

    // Clean up time effects
    this.cleanupTimeEffects();

    // Remove all ticker callbacks
    this.tickerCallbacks.forEach((callback, id) => {
      this.engine.app.ticker.remove(callback);
    });
    this.tickerCallbacks.clear();

    // Clear all textures we've cached
    for (const key in this) {
      if (key.startsWith("lightTexture_")) {
        const texture = (this as any)[key] as PIXI.Texture;
        if (texture && texture.destroy) {
          texture.destroy(true);
        }
        (this as any)[key] = null;
      }
    }

    // Remove all entities
    for (const entity of this.entities) {
      this.removeEntity(entity);
    }
    this.entities = [];

    // Clear all containers
    if (this.container) {
      this.container.removeChildren();
    }

    if (this.timeEffectsContainer) {
      this.timeEffectsContainer.removeChildren();
    }

    if (this.lightingContainer) {
      this.lightingContainer.removeChildren();
    }

    // Remove references
    this.tiles = [];
    this.npcs = [];
    this.interactionPoints = [];

    console.log("World destroyed and resources cleaned up");
  }

  // Toggle terrain culling
  toggleCulling(enabled: boolean = true) {
    // Only process if the state is changing
    if (this.cullingEnabled === enabled) return;

    console.log(`${enabled ? "Enabling" : "Disabling"} terrain culling`);
    this.cullingEnabled = enabled;

    // If disabling culling, make all tiles visible
    if (!enabled) {
      let madeVisible = 0;
      for (const tile of this.tiles) {
        if (tile.sprite && !tile.sprite.visible) {
          tile.sprite.visible = true;
          madeVisible++;
        }
      }
      console.log(`Made ${madeVisible} tiles visible`);
    } else {
      // If enabling culling, immediately update visibility
      this.updateTileVisibility();
    }

    return enabled;
  }

  // Create a debug visualization of the rendering
  createDebugVisualization() {
    if (!this.engine || !this.engine.app || !this.container) {
      console.error(
        "Cannot create debug visualization - engine or container not initialized"
      );
      return;
    }

    // Create a debug graphics container
    const debugGraphics = new PIXI.Graphics();

    // Draw a grid to help visualize the world
    debugGraphics.lineStyle(1, 0xff00ff, 0.5);

    // Draw horizontal lines
    for (let y = 0; y <= 800; y += 100) {
      debugGraphics.moveTo(0, y);
      debugGraphics.lineTo(800, y);
    }

    // Draw vertical lines
    for (let x = 0; x <= 800; x += 100) {
      debugGraphics.moveTo(x, 0);
      debugGraphics.lineTo(x, 800);
    }

    // Draw the center point
    debugGraphics.lineStyle(2, 0xff0000, 1);
    debugGraphics.drawCircle(400, 400, 10);

    // Add to world container with high z-index
    debugGraphics.zIndex = 1000;
    this.container.addChild(debugGraphics);

    console.log("Debug visualization added to world");

    return debugGraphics;
  }
}
