"use client";

import { GameEngine } from "../GameEngine";

// Item types and information
export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: "weapon" | "armor" | "potion" | "quest" | "key" | "misc";
  value: number;
  stats?: Record<string, number>;
  usable: boolean;
}

export class InventoryManager {
  engine: GameEngine;
  inventoryOpen: boolean = false;
  selectedItem: string | null = null;

  // Item database - Zelda NES style
  itemDatabase: Record<string, GameItem> = {
    health_potion: {
      id: "health_potion",
      name: "Health Potion",
      description: "Restores 1 heart",
      type: "potion",
      value: 10,
      stats: { healing: 1 },
      usable: true,
    },
    mana_potion: {
      id: "mana_potion",
      name: "Mana Potion",
      description: "Restores 20 MP",
      type: "potion",
      value: 15,
      stats: { mana: 20 },
      usable: true,
    },
    iron_sword: {
      id: "iron_sword",
      name: "Iron Sword",
      description: "A basic sword for combat",
      type: "weapon",
      value: 50,
      stats: { attack: 5 },
      usable: false,
    },
    leather_armor: {
      id: "leather_armor",
      name: "Leather Armor",
      description: "+3 Defense",
      type: "armor",
      value: 45,
      stats: { defense: 3 },
      usable: false,
    },
    bow: {
      id: "bow",
      name: "Bow",
      description: "Fires arrows at enemies",
      type: "weapon",
      value: 80,
      stats: { attack: 3 },
      usable: true,
    },
    bomb: {
      id: "bomb",
      name: "Bomb",
      description: "Explodes walls and enemies",
      type: "weapon",
      value: 20,
      stats: { attack: 8 },
      usable: true,
    },
    boomerang: {
      id: "boomerang",
      name: "Boomerang",
      description: "Stuns enemies and collects items",
      type: "weapon",
      value: 60,
      stats: { attack: 1 },
      usable: true,
    },
    magic_rod: {
      id: "magic_rod",
      name: "Magic Rod",
      description: "Fires magical blasts",
      type: "weapon",
      value: 100,
      stats: { attack: 7, magicCost: 5 },
      usable: true,
    },
    key: {
      id: "key",
      name: "Key",
      description: "Opens locked doors",
      type: "key",
      value: 5,
      usable: true,
    },
    map: {
      id: "map",
      name: "Map",
      description: "Shows dungeon layout",
      type: "key",
      value: 0,
      usable: false,
    },
    compass: {
      id: "compass",
      name: "Compass",
      description: "Points to hidden treasures",
      type: "key",
      value: 0,
      usable: false,
    },
  };

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  openInventory() {
    this.inventoryOpen = true;
    this.engine.setGameMode("inventory");
  }

  closeInventory() {
    this.inventoryOpen = false;
    this.engine.setGameMode("exploration");
  }

  toggleInventory() {
    if (this.inventoryOpen) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  }

  selectItem(itemId: string) {
    this.selectedItem = itemId;
  }

  useItem(itemId: string) {
    // Make sure the item exists in player inventory
    if (!this.engine.gameState.inventory.includes(itemId)) {
      console.log("Item not in inventory");
      return;
    }

    // Get item data
    const item = this.itemDatabase[itemId];
    if (!item) {
      console.log("Unknown item");
      return;
    }

    // Check if item is usable
    if (!item.usable) {
      console.log("Item cannot be used");
      return;
    }

    // Handle different item types
    if (item.type === "potion") {
      if (itemId === "health_potion") {
        // Apply healing - forward to player character
        if (this.engine.player) {
          const success = this.engine.player.useItem(itemId);
          if (success) {
            // Remove item and update health
            this.removeItem(itemId);
          }
        }
      } else if (itemId === "mana_potion") {
        // Restore mana
        const manaAmount = item.stats?.mana || 20;
        const newMana = Math.min(50, this.engine.gameState.mana + manaAmount);

        // Remove item and update mana
        this.removeItem(itemId);
        this.engine.updateGameState({
          mana: newMana,
        });
      }
    } else if (
      item.type === "weapon" &&
      ["bow", "bomb", "boomerang", "magic_rod"].includes(itemId)
    ) {
      // Use weapon
      const success = this.engine.player?.useItem(itemId);
      console.log(`Used ${itemId}: ${success ? "success" : "failed"}`);

      // Only consume bombs
      if (success && itemId === "bomb") {
        this.removeItem(itemId);
      }
    } else if (item.type === "key" && itemId === "key") {
      // Try to use key with a locked door
      console.log("Attempting to use key");
      // The actual door unlocking would be handled by game logic
    }
  }

  dropItem(itemId: string) {
    // Make sure the item exists
    if (!this.engine.gameState.inventory.includes(itemId)) {
      return;
    }

    // Remove from inventory
    this.removeItem(itemId);
  }

  addItem(itemId: string) {
    // Make sure the item exists in the database
    if (!this.itemDatabase[itemId]) {
      console.log("Unknown item");
      return;
    }

    // Add to inventory
    const newInventory = [...this.engine.gameState.inventory, itemId];
    this.engine.updateGameState({
      inventory: newInventory,
    });
  }

  removeItem(itemId: string) {
    // Find item index
    const inventory = [...this.engine.gameState.inventory];
    const itemIndex = inventory.indexOf(itemId);

    // Remove if found
    if (itemIndex !== -1) {
      inventory.splice(itemIndex, 1);

      // Update game state
      this.engine.updateGameState({
        inventory: inventory,
      });
    }
  }

  getItemDetails(itemId: string): GameItem | null {
    return this.itemDatabase[itemId] || null;
  }

  // Check if player has a specific item
  hasItem(itemId: string): boolean {
    return this.engine.gameState.inventory.includes(itemId);
  }

  // Get count of a specific item type (e.g., how many keys)
  getItemCount(itemId: string): number {
    return this.engine.gameState.inventory.filter((id) => id === itemId).length;
  }

  // Check if player has specific key items (Zelda-style)
  hasMap(): boolean {
    return this.hasItem("map");
  }

  hasCompass(): boolean {
    return this.hasItem("compass");
  }

  update(delta: number) {
    // Nothing to update for inventory currently
  }
}
