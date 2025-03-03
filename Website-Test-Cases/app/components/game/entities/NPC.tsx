"use client";

import * as PIXI from "pixi.js";

export class NPC {
  id: string;
  data: any;
  sprite: PIXI.Sprite;

  constructor(id: string, data: any) {
    this.id = id;
    this.data = data;
    this.sprite = new PIXI.Sprite();
  }

  async init() {
    // Create a canvas for the NPC
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw a cyan circle for NPCs
      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // Create texture from canvas
    const texture = PIXI.Texture.from(canvas);
    this.sprite.texture = texture;

    // Set up sprite properties
    this.sprite.anchor.set(0.5);

    return this;
  }

  getApp() {
    // This is a placeholder. In a real implementation,
    // we'd need a way to access the PIXI.Application
    // This could be passed into the constructor or stored globally
    return null;
  }

  update(delta: number) {
    // Simple idle animation - small bob up and down
    if (this.sprite) {
      this.sprite.y += Math.sin(Date.now() / 500) * 0.5;
    }
  }
}
