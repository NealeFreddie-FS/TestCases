"use client";

import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { CharacterInfo } from "../ProphecyEngine";
import { GameMode } from "../GameContainer";
import { PlayerCharacter } from "./entities/PlayerCharacter";
import { World } from "./World";
import { DialogManager } from "./managers/DialogManager";
import { CombatManager } from "./managers/CombatManager";
import { InventoryManager } from "./managers/InventoryManager";
import { QuestManager } from "./managers/QuestManager";
import { ShopManager } from "./managers/ShopManager";
import { InputManager } from "./managers/InputManager";
import { IntroManager } from "./managers/IntroManager";
import { TimeManager } from "./managers/TimeManager";
import { SoundManager } from "./managers/SoundManager";
import { PerformanceManager } from "./managers/PerformanceManager";
import { AssetManager } from "./managers/AssetManager";

// Define the loading progress callback type
type LoadingProgressCallback = (progress: number, message: string) => void;

export interface GameState {
  health: number;
  mana: number;
  gold: number;
  experience: number;
  level: number;
  inventory: string[];
  quests: string[];
  currentLocation: string;
  currentTimeInfo?: string;
  fps?: number; // Add FPS to the game state
  currentEnemy?: {
    name: string;
    type: string;
    level: number;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    experience: number;
    gold: number;
  };
  // Add loading state to game state
  loading: boolean;
  loadingProgress: number;
  loadingMessage: string;
}

type GameCallbacks = {
  onGameModeChange: (mode: GameMode) => void;
  onGameStateChange: (state: Partial<GameState>) => void;
};

export class GameEngine {
  app: any;
  viewport: Viewport | PIXI.Container;
  character: CharacterInfo;
  player: PlayerCharacter | null = null;
  world: World | null = null;
  currentMode: GameMode = "exploration";
  gameState: GameState;
  callbacks: GameCallbacks;
  private boundUpdateMethod: (ticker: any) => void;
  rendererInitialized: boolean = false;
  private frameCount: number = 0;
  assetManager: AssetManager;
  assetsLoaded: boolean = false;

  // Initialize managers with default values
  dialogManager!: DialogManager;
  combatManager!: CombatManager;
  inventoryManager!: InventoryManager;
  questManager!: QuestManager;
  shopManager!: ShopManager;
  inputManager!: InputManager;
  introManager!: IntroManager;
  timeManager!: TimeManager;
  soundManager!: SoundManager;
  performanceManager!: PerformanceManager;

  constructor(app: any, character: CharacterInfo, callbacks: GameCallbacks) {
    this.app = app;
    this.character = character;
    this.callbacks = callbacks;
    this.boundUpdateMethod = this.update.bind(this);

    console.log("GameEngine constructor called with app:", !!app);

    // Initialize game state with loading state
    this.gameState = {
      health: 100,
      mana: 50,
      gold: 100,
      experience: 0,
      level: 1,
      inventory: [
        // Add starter Zelda-style items for testing
        "iron_sword",
        "health_potion",
        "health_potion",
        "bomb",
        "bow",
        "key",
        "map",
      ],
      quests: [],
      currentLocation: "Approaching Crossroads", // Starting location
      // Loading state
      loading: true,
      loadingProgress: 0,
      loadingMessage: "Initializing...",
    };

    // Create a placeholder for viewport to avoid null references
    this.viewport = new PIXI.Container();

    // Initialize asset manager first
    this.assetManager = new AssetManager(this);

    // Make asset manager globally accessible for components that need it
    if (typeof window !== "undefined") {
      (window as any).gameAssetManager = this.assetManager;
    }

    // Initialize managers safely
    try {
      this.dialogManager = new DialogManager(this);
      this.combatManager = new CombatManager(this);
      this.inventoryManager = new InventoryManager(this);
      this.questManager = new QuestManager(this);
      this.shopManager = new ShopManager(this);
      this.inputManager = new InputManager(this);
      this.introManager = new IntroManager(this);
      this.timeManager = new TimeManager(this);
      this.soundManager = new SoundManager(this);
      this.performanceManager = new PerformanceManager(this);
      console.log("Game managers initialized");
    } catch (error) {
      console.error("Failed to initialize managers:", error);
    }
  }

  async init() {
    try {
      console.log("Initializing game engine");

      // Initialize PIXI.js if not done yet
      if (!this.app) {
        console.error("PIXI app not initialized");
        return;
      }

      try {
        // Set up loading state
        this.updateGameState({
          loading: true,
          loadingProgress: 0,
          loadingMessage: "Loading game assets...",
        });

        // Preload all assets before proceeding
        await this.preloadAssets();

        // Only continue if assets loaded successfully
        if (!this.assetsLoaded) {
          console.error("Failed to load assets, cannot initialize game");
          this.updateGameState({
            loadingMessage:
              "Failed to load game assets. Please refresh the page.",
          });
          return;
        }

        // Set maximum FPS (60fps target)
        this.app.ticker.maxFPS = 60;
        // Use a consistent delta time step for smoother animations
        this.app.ticker.autoStart = false;
        this.app.ticker.stop();
        this.app.ticker.start();
        console.log("Set ticker maxFPS to 60");

        // Initialize viewport for camera control
        const viewportOptions = {
          screenWidth: this.app.screen.width,
          screenHeight: this.app.screen.height,
          worldWidth: 1600, // Larger than the actual map (40 tiles x 32px = 1280px)
          worldHeight: 1600,
        };

        // Create viewport either using pixi-viewport or a simple container
        try {
          if (typeof Viewport !== "undefined") {
            console.log("Creating Viewport for camera control");
            this.viewport = new Viewport({
              screenWidth: viewportOptions.screenWidth,
              screenHeight: viewportOptions.screenHeight,
              worldWidth: viewportOptions.worldWidth,
              worldHeight: viewportOptions.worldHeight,
              events: this.app.renderer.events,
            });
            // Configure viewport plugins
            (this.viewport as Viewport).drag().pinch().wheel().decelerate();
          } else {
            // Fallback to basic container if Viewport is not available
            console.log(
              "Using basic container as viewport (no camera controls)"
            );
            this.viewport = new PIXI.Container();
          }
        } catch (error) {
          console.error(
            "Error creating viewport, falling back to basic container:",
            error
          );
          this.viewport = new PIXI.Container();
        }

        // Ensure the viewport is set up properly
        this.viewport.position.set(0, 0);
        this.viewport.sortableChildren = true; // Enable z-index sorting

        // Add viewport to stage
        this.app.stage.addChild(this.viewport);
        console.log("Viewport added to stage");

        // Update loading progress
        this.updateGameState({
          loadingProgress: 40,
          loadingMessage: "Initializing game world...",
        });

        // Initialize managers
        this.initializeManagers();

        // Create the world
        console.log("Creating game world");
        this.world = new World(this);

        // Disable lighting effects before initializing world
        this.world.disableLighting = true;

        // Update loading progress
        this.updateGameState({
          loadingProgress: 60,
          loadingMessage: "Building the world...",
        });

        await this.world.init();

        // Ensure world container is added to stage/viewport
        if (this.world && this.world.container) {
          console.log("Adding world container to viewport");

          if (this.viewport instanceof PIXI.Container) {
            this.viewport.addChild(this.world.container);

            // Ensure the world container is visible
            this.world.container.visible = true;
            this.world.container.alpha = 1.0;

            // Set up the world container to use sortableChildren
            this.world.container.sortableChildren = true;

            console.log("World container added to viewport");
            console.log(
              "Viewport children count:",
              this.viewport.children.length
            );
          } else {
            console.error("Viewport is not a PIXI.Container");
          }
        } else {
          console.error("World or world container not available");
        }

        // Update loading progress
        this.updateGameState({
          loadingProgress: 80,
          loadingMessage: "Creating player character...",
        });

        // Create the player
        console.log("Creating player character");
        await this.createPlayer();

        // Add renderer to DOM if needed
        if (typeof window !== "undefined") {
          // Set rendererInitialized flag
          this.rendererInitialized = true;

          // Add the PIXI ticker for game loop
          this.app.ticker.add(this.boundUpdateMethod);
        }

        // Update loading progress - complete
        this.updateGameState({
          loading: false,
          loadingProgress: 100,
          loadingMessage: "Game loaded successfully!",
          health: 100,
          mana: 50,
          gold: 100,
          experience: 0,
          level: 1,
          currentLocation: this.world ? "Crossroads" : "Unknown",
        });

        console.log("Game engine initialized successfully");
      } catch (error) {
        console.error("Error initializing game components:", error);
        // Update loading state with error
        this.updateGameState({
          loadingMessage: `Error: ${error}. Please refresh the page.`,
        });
      }
    } catch (error) {
      console.error("Error in game engine initialization:", error);
      // Update loading state with error
      this.updateGameState({
        loadingMessage: `Fatal error: ${error}. Please refresh the page.`,
      });
    }
  }

  /**
   * Preload all game assets before starting
   */
  private async preloadAssets(): Promise<void> {
    try {
      // Use the asset manager to preload all assets
      const success = await this.assetManager.preloadAssets((progressData) => {
        // Update loading state based on asset loading progress
        this.updateGameState({
          loadingProgress: progressData.progress,
          loadingMessage: progressData.message,
        });
      });

      this.assetsLoaded = success;

      if (success) {
        console.log("Assets successfully loaded");
      } else {
        console.error("Asset loading failed");
      }
    } catch (error) {
      console.error("Error in asset preloading:", error);
      this.assetsLoaded = false;
    }
  }

  // Initialize all game managers
  private initializeManagers() {
    try {
      console.log("Initializing game managers");

      // Performance manager should be first to track everything
      this.performanceManager = new PerformanceManager(this);

      // Initialize other managers
      this.dialogManager = new DialogManager(this);
      this.combatManager = new CombatManager(this);
      this.inventoryManager = new InventoryManager(this);
      this.questManager = new QuestManager(this);
      this.shopManager = new ShopManager(this);
      this.inputManager = new InputManager(this);
      this.introManager = new IntroManager(this);
      this.timeManager = new TimeManager(this);
      this.soundManager = new SoundManager(this);

      // Initialize managers that need it
      this.timeManager.init();

      console.log("Game managers initialized");
    } catch (error) {
      console.error("Error initializing game managers:", error);
    }
  }

  async createPlayer() {
    console.log("Creating player character");

    // Create player character based on character class
    this.player = new PlayerCharacter(this.character);
    await this.player.init();

    if (this.world && this.player.sprite) {
      console.log("Player created, adding to world");

      // Set initial position to center of map
      this.player.sprite.x = 400;
      this.player.sprite.y = 400;

      // Ensure player has proper size and is visible
      this.player.sprite.width = 32;
      this.player.sprite.height = 32;
      this.player.sprite.visible = true;
      this.player.sprite.alpha = 1;

      // Add player to world
      this.world.addEntity(this.player);

      console.log(
        "Player added to world at position:",
        this.player.sprite.x,
        this.player.sprite.y
      );

      // Center viewport on player sprite coordinates
      if (this.viewport instanceof Viewport) {
        // In PixiJS v8, manually set the viewport center
        this.viewport.moveCenter(this.player.sprite.x, this.player.sprite.y);
        console.log("Viewport moved to player position");
      }
    } else {
      console.error("Failed to create player or world not initialized");
    }
  }

  update(ticker: any) {
    try {
      // Start performance monitoring
      const startTime = performance.now();

      // Update time
      const delta = ticker.deltaTime;

      // Update performance metrics first
      if (this.performanceManager) {
        this.performanceManager.update();

        // Update FPS in game state (not too frequently to avoid UI flashing)
        if (this.frameCount % 10 === 0) {
          this.updateGameState({
            fps: this.performanceManager.getFps(),
          });
        }
      }

      // Handle player input and movement first
      if (this.player && this.inputManager) {
        const { x, y } = this.inputManager.getDirectionalInput();

        // Move the player if there's input
        if (x !== 0 || y !== 0) {
          this.player.move(x, y);

          // Update player direction based on movement
          if (y < 0) this.player.direction = "up";
          else if (y > 0) this.player.direction = "down";
          else if (x < 0) this.player.direction = "left";
          else if (x > 0) this.player.direction = "right";
        } else if (
          this.player.animationState !== "idle" &&
          !this.player.isAttacking
        ) {
          // Set to idle if not moving and not attacking
          this.player.animationState = "idle";
        }

        // Update player
        this.player.update(delta);

        // Update camera to follow player with the appropriate viewport type
        if (this.player.sprite) {
          if (this.viewport instanceof Viewport) {
            // Use viewport's built-in follow method
            this.viewport.follow(this.player.sprite, {
              speed: 5 * delta,
              acceleration: 0.5,
            });
          } else {
            // For basic container, manually center on player
            // Center the view on the player by moving the world in the opposite direction
            this.viewport.pivot.x = this.player.sprite.x;
            this.viewport.pivot.y = this.player.sprite.y;

            // Adjust for screen size to center
            if (this.app && this.app.renderer) {
              this.viewport.position.x = this.app.renderer.width / 2;
              this.viewport.position.y = this.app.renderer.height / 2;
            }
          }
        }
      }

      // Update game world after player
      if (this.world) {
        this.world.update(delta);
      }

      // Make sure we track frames for FPS throttling
      this.frameCount++;

      // Measure frame time
      const frameTime = performance.now() - startTime;
      if (frameTime > 16.67) {
        // More than target for 60fps (16.67ms)
        console.debug(`Long frame: ${frameTime.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error("Error in game loop:", error);
    }
  }

  updateExploration(delta: number) {
    if (!this.player || !this.inputManager) return;

    // Use Zelda-style directional input
    const { x, y } = this.inputManager.getDirectionalInput();

    // Move the player with Zelda-style controls (only one direction at a time)
    if (x !== 0 || y !== 0) {
      this.player.move(x, y);

      // Set direction based on movement
      if (y < 0) this.player.direction = "up";
      else if (y > 0) this.player.direction = "down";
      else if (x < 0) this.player.direction = "left";
      else if (x > 0) this.player.direction = "right";
    } else {
      // When not moving, set to idle animation
      if (this.player.animationState !== "idle" && !this.player.isAttacking) {
        this.player.animationState = "idle";
      }
    }

    // Center the viewport on the player
    if (this.viewport instanceof Viewport) {
      this.viewport.follow(this.player.sprite);
    }
  }

  setGameMode(mode: GameMode) {
    this.currentMode = mode;
    this.callbacks.onGameModeChange(mode);

    // Play appropriate music for the game mode
    try {
      this.soundManager.setMusicForGameMode(mode);
    } catch (e) {
      console.error("Error changing game mode music:", e);
    }

    // Handle mode-specific initialization
    switch (mode) {
      case "combat":
        this.combatManager.startCombat();
        break;
      case "dialog":
        // Dialog is handled externally
        break;
      case "shop":
        this.shopManager.openShop();
        break;
      case "inventory":
        this.inventoryManager.openInventory();
        break;
    }
  }

  updateGameState(newState: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...newState };
    this.callbacks.onGameStateChange(newState);
  }

  handleAction(action: string, data?: any) {
    if (!this.player) {
      console.warn("No player found when handling action:", action);
      return;
    }

    console.log("Handling action:", action, data);

    switch (action) {
      case "move":
        // Existing code...
        break;

      case "lightAttack":
        if (this.currentMode === "exploration") {
          this.player.lightAttack(data?.mouseX, data?.mouseY);
        }
        break;

      case "block":
        if (this.currentMode === "exploration") {
          this.player.startBlocking();
        }
        break;

      case "stopBlock":
        if (this.currentMode === "exploration") {
          this.player.stopBlocking();
        }
        break;

      case "attack":
        // Existing code...
        console.log(
          "Attacking with sword in direction:",
          this.player.direction
        );
        this.player.attack();

        // Check for enemy hits with the sword
        if (this.player.isAttacking && this.player.swordHitbox) {
          // Wait a slight delay before checking hits (matches animation timing)
          setTimeout(() => this.checkSwordHits(), 150);
        }
        break;

      case "interact":
        // Get closest interactable in the direction the player is facing
        const interactables = this.world?.getInteractableObjects?.() || [];
        let closestInteractable = null;
        let shortestDistance = Infinity;

        for (const interactable of interactables) {
          if (!interactable.sprite) continue;

          if (this.isObjectInFrontOfPlayer(interactable)) {
            const dx = interactable.sprite.x - this.player.sprite.x;
            const dy = interactable.sprite.y - this.player.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if this is within interaction range (64 pixels)
            if (distance < 64 && distance < shortestDistance) {
              closestInteractable = interactable;
              shortestDistance = distance;
            }
          }
        }

        // Handle the interaction if found
        if (closestInteractable) {
          console.log("Interacting with", closestInteractable.id);

          if (closestInteractable.type === "npc") {
            this.setGameMode("dialog");
            // Start dialog with the NPC
            this.dialogManager.startDialog(closestInteractable.id);
          } else if (closestInteractable.type === "chest") {
            // Open the chest
            const chestData = this.world?.openChest?.(closestInteractable.id);
            // Type safety: Check if chestData exists and has an item property
            if (
              chestData &&
              typeof chestData === "object" &&
              "item" in chestData
            ) {
              // Use type assertion to avoid TypeScript errors
              const itemId = (chestData as { item: string }).item;
              this.inventoryManager.addItem(itemId);
              console.log(`Added ${itemId} to inventory`);
            }
          } else if (closestInteractable.type === "shop") {
            this.setGameMode("shop");
            this.shopManager.openShop();
          }
        }
        break;

      case "toggleInventory":
        // Toggle between inventory and exploration modes
        console.log("Toggling inventory");
        if (this.currentMode === "inventory") {
          this.inventoryManager.closeInventory();
        } else {
          this.inventoryManager.openInventory();
        }
        break;

      case "togglePause":
        // Toggle pause menu
        console.log("Toggling pause menu");
        // Implement pause menu functionality here
        break;

      case "useItem":
        if (data && typeof data === "string") {
          console.log("Using item:", data);
          this.inventoryManager.useItem(data);
        }
        break;

      case "dropItem":
        if (data && typeof data === "string") {
          console.log("Dropping item:", data);
          this.inventoryManager.dropItem(data);
        }
        break;
    }
  }

  // Helper method to check if an object is in front of the player based on their facing direction
  isObjectInFrontOfPlayer(object: any): boolean {
    if (!this.player) return false;

    const dx = object.position.x - this.player.sprite.x;
    const dy = object.position.y - this.player.sprite.y;

    switch (this.player.direction) {
      case "up":
        return dy < 0 && Math.abs(dy) > Math.abs(dx);
      case "down":
        return dy > 0 && Math.abs(dy) > Math.abs(dx);
      case "left":
        return dx < 0 && Math.abs(dx) > Math.abs(dy);
      case "right":
        return dx > 0 && Math.abs(dx) > Math.abs(dy);
      default:
        return false;
    }
  }

  // Add a method to check for sword hits against enemies
  checkSwordHits() {
    if (!this.player || !this.player.swordHitbox || !this.world) return;

    // Debug information
    console.log("Checking sword hits");

    // Safely get enemies, handling potential undefined
    const enemies = this.world.getEnemies ? this.world.getEnemies() : [];
    console.log("Enemies found:", enemies.length);

    if (!enemies || enemies.length === 0) return;

    // Create a sword hitbox in world coordinates based on player direction
    const swordRange = 24; // Range of the sword from player center
    let swordX = this.player.sprite.x;
    let swordY = this.player.sprite.y;
    let swordWidth = 16;
    let swordHeight = 16;

    // Adjust sword position based on player direction
    switch (this.player.direction) {
      case "up":
        swordY -= swordRange;
        swordWidth = 24;
        swordHeight = 16;
        break;
      case "down":
        swordY += swordRange;
        swordWidth = 24;
        swordHeight = 16;
        break;
      case "left":
        swordX -= swordRange;
        swordWidth = 16;
        swordHeight = 24;
        break;
      case "right":
        swordX += swordRange;
        swordWidth = 16;
        swordHeight = 24;
        break;
    }

    // Create a simple AABB hitbox
    const swordHitbox = {
      x: swordX - swordWidth / 2,
      y: swordY - swordHeight / 2,
      width: swordWidth,
      height: swordHeight,
    };

    // Check each enemy for collision with the sword
    for (const enemy of enemies) {
      // Skip if enemy doesn't have a sprite or takeDamage method
      if (!enemy || !enemy.sprite || typeof enemy.takeDamage !== "function")
        continue;

      // Simple AABB collision check
      const enemyHitbox = {
        x: enemy.sprite.x - 8,
        y: enemy.sprite.y - 8,
        width: 16,
        height: 16,
      };

      if (
        swordHitbox.x < enemyHitbox.x + enemyHitbox.width &&
        swordHitbox.x + swordHitbox.width > enemyHitbox.x &&
        swordHitbox.y < enemyHitbox.y + enemyHitbox.height &&
        swordHitbox.y + swordHitbox.height > enemyHitbox.y
      ) {
        // Enemy hit! Apply damage
        console.log("Enemy hit!");
        enemy.takeDamage(1);
      }
    }
  }

  resize(width: number, height: number) {
    try {
      // Resize the application renderer
      if (this.app && this.app.renderer) {
        this.app.renderer.resize(width, height);
      }

      // Update viewport dimensions
      if (this.viewport instanceof Viewport) {
        this.viewport.resize(width, height);
      }
    } catch (error) {
      console.error("Error during resize:", error);
    }
  }

  destroy() {
    console.log("GameEngine destroy called");
    try {
      // First try to remove the ticker update
      try {
        if (this.app && this.app.ticker && this.app.ticker.remove) {
          this.app.ticker.remove(this.boundUpdateMethod);
          console.log("Removed ticker update");
        }
      } catch (e) {
        console.warn("Error removing ticker update:", e);
      }

      // Try to destroy the input manager
      try {
        if (this.inputManager && this.inputManager.destroy) {
          this.inputManager.destroy();
          console.log("Input manager destroyed");
        }
      } catch (e) {
        console.warn("Error destroying input manager:", e);
      }

      // Try to clean up the stage
      try {
        if (this.app && this.app.stage) {
          if (this.viewport) {
            this.app.stage.removeChild(this.viewport);
          }
          console.log("Viewport removed from stage");
        }
      } catch (e) {
        console.warn("Error cleaning up stage:", e);
      }

      // Clean up the sound manager
      try {
        if (this.soundManager) {
          this.soundManager.destroy();
          console.log("Sound manager destroyed");
        }
      } catch (e) {
        console.warn("Error destroying sound manager:", e);
      }

      // Clean up the time manager
      this.timeManager.destroy();

      console.log("GameEngine destroy completed");
    } catch (error) {
      console.error("Error in game engine cleanup:", error);
    }
  }

  // Add a method to handle region-specific logic
  updateRegionLogic() {
    if (!this.player || !this.world) return;

    // Handle different locations
    const location = this.gameState.currentLocation;

    switch (location) {
      case "Castle Approach":
        // Add castle-specific logic
        // Example: royal guards, castle gates, etc.
        break;

      case "Village Outskirts":
        // Add village-specific logic
        // Example: villagers, market stalls, etc.
        break;

      case "Coastal Path":
        // Add coastal-specific logic
        // Example: waves, seagulls, fishing boats, etc.
        break;

      case "Forest Edge":
        // Add forest-specific logic
        // Example: rustling leaves, wildlife, etc.
        break;

      case "Crossroads":
        // Central area logic
        break;
    }
  }

  // Toggle performance settings
  togglePerformanceMode(highPerformance: boolean = true) {
    console.log(
      `Setting performance mode: ${highPerformance ? "High" : "Quality"}`
    );

    if (this.world) {
      // Update world settings
      this.world.disableLighting = highPerformance;
      this.world.reduceParticles = highPerformance;

      // Always enable terrain culling for performance (culling is an optimization)
      this.world.toggleCulling(true);

      // Log the change
      console.log(
        `Updated world settings - Lighting disabled: ${this.world.disableLighting}, Particles reduced: ${this.world.reduceParticles}, Terrain culling: ${this.world.cullingEnabled}`
      );
    }

    // Update ticker settings
    if (this.app && this.app.ticker) {
      // High performance mode = higher FPS target
      this.app.ticker.maxFPS = highPerformance ? 60 : 30;
      console.log(`Set ticker maxFPS to ${this.app.ticker.maxFPS}`);
    }

    return highPerformance;
  }

  // Toggle specific performance settings
  toggleTerrainCulling(enabled: boolean = true) {
    if (this.world) {
      return this.world.toggleCulling(enabled);
    }
    return false;
  }
}
