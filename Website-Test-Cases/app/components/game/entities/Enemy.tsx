import { Container, Sprite, Texture, Graphics } from "pixi.js";
import { Direction } from "../types";

// Types of enemies in Zelda NES
export enum EnemyType {
  OCTOROK = "default",
  MOBLIN = "moblin",
  TEKTITE = "tektite",
  LEEVER = "leever",
  ZORA = "zora",
  LYNEL = "lynel",
  LIKE_LIKE = "like_like",
  PEAHAT = "peahat",
  DARKNUT = "darknut",
  GORIYA = "goriya",
}

// Movement patterns for enemies
export enum MovementPattern {
  RANDOM, // Random direction changes
  STRAIGHT, // Moves in straight lines, changes on collision
  TRACKING, // Follows the player
  STATIONARY, // Doesn't move
  BOUNCING, // Bounces around like a ball
}

export class Enemy {
  id: string;
  sprite: Container;
  health: number;
  damage: number;
  speed: number;
  direction: Direction;
  type: EnemyType;
  movementPattern: MovementPattern;
  movementTimer: number = 0;
  directionChangeTime: number = 60; // frames before changing direction
  isHit: boolean = false;
  hitCooldown: number = 0;
  knockbackDistance: number = 0;
  knockbackDirection: Direction = "down";
  flash: boolean = false;
  flashCounter: number = 0;
  engine: any;

  private bodySprite: Sprite;
  private hitbox: Graphics;

  constructor(
    id: string,
    type: EnemyType,
    x: number,
    y: number,
    health: number = 1,
    damage: number = 0.5,
    movementPattern: MovementPattern = MovementPattern.RANDOM
  ) {
    this.id = id;
    this.type = type;
    this.health = health;
    this.damage = damage;
    this.movementPattern = movementPattern;
    this.speed = 1.0; // Default speed for most enemies
    this.direction = "down"; // Default direction

    // Create container for all enemy visuals
    this.sprite = new Container();
    this.sprite.x = x;
    this.sprite.y = y;

    // Create enemy sprite based on type
    // In a real game, you would load the appropriate texture based on the enemy type
    const enemyTexture = this.getTextureForType(type);
    this.bodySprite = new Sprite(enemyTexture);
    this.bodySprite.anchor.set(0.5);
    this.sprite.addChild(this.bodySprite);

    // Create hitbox for collision detection
    this.hitbox = new Graphics();
    this.hitbox.fill({ color: 0xff0000, alpha: 0.0 }); // Invisible hitbox
    this.hitbox.rect(-8, -8, 16, 16); // 16x16 hitbox centered on sprite
    this.sprite.addChild(this.hitbox);

    // Set speed based on type
    if (type === EnemyType.OCTOROK || type === EnemyType.TEKTITE) {
      this.speed = 1.0;
    } else if (type === EnemyType.MOBLIN || type === EnemyType.LEEVER) {
      this.speed = 0.8;
    } else if (type === EnemyType.LYNEL) {
      this.speed = 1.5;
    }
  }

  // Get the right texture based on enemy type
  private getTextureForType(type: EnemyType): Texture {
    // In a real implementation, you would have specific textures for each enemy type
    // For now, we'll use placeholder textures
    const texturePath = `/assets/enemies/${type}.png`;

    // Fallback to a default enemy texture if the specific one isn't found
    try {
      return Texture.from(texturePath);
    } catch (e) {
      console.warn(`Texture for enemy type ${type} not found, using default`);
      return Texture.from("/assets/enemies/default.svg");
    }
  }

  // Update enemy movement and behavior
  update(delta: number, playerX?: number, playerY?: number) {
    // Handle hit cooldown
    if (this.hitCooldown > 0) {
      this.hitCooldown -= delta;

      // Flash the enemy when hit
      if (this.isHit) {
        this.flashCounter += delta;
        if (this.flashCounter > 5) {
          this.flash = !this.flash;
          this.flashCounter = 0;
          this.bodySprite.alpha = this.flash ? 0.5 : 1.0;
        }

        // End hit state
        if (this.hitCooldown <= 0) {
          this.isHit = false;
          this.bodySprite.alpha = 1.0;
        }
      }
    }

    // Apply knockback if the enemy is being pushed back
    if (this.knockbackDistance > 0) {
      const knockbackSpeed = 3;
      switch (this.knockbackDirection) {
        case "up":
          this.sprite.y -= knockbackSpeed * delta;
          break;
        case "down":
          this.sprite.y += knockbackSpeed * delta;
          break;
        case "left":
          this.sprite.x -= knockbackSpeed * delta;
          break;
        case "right":
          this.sprite.x += knockbackSpeed * delta;
          break;
      }

      this.knockbackDistance -= knockbackSpeed * delta;
    }
    // Only move if not being knocked back
    else if (!this.isHit) {
      // Update movement based on pattern
      this.updateMovement(delta, playerX, playerY);
    }

    // Update animation effects
    this.updateAnimations(delta);
  }

  // Update enemy movement based on its pattern
  private updateMovement(delta: number, playerX?: number, playerY?: number) {
    // Increment timer for direction changes
    this.movementTimer += delta;

    // Check if it's time to change direction
    if (this.movementTimer >= this.directionChangeTime) {
      // Reset timer
      this.movementTimer = 0;

      // Random direction change (for RANDOM pattern)
      if (this.movementPattern === MovementPattern.RANDOM) {
        const directions: Direction[] = ["up", "down", "left", "right"];
        this.direction =
          directions[Math.floor(Math.random() * directions.length)];
      }
      // For tracking pattern, update direction less frequently
      else if (
        this.movementPattern === MovementPattern.TRACKING &&
        playerX !== undefined &&
        playerY !== undefined
      ) {
        this.updateDirectionTowardsPlayer(playerX, playerY);
      }
    }

    // Update position based on current direction and movement pattern
    if (this.movementPattern !== MovementPattern.STATIONARY) {
      // For tracking, update direction each frame if player coordinates are provided
      if (
        this.movementPattern === MovementPattern.TRACKING &&
        playerX !== undefined &&
        playerY !== undefined
      ) {
        // Only update direction every few frames to make movement less erratic
        if (this.movementTimer % 10 === 0) {
          this.updateDirectionTowardsPlayer(playerX, playerY);
        }
      }

      // Move in the current direction
      this.move(delta);
    }
  }

  // Update direction towards the player
  private updateDirectionTowardsPlayer(playerX: number, playerY: number) {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;

    // Determine primary direction based on which axis has greater difference
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? "right" : "left";
    } else {
      this.direction = dy > 0 ? "down" : "up";
    }
  }

  // Move in current direction
  private move(delta: number) {
    const moveSpeed = this.speed * delta;

    switch (this.direction) {
      case "up":
        this.sprite.y -= moveSpeed;
        break;
      case "down":
        this.sprite.y += moveSpeed;
        break;
      case "left":
        this.sprite.x -= moveSpeed;
        this.bodySprite.scale.x = -1; // Flip sprite to face left
        break;
      case "right":
        this.sprite.x += moveSpeed;
        this.bodySprite.scale.x = 1; // Normal orientation
        break;
    }
  }

  // Update animations based on enemy type
  private updateAnimations(delta: number) {
    // Different animation effects based on enemy type
    switch (this.type) {
      case EnemyType.PEAHAT:
        // Pulsing animation
        const scale = 0.9 + Math.sin(this.movementTimer * 0.1) * 0.1;
        this.bodySprite.scale.set(scale);
        break;

      case EnemyType.ZORA:
        // Bobbing animation
        this.bodySprite.y = Math.sin(this.movementTimer * 0.1) * 3;
        break;

      case EnemyType.LIKE_LIKE:
        // Stretching animation
        this.bodySprite.scale.y =
          0.9 + Math.sin(this.movementTimer * 0.2) * 0.2;
        break;

      default:
        // Slight bobbing for most enemies
        this.bodySprite.y = Math.sin(this.movementTimer * 0.1) * 1;
        break;
    }
  }

  // Take damage from player
  takeDamage(amount: number, attackDirection: Direction) {
    if (this.isHit) return; // Already being hit

    this.health -= amount;
    this.isHit = true;
    this.hitCooldown = 30; // 30 frames of invulnerability
    this.flash = true;

    // Apply knockback
    this.knockbackDirection = attackDirection;
    this.knockbackDistance = 20; // Knockback distance in pixels

    // Check if enemy is defeated
    if (this.health <= 0) {
      this.die();
    }
  }

  // Handle enemy death
  die() {
    // TODO: Add death animation and drop items
    this.sprite.visible = false;

    // In a real implementation, you would:
    // 1. Play death animation
    // 2. Drop items or rewards
    // 3. Remove from the world
    console.log(`Enemy ${this.id} defeated!`);
  }

  // Check collision with player (for dealing damage)
  checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): boolean {
    // Simple AABB collision
    const enemyBounds = {
      x: this.sprite.x - 8,
      y: this.sprite.y - 8,
      width: 16,
      height: 16,
    };

    const playerBounds = {
      x: playerX - playerWidth / 2,
      y: playerY - playerHeight / 2,
      width: playerWidth,
      height: playerHeight,
    };

    return !(
      enemyBounds.x + enemyBounds.width < playerBounds.x ||
      enemyBounds.x > playerBounds.x + playerBounds.width ||
      enemyBounds.y + enemyBounds.height < playerBounds.y ||
      enemyBounds.y > playerBounds.y + playerBounds.height
    );
  }

  async init(engine?: any) {
    // Create container
    this.sprite = new Container();

    try {
      // Load sprite
      const enemyTexture = this.getTextureForType(this.type);
      this.bodySprite = new Sprite(enemyTexture);
      this.bodySprite.anchor.set(0.5);
      this.sprite.addChild(this.bodySprite);

      // Set up error handler for when sprite fails to load
      this.bodySprite.texture.baseTexture.on("error", () => {
        console.warn(
          `Failed to load enemy sprite: ${this.type}, using fallback`
        );
        this.createFallbackSprite();
      });

      // Add hitbox for collision detection
      this.hitbox = new Graphics();
      this.hitbox.fill({ color: 0xff0000, alpha: 0.0 });
      this.hitbox.rect(-8, -8, 16, 16);

      // Set initial position
      this.sprite.x = this.sprite.x;
      this.sprite.y = this.sprite.y;

      // Add sprite to container
      this.sprite.addChild(this.hitbox);

      // Store the engine reference
      if (engine) {
        this.engine = engine;
      }
    } catch (error) {
      console.error(`Error initializing enemy: ${error}`);
      this.createFallbackSprite();
    }
  }

  // Create a fallback sprite when asset loading fails
  createFallbackSprite() {
    try {
      // Create a simple graphics object as fallback
      const fallbackGraphics = new Graphics();

      // Different colors for different enemy types
      let color = 0xff0000; // Red default

      if (this.type === EnemyType.OCTOROK) {
        color = 0xff6347; // Tomato color for octoroks
      } else if (this.type === EnemyType.MOBLIN) {
        color = 0x8b4513; // Brown for moblins
      } else if (this.type === EnemyType.DARKNUT) {
        color = 0x4b0082; // Indigo for darknuts
      }

      // Draw a simple enemy shape
      fallbackGraphics.fill({ color: color });
      fallbackGraphics.circle(0, 0, 8); // Main body

      // Add some details
      fallbackGraphics.fill({ color: 0x000000, alpha: 0.8 });
      fallbackGraphics.circle(-3, -2, 2); // Left eye
      fallbackGraphics.circle(3, -2, 2); // Right eye

      // For Octorok, add tentacles
      if (this.type === EnemyType.OCTOROK) {
        fallbackGraphics.fill({ color: color });
        fallbackGraphics.rect(-10, 6, 4, 4); // Bottom left tentacle
        fallbackGraphics.rect(-4, 8, 4, 4); // Bottom middle-left tentacle
        fallbackGraphics.rect(4, 8, 4, 4); // Bottom middle-right tentacle
        fallbackGraphics.rect(10, 6, 4, 4); // Bottom right tentacle
      }

      // Generate texture
      if (this.engine && this.engine.app && this.engine.app.renderer) {
        try {
          const texture =
            this.engine.app.renderer.generateTexture(fallbackGraphics);

          // Create sprite from texture
          if (this.bodySprite) {
            // Replace existing sprite texture
            this.bodySprite.texture = texture;
          } else {
            // Create new sprite
            this.bodySprite = new Sprite(texture);
            this.bodySprite.anchor.set(0.5);
            this.bodySprite.position.set(this.sprite.x, this.sprite.y);

            // Create hitbox if it doesn't exist
            if (!this.hitbox) {
              this.hitbox = new Graphics();
              this.hitbox.fill({ color: 0xff0000, alpha: 0.0 });
              this.hitbox.rect(-8, -8, 16, 16);
            }

            // Add to container
            this.sprite.addChild(this.bodySprite);
            this.sprite.addChild(this.hitbox);
          }
        } catch (textureError) {
          console.error("Failed to generate fallback texture:", textureError);
          this.createBasicFallbackSprite();
        }
      } else {
        console.warn("Renderer not available for fallback sprite generation");
        this.createBasicFallbackSprite();
      }
    } catch (error) {
      console.error("Error creating fallback sprite:", error);
      this.createBasicFallbackSprite();
    }
  }

  // Very basic fallback using a colored square if all else fails
  createBasicFallbackSprite() {
    try {
      // Use the WHITE texture (which is built into PixiJS) and apply a tint
      const basicTexture = Texture.WHITE;

      if (this.bodySprite) {
        this.bodySprite.texture = basicTexture;
        this.bodySprite.tint = 0xff0000; // Red
        this.bodySprite.width = 16;
        this.bodySprite.height = 16;
      } else {
        this.bodySprite = new Sprite(basicTexture);
        this.bodySprite.tint = 0xff0000; // Red
        this.bodySprite.width = 16;
        this.bodySprite.height = 16;
        this.bodySprite.anchor.set(0.5);
        this.bodySprite.position.set(this.sprite.x, this.sprite.y);

        if (this.sprite) {
          this.sprite.addChild(this.bodySprite);
        }
      }
    } catch (error) {
      console.error("Failed to create basic fallback sprite:", error);
    }
  }
}
