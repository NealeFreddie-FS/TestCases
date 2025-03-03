import { Container, Sprite, Texture } from "pixi.js";

export class Chest {
  id: string;
  sprite: Container;
  isOpen: boolean = false;
  private chestClosed: Sprite;
  private chestOpen: Sprite;
  private contents: string | null = null;

  constructor(
    id: string,
    x: number,
    y: number,
    contents: string | null = null
  ) {
    this.id = id;
    this.contents = contents;

    // Create container for all chest visuals
    this.sprite = new Container();
    this.sprite.x = x;
    this.sprite.y = y;

    // Create chest sprites
    // Using placeholder textures - replace with actual chest textures
    this.chestClosed = new Sprite(Texture.from("/assets/chest_closed.png"));
    this.chestOpen = new Sprite(Texture.from("/assets/chest_open.png"));

    // Center the sprites
    this.chestClosed.anchor.set(0.5);
    this.chestOpen.anchor.set(0.5);

    // Initially show the closed chest
    this.sprite.addChild(this.chestClosed);
  }

  // Open the chest
  open() {
    if (this.isOpen) return;

    this.isOpen = true;

    // Swap sprites
    this.sprite.removeChild(this.chestClosed);
    this.sprite.addChild(this.chestOpen);

    // Play a sound effect
    // this.playSoundEffect('chest_open.mp3');

    console.log(`Chest opened: ${this.id}`);
  }

  // Method to interact with the chest
  interact() {
    if (!this.isOpen) {
      this.open();
      return {
        type: "chest_opened",
        contents: this.contents,
      };
    }
    return null;
  }

  // Get what's inside the chest
  getContents() {
    return this.contents;
  }

  // Update method (called each frame)
  update(delta: number) {
    // Chests don't need updating logic in most cases
    // Could add animation or particle effects here if needed
  }
}
