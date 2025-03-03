"use client";

import * as PIXI from "pixi.js";
import { GameEngine } from "../GameEngine";

export class IntroManager {
  engine: GameEngine;
  introContainer: PIXI.Container;
  introState: "carriage" | "text" | "player_control" | "completed";
  textOverlay: PIXI.Container;
  carriageSprite: PIXI.Sprite | null = null;
  playerPlaceholder: PIXI.Sprite | null = null;
  introTimer: number = 0;
  introCompleted: boolean = false;
  dialogueLines: string[] = [
    "The carriage comes to a halt at the crossroads.",
    '"This is where your journey begins," says the driver.',
    '"From here, your path is your own to choose."',
    "Choose your destiny...",
  ];
  currentDialogueLine: number = 0;
  dialogueText: PIXI.Text | null = null;
  signposts: PIXI.Container | null = null;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.introContainer = new PIXI.Container();
    this.introState = "carriage";
    this.textOverlay = new PIXI.Container();
    this.setupIntroSequence();
  }

  setupIntroSequence() {
    // Create the intro container
    this.introContainer.visible = true;

    // Create text overlay for dialogue
    this.setupTextOverlay();

    // Create the carriage sprite
    this.createCarriageSprite();

    // Create signposts
    this.createSignposts();
  }

  createCarriageSprite() {
    // Create a simple carriage using graphics
    const carriageGraphics = new PIXI.Graphics();

    try {
      // Carriage body
      carriageGraphics.fill({ color: 0x8b4513 }); // Brown
      carriageGraphics.rect(-40, -20, 80, 40);

      // Wheels
      carriageGraphics.fill({ color: 0x4b2810 }); // Darker brown
      carriageGraphics.circle(-25, 25, 15);
      carriageGraphics.circle(25, 25, 15);

      // Carriage top
      carriageGraphics.fill({ color: 0x654321 }); // Medium brown
      carriageGraphics.rect(-35, -35, 70, 15);

      // Horse - simple shape
      carriageGraphics.fill({ color: 0x8b4513 }); // Brown
      carriageGraphics.rect(-70, -15, 30, 30);
      carriageGraphics.rect(-80, -20, 10, 10); // Horse head

      // Create a texture from the graphics - safely access renderer
      if (this.engine.app?.renderer) {
        try {
          const texture =
            this.engine.app.renderer.generateTexture(carriageGraphics);
          this.carriageSprite = new PIXI.Sprite(texture);
          this.carriageSprite.anchor.set(0.5);
          this.carriageSprite.position.set(200, 300); // Start position off-screen

          this.introContainer.addChild(this.carriageSprite);
        } catch (textureError) {
          console.warn("Failed to generate carriage texture:", textureError);
          // Fallback: Create a simple rectangle sprite
          this.createFallbackCarriageSprite();
        }
      } else {
        // Fallback if renderer is not available
        console.warn("Renderer not available, using fallback carriage sprite");
        this.createFallbackCarriageSprite();
      }
    } catch (graphicsError) {
      console.warn("Error creating carriage graphics:", graphicsError);
      this.createFallbackCarriageSprite();
    }
  }

  // Fallback method for carriage sprite creation
  createFallbackCarriageSprite() {
    // Create a very simple rectangle as fallback
    const fallbackGraphics = new PIXI.Graphics();
    fallbackGraphics.fill({ color: 0x8b4513 }); // Brown
    fallbackGraphics.rect(-30, -15, 60, 30);

    try {
      // Use a basic texture if possible
      const basicTexture = PIXI.Texture.WHITE;
      this.carriageSprite = new PIXI.Sprite(basicTexture);
      this.carriageSprite.tint = 0x8b4513; // Brown
      this.carriageSprite.width = 60;
      this.carriageSprite.height = 30;
      this.carriageSprite.anchor.set(0.5);
      this.carriageSprite.position.set(200, 300);
      this.introContainer.addChild(this.carriageSprite);
    } catch (error) {
      console.error("Failed to create fallback carriage sprite:", error);
    }
  }

  createSignposts() {
    this.signposts = new PIXI.Container();

    // Center position where the crossroads meet
    const centerX = 400;
    const centerY = 400;

    // Create the crossroads visual
    const crossroads = new PIXI.Graphics();

    // Main roads (horizontal and vertical)
    crossroads.fill({ color: 0xd2b48c }); // Tan/sand color for dirt road
    crossroads.rect(centerX - 200, centerY - 20, 400, 40); // Horizontal road
    crossroads.rect(centerX - 20, centerY - 200, 40, 400); // Vertical road

    // Circular center area
    crossroads.fill({ color: 0xdeb887 }); // Slightly lighter color for center
    crossroads.circle(centerX, centerY, 40);

    this.signposts.addChild(crossroads);

    // Create signposts for each direction
    this.createSignpost(centerX, centerY - 80, "North", "The Castle");
    this.createSignpost(centerX + 80, centerY, "East", "The Village");
    this.createSignpost(centerX, centerY + 80, "South", "The Sea");
    this.createSignpost(centerX - 80, centerY, "West", "The Forest");

    // Add the signposts container but make it initially invisible
    this.signposts.visible = false;
    this.introContainer.addChild(this.signposts);
  }

  createSignpost(
    x: number,
    y: number,
    direction: string,
    locationName: string
  ) {
    const signpost = new PIXI.Container();

    // Create the post
    const post = new PIXI.Graphics();
    post.fill({ color: 0x8b4513 }); // Brown
    post.rect(-5, -5, 10, 40);

    // Create the sign
    const sign = new PIXI.Graphics();
    sign.fill({ color: 0xdeb887 }); // Tan
    sign.rect(-40, -30, 80, 30);
    sign.y = -25;

    // Add text to the sign
    const directionText = new PIXI.Text(direction, {
      fontFamily: "Arial",
      fontSize: 10,
      fill: 0x000000,
      align: "center",
    });
    directionText.anchor.set(0.5);
    directionText.y = -25;

    const locationText = new PIXI.Text(locationName, {
      fontFamily: "Arial",
      fontSize: 8,
      fill: 0x000000,
      align: "center",
    });
    locationText.anchor.set(0.5);
    locationText.y = -10;

    // Add all elements to the signpost container
    signpost.addChild(post);
    signpost.addChild(sign);
    signpost.addChild(directionText);
    signpost.addChild(locationText);

    // Position the signpost
    signpost.position.set(x, y);

    // Add to signposts container - with null check
    if (this.signposts) {
      this.signposts.addChild(signpost);
    }
  }

  setupTextOverlay() {
    // Semi-transparent background for text
    const background = new PIXI.Graphics();
    background.fill({ color: 0x000000, alpha: 0.7 });

    // Make sure we can access app screen dimensions safely
    const screenWidth = this.engine.app?.screen?.width || 800;
    const screenHeight = this.engine.app?.screen?.height || 600;

    background.rect(0, screenHeight - 150, screenWidth, 150);
    this.textOverlay.addChild(background);

    // Text for dialogue
    this.dialogueText = new PIXI.Text("", {
      fontFamily: "Arial",
      fontSize: 20,
      fill: 0xffffff,
      align: "center",
      wordWrap: true,
      wordWrapWidth: screenWidth - 100,
    });
    this.dialogueText.position.set(50, screenHeight - 120);
    this.textOverlay.addChild(this.dialogueText);

    // Prompt text (press space to continue)
    const promptText = new PIXI.Text("Press SPACE to continue", {
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0xcccccc,
      align: "right",
    });
    promptText.position.set(screenWidth - 150, screenHeight - 40);
    this.textOverlay.addChild(promptText);

    // Add text overlay to intro container
    this.textOverlay.visible = false;
    this.introContainer.addChild(this.textOverlay);
  }

  start() {
    // Add container to the world
    if (this.engine.world) {
      this.engine.world.container.addChild(this.introContainer);
    }

    // Start in carriage state
    this.introState = "carriage";
    this.introTimer = 0;
    this.currentDialogueLine = 0;

    // Disable player control during intro
    if (this.engine.player) {
      this.engine.player.canInteract = false;
    }

    // Setup input listener for dialogue advancement
    window.addEventListener("keydown", this.handleKeyPress);
  }

  handleKeyPress = (event: KeyboardEvent) => {
    // Only handle space key and only during the text phase
    if (event.code === "Space" && this.introState === "text") {
      this.advanceDialogue();
    }
  };

  advanceDialogue() {
    this.currentDialogueLine++;

    if (this.currentDialogueLine >= this.dialogueLines.length) {
      // All dialogue completed, show signposts and allow player control
      this.introState = "player_control";
      if (this.dialogueText) {
        this.dialogueText.text = "Choose a direction to begin your journey...";
      }
      if (this.signposts) {
        this.signposts.visible = true;
      }

      // Enable player control
      if (this.engine.player) {
        this.engine.player.canInteract = true;
      }

      // Update game state to reflect intro completed
      this.engine.updateGameState({
        currentLocation: "Crossroads",
      });
    } else {
      // Show next dialogue line
      if (this.dialogueText) {
        this.dialogueText.text = this.dialogueLines[this.currentDialogueLine];
      }
    }
  }

  update(delta: number) {
    this.introTimer += delta;

    switch (this.introState) {
      case "carriage":
        this.updateCarriageSequence(delta);
        break;
      case "text":
        // Text state is mostly passive, waiting for user input
        break;
      case "player_control":
        this.checkPlayerDirection();
        break;
      case "completed":
        // Intro is done, nothing to update
        break;
    }
  }

  updateCarriageSequence(delta: number) {
    if (!this.carriageSprite) return;

    // Move carriage to the center over time
    if (this.introTimer < 3) {
      // Move from left side of screen to center
      this.carriageSprite.x = 200 + (this.introTimer / 3) * 200;
    } else if (this.introTimer < 4) {
      // Short pause at the center
      this.carriageSprite.x = 400;
    } else if (this.introTimer < 5) {
      // Create player character
      if (!this.playerPlaceholder && this.engine.player) {
        try {
          // Create placeholder for player
          const playerGraphics = new PIXI.Graphics();
          const playerColor = 0x0000ff; // Blue
          playerGraphics.fill({ color: playerColor });
          playerGraphics.circle(0, 0, 15);

          // Safely generate texture
          if (this.engine.app?.renderer) {
            try {
              const texture =
                this.engine.app.renderer.generateTexture(playerGraphics);

              this.playerPlaceholder = new PIXI.Sprite(texture);
              this.playerPlaceholder.anchor.set(0.5);
              this.playerPlaceholder.position.set(400, 400);
              this.playerPlaceholder.visible = false;
              this.introContainer.addChild(this.playerPlaceholder);

              // Show player descending from carriage
              this.playerPlaceholder.visible = true;
              this.playerPlaceholder.position.set(400, 380);
            } catch (textureError) {
              console.warn("Failed to generate player texture:", textureError);
              this.createFallbackPlayerPlaceholder();
            }
          } else {
            console.warn("Renderer not available for player placeholder");
            this.createFallbackPlayerPlaceholder();
          }

          // Move the actual player character to the crossroads
          this.engine.player.sprite.position.set(400, 400);
        } catch (error) {
          console.warn("Error creating player placeholder:", error);
          this.createFallbackPlayerPlaceholder();
        }
      }
    } else {
      // Transition to dialogue state
      this.introState = "text";
      this.textOverlay.visible = true;
      if (this.dialogueText) {
        this.dialogueText.text = this.dialogueLines[0];
      }

      // Move carriage out slowly
      if (this.carriageSprite.x < 700) {
        this.carriageSprite.x += 2 * delta;
      } else {
        // Carriage has left, hide it
        this.carriageSprite.visible = false;
        if (this.playerPlaceholder) {
          this.playerPlaceholder.visible = false;
        }
      }
    }
  }

  // Fallback method for player placeholder
  createFallbackPlayerPlaceholder() {
    try {
      // Use a basic texture
      const basicTexture = PIXI.Texture.WHITE;
      this.playerPlaceholder = new PIXI.Sprite(basicTexture);
      this.playerPlaceholder.tint = 0x0000ff; // Blue
      this.playerPlaceholder.width = 30;
      this.playerPlaceholder.height = 30;
      this.playerPlaceholder.anchor.set(0.5);
      this.playerPlaceholder.position.set(400, 380);
      this.playerPlaceholder.visible = true;
      this.introContainer.addChild(this.playerPlaceholder);
    } catch (error) {
      console.error("Failed to create fallback player placeholder:", error);
    }
  }

  checkPlayerDirection() {
    // Check if player has moved significantly in any direction
    if (!this.engine.player || !this.introCompleted) return;

    const playerX = this.engine.player.sprite.x;
    const playerY = this.engine.player.sprite.y;
    const centerX = 400;
    const centerY = 400;

    const distanceFromCenter = Math.sqrt(
      Math.pow(playerX - centerX, 2) + Math.pow(playerY - centerY, 2)
    );

    // If player has moved at least 100 pixels from center
    if (distanceFromCenter > 100) {
      let direction: string;
      let location: string;

      // Determine which direction
      if (playerY < centerY - 80) {
        direction = "North";
        location = "Castle Approach";
      } else if (playerX > centerX + 80) {
        direction = "East";
        location = "Village Outskirts";
      } else if (playerY > centerY + 80) {
        direction = "South";
        location = "Coastal Path";
      } else {
        direction = "West";
        location = "Forest Edge";
      }

      // Update game state
      this.engine.updateGameState({
        currentLocation: location,
      });

      // Mark intro as fully completed
      this.introCompleted = true;
      this.introState = "completed";
      this.removeIntroElements();
    }
  }

  removeIntroElements() {
    // Remove intro elements from the world
    if (this.textOverlay) {
      this.textOverlay.visible = false;
    }

    // Remove event listener
    window.removeEventListener("keydown", this.handleKeyPress);

    // Remove intro container after a short delay
    setTimeout(() => {
      if (this.engine.world && this.introContainer.parent) {
        this.engine.world.container.removeChild(this.introContainer);
      }
    }, 1000);
  }
}
