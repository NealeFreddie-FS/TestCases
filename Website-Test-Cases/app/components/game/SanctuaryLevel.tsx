"use client";

import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { getCharacterInfo } from "../../utils/game-utils";

// Define the tile size for our grid
const TILE_SIZE = 40; // Increased tile size for more detail
const GRID_SIZE = 25; // Larger grid for a bigger sanctuary

// Character animation states
enum CharacterState {
  IDLE,
  WALKING,
}

// Direction for facing
enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

interface PlayerCharacter {
  sprite: PIXI.Graphics;
  state: CharacterState;
  direction: Direction;
  speed: number;
  animationFrame: number;
  animationSpeed: number;
  class: string;
  name: string;
}

interface SanctuaryLevelProps {
  onLoaded?: () => void;
}

export default function SanctuaryLevel({ onLoaded }: SanctuaryLevelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const playerRef = useRef<PlayerCharacter | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});

  // Initialize the sanctuary level
  useEffect(() => {
    if (!containerRef.current) return;

    // Create PIXI Application if it doesn't exist
    const initializeApp = async () => {
      if (!appRef.current) {
        // Create a new application instance
        appRef.current = new PIXI.Application();

        // Initialize the application with our settings
        await appRef.current.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x1a1a1a, // Darker background for Dark Souls atmosphere
          antialias: true,
        });

        // Append the view to our container
        if (containerRef.current && appRef.current.view) {
          containerRef.current.appendChild(appRef.current.view);

          // Create the sanctuary level
          createSanctuaryLevel();
        }
      }
    };

    // Call the async initialization function
    initializeApp().catch(console.error);

    // Set up keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Handle resize
    const handleResize = () => {
      if (appRef.current) {
        appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // Create the sanctuary level
  const createSanctuaryLevel = async () => {
    if (!appRef.current) return;

    // Create a container for the level
    const levelContainer = new PIXI.Container();
    appRef.current.stage.addChild(levelContainer);

    // Create separate layers
    const backgroundLayer = new PIXI.Container();
    const groundLayer = new PIXI.Container();
    const pathsLayer = new PIXI.Container(); // New layer for paths
    const structuresLayer = new PIXI.Container();
    const decorationsLayer = new PIXI.Container();
    const playerLayer = new PIXI.Container(); // Layer for player
    const npcLayer = new PIXI.Container();
    const effectsLayer = new PIXI.Container(); // New layer for visual effects

    // Add all layers to the level container
    levelContainer.addChild(backgroundLayer);
    levelContainer.addChild(groundLayer);
    levelContainer.addChild(pathsLayer);
    levelContainer.addChild(structuresLayer);
    levelContainer.addChild(decorationsLayer);
    levelContainer.addChild(playerLayer);
    levelContainer.addChild(npcLayer);
    levelContainer.addChild(effectsLayer);

    // Center the level
    levelContainer.x = window.innerWidth / 2;
    levelContainer.y = window.innerHeight / 2;

    // Create elements
    createBackground(backgroundLayer);
    createGround(groundLayer);
    createPaths(pathsLayer);
    createStructures(structuresLayer);
    createDecorations(decorationsLayer);
    createPlayer(playerLayer); // Create player character
    createNPCs(npcLayer);
    createEffects(effectsLayer);

    // Enable dragging (simple camera)
    setupCamera(levelContainer);

    // Setup movement animation
    setupPlayerMovement(levelContainer);

    // Notify the parent component that level is loaded
    setIsLoaded(true);
    if (onLoaded) {
      onLoaded();
    }
  };

  // Set up player movement with game loop
  const setupPlayerMovement = (levelContainer: PIXI.Container) => {
    if (!appRef.current || !playerRef.current) return;

    // Game loop
    appRef.current.ticker.add(() => {
      const player = playerRef.current;
      if (!player) return;

      // Handle movement
      let dx = 0;
      let dy = 0;
      let isMoving = false;

      if (keysPressed.current["w"] || keysPressed.current["arrowup"]) {
        dy -= player.speed;
        player.direction = Direction.UP;
        isMoving = true;
      }
      if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) {
        dy += player.speed;
        player.direction = Direction.DOWN;
        isMoving = true;
      }
      if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) {
        dx -= player.speed;
        player.direction = Direction.LEFT;
        isMoving = true;
      }
      if (keysPressed.current["d"] || keysPressed.current["arrowright"]) {
        dx += player.speed;
        player.direction = Direction.RIGHT;
        isMoving = true;
      }

      // Update player position
      if (isMoving) {
        player.state = CharacterState.WALKING;
        player.sprite.x += dx;
        player.sprite.y += dy;

        // Update animation
        player.animationFrame += player.animationSpeed;
        if (player.animationFrame > 4) {
          player.animationFrame = 0;
        }
      } else {
        player.state = CharacterState.IDLE;
        player.animationFrame = 0;
      }

      // Center the world on the player with some offset based on player direction
      // This creates a more dynamic camera that shows more space in front of the player
      const lookAheadFactor = 3; // How far ahead to look
      const lookAheadX =
        player.direction === Direction.RIGHT
          ? lookAheadFactor
          : player.direction === Direction.LEFT
          ? -lookAheadFactor
          : 0;
      const lookAheadY =
        player.direction === Direction.DOWN
          ? lookAheadFactor
          : player.direction === Direction.UP
          ? -lookAheadFactor
          : 0;

      // Smoothly move the camera to the player position
      const targetX =
        -player.sprite.x + window.innerWidth / 2 + (lookAheadX * TILE_SIZE) / 4;
      const targetY =
        -player.sprite.y +
        window.innerHeight / 2 +
        (lookAheadY * TILE_SIZE) / 4;

      // Smooth camera movement (lerp)
      levelContainer.x += (targetX - levelContainer.x) * 0.05;
      levelContainer.y += (targetY - levelContainer.y) * 0.05;

      // Update player appearance based on direction and animation
      updatePlayerAppearance(player);
    });
  };

  // Create the player character based on character creation choices
  const createPlayer = (container: PIXI.Container) => {
    // Get character info from storage
    const characterInfo = getCharacterInfo();
    const charClass = characterInfo?.class || "knight";
    const charName = characterInfo?.name || "Chosen Undead";

    // Create player sprite
    const player = new PIXI.Graphics();

    // Player body based on class
    let mainColor;

    switch (charClass.toLowerCase()) {
      case "knight":
        mainColor = 0xc0c0c0; // Silver armor
        break;
      case "warrior":
        mainColor = 0x8b4513; // Brown leather
        break;
      case "pyromancer":
        mainColor = 0x8b0000; // Dark red
        break;
      case "sorcerer":
        mainColor = 0x000066; // Dark blue
        break;
      case "cleric":
        mainColor = 0xf0f0f0; // White robes
        break;
      default:
        mainColor = 0xc0c0c0; // Default to knight
    }

    // Set initial player appearance
    drawPlayer(player, Direction.DOWN, 0, charClass, mainColor);

    // Set initial position (at bonfire)
    player.x = 0;
    player.y = TILE_SIZE * 2; // Just below the bonfire

    // Create player reference
    playerRef.current = {
      sprite: player,
      state: CharacterState.IDLE,
      direction: Direction.DOWN,
      speed: 2,
      animationFrame: 0,
      animationSpeed: 0.15,
      class: charClass,
      name: charName,
    };

    container.addChild(player);

    // Create name tag above player
    const nameText = new PIXI.Text(charName, {
      fontSize: 12,
      fill: 0xffffff,
      align: "center",
      dropShadow: {
        alpha: 1,
        color: 0x000000,
        blur: 2,
        distance: 1,
        angle: Math.PI / 6,
      },
    });

    nameText.anchor.set(0.5, 1);
    nameText.x = 0;
    nameText.y = -TILE_SIZE * 1.2;
    player.addChild(nameText);

    console.log(`Created player character: ${charName} (${charClass})`);
  };

  // Update player appearance based on current state and direction
  const updatePlayerAppearance = (player: PlayerCharacter) => {
    const mainColor = getCharacterColor(player.class);
    drawPlayer(
      player.sprite,
      player.direction,
      Math.floor(player.animationFrame),
      player.class,
      mainColor
    );
  };

  // Get character color based on class
  const getCharacterColor = (charClass: string): number => {
    switch (charClass.toLowerCase()) {
      case "knight":
        return 0xc0c0c0; // Silver armor
      case "warrior":
        return 0x8b4513; // Brown leather
      case "pyromancer":
        return 0x8b0000; // Dark red
      case "sorcerer":
        return 0x000066; // Dark blue
      case "cleric":
        return 0xf0f0f0; // White robes
      default:
        return 0xc0c0c0; // Default to knight
    }
  };

  // Draw player sprite based on direction and animation frame
  const drawPlayer = (
    graphics: PIXI.Graphics,
    direction: Direction,
    frame: number,
    charClass: string,
    mainColor: number
  ) => {
    // Clear previous drawing
    graphics.clear();

    // Character specific details
    let secondaryColor;
    let hasShield = false;
    let hasStaff = false;
    let hasSword = false;

    switch (charClass.toLowerCase()) {
      case "knight":
        secondaryColor = 0x333333; // Dark armor parts
        hasShield = true;
        hasSword = true;
        break;
      case "warrior":
        secondaryColor = 0x654321; // Dark leather
        hasSword = true;
        break;
      case "pyromancer":
        secondaryColor = 0xff6600; // Flame color
        break;
      case "sorcerer":
        secondaryColor = 0x6666ff; // Light blue
        hasStaff = true;
        break;
      case "cleric":
        secondaryColor = 0xddddbb; // Beige
        hasStaff = true;
        break;
      default:
        secondaryColor = 0x333333;
        hasShield = true;
    }

    // Body animation offset based on walking animation
    const bounceOffset = frame % 2 === 0 ? 0 : -1;

    // Draw body
    graphics.beginFill(mainColor);
    graphics.drawRect(
      -TILE_SIZE * 0.3,
      -TILE_SIZE * 0.7 + bounceOffset,
      TILE_SIZE * 0.6,
      TILE_SIZE * 0.7
    );
    graphics.endFill();

    // Draw head
    graphics.beginFill(0xe6be8a); // Skin tone
    graphics.drawCircle(0, -TILE_SIZE * 0.85 + bounceOffset, TILE_SIZE * 0.15);
    graphics.endFill();

    // Draw class-specific details
    switch (charClass.toLowerCase()) {
      case "knight":
        // Helmet
        graphics.beginFill(mainColor);
        graphics.drawCircle(
          0,
          -TILE_SIZE * 0.85 + bounceOffset,
          TILE_SIZE * 0.18
        );
        graphics.endFill();

        // Face opening
        graphics.beginFill(0x000000, 0.6);
        switch (direction) {
          case Direction.UP:
            graphics.drawRect(
              -TILE_SIZE * 0.1,
              -TILE_SIZE * 0.95 + bounceOffset,
              TILE_SIZE * 0.2,
              TILE_SIZE * 0.1
            );
            break;
          case Direction.RIGHT:
            graphics.drawCircle(
              TILE_SIZE * 0.05,
              -TILE_SIZE * 0.85 + bounceOffset,
              TILE_SIZE * 0.08
            );
            break;
          case Direction.DOWN:
            graphics.drawRect(
              -TILE_SIZE * 0.1,
              -TILE_SIZE * 0.9 + bounceOffset,
              TILE_SIZE * 0.2,
              TILE_SIZE * 0.1
            );
            break;
          case Direction.LEFT:
            graphics.drawCircle(
              -TILE_SIZE * 0.05,
              -TILE_SIZE * 0.85 + bounceOffset,
              TILE_SIZE * 0.08
            );
            break;
        }
        graphics.endFill();
        break;

      case "sorcerer":
        // Wizard hat
        graphics.beginFill(mainColor);
        graphics.moveTo(-TILE_SIZE * 0.2, -TILE_SIZE * 0.85 + bounceOffset);
        graphics.lineTo(TILE_SIZE * 0.2, -TILE_SIZE * 0.85 + bounceOffset);
        graphics.lineTo(0, -TILE_SIZE * 1.2 + bounceOffset);
        graphics.closePath();
        graphics.endFill();
        break;

      case "pyromancer":
        // Ragged hood
        graphics.beginFill(mainColor);
        graphics.drawCircle(
          0,
          -TILE_SIZE * 0.85 + bounceOffset,
          TILE_SIZE * 0.18
        );
        graphics.endFill();

        // Flame effect around hand
        const handX =
          direction === Direction.LEFT
            ? -TILE_SIZE * 0.4
            : direction === Direction.RIGHT
            ? TILE_SIZE * 0.4
            : 0;
        const handY =
          direction === Direction.UP
            ? -TILE_SIZE * 0.5
            : direction === Direction.DOWN
            ? -TILE_SIZE * 0.3
            : -TILE_SIZE * 0.4;

        graphics.beginFill(0xff6600, 0.7);
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * TILE_SIZE * 0.1;
          graphics.drawCircle(
            handX + Math.cos(angle) * dist,
            handY + bounceOffset + Math.sin(angle) * dist,
            TILE_SIZE * 0.08
          );
        }
        graphics.endFill();
        break;
    }

    // Draw equipment based on direction
    if (hasSword) {
      graphics.lineStyle(2, 0x888888);
      switch (direction) {
        case Direction.UP:
          graphics.moveTo(0, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(0, -TILE_SIZE * 0.9 + bounceOffset);
          break;
        case Direction.RIGHT:
          graphics.moveTo(TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(TILE_SIZE * 0.6, -TILE_SIZE * 0.5 + bounceOffset);
          break;
        case Direction.DOWN:
          graphics.moveTo(0, -TILE_SIZE * 0.3 + bounceOffset);
          graphics.lineTo(0, TILE_SIZE * 0.1 + bounceOffset);
          break;
        case Direction.LEFT:
          graphics.moveTo(-TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(-TILE_SIZE * 0.6, -TILE_SIZE * 0.5 + bounceOffset);
          break;
      }
    }

    if (hasShield) {
      graphics.beginFill(secondaryColor);
      switch (direction) {
        case Direction.UP:
          graphics.drawRect(
            -TILE_SIZE * 0.4,
            -TILE_SIZE * 0.7 + bounceOffset,
            TILE_SIZE * 0.2,
            TILE_SIZE * 0.3
          );
          break;
        case Direction.RIGHT:
          graphics.drawRect(
            TILE_SIZE * 0.1,
            -TILE_SIZE * 0.7 + bounceOffset,
            TILE_SIZE * 0.2,
            TILE_SIZE * 0.4
          );
          break;
        case Direction.DOWN:
          graphics.drawRect(
            TILE_SIZE * 0.2,
            -TILE_SIZE * 0.6 + bounceOffset,
            TILE_SIZE * 0.2,
            TILE_SIZE * 0.3
          );
          break;
        case Direction.LEFT:
          graphics.drawRect(
            -TILE_SIZE * 0.3,
            -TILE_SIZE * 0.7 + bounceOffset,
            TILE_SIZE * 0.3,
            TILE_SIZE * 0.4
          );
          break;
      }
      graphics.endFill();
    }

    if (hasStaff) {
      graphics.lineStyle(3, 0x8b4513);
      switch (direction) {
        case Direction.UP:
          graphics.moveTo(TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(TILE_SIZE * 0.3, TILE_SIZE * 0.2 + bounceOffset);
          break;
        case Direction.RIGHT:
          graphics.moveTo(TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(TILE_SIZE * 0.3, TILE_SIZE * 0.2 + bounceOffset);
          break;
        case Direction.DOWN:
          graphics.moveTo(-TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(-TILE_SIZE * 0.3, TILE_SIZE * 0.2 + bounceOffset);
          break;
        case Direction.LEFT:
          graphics.moveTo(-TILE_SIZE * 0.3, -TILE_SIZE * 0.5 + bounceOffset);
          graphics.lineTo(-TILE_SIZE * 0.3, TILE_SIZE * 0.2 + bounceOffset);
          break;
      }

      // Staff head (orb for sorcerer, cross for cleric)
      if (charClass.toLowerCase() === "sorcerer") {
        const staffHeadX =
          direction === Direction.UP || direction === Direction.RIGHT
            ? TILE_SIZE * 0.3
            : -TILE_SIZE * 0.3;
        const staffHeadY = -TILE_SIZE * 0.5 + bounceOffset;

        graphics.beginFill(0x6666ff, 0.6);
        graphics.drawCircle(staffHeadX, staffHeadY, TILE_SIZE * 0.1);
        graphics.endFill();
      } else if (charClass.toLowerCase() === "cleric") {
        const staffHeadX =
          direction === Direction.UP || direction === Direction.RIGHT
            ? TILE_SIZE * 0.3
            : -TILE_SIZE * 0.3;
        const staffHeadY = -TILE_SIZE * 0.5 + bounceOffset;

        graphics.lineStyle(2, 0xf0f0f0);
        graphics.moveTo(staffHeadX - TILE_SIZE * 0.1, staffHeadY);
        graphics.lineTo(staffHeadX + TILE_SIZE * 0.1, staffHeadY);
        graphics.moveTo(staffHeadX, staffHeadY - TILE_SIZE * 0.1);
        graphics.lineTo(staffHeadX, staffHeadY + TILE_SIZE * 0.1);
      }
    }

    // Draw legs with walking animation
    graphics.beginFill(secondaryColor);
    if (frame === 0 || frame === 2) {
      // Standing or mid-step
      graphics.drawRect(
        -TILE_SIZE * 0.2,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.4
      );
      graphics.drawRect(
        TILE_SIZE * 0.05,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.4
      );
    } else if (frame === 1) {
      // Right foot forward
      graphics.drawRect(
        -TILE_SIZE * 0.2,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.4
      );
      graphics.drawRect(
        TILE_SIZE * 0.05,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.3
      );
      graphics.drawRect(
        TILE_SIZE * 0.05,
        -TILE_SIZE * 0.1 + bounceOffset + TILE_SIZE * 0.3,
        TILE_SIZE * 0.25,
        TILE_SIZE * 0.1
      );
    } else if (frame === 3) {
      // Left foot forward
      graphics.drawRect(
        -TILE_SIZE * 0.2,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.3
      );
      graphics.drawRect(
        -TILE_SIZE * 0.3,
        -TILE_SIZE * 0.1 + bounceOffset + TILE_SIZE * 0.3,
        TILE_SIZE * 0.25,
        TILE_SIZE * 0.1
      );
      graphics.drawRect(
        TILE_SIZE * 0.05,
        -TILE_SIZE * 0.1 + bounceOffset,
        TILE_SIZE * 0.15,
        TILE_SIZE * 0.4
      );
    }
    graphics.endFill();
  };

  // Create a dark, atmospheric background
  const createBackground = (container: PIXI.Container) => {
    // Create a dark background for the sanctuary
    const background = new PIXI.Graphics();
    background.beginFill(0x1a1a1a); // Dark background
    background.drawRect(
      -window.innerWidth,
      -window.innerHeight,
      window.innerWidth * 2,
      window.innerHeight * 2
    );
    background.endFill();

    // Add some fog/mist effect
    const fogLayer = new PIXI.Graphics();
    fogLayer.beginFill(0x333333, 0.3); // Semi-transparent gray

    // Create irregular fog patches
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * window.innerWidth * 1.5;
      const y = (Math.random() - 0.5) * window.innerHeight * 1.5;
      const radius = 50 + Math.random() * 150;
      fogLayer.drawCircle(x, y, radius);
    }

    fogLayer.endFill();

    container.addChild(background);
    container.addChild(fogLayer);
  };

  // Create ground tiles
  const createGround = (container: PIXI.Container) => {
    // Create a larger grid of ground tiles
    const halfGrid = Math.floor(GRID_SIZE / 2);

    for (let x = -halfGrid; x <= halfGrid; x++) {
      for (let y = -halfGrid; y <= halfGrid; y++) {
        const tile = new PIXI.Graphics();
        const distFromCenter = Math.sqrt(x * x + y * y);

        // Different areas based on distance from center
        let baseColor;
        if (distFromCenter < 2) {
          // Central bonfire area
          baseColor = 0x4a4a4a; // Dark gray stone
        } else if (distFromCenter < 5) {
          // Inner sanctuary area
          baseColor = 0x3c3c3c; // Medium gray stone
        } else if (distFromCenter < 10) {
          // Mid sanctuary area
          baseColor = 0x2d2d2d; // Lighter gray stone
        } else {
          // Outer sanctuary area
          baseColor = 0x1f1f1f; // Darkest gray
        }

        // Add some variation to tiles
        const brightness = 0.9 + Math.random() * 0.2;
        const tileColor = adjustBrightness(baseColor, brightness);

        tile.beginFill(tileColor);

        // Draw the tile with a slight border
        tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        tile.endFill();

        // Add subtle cracks to some tiles
        if (Math.random() > 0.7) {
          tile.lineStyle(1, 0x000000, 0.2);
          const startX = Math.random() * TILE_SIZE;
          const startY = Math.random() * TILE_SIZE;
          tile.moveTo(startX, startY);
          tile.lineTo(
            startX + (Math.random() - 0.5) * TILE_SIZE,
            startY + (Math.random() - 0.5) * TILE_SIZE
          );
        }

        // Position the tile
        tile.x = x * TILE_SIZE;
        tile.y = y * TILE_SIZE;
        container.addChild(tile);
      }
    }
  };

  // Helper function to adjust color brightness
  const adjustBrightness = (color: number, factor: number): number => {
    const r = ((color >> 16) & 0xff) * factor;
    const g = ((color >> 8) & 0xff) * factor;
    const b = (color & 0xff) * factor;
    return (
      (Math.min(255, Math.floor(r)) << 16) |
      (Math.min(255, Math.floor(g)) << 8) |
      Math.min(255, Math.floor(b))
    );
  };

  // Create paths connecting different areas
  const createPaths = (container: PIXI.Container) => {
    // Main paths from center to different areas
    const paths = [
      { x1: 0, y1: 0, x2: 0, y2: -10 }, // North path
      { x1: 0, y1: 0, x2: 10, y2: 0 }, // East path
      { x1: 0, y1: 0, x2: 0, y2: 10 }, // South path
      { x1: 0, y1: 0, x2: -10, y2: 0 }, // West path
    ];

    paths.forEach((path) => {
      const pathGraphic = new PIXI.Graphics();
      pathGraphic.beginFill(0x4a4a4a); // Path color

      // Create path segments
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.floor(path.x1 + (path.x2 - path.x1) * t);
        const y = Math.floor(path.y1 + (path.y2 - path.y1) * t);

        // Add some randomness to path width
        const width = TILE_SIZE * (0.8 + Math.random() * 0.4);

        pathGraphic.drawRect(
          x * TILE_SIZE - width / 2,
          y * TILE_SIZE - width / 2,
          width,
          width
        );
      }

      pathGraphic.endFill();
      container.addChild(pathGraphic);
    });
  };

  // Create effects like the bonfire glow and animated elements
  const createEffects = (container: PIXI.Container) => {
    // Bonfire glow at the center
    const bonfireGlow = new PIXI.Graphics();
    bonfireGlow.beginFill(0xff6600, 0.2); // Orange glow
    bonfireGlow.drawCircle(0, 0, TILE_SIZE * 3);
    bonfireGlow.endFill();

    // Inner stronger glow
    bonfireGlow.beginFill(0xff9900, 0.3);
    bonfireGlow.drawCircle(0, 0, TILE_SIZE * 1.5);
    bonfireGlow.endFill();

    container.addChild(bonfireGlow);

    // Create maps to store particle and fog data
    const particleDataMap = new Map();
    const fogDataMap = new Map();

    // Create animated fire particles
    const fireParticles: PIXI.Graphics[] = [];
    const numParticles = 15;

    for (let i = 0; i < numParticles; i++) {
      const particle = new PIXI.Graphics();
      const size = 3 + Math.random() * 5;

      // Random color from red to yellow
      const colorFactor = Math.random();
      const color =
        colorFactor < 0.3 ? 0xff0000 : colorFactor < 0.7 ? 0xff6600 : 0xffcc00;

      particle.beginFill(color, 0.7);
      particle.drawCircle(0, 0, size);
      particle.endFill();

      // Set initial position
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * TILE_SIZE * 0.5;
      particle.x = Math.cos(angle) * dist;
      particle.y = Math.sin(angle) * dist;

      // Store particle data in map
      particleDataMap.set(particle, {
        angle,
        dist,
        speed: 0.2 + Math.random() * 0.4,
        size,
        life: 0,
        maxLife: 30 + Math.random() * 60,
      });

      fireParticles.push(particle);
      container.addChild(particle);
    }

    // Create ambient fog patches
    const fogPatches: PIXI.Graphics[] = [];
    const numFogPatches = 10;

    for (let i = 0; i < numFogPatches; i++) {
      const fog = new PIXI.Graphics();
      const size = TILE_SIZE * (2 + Math.random() * 5);

      fog.beginFill(0xaaaaaa, 0.05 + Math.random() * 0.1);
      fog.drawCircle(0, 0, size);
      fog.endFill();

      // Set initial position (spread around the sanctuary)
      const x = (Math.random() - 0.5) * GRID_SIZE * TILE_SIZE;
      const y = (Math.random() - 0.5) * GRID_SIZE * TILE_SIZE;
      fog.x = x;
      fog.y = y;

      // Store fog data in map
      fogDataMap.set(fog, {
        baseX: x,
        baseY: y,
        xSpeed: (Math.random() - 0.5) * 0.2,
        ySpeed: (Math.random() - 0.5) * 0.2,
        size,
        phase: Math.random() * Math.PI * 2,
      });

      fogPatches.push(fog);
      container.addChild(fog);
    }

    // Set up animation ticker
    if (appRef.current) {
      appRef.current.ticker.add(() => {
        // Animate fire particles
        for (let i = 0; i < fireParticles.length; i++) {
          const particle = fireParticles[i];
          const data = particleDataMap.get(particle);

          if (!data) continue;

          // Update particle life
          data.life += 1;

          // Respawn if lifetime is over
          if (data.life >= data.maxLife) {
            // Reset position
            data.angle = Math.random() * Math.PI * 2;
            data.dist = Math.random() * TILE_SIZE * 0.5;
            particle.x = Math.cos(data.angle) * data.dist;
            particle.y = Math.sin(data.angle) * data.dist;

            // Reset properties
            data.life = 0;
            data.maxLife = 30 + Math.random() * 60;
            data.speed = 0.2 + Math.random() * 0.4;

            // Reset opacity
            particle.alpha = 0.7;
          } else {
            // Move upward with some randomness
            particle.y -= data.speed;
            particle.x += (Math.random() - 0.5) * 0.5;

            // Fade out as it rises
            const lifeRatio = data.life / data.maxLife;
            particle.alpha = 0.7 * (1 - lifeRatio);
          }
        }

        // Animate fog patches
        for (let i = 0; i < fogPatches.length; i++) {
          const fog = fogPatches[i];
          const data = fogDataMap.get(fog);

          if (!data) continue;

          // Update phase
          data.phase += 0.01;

          // Move fog patch with slow drifting motion
          fog.x = data.baseX + Math.sin(data.phase) * TILE_SIZE * 3;
          fog.y = data.baseY + Math.cos(data.phase * 0.7) * TILE_SIZE * 2;

          // Subtle alpha pulsing
          fog.alpha = 0.05 + Math.sin(data.phase * 0.5) * 0.03;
        }

        // Subtle pulsing for bonfire glow
        const time = Date.now() / 1000;
        const pulseScale = 1 + Math.sin(time * 2) * 0.05;
        bonfireGlow.scale.set(pulseScale);
      });
    }
  };

  // Create main structures
  const createStructures = (container: PIXI.Container) => {
    // 1. Central Bonfire
    createBonfire(container, 0, 0);

    // 2. Blacksmith's forge (Andre-like)
    createBlacksmithForge(container, -8, 3);

    // 3. Shrine / Temple (like Firelink)
    createShrine(container, 0, -7);

    // 4. Firekeeper's chamber
    createFirekeeperChamber(container, 3, -3);

    // 5. Merchant hut / Undead merchant style
    createMerchantHut(container, 7, 5);

    // 6. Crestfallen warrior's spot
    createStoneSeating(container, 2, 2);

    // 7. Spell trainer / Sorcery area
    createSpellTrainerArea(container, -5, -5);

    // 8. Ruined arches and pillars
    createRuins(container);
  };

  // Create a bonfire
  const createBonfire = (container: PIXI.Container, x: number, y: number) => {
    // Base stone circle
    const base = new PIXI.Graphics();
    base.beginFill(0x555555); // Stone color
    base.drawCircle(0, 0, TILE_SIZE * 1.2);
    base.endFill();

    // Sword
    const sword = new PIXI.Graphics();
    sword.lineStyle(3, 0xaaaaaa); // Silver color
    sword.moveTo(0, -TILE_SIZE * 0.7);
    sword.lineTo(0, TILE_SIZE * 0.2);

    // Sword guard
    sword.lineStyle(6, 0x8a8a8a);
    sword.moveTo(-TILE_SIZE * 0.3, -TILE_SIZE * 0.1);
    sword.lineTo(TILE_SIZE * 0.3, -TILE_SIZE * 0.1);

    // Coiled sword blade
    sword.lineStyle(2, 0xaaaaaa);
    sword.moveTo(0, -TILE_SIZE * 0.7);
    sword.lineTo(TILE_SIZE * 0.1, -TILE_SIZE * 0.9);

    // Fire pit
    const firePit = new PIXI.Graphics();
    firePit.beginFill(0x333333);
    firePit.drawCircle(0, 0, TILE_SIZE * 0.6);
    firePit.endFill();

    // Ash/embers
    const embers = new PIXI.Graphics();
    embers.beginFill(0xff3300, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * TILE_SIZE * 0.4;
      embers.drawCircle(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        2 + Math.random() * 4
      );
    }
    embers.endFill();

    base.x = x * TILE_SIZE;
    base.y = y * TILE_SIZE;
    sword.x = x * TILE_SIZE;
    sword.y = y * TILE_SIZE;
    firePit.x = x * TILE_SIZE;
    firePit.y = y * TILE_SIZE;
    embers.x = x * TILE_SIZE;
    embers.y = y * TILE_SIZE;

    container.addChild(base);
    container.addChild(firePit);
    container.addChild(embers);
    container.addChild(sword);
  };

  // Create blacksmith's forge
  const createBlacksmithForge = (
    container: PIXI.Container,
    x: number,
    y: number
  ) => {
    // Forge building structure
    const forge = new PIXI.Graphics();

    // Stone building
    forge.beginFill(0x555555);
    forge.drawRect(0, 0, TILE_SIZE * 4, TILE_SIZE * 3);
    forge.endFill();

    // Roof
    forge.beginFill(0x3d3d3d);
    forge.moveTo(-TILE_SIZE * 0.5, 0);
    forge.lineTo(TILE_SIZE * 4.5, 0);
    forge.lineTo(TILE_SIZE * 4, -TILE_SIZE);
    forge.lineTo(0, -TILE_SIZE);
    forge.closePath();
    forge.endFill();

    // Chimney
    forge.beginFill(0x444444);
    forge.drawRect(TILE_SIZE * 3, -TILE_SIZE * 2, TILE_SIZE, TILE_SIZE);
    forge.endFill();

    // Smoke from chimney
    const smoke = new PIXI.Graphics();
    smoke.beginFill(0x888888, 0.4);
    for (let i = 0; i < 5; i++) {
      smoke.drawCircle(
        TILE_SIZE * 3.5,
        -TILE_SIZE * (2 + i * 0.4),
        TILE_SIZE * (0.3 + i * 0.2)
      );
    }
    smoke.endFill();

    // Anvil
    const anvil = new PIXI.Graphics();
    anvil.beginFill(0x333333);
    anvil.drawRect(
      TILE_SIZE,
      TILE_SIZE * 1.5,
      TILE_SIZE * 0.8,
      TILE_SIZE * 0.5
    );
    anvil.endFill();

    forge.x = x * TILE_SIZE;
    forge.y = y * TILE_SIZE;
    smoke.x = x * TILE_SIZE;
    smoke.y = y * TILE_SIZE;
    anvil.x = x * TILE_SIZE;
    anvil.y = y * TILE_SIZE;

    container.addChild(forge);
    container.addChild(smoke);
    container.addChild(anvil);
  };

  // Create the main shrine/temple
  const createShrine = (container: PIXI.Container, x: number, y: number) => {
    // Main structure - ruined temple
    const shrine = new PIXI.Graphics();

    // Base/platform
    shrine.beginFill(0x4a4a4a);
    shrine.drawRect(-TILE_SIZE * 5, 0, TILE_SIZE * 10, TILE_SIZE * 0.5);
    shrine.endFill();

    // Steps
    shrine.beginFill(0x555555);
    shrine.drawRect(
      -TILE_SIZE * 4,
      TILE_SIZE * 0.5,
      TILE_SIZE * 8,
      TILE_SIZE * 0.5
    );
    shrine.endFill();

    shrine.beginFill(0x606060);
    shrine.drawRect(-TILE_SIZE * 3, TILE_SIZE, TILE_SIZE * 6, TILE_SIZE * 0.5);
    shrine.endFill();

    // Create broken pillars
    const createPillar = (offsetX: number, broken: boolean) => {
      const pillar = new PIXI.Graphics();
      pillar.beginFill(0x777777);

      const pillarHeight = broken
        ? TILE_SIZE * (1.5 + Math.random())
        : TILE_SIZE * 4;

      pillar.drawRect(offsetX, -pillarHeight, TILE_SIZE * 0.8, pillarHeight);

      // Pillar top/capital
      if (!broken) {
        pillar.beginFill(0x888888);
        pillar.drawRect(
          offsetX - TILE_SIZE * 0.2,
          -TILE_SIZE * 4.2,
          TILE_SIZE * 1.2,
          TILE_SIZE * 0.4
        );
      }

      pillar.endFill();
      return pillar;
    };

    // Add pillars
    const pillars = [
      createPillar(-TILE_SIZE * 4, true),
      createPillar(-TILE_SIZE * 2, false),
      createPillar(TILE_SIZE * 0, true),
      createPillar(TILE_SIZE * 2, false),
      createPillar(TILE_SIZE * 4, true),
    ];

    // Broken arch/lintel
    const arch = new PIXI.Graphics();
    arch.beginFill(0x666666);
    arch.drawRect(
      -TILE_SIZE * 3,
      -TILE_SIZE * 4.5,
      TILE_SIZE * 3,
      TILE_SIZE * 0.5
    );
    arch.endFill();

    shrine.x = x * TILE_SIZE;
    shrine.y = y * TILE_SIZE;
    arch.x = x * TILE_SIZE;
    arch.y = y * TILE_SIZE;

    container.addChild(shrine);
    pillars.forEach((pillar) => {
      pillar.x = x * TILE_SIZE;
      pillar.y = y * TILE_SIZE;
      container.addChild(pillar);
    });
    container.addChild(arch);
  };

  // Create other structures
  const createFirekeeperChamber = (
    container: PIXI.Container,
    x: number,
    y: number
  ) => {
    const chamber = new PIXI.Graphics();

    // Underground chamber with stairs
    chamber.beginFill(0x333333);
    chamber.drawRect(0, 0, TILE_SIZE * 3, TILE_SIZE * 2);
    chamber.endFill();

    // Stairs down
    chamber.beginFill(0x3a3a3a);
    for (let i = 0; i < 5; i++) {
      chamber.drawRect(
        TILE_SIZE * 0.5 + i * TILE_SIZE * 0.4,
        TILE_SIZE * 2 + i * TILE_SIZE * 0.2,
        TILE_SIZE * 0.4,
        TILE_SIZE * 0.2
      );
    }
    chamber.endFill();

    // Hidden door effect
    chamber.lineStyle(1, 0x222222);
    chamber.drawRect(TILE_SIZE, TILE_SIZE * 0.5, TILE_SIZE, TILE_SIZE);

    chamber.x = x * TILE_SIZE;
    chamber.y = y * TILE_SIZE;
    container.addChild(chamber);
  };

  const createMerchantHut = (
    container: PIXI.Container,
    x: number,
    y: number
  ) => {
    // Simple merchant hut
    const hut = new PIXI.Graphics();

    // Wooden structure
    hut.beginFill(0x654321);
    hut.drawRect(0, 0, TILE_SIZE * 3, TILE_SIZE * 2);
    hut.endFill();

    // Roof
    hut.beginFill(0x4b3621);
    hut.moveTo(-TILE_SIZE * 0.5, 0);
    hut.lineTo(TILE_SIZE * 3.5, 0);
    hut.lineTo(TILE_SIZE * 1.5, -TILE_SIZE * 1.5);
    hut.closePath();
    hut.endFill();

    // Counter/table
    hut.beginFill(0x8b4513);
    hut.drawRect(
      TILE_SIZE * 2.7,
      TILE_SIZE * 0.8,
      TILE_SIZE * 1.2,
      TILE_SIZE * 0.4
    );
    hut.endFill();

    // Items on counter
    const items = new PIXI.Graphics();

    // Potion
    items.beginFill(0xcc0000);
    items.drawCircle(TILE_SIZE * 3.2, TILE_SIZE * 0.6, TILE_SIZE * 0.15);
    items.endFill();

    // Scroll
    items.beginFill(0xf0f0d0);
    items.drawRect(
      TILE_SIZE * 3.5,
      TILE_SIZE * 0.6,
      TILE_SIZE * 0.3,
      TILE_SIZE * 0.2
    );
    items.endFill();

    hut.x = x * TILE_SIZE;
    hut.y = y * TILE_SIZE;
    items.x = x * TILE_SIZE;
    items.y = y * TILE_SIZE;

    container.addChild(hut);
    container.addChild(items);
  };

  const createStoneSeating = (
    container: PIXI.Container,
    x: number,
    y: number
  ) => {
    // Create a stone for the crestfallen warrior to sit on
    const stone = new PIXI.Graphics();
    stone.beginFill(0x666666);
    stone.drawRect(0, 0, TILE_SIZE * 1.5, TILE_SIZE * 0.7);
    stone.endFill();

    stone.x = x * TILE_SIZE;
    stone.y = y * TILE_SIZE;
    container.addChild(stone);
  };

  const createSpellTrainerArea = (
    container: PIXI.Container,
    x: number,
    y: number
  ) => {
    // Spell trainer area with arcane circle
    const area = new PIXI.Graphics();

    // Small pedestal
    area.beginFill(0x444444);
    area.drawRect(0, 0, TILE_SIZE * 2, TILE_SIZE * 1);
    area.endFill();

    // Arcane circle
    area.lineStyle(2, 0x6666cc, 0.7);
    area.drawCircle(TILE_SIZE, -TILE_SIZE, TILE_SIZE * 1.5);

    // Runes around circle
    area.lineStyle(1, 0x6688ff, 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = TILE_SIZE + Math.cos(angle) * TILE_SIZE * 1.3;
      const y1 = -TILE_SIZE + Math.sin(angle) * TILE_SIZE * 1.3;
      area.drawRect(x1 - 3, y1 - 3, 6, 6);
    }

    // Magic effect
    const glow = new PIXI.Graphics();
    glow.beginFill(0x6666ff, 0.2);
    glow.drawCircle(TILE_SIZE, -TILE_SIZE, TILE_SIZE);
    glow.endFill();

    area.x = x * TILE_SIZE;
    area.y = y * TILE_SIZE;
    glow.x = x * TILE_SIZE;
    glow.y = y * TILE_SIZE;

    container.addChild(area);
    container.addChild(glow);
  };

  const createRuins = (container: PIXI.Container) => {
    // Add scattered ruins across the area
    const createRuin = (x: number, y: number, type: number) => {
      const ruin = new PIXI.Graphics();

      switch (type) {
        case 0: // Broken column
          ruin.beginFill(0x777777);
          ruin.drawRect(0, 0, TILE_SIZE * 0.8, TILE_SIZE * 1.2);
          ruin.endFill();
          break;
        case 1: // Wall segment
          ruin.beginFill(0x666666);
          ruin.drawRect(0, 0, TILE_SIZE * 2, TILE_SIZE * 0.8);
          ruin.endFill();
          break;
        case 2: // Broken arch
          ruin.beginFill(0x777777);
          ruin.drawRect(0, 0, TILE_SIZE * 0.6, TILE_SIZE * 2);
          ruin.drawRect(TILE_SIZE * 2, 0, TILE_SIZE * 0.6, TILE_SIZE * 2);
          ruin.drawRect(0, -TILE_SIZE * 0.5, TILE_SIZE * 2.6, TILE_SIZE * 0.5);
          ruin.endFill();
          break;
      }

      ruin.x = x * TILE_SIZE;
      ruin.y = y * TILE_SIZE;
      container.addChild(ruin);
    };

    // Place ruins around the sanctuary
    createRuin(-10, -8, 0);
    createRuin(12, 6, 0);
    createRuin(-12, 10, 1);
    createRuin(8, -10, 1);
    createRuin(-6, 12, 2);
    createRuin(10, -3, 0);
    createRuin(-9, -3, 1);
    createRuin(4, 9, 2);
  };

  // Create decorative elements
  const createDecorations = (container: PIXI.Container) => {
    // Add various decorations around the sanctuary

    // Dead trees
    const createDeadTree = (x: number, y: number, size: number = 1) => {
      const tree = new PIXI.Graphics();

      // Trunk
      tree.beginFill(0x3d3124);
      tree.drawRect(
        -TILE_SIZE * 0.15 * size,
        -TILE_SIZE * 0.3 * size,
        TILE_SIZE * 0.3 * size,
        TILE_SIZE * size
      );
      tree.endFill();

      // Branches
      tree.lineStyle(TILE_SIZE * 0.1 * size, 0x3d3124);

      // Branch 1
      tree.moveTo(0, -TILE_SIZE * 0.3 * size);
      tree.lineTo(TILE_SIZE * 0.5 * size, -TILE_SIZE * 0.7 * size);

      // Branch 2
      tree.moveTo(0, -TILE_SIZE * 0.5 * size);
      tree.lineTo(-TILE_SIZE * 0.6 * size, -TILE_SIZE * 0.8 * size);

      // Branch 3
      tree.moveTo(0, -TILE_SIZE * size);
      tree.lineTo(TILE_SIZE * 0.4 * size, -TILE_SIZE * 1.3 * size);

      tree.x = x * TILE_SIZE;
      tree.y = y * TILE_SIZE;
      container.addChild(tree);
    };

    // Scattered stones/rocks
    const createRock = (x: number, y: number, size: number = 1) => {
      const rock = new PIXI.Graphics();
      rock.beginFill(0x555555);

      // Irregular polygon for rock
      const points = [];
      const numPoints = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radius = TILE_SIZE * size * (0.2 + Math.random() * 0.2);
        points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }

      rock.drawPolygon(points);
      rock.endFill();

      rock.x = x * TILE_SIZE;
      rock.y = y * TILE_SIZE;
      container.addChild(rock);
    };

    // Scattered bones
    const createBones = (x: number, y: number) => {
      const bones = new PIXI.Graphics();
      bones.beginFill(0xdddddd);

      // Skull
      bones.drawCircle(0, 0, TILE_SIZE * 0.2);

      // Some scattered bones
      bones.drawRect(
        TILE_SIZE * 0.3,
        TILE_SIZE * 0.1,
        TILE_SIZE * 0.4,
        TILE_SIZE * 0.08
      );
      bones.drawRect(
        -TILE_SIZE * 0.1,
        TILE_SIZE * 0.3,
        TILE_SIZE * 0.3,
        TILE_SIZE * 0.07
      );

      bones.endFill();

      bones.x = x * TILE_SIZE;
      bones.y = y * TILE_SIZE;
      container.addChild(bones);
    };

    // Add decorations
    // Dead trees
    createDeadTree(-11, -9, 1.2);
    createDeadTree(9, 10, 1.5);
    createDeadTree(-7, 8, 1);
    createDeadTree(12, -7, 1.3);

    // Rocks
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * GRID_SIZE * 0.8;
      const y = (Math.random() - 0.5) * GRID_SIZE * 0.8;
      const size = 0.5 + Math.random() * 0.7;
      createRock(x, y, size);
    }

    // Bones
    createBones(-3, 8);
    createBones(6, -5);
    createBones(-8, -1);
    createBones(8, 7);
  };

  // Create NPCs
  const createNPCs = (container: PIXI.Container) => {
    // Create various Dark Souls NPCs

    // Blacksmith (Andre style)
    const createBlacksmith = (x: number, y: number) => {
      const npc = new PIXI.Graphics();

      // Body
      npc.beginFill(0x8b4513); // Brown
      npc.drawRect(
        -TILE_SIZE * 0.3,
        -TILE_SIZE * 0.8,
        TILE_SIZE * 0.6,
        TILE_SIZE * 0.6
      );
      npc.endFill();

      // Head
      npc.beginFill(0xe6be8a); // Skin tone
      npc.drawCircle(0, -TILE_SIZE * 0.9, TILE_SIZE * 0.2);
      npc.endFill();

      // Hair/beard
      npc.beginFill(0xc0c0c0); // Gray hair
      npc.drawCircle(0, -TILE_SIZE * 0.9, TILE_SIZE * 0.22);
      npc.endFill();

      // Face
      npc.beginFill(0xe6be8a);
      npc.drawCircle(0, -TILE_SIZE * 0.9, TILE_SIZE * 0.15);
      npc.endFill();

      // Arms
      npc.beginFill(0x8b4513);
      npc.drawRect(
        TILE_SIZE * 0.3,
        -TILE_SIZE * 0.7,
        TILE_SIZE * 0.3,
        TILE_SIZE * 0.3
      );
      npc.endFill();

      npc.x = x * TILE_SIZE;
      npc.y = y * TILE_SIZE;
      container.addChild(npc);
    };

    // Fire Keeper
    const createFireKeeper = (x: number, y: number) => {
      const npc = new PIXI.Graphics();

      // Robe
      npc.beginFill(0x333333); // Dark robe
      npc.drawRect(
        -TILE_SIZE * 0.25,
        -TILE_SIZE * 0.8,
        TILE_SIZE * 0.5,
        TILE_SIZE * 0.8
      );
      npc.endFill();

      // Head/hood
      npc.beginFill(0x444444);
      npc.drawCircle(0, -TILE_SIZE * 0.9, TILE_SIZE * 0.18);
      npc.endFill();

      // Mask
      npc.beginFill(0x222222);
      npc.drawRect(
        -TILE_SIZE * 0.1,
        -TILE_SIZE * 0.95,
        TILE_SIZE * 0.2,
        TILE_SIZE * 0.1
      );
      npc.endFill();

      npc.x = x * TILE_SIZE;
      npc.y = y * TILE_SIZE;
      container.addChild(npc);
    };

    // Crestfallen Warrior
    const createCrestfallenWarrior = (x: number, y: number) => {
      const npc = new PIXI.Graphics();

      // Body
      npc.beginFill(0x666666); // Armor
      npc.drawRect(
        -TILE_SIZE * 0.3,
        -TILE_SIZE * 0.7,
        TILE_SIZE * 0.6,
        TILE_SIZE * 0.6
      );
      npc.endFill();

      // Head
      npc.beginFill(0xe6be8a);
      npc.drawCircle(0, -TILE_SIZE * 0.8, TILE_SIZE * 0.15);
      npc.endFill();

      // Hunched posture
      npc.rotation = 0.2; // Slightly hunched forward

      npc.x = x * TILE_SIZE;
      npc.y = y * TILE_SIZE;
      container.addChild(npc);
    };

    // Spell Trainer / Sorcerer
    const createSpellTrainer = (x: number, y: number) => {
      const npc = new PIXI.Graphics();

      // Robe
      npc.beginFill(0x1a1a66); // Blue robe
      npc.drawRect(
        -TILE_SIZE * 0.25,
        -TILE_SIZE * 0.8,
        TILE_SIZE * 0.5,
        TILE_SIZE * 0.8
      );
      npc.endFill();

      // Head/hat
      npc.beginFill(0x1a1a66);
      npc.drawCircle(0, -TILE_SIZE * 0.9, TILE_SIZE * 0.18);
      npc.endFill();

      // Staff
      npc.lineStyle(2, 0x8b4513);
      npc.moveTo(TILE_SIZE * 0.3, -TILE_SIZE * 0.3);
      npc.lineTo(TILE_SIZE * 0.3, TILE_SIZE * 0.3);

      // Magic effect
      npc.beginFill(0x3333ff, 0.3);
      npc.drawCircle(TILE_SIZE * 0.3, -TILE_SIZE * 0.3, TILE_SIZE * 0.1);
      npc.endFill();

      npc.x = x * TILE_SIZE;
      npc.y = y * TILE_SIZE;
      container.addChild(npc);
    };

    // Merchant
    const createMerchant = (x: number, y: number) => {
      const npc = new PIXI.Graphics();

      // Body/cloak
      npc.beginFill(0x8b0000); // Dark red
      npc.drawRect(
        -TILE_SIZE * 0.3,
        -TILE_SIZE * 0.7,
        TILE_SIZE * 0.6,
        TILE_SIZE * 0.7
      );
      npc.endFill();

      // Head/hood
      npc.beginFill(0x8b0000);
      npc.drawCircle(0, -TILE_SIZE * 0.8, TILE_SIZE * 0.18);
      npc.endFill();

      // Face shadow
      npc.beginFill(0x000000, 0.5);
      npc.drawCircle(0, -TILE_SIZE * 0.8, TILE_SIZE * 0.1);
      npc.endFill();

      npc.x = x * TILE_SIZE;
      npc.y = y * TILE_SIZE;
      container.addChild(npc);
    };

    // Place NPCs
    createBlacksmith(-7, 4); // Near the forge
    createFireKeeper(3, -2); // Near firekeeper chamber
    createCrestfallenWarrior(2, 1.5); // Sitting on the stone
    createSpellTrainer(-5, -6); // At the spell area
    createMerchant(8, 4); // At the merchant hut
  };

  // Setup camera controls with zoom support
  const setupCamera = (container: PIXI.Container) => {
    let isDragging = false;
    let lastPosition = { x: 0, y: 0 };
    let startPosition = { x: 0, y: 0 };
    let currentScale = 1;

    // Set initial position and zoom
    container.scale.set(currentScale);

    // Mouse down event
    const onDown = (event: PIXI.FederatedPointerEvent) => {
      isDragging = true;
      lastPosition = { x: event.clientX, y: event.clientY };
      startPosition = { x: container.x, y: container.y };
    };

    // Mouse move event
    const onMove = (event: PIXI.FederatedPointerEvent) => {
      if (!isDragging) return;

      const dx = event.clientX - lastPosition.x;
      const dy = event.clientY - lastPosition.y;

      container.x = startPosition.x + dx;
      container.y = startPosition.y + dy;
    };

    // Mouse up event
    const onUp = () => {
      isDragging = false;
    };

    // Wheel event for zooming
    const onWheel = (event: WheelEvent) => {
      // Prevent default scrolling behavior
      event.preventDefault();

      // Calculate new scale based on wheel delta
      const zoomIntensity = 0.1;
      const delta = -Math.sign(event.deltaY) * zoomIntensity;
      const newScale = Math.max(0.5, Math.min(2, currentScale + delta));

      // Get mouse position
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Calculate world position of mouse before scaling
      const worldPos = {
        x: (mouseX - container.x) / currentScale,
        y: (mouseY - container.y) / currentScale,
      };

      // Update scale
      currentScale = newScale;
      container.scale.set(currentScale);

      // Update position to zoom towards mouse position
      container.x = mouseX - worldPos.x * currentScale;
      container.y = mouseY - worldPos.y * currentScale;
    };

    // Attach events to the app stage
    if (appRef.current) {
      // Setup interaction events
      appRef.current.stage.eventMode = "static";
      appRef.current.stage.addEventListener("pointerdown", onDown);
      appRef.current.stage.addEventListener("pointermove", onMove);
      appRef.current.stage.addEventListener("pointerup", onUp);
      appRef.current.stage.addEventListener("pointerupoutside", onUp);

      // Add wheel event for zooming
      if (containerRef.current) {
        containerRef.current.addEventListener("wheel", onWheel);
      }
    }

    // Return cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("wheel", onWheel);
      }
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        overflow: "hidden",
      }}
    />
  );
}
