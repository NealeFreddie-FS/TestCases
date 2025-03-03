"use client";

import { GameEngine } from "../GameEngine";
import { Viewport } from "pixi-viewport";

export class InputManager {
  engine: GameEngine;
  keys: Record<string, boolean> = {};
  pressedThisFrame: Record<string, boolean> = {};
  mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  mouseButtons: { left: boolean; right: boolean } = {
    left: false,
    right: false,
  };
  mouseButtonsJustPressed: { left: boolean; right: boolean } = {
    left: false,
    right: false,
  };

  // Modern WASD control mapping
  controlMap = {
    up: ["KeyW"],
    down: ["KeyS"],
    left: ["KeyA"],
    right: ["KeyD"],
    sprint: ["ShiftLeft"],
    interact: ["KeyE"],
    inventory: ["Tab"],
    pause: ["Escape"],
  };

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init() {
    // Add keyboard event listeners
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Add mouse event listeners
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("contextmenu", this.preventContextMenu);

    // Reset keys and mouse
    this.keys = {};
    this.pressedThisFrame = {};
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = { left: false, right: false };
    this.mouseButtonsJustPressed = { left: false, right: false };
  }

  handleKeyDown = (event: KeyboardEvent) => {
    // Store key state
    this.keys[event.code] = true;

    // Track keys pressed this frame for isKeyJustPressed
    if (!this.pressedThisFrame[event.code]) {
      this.pressedThisFrame[event.code] = true;
    }

    if (this.isButtonJustPressed("interact")) {
      if (this.engine.currentMode === "exploration") {
        this.engine.handleAction("interact");
      }
    }

    if (this.isButtonJustPressed("pause")) {
      this.engine.handleAction("togglePause");
    }

    if (this.isButtonJustPressed("inventory")) {
      this.engine.handleAction("toggleInventory");
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    // Clear key state
    this.keys[event.code] = false;
  };

  handleMouseMove = (event: MouseEvent) => {
    // Get mouse position relative to the game canvas
    const rect = this.engine.app.view.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    // Update player's attack direction based on mouse position
    if (this.engine.player && this.engine.viewport) {
      this.updatePlayerAttackDirection();
    }
  };

  handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      // Left click
      this.mouseButtons.left = true;
      this.mouseButtonsJustPressed.left = true;

      // Light attack towards mouse
      if (this.engine.currentMode === "exploration") {
        this.engine.handleAction("lightAttack", {
          mouseX: this.mousePosition.x,
          mouseY: this.mousePosition.y,
        });
      }
    } else if (event.button === 2) {
      // Right click
      this.mouseButtons.right = true;
      this.mouseButtonsJustPressed.right = true;

      // Block
      if (this.engine.currentMode === "exploration") {
        this.engine.handleAction("block");
      }
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      // Left click
      this.mouseButtons.left = false;
    } else if (event.button === 2) {
      // Right click
      this.mouseButtons.right = false;

      // Stop blocking when right click is released
      if (this.engine.currentMode === "exploration") {
        this.engine.handleAction("stopBlock");
      }
    }
  };

  preventContextMenu = (event: MouseEvent) => {
    // Prevent right-click context menu
    event.preventDefault();
  };

  update(delta: number) {
    // Clear keys pressed this frame at the end of the frame
    this.pressedThisFrame = {};
    this.mouseButtonsJustPressed = { left: false, right: false };
  }

  updatePlayerAttackDirection() {
    if (!this.engine.player || !this.engine.viewport) return;

    // Calculate the target position in world coordinates
    const viewportPos = this.engine.viewport as Viewport;
    const worldMouseX = this.mousePosition.x + viewportPos.left;
    const worldMouseY = this.mousePosition.y + viewportPos.top;

    // Calculate angle between player and mouse
    const dx = worldMouseX - this.engine.player.sprite.x;
    const dy = worldMouseY - this.engine.player.sprite.y;
    const angle = Math.atan2(dy, dx);

    // Determine the facing direction based on the angle
    // Convert radians to degrees and normalize to 0-360
    const degrees = ((angle * 180) / Math.PI + 360) % 360;

    // Set player direction based on angle
    if (degrees >= 315 || degrees < 45) {
      this.engine.player.direction = "right";
    } else if (degrees >= 45 && degrees < 135) {
      this.engine.player.direction = "down";
    } else if (degrees >= 135 && degrees < 225) {
      this.engine.player.direction = "left";
    } else {
      this.engine.player.direction = "up";
    }
  }

  isKeyDown(keyCode: string): boolean {
    return !!this.keys[keyCode];
  }

  isKeyJustPressed(keyCode: string): boolean {
    return !!this.pressedThisFrame[keyCode];
  }

  isKeyPressed(code: string): boolean {
    return !!this.keys[code];
  }

  isButtonPressed(button: keyof typeof this.controlMap): boolean {
    return this.controlMap[button].some((key) => this.isKeyPressed(key));
  }

  isButtonJustPressed(button: keyof typeof this.controlMap): boolean {
    return this.controlMap[button].some((key) => this.isKeyJustPressed(key));
  }

  getDirectionalInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // Allow diagonal movement (multiple directions at once)
    if (this.isButtonPressed("up")) {
      y = -1;
    }
    if (this.isButtonPressed("down")) {
      y = 1;
    }
    if (this.isButtonPressed("left")) {
      x = -1;
    }
    if (this.isButtonPressed("right")) {
      x = 1;
    }

    // Normalize diagonal movement to prevent faster diagonal speed
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x = x / length;
      y = y / length;
    }

    return { x, y };
  }

  destroy() {
    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("contextmenu", this.preventContextMenu);
  }
}
