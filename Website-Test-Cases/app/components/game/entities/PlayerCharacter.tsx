"use client";

import * as PIXI from "pixi.js";
import { CharacterInfo } from "../../ProphecyEngine";

// Animation state types
type AnimationState = "idle" | "walking" | "attack" | "block" | "dodge";
type Direction = "down" | "up" | "left" | "right";

export class PlayerCharacter {
  id: string = "player";
  character: CharacterInfo;
  sprite: PIXI.Container;
  animatedSprite: PIXI.AnimatedSprite | null = null;
  animationState: AnimationState = "idle";
  direction: Direction = "down";
  speed: number = 2.5; // Fixed speed (Zelda style)
  canInteract: boolean = true;
  showingInteractionHint: boolean = false;
  interactionHint: PIXI.Container | null = null;
  characterGlow: PIXI.Sprite | null = null;
  isInvulnerable: boolean = false;
  invulnerabilityTimer: number = 0;
  invulnerabilityDuration: number = 1.5; // in seconds
  maxHearts: number = 3;
  hearts: number = 3;
  halfHearts: boolean = false; // Whether to use half hearts
  swordSprite: PIXI.Sprite | null = null;
  swordHitbox: PIXI.Rectangle | null = null;

  // New properties for the enhanced combat system
  isBlocking: boolean = false;
  blockTimer: number = 0;
  blockDuration: number = 2.0; // max blocking time in seconds
  blockCooldown: number = 0;
  blockCooldownDuration: number = 1.0; // cooldown between blocks
  attackDirection: number = 0; // angle in radians
  mouseTarget: { x: number; y: number } | null = null;

  // Animation properties
  animations: Record<string, PIXI.Texture[]> = {};
  animationSpeed: number = 0.1;
  attackCooldown: number = 0;
  isAttacking: boolean = false;

  constructor(character: CharacterInfo) {
    this.character = character;
    // Create a container to hold the animated sprite
    this.sprite = new PIXI.Container();
  }

  async init() {
    // Create all animations
    await this.createAnimations();

    // Set up initial position
    this.sprite.x = 400;
    this.sprite.y = 400;

    // Add a glow effect around the character
    this.addCharacterGlow();

    // Create interaction hint container
    this.createInteractionHint();

    return this;
  }

  async createAnimations() {
    // Load character textures based on class
    await this.loadAnimationTextures();

    // Set the initial animation
    this.playAnimation("idle_down");
  }

  async loadAnimationTextures() {
    // Character class config
    const classConfig = this.getClassConfig();

    // Create textures for each animation frame
    // We'll create these on canvas for flexibility

    // Create idle animations (4 directions)
    this.animations["idle_down"] = await this.createAnimationFrames(
      "idle",
      "down",
      classConfig,
      4
    );
    this.animations["idle_up"] = await this.createAnimationFrames(
      "idle",
      "up",
      classConfig,
      4
    );
    this.animations["idle_left"] = await this.createAnimationFrames(
      "idle",
      "left",
      classConfig,
      4
    );
    this.animations["idle_right"] = await this.createAnimationFrames(
      "idle",
      "right",
      classConfig,
      4
    );

    // Create walking animations (4 directions)
    this.animations["walking_down"] = await this.createAnimationFrames(
      "walking",
      "down",
      classConfig,
      6
    );
    this.animations["walking_up"] = await this.createAnimationFrames(
      "walking",
      "up",
      classConfig,
      6
    );
    this.animations["walking_left"] = await this.createAnimationFrames(
      "walking",
      "left",
      classConfig,
      6
    );
    this.animations["walking_right"] = await this.createAnimationFrames(
      "walking",
      "right",
      classConfig,
      6
    );

    // Create attack animations (4 directions)
    this.animations["attack_down"] = await this.createAnimationFrames(
      "attack",
      "down",
      classConfig,
      5
    );
    this.animations["attack_up"] = await this.createAnimationFrames(
      "attack",
      "up",
      classConfig,
      5
    );
    this.animations["attack_left"] = await this.createAnimationFrames(
      "attack",
      "left",
      classConfig,
      5
    );
    this.animations["attack_right"] = await this.createAnimationFrames(
      "attack",
      "right",
      classConfig,
      5
    );

    // Create dodge animations (4 directions) - Dark Souls roll
    this.animations["dodge_down"] = await this.createAnimationFrames(
      "dodge",
      "down",
      classConfig,
      6
    );
    this.animations["dodge_up"] = await this.createAnimationFrames(
      "dodge",
      "up",
      classConfig,
      6
    );
    this.animations["dodge_left"] = await this.createAnimationFrames(
      "dodge",
      "left",
      classConfig,
      6
    );
    this.animations["dodge_right"] = await this.createAnimationFrames(
      "dodge",
      "right",
      classConfig,
      6
    );
  }

  getClassConfig() {
    // Default configuration
    const config = {
      mainColor: "#ff0000",
      secondaryColor: "#8a0000",
      bodyShape: "humanoid",
      specialEffect: "none",
      weapon: "none",
      headgear: "none",
    };

    // Class-specific configurations
    switch (this.character.characterClass) {
      case "warrior":
        config.mainColor = "#ff0000"; // Red
        config.secondaryColor = "#8a0000"; // Dark red
        config.bodyShape = "muscular";
        config.weapon = "sword";
        config.headgear = "helmet";
        break;

      case "mage":
        config.mainColor = "#0000ff"; // Blue
        config.secondaryColor = "#000080"; // Dark blue
        config.bodyShape = "robed";
        config.specialEffect = "magic";
        config.weapon = "staff";
        config.headgear = "hat";
        break;

      case "ranger":
        config.mainColor = "#00ff00"; // Green
        config.secondaryColor = "#006400"; // Dark green
        config.bodyShape = "agile";
        config.weapon = "bow";
        config.headgear = "hood";
        break;

      case "bard":
        config.mainColor = "#800080"; // Purple
        config.secondaryColor = "#4b0082"; // Indigo
        config.bodyShape = "charismatic";
        config.weapon = "lute";
        config.specialEffect = "notes";
        break;

      case "rogue":
        config.mainColor = "#333333"; // Dark grey
        config.secondaryColor = "#000000"; // Black
        config.bodyShape = "stealthy";
        config.weapon = "daggers";
        config.headgear = "mask";
        break;
    }

    return config;
  }

  async createAnimationFrames(
    state: AnimationState,
    direction: Direction,
    config: any,
    frameCount: number
  ): Promise<PIXI.Texture[]> {
    const textures: PIXI.Texture[] = [];

    for (let i = 0; i < frameCount; i++) {
      // Create a canvas for this frame
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      // Draw shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(64, 104, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw the base character with animation frame-specific adjustments
      if (state === "dodge") {
        this.drawDodgeAnimation(ctx, config, direction, i, frameCount);
      } else {
        this.drawCharacterForAnimation(
          ctx,
          config,
          state,
          direction,
          i,
          frameCount
        );
      }

      // Add class-specific details
      this.drawClassDetails(ctx, config, state, direction, i);

      // Add character name
      this.drawCharacterName(ctx);

      // Create a texture from the canvas
      textures.push(PIXI.Texture.from(canvas));
    }

    return textures;
  }

  drawCharacterForAnimation(
    ctx: CanvasRenderingContext2D,
    config: any,
    state: AnimationState,
    direction: Direction,
    frame: number,
    frameCount: number
  ) {
    const centerX = 64;
    const centerY = 64;

    // Calculate animation properties
    const frameRatio = frame / (frameCount - 1);
    const bounce = Math.sin(frameRatio * Math.PI * 2) * 4; // Bounce effect for walking
    const attackSwing =
      state === "attack" ? Math.sin(frameRatio * Math.PI) * 15 : 0; // Swing effect for attack

    // Apply direction-specific transformations
    let flip = false;
    let rotation = 0;
    if (direction === "left") {
      flip = true;
    } else if (direction === "right") {
      flip = false;
    } else if (direction === "up") {
      rotation = state === "attack" ? 0 : 0; // Special handling for up attacks
    }

    // Save context for transform
    ctx.save();

    // Apply flip if needed
    if (flip) {
      ctx.translate(centerX * 2, 0);
      ctx.scale(-1, 1);
    }

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);
    }

    // Draw body based on animation state
    // Draw main body shape
    ctx.fillStyle = config.mainColor;

    if (state === "idle") {
      // Subtle breathing animation in idle
      const breathFactor = Math.sin(frameRatio * Math.PI * 2) * 2;

      // Body
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 18, 25 + breathFactor, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(centerX, centerY - 30, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (state === "walking") {
      // Apply walking bounce
      const walkOffsetY =
        direction === "up" || direction === "down" ? bounce : 0;

      // Body with bounce
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + walkOffsetY, 18, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head with bounce
      ctx.beginPath();
      ctx.arc(centerX, centerY - 30 + walkOffsetY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Arms with swing
      const armSwing = Math.sin(frameRatio * Math.PI * 4) * 10;
      this.drawArms(ctx, config, direction, armSwing);

      // Legs with stride
      this.drawLegs(ctx, config, direction, frameRatio);
    } else if (state === "attack") {
      // Apply attack motion
      let attackOffsetX = 0;
      let attackOffsetY = 0;

      if (direction === "down") {
        attackOffsetY = attackSwing * 0.5;
      } else if (direction === "up") {
        attackOffsetY = -attackSwing * 0.5;
      } else if (direction === "left" || direction === "right") {
        attackOffsetX =
          direction === "right" ? attackSwing * 0.5 : -attackSwing * 0.5;
      }

      // Body with attack motion
      ctx.beginPath();
      ctx.ellipse(
        centerX + attackOffsetX,
        centerY + attackOffsetY,
        18,
        25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Head with attack motion
      ctx.beginPath();
      ctx.arc(
        centerX + attackOffsetX * 0.5,
        centerY - 30 + attackOffsetY * 0.5,
        15,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Arms with attack position
      this.drawAttackPose(ctx, config, direction, frameRatio);
    }

    // Restore context after transform
    ctx.restore();
  }

  drawArms(
    ctx: CanvasRenderingContext2D,
    config: any,
    direction: Direction,
    swingAmount: number
  ) {
    const centerX = 64;
    const centerY = 64;

    ctx.fillStyle = config.mainColor;

    if (direction === "left" || direction === "right") {
      // Arms swinging forward and back
      ctx.beginPath();
      ctx.ellipse(
        centerX - 15,
        centerY,
        6,
        12,
        swingAmount * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        centerX + 15,
        centerY,
        6,
        12,
        -swingAmount * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      // Arms swinging side to side
      ctx.beginPath();
      ctx.ellipse(
        centerX - 18 + swingAmount * 0.5,
        centerY,
        6,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        centerX + 18 - swingAmount * 0.5,
        centerY,
        6,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  drawLegs(
    ctx: CanvasRenderingContext2D,
    config: any,
    direction: Direction,
    frameRatio: number
  ) {
    const centerX = 64;
    const centerY = 64;

    ctx.fillStyle = config.secondaryColor;

    const legSwing = Math.sin(frameRatio * Math.PI * 4) * 10;

    if (direction === "up" || direction === "down") {
      // Legs moving forward and back
      ctx.beginPath();
      ctx.ellipse(
        centerX - 8,
        centerY + 25,
        6,
        12 + Math.abs(legSwing * 0.2),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        centerX + 8,
        centerY + 25,
        6,
        12 - Math.abs(legSwing * 0.2),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      // Legs moving with side view
      ctx.beginPath();
      ctx.ellipse(
        centerX - 5,
        centerY + 25,
        6,
        12,
        legSwing * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        centerX + 5,
        centerY + 25,
        6,
        12,
        -legSwing * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  drawAttackPose(
    ctx: CanvasRenderingContext2D,
    config: any,
    direction: Direction,
    frameRatio: number
  ) {
    const centerX = 64;
    const centerY = 64;

    // Calculate the attack swing (0 to 1 to 0)
    const attackProgress = Math.sin(frameRatio * Math.PI);
    const weaponSwing = attackProgress * 70; // Degrees of swing

    ctx.fillStyle = config.mainColor;

    if (direction === "down") {
      // Arms in attack position for downward swing
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(((weaponSwing - 45) * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Draw arm
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 10, 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw weapon
      this.drawWeapon(ctx, config, attackProgress);

      ctx.restore();
    } else if (direction === "up") {
      // Arms in attack position for upward swing
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(((-weaponSwing + 45) * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Draw arm
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 10, 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw weapon
      this.drawWeapon(ctx, config, attackProgress);

      ctx.restore();
    } else if (direction === "left" || direction === "right") {
      // Arms in attack position for side swing
      const dirMod = direction === "right" ? 1 : -1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((dirMod * weaponSwing * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Draw arm
      ctx.beginPath();
      ctx.ellipse(centerX + 15 * dirMod, centerY, 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw weapon
      this.drawWeapon(ctx, config, attackProgress);

      ctx.restore();
    }
  }

  drawWeapon(
    ctx: CanvasRenderingContext2D,
    config: any,
    attackProgress: number
  ) {
    const centerX = 64;
    const centerY = 64;

    // Draw weapon based on class
    if (config.weapon === "sword") {
      // Sword
      ctx.fillStyle = "#a0a0a0"; // Metal color

      // Blade
      ctx.beginPath();
      ctx.rect(centerX - 3, centerY - 40, 6, 30);
      ctx.fill();

      // Hilt
      ctx.fillStyle = "#8b4513"; // Brown
      ctx.beginPath();
      ctx.rect(centerX - 8, centerY - 15, 16, 5);
      ctx.fill();

      // Handle
      ctx.beginPath();
      ctx.rect(centerX - 2, centerY - 10, 4, 10);
      ctx.fill();

      // Attack effect
      if (attackProgress > 0.5) {
        const slashOpacity = (1 - attackProgress) * 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${slashOpacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 30, 30, 0, Math.PI, true);
        ctx.stroke();
      }
    } else if (config.weapon === "staff") {
      // Staff
      ctx.fillStyle = "#8b4513"; // Brown

      // Staff pole
      ctx.beginPath();
      ctx.rect(centerX - 2, centerY - 50, 4, 60);
      ctx.fill();

      // Orb
      const glowSize = 10 + attackProgress * 5;
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY - 50,
        0,
        centerX,
        centerY - 50,
        glowSize
      );
      gradient.addColorStop(0, "#00ffff");
      gradient.addColorStop(1, "rgba(0, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, glowSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (config.weapon === "bow") {
      // Bow
      ctx.strokeStyle = "#8b4513"; // Brown
      ctx.lineWidth = 3;

      // Bow curve
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, Math.PI * 0.25, Math.PI * 0.75, false);
      ctx.stroke();

      // Bowstring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX + 14, centerY - 14);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + 14, centerY + 14);
      ctx.stroke();

      // Arrow
      if (attackProgress > 0.5) {
        const arrowLength = (attackProgress - 0.5) * 2 * 40;

        ctx.fillStyle = "#8b4513";
        ctx.beginPath();
        ctx.rect(centerX, centerY - 1, arrowLength, 2);
        ctx.fill();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(centerX + arrowLength, centerY - 4);
        ctx.lineTo(centerX + arrowLength + 8, centerY);
        ctx.lineTo(centerX + arrowLength, centerY + 4);
        ctx.fill();
      }
    } else if (config.weapon === "daggers") {
      // Daggers
      ctx.fillStyle = "#a0a0a0"; // Metal color

      // Two daggers
      for (let i = -1; i <= 1; i += 2) {
        // Blade
        ctx.beginPath();
        ctx.rect(centerX + i * 15, centerY - 20, 4, 20);
        ctx.fill();

        // Handle
        ctx.fillStyle = "#8b4513"; // Brown
        ctx.beginPath();
        ctx.rect(centerX + i * 15, centerY, 4, 8);
        ctx.fill();
      }

      // Attack effect
      if (attackProgress > 0.5) {
        const slashOpacity = (1 - attackProgress) * 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${slashOpacity})`;
        ctx.lineWidth = 2;

        // Slash lines
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY - 20);
        ctx.lineTo(centerX + 20, centerY + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY - 20);
        ctx.lineTo(centerX - 20, centerY + 20);
        ctx.stroke();
      }
    } else if (config.weapon === "lute") {
      // Lute
      ctx.fillStyle = "#8b4513"; // Brown

      // Lute body
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 10, 15, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lute neck
      ctx.beginPath();
      ctx.rect(centerX - 2, centerY - 35, 4, 25);
      ctx.fill();

      // Strings
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      for (let i = -6; i <= 6; i += 3) {
        ctx.beginPath();
        ctx.moveTo(centerX + i, centerY - 30);
        ctx.lineTo(centerX + i, centerY + 5);
        ctx.stroke();
      }

      // Music notes effect for attack
      if (attackProgress > 0.3) {
        const noteOpacity =
          Math.min(1, attackProgress * 2) * (1 - attackProgress);
        ctx.fillStyle = `rgba(255, 255, 255, ${noteOpacity})`;

        // Draw music notes
        for (let i = 0; i < 3; i++) {
          const noteX = centerX + (i * 10 - 10) + attackProgress * 20;
          const noteY = centerY - 30 - attackProgress * 40;

          // Note head
          ctx.beginPath();
          ctx.ellipse(noteX, noteY, 4, 3, Math.PI * 0.25, 0, Math.PI * 2);
          ctx.fill();

          // Note stem
          ctx.beginPath();
          ctx.rect(noteX + 2, noteY - 1, 1, 15);
          ctx.fill();
        }
      }
    }
  }

  drawClassDetails(
    ctx: CanvasRenderingContext2D,
    config: any,
    state: AnimationState = "idle",
    direction: Direction = "down",
    frame: number = 0
  ) {
    const centerX = 64;
    const centerY = 64;

    // Draw class-specific details
    // This is where class-specific elements are added

    // Draw headgear
    if (config.headgear) {
      const breathFactor =
        state === "idle" ? Math.sin((frame / 3) * Math.PI * 2) * 2 : 0;
      const bounceOffset =
        state === "walking" ? Math.sin((frame / 5) * Math.PI * 2) * 4 : 0;

      ctx.fillStyle = config.secondaryColor;

      if (config.headgear === "helmet") {
        // Warrior helmet
        ctx.beginPath();
        ctx.rect(centerX - 15, centerY - 40 + bounceOffset, 30, 10);
        ctx.fill();

        // Helmet top
        ctx.beginPath();
        ctx.arc(centerX, centerY - 35 + bounceOffset, 15, Math.PI, 0, false);
        ctx.fill();

        // Helmet detail
        ctx.fillStyle = "#a0a0a0";
        ctx.beginPath();
        ctx.rect(centerX - 1, centerY - 48 + bounceOffset, 2, 10);
        ctx.fill();
      } else if (config.headgear === "hat") {
        // Mage hat
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY - 30 + bounceOffset);
        ctx.lineTo(centerX, centerY - 60 + bounceOffset + breathFactor);
        ctx.lineTo(centerX + 20, centerY - 30 + bounceOffset);
        ctx.closePath();
        ctx.fill();

        // Hat brim
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY - 30 + bounceOffset,
          25,
          8,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (config.headgear === "hood") {
        // Ranger hood
        ctx.beginPath();
        ctx.arc(centerX, centerY - 30 + bounceOffset, 18, Math.PI, 0, false);
        ctx.fill();

        // Hood sides
        ctx.beginPath();
        ctx.moveTo(centerX - 18, centerY - 30 + bounceOffset);
        ctx.lineTo(centerX - 15, centerY - 10 + bounceOffset);
        ctx.lineTo(centerX + 15, centerY - 10 + bounceOffset);
        ctx.lineTo(centerX + 18, centerY - 30 + bounceOffset);
        ctx.closePath();
        ctx.fill();
      } else if (config.headgear === "mask") {
        // Rogue mask
        ctx.beginPath();
        ctx.rect(centerX - 15, centerY - 35 + bounceOffset, 30, 10);
        ctx.fill();

        // Eye holes
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(
          centerX - 8,
          centerY - 30 + bounceOffset,
          3,
          2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
          centerX + 8,
          centerY - 30 + bounceOffset,
          3,
          2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Special effects for certain classes
    if (config.specialEffect) {
      if (config.specialEffect === "magic" && state === "attack") {
        // Magic effect for mages during attack
        const frameRatio = frame / 4;
        const effectIntensity = Math.sin(frameRatio * Math.PI);

        ctx.globalAlpha = effectIntensity;

        // Magic aura
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          40 + effectIntensity * 20
        );
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(0, 0, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40 + effectIntensity * 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      } else if (
        config.specialEffect === "notes" &&
        (state === "idle" || state === "attack")
      ) {
        // Music notes for bards
        const frameRatio = frame / 4;

        if (state === "attack" || (state === "idle" && frame % 3 === 0)) {
          ctx.fillStyle = "#ffffff";

          // Draw musical notes
          for (let i = 0; i < 3; i++) {
            const noteX =
              centerX +
              (i * 10 - 10) +
              Math.sin(frameRatio * Math.PI * 2 + i) * 5;
            const noteY = centerY - 40 - frameRatio * 10;

            // Note head
            ctx.beginPath();
            ctx.ellipse(noteX, noteY, 3, 2, Math.PI * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Note stem
            ctx.beginPath();
            ctx.rect(noteX + 2, noteY - 1, 1, 10);
            ctx.fill();
          }
        }
      }
    }
  }

  drawCharacterName(ctx: CanvasRenderingContext2D) {
    const centerX = 64;

    // Draw character name
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "10px Arial";
    ctx.fillText(this.character.adventurerName, centerX, 20);
  }

  addCharacterGlow() {
    // Create a glowing effect around the character
    const glow = new PIXI.Sprite(PIXI.Texture.WHITE);
    glow.width = 80;
    glow.height = 80;
    glow.anchor.set(0.5);
    glow.alpha = 0.2;

    // Set glow color based on class
    const colors: Record<string, number> = {
      warrior: 0xff0000, // Red
      mage: 0x0000ff, // Blue
      ranger: 0x00ff00, // Green
      bard: 0x800080, // Purple
      rogue: 0x333333, // Dark grey
    };

    glow.tint = colors[this.character.characterClass] || 0xffffff;

    // Add the glow behind the main sprite
    this.sprite.addChildAt(glow, 0);
    this.characterGlow = glow;
  }

  playAnimation(animationKey: string) {
    // Check if the animation exists
    if (!this.animations[animationKey]) {
      console.warn(`Animation "${animationKey}" not found`);
      return;
    }

    // If already playing this animation, don't restart
    if (
      this.animatedSprite &&
      this.animatedSprite.textures === this.animations[animationKey]
    ) {
      return;
    }

    // Remove existing animated sprite if any
    if (this.animatedSprite) {
      this.sprite.removeChild(this.animatedSprite);
    }

    // Create new animated sprite
    this.animatedSprite = new PIXI.AnimatedSprite(
      this.animations[animationKey]
    );
    this.animatedSprite.animationSpeed = this.animationSpeed;
    this.animatedSprite.anchor.set(0.5);

    // Check if this is an attack animation
    const isAttack = animationKey.startsWith("attack");
    const isDodge = animationKey.startsWith("dodge");

    // If it's an attack, play it once and go back to idle
    if (isAttack) {
      this.animatedSprite.loop = false;
      this.animatedSprite.onComplete = () => {
        this.isAttacking = false;
        this.playAnimation(`idle_${this.direction}`);
      };
    } else if (isDodge) {
      // If it's a dodge, play it once
      this.animatedSprite.loop = false;
    } else {
      this.animatedSprite.loop = true;
    }

    // Add and play the animation
    this.sprite.addChild(this.animatedSprite);
    this.animatedSprite.play();
  }

  createInteractionHint() {
    // Create a container for the interaction hint
    this.interactionHint = new PIXI.Container();
    this.interactionHint.visible = false;
    this.interactionHint.y = -50; // Position above the player
    this.sprite.addChild(this.interactionHint);
  }

  showInteractionHint(type: string) {
    if (!this.interactionHint) this.createInteractionHint();
    if (!this.interactionHint) return;

    // Clear any existing contents
    this.interactionHint.removeChildren();

    // Create background for the hint
    const background = new PIXI.Graphics();
    background.fill({ color: 0x000000, alpha: 0.7 });
    background.roundRect(-40, -20, 80, 30, 5);
    this.interactionHint.addChild(background);

    // Create text based on interaction type
    let text: string;
    let color: number;

    switch (type) {
      case "npc":
        text = "Talk";
        color = 0xffcc00;
        break;
      case "shop":
        text = "Shop";
        color = 0x00ccff;
        break;
      case "quest":
        text = "Quest";
        color = 0xff6600;
        break;
      case "item":
        text = "Take";
        color = 0x00ff00;
        break;
      default:
        text = "Interact";
        color = 0xffffff;
    }

    // Create text
    const textSprite = new PIXI.Text(text, {
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0xffffff,
    });
    textSprite.position.set(0, -12);

    // Add to container
    this.interactionHint.addChild(textSprite);

    // Add colored icon
    const icon = new PIXI.Graphics();
    icon.fill({ color });
    icon.circle(-20, -5, 8);
    this.interactionHint.addChild(icon);

    // Make visible
    this.interactionHint.visible = true;
    this.showingInteractionHint = true;
  }

  hideInteractionHint() {
    if (this.interactionHint) {
      this.interactionHint.visible = false;
    }
    this.showingInteractionHint = false;
  }

  attack() {
    // Only allow attacking if not already attacking, blocking, and cooldown is over
    if (
      this.isAttacking ||
      this.isBlocking ||
      this.attackCooldown > 0 ||
      !this.canInteract
    )
      return;

    console.log(`Attacking in direction: ${this.direction}`);

    // Set attack state
    this.isAttacking = true;
    this.animationState = "attack";
    this.playAnimation(`attack_${this.direction}`);

    // Set a longer cooldown for heavy attacks compared to light attacks
    this.attackCooldown = 0.5;

    // Create sword hitbox
    this.createSwordHitbox();

    // Make the heavy attack have a bigger hitbox
    if (this.swordSprite) {
      this.swordSprite.width = 50; // Wider than light attack
      this.swordSprite.height = 15; // Taller than light attack

      // Apply a different color for heavy attack
      this.swordSprite.tint = 0xffcc00; // Gold color
    }

    // Play heavy attack sound
    // this.world.soundManager.playSound("heavySwordSwing");
  }

  // Add a method to use items
  useItem(itemId: string) {
    console.log(`Using item: ${itemId}`);

    // Handle different item types
    switch (itemId) {
      case "health_potion":
        // Restore health
        this.hearts = Math.min(this.maxHearts, this.hearts + 1);
        return true;

      case "bomb":
        // Create a bomb entity in front of the player
        console.log("Placing bomb");
        // In a real implementation, would need to create a bomb entity through the game engine
        return true;

      case "bow":
        // Shoot an arrow in the direction the player is facing
        console.log("Shooting arrow");
        // In a real implementation, would need to create an arrow entity
        return true;

      case "boomerang":
        // Throw a boomerang in the direction the player is facing
        console.log("Throwing boomerang");
        // In a real implementation, would need to create a boomerang entity
        return true;

      default:
        console.log(`Unknown item: ${itemId}`);
        return false;
    }
  }

  takeDamage(amount: number = 0.5) {
    // If invulnerable, don't take damage
    if (this.isInvulnerable) return;

    // Apply damage
    this.hearts -= amount;

    // Make sure hearts don't go below 0
    if (this.hearts < 0) this.hearts = 0;

    // Set invulnerability period after taking damage (Zelda-style)
    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.invulnerabilityDuration;

    // Flash the player (Zelda style damage feedback)
    this.flashPlayer();
  }

  flashPlayer() {
    let flashes = 0;
    const maxFlashes = 5;
    const flashInterval =
      (this.invulnerabilityDuration * 1000) / (maxFlashes * 2); // Total duration divided by number of flash transitions

    const flashTimer = setInterval(() => {
      if (this.animatedSprite) {
        this.animatedSprite.visible = !this.animatedSprite.visible;
        flashes++;

        if (flashes >= maxFlashes * 2) {
          // *2 because each flash has visibility on and off
          clearInterval(flashTimer);
          if (this.animatedSprite) this.animatedSprite.visible = true;
        }
      }
    }, flashInterval);
  }

  move(dx: number, dy: number) {
    // Can't move while attacking or blocking
    if (this.isAttacking || this.isBlocking) return;

    // Set the animation state to walking
    if (this.animationState !== "walking" && (dx !== 0 || dy !== 0)) {
      this.animationState = "walking";

      // Determine the walking direction
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement is greater
        this.direction = dx > 0 ? "right" : "left";
      } else {
        // Vertical movement is greater
        this.direction = dy > 0 ? "down" : "up";
      }

      this.playAnimation(`walking_${this.direction}`);
    } else if (dx === 0 && dy === 0 && this.animationState === "walking") {
      // Return to idle if we stopped moving
      this.animationState = "idle";
      this.playAnimation(`idle_${this.direction}`);
    }

    // Move the sprite
    this.sprite.x += dx * this.speed;
    this.sprite.y += dy * this.speed;
  }

  update(delta: number) {
    // Convert delta from frames to seconds (assuming 60 FPS)
    const deltaSeconds = delta / 60;

    // Handle attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaSeconds;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 0;
        this.isAttacking = false;

        // If we were attacking, return to idle
        if (this.animationState === "attack") {
          this.animationState = "idle";
          this.playAnimation(`idle_${this.direction}`);
        }

        // Remove sword hitbox
        if (this.swordSprite && this.swordSprite.parent) {
          this.swordSprite.parent.removeChild(this.swordSprite);
          this.swordSprite = null;
        }
        this.swordHitbox = null;
      }
    }

    // Handle blocking timer
    if (this.isBlocking) {
      this.blockTimer -= deltaSeconds;
      if (this.blockTimer <= 0) {
        this.stopBlocking();
      }
    }

    // Handle block cooldown
    if (this.blockCooldown > 0) {
      this.blockCooldown -= deltaSeconds;
      if (this.blockCooldown < 0) {
        this.blockCooldown = 0;
      }
    }

    // Handle invulnerability
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= deltaSeconds;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.sprite.alpha = 1;
      } else {
        // Flash the player while invulnerable
        this.sprite.alpha =
          Math.sin(this.invulnerabilityTimer * 10) * 0.5 + 0.5;
      }
    }

    // Update interaction hint position
    if (this.showingInteractionHint && this.interactionHint) {
      this.interactionHint.y = -50; // Position above player's head
    }

    // Update character glow effect
    if (this.characterGlow) {
      this.characterGlow.rotation += 0.01;
    }
  }

  drawDodgeAnimation(
    ctx: CanvasRenderingContext2D,
    config: any,
    direction: Direction,
    frame: number,
    frameCount: number
  ) {
    const centerX = 64;
    const centerY = 64;

    // Calculate animation properties
    const frameRatio = frame / (frameCount - 1);

    // Rolling animation - character tucks and rolls
    const rollProgress = Math.sin(frameRatio * Math.PI);
    const tuckAmount = Math.sin(frameRatio * Math.PI) * 10;

    // Apply direction-specific transformations
    let flip = false;
    if (direction === "left") {
      flip = true;
    }

    // Save context for transform
    ctx.save();

    // Apply flip if needed
    if (flip) {
      ctx.translate(centerX * 2, 0);
      ctx.scale(-1, 1);
    }

    // Apply rotation based on roll progress
    ctx.translate(centerX, centerY);
    if (direction === "left" || direction === "right") {
      // Side roll - rotate around horizontal axis
      ctx.rotate(rollProgress * Math.PI);
    } else if (direction === "up") {
      // Back roll
      ctx.rotate(rollProgress * Math.PI);
    } else {
      // Forward roll
      ctx.rotate(rollProgress * Math.PI);
    }
    ctx.translate(-centerX, -centerY);

    // Draw main body shape - smaller during roll
    ctx.fillStyle = config.mainColor;

    // Body curled into ball during roll
    const bodySize = 20 - tuckAmount;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, bodySize, bodySize, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw curled limbs
    ctx.fillStyle = config.secondaryColor;

    // Less visible limbs during the middle of the roll
    const limbOpacity = Math.max(0.2, 1 - rollProgress);
    ctx.globalAlpha = limbOpacity;

    // Draw roll dust/trail effect
    if (frameRatio > 0.3 && frameRatio < 0.8) {
      ctx.fillStyle = "rgba(200, 200, 200, 0.5)";

      for (let i = 0; i < 5; i++) {
        const dustX = centerX + (Math.random() - 0.5) * 40;
        const dustY = centerY + (Math.random() - 0.5) * 20;
        const dustSize = 2 + Math.random() * 4;

        ctx.beginPath();
        ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Reset opacity
    ctx.globalAlpha = 1;

    // Restore context
    ctx.restore();

    // Draw dodge/roll effect (motion blur/trail)
    this.drawDodgeEffect(ctx, direction, frameRatio);
  }

  drawDodgeEffect(
    ctx: CanvasRenderingContext2D,
    direction: Direction,
    frameRatio: number
  ) {
    const centerX = 64;
    const centerY = 64;

    // Only show trail in middle of dodge
    if (frameRatio < 0.2 || frameRatio > 0.8) return;

    // Motion blur effect
    ctx.globalAlpha = 0.3;

    let trailX = 0;
    let trailY = 0;

    // Direction of trail
    switch (direction) {
      case "left":
        trailX = 20;
        break;
      case "right":
        trailX = -20;
        break;
      case "up":
        trailY = 20;
        break;
      case "down":
        trailY = -20;
        break;
    }

    // Draw motion trail
    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < 3; i++) {
      const alpha = 0.2 - i * 0.05;
      const distance = i * 0.3;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(
        centerX + trailX * distance,
        centerY + trailY * distance,
        15,
        15,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  // New method for light attack with mouse targeting
  lightAttack(mouseX?: number, mouseY?: number) {
    if (this.isAttacking || this.isBlocking || !this.canInteract) return;

    this.isAttacking = true;
    this.attackCooldown = 0.3; // Light attack is faster than regular attack

    if (mouseX !== undefined && mouseY !== undefined) {
      this.mouseTarget = { x: mouseX, y: mouseY };
    }

    this.animationState = "attack";
    this.playAnimation(`attack_${this.direction}`);

    // Create sword hitbox in front of the player in the direction of the mouse
    this.createSwordHitbox();

    // Play attack sound
    // this.world.soundManager.playSound("swordSwing");
  }

  // Create a sword hitbox in the appropriate direction
  createSwordHitbox() {
    // Remove any existing sword sprite
    if (this.swordSprite && this.swordSprite.parent) {
      this.swordSprite.parent.removeChild(this.swordSprite);
    }

    // Create a new sword sprite
    this.swordSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.swordSprite.width = 40;
    this.swordSprite.height = 10;
    this.swordSprite.alpha = 0.5; // Make it semi-transparent for debugging
    this.swordSprite.tint = 0xffffff; // White

    // Position based on direction
    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;

    switch (this.direction) {
      case "up":
        offsetX = 0;
        offsetY = -30;
        rotation = -Math.PI / 2;
        break;
      case "down":
        offsetX = 0;
        offsetY = 30;
        rotation = Math.PI / 2;
        break;
      case "left":
        offsetX = -30;
        offsetY = 0;
        rotation = Math.PI;
        break;
      case "right":
        offsetX = 30;
        offsetY = 0;
        rotation = 0;
        break;
    }

    this.swordSprite.x = offsetX;
    this.swordSprite.y = offsetY;
    this.swordSprite.rotation = rotation;
    this.swordSprite.anchor.set(0, 0.5); // Anchor at the hilt

    this.sprite.addChild(this.swordSprite);

    // Create the hitbox for collision detection
    this.swordHitbox = new PIXI.Rectangle(
      this.sprite.x + offsetX - this.swordSprite.width / 2,
      this.sprite.y + offsetY - this.swordSprite.height / 2,
      this.swordSprite.width,
      this.swordSprite.height
    );
  }

  // Start blocking
  startBlocking() {
    if (this.isAttacking || this.blockCooldown > 0 || !this.canInteract) return;

    this.isBlocking = true;
    this.blockTimer = this.blockDuration;
    this.animationState = "block";
    this.playAnimation(`block_${this.direction}`);

    // Play block start sound
    // this.world.soundManager.playSound("shieldUp");
  }

  // Stop blocking
  stopBlocking() {
    if (!this.isBlocking) return;

    this.isBlocking = false;
    this.blockCooldown = this.blockCooldownDuration;
    this.animationState = "idle";
    this.playAnimation(`idle_${this.direction}`);

    // Play block end sound
    // this.world.soundManager.playSound("shieldDown");
  }
}
