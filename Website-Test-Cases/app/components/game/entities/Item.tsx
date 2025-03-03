"use client";

import * as PIXI from "pixi.js";

export class Item {
  id: string;
  data: any;
  sprite: PIXI.Sprite;

  constructor(id: string, data: any) {
    this.id = id;
    this.data = data;
    this.sprite = new PIXI.Sprite();
  }

  async init() {
    // Using a texture with a temporary canvas
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw a simple representation
      ctx.fillStyle = this.id.includes("potion") ? "purple" : "gold";
      ctx.beginPath();
      ctx.arc(32, 32, 16, 0, Math.PI * 2);
      ctx.fill();

      // Create texture from canvas
      const texture = PIXI.Texture.from(canvas);
      this.sprite.texture = texture;
    }

    // Set up sprite properties
    this.sprite.anchor.set(0.5);

    // Add simple animation
    this.startFloatingAnimation();

    return this;
  }

  startFloatingAnimation() {
    // Set initial position
    this.sprite.y = 0;

    // Store original y position for animation reference
    const originalY = this.sprite.y;

    // Animation speed
    const speed = 0.05 + Math.random() * 0.05;

    // Animation amplitude
    const amplitude = 5 + Math.random() * 3;

    // Custom update function for floating animation
    const customUpdate = (delta: number) => {
      // Calculate new y position for floating effect
      const time = Date.now() * speed;
      const offset = Math.sin(time) * amplitude;
      this.sprite.y = originalY + offset;
    };

    // Store the custom update function for later
    (this as any).customUpdate = customUpdate;
  }

  update(delta: number) {
    // Call custom update if available
    if ((this as any).customUpdate) {
      (this as any).customUpdate(delta);
    }

    // Gentle rotation
    this.sprite.rotation += 0.005 * delta;
  }
}
