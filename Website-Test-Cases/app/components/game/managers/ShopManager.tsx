"use client";

import { GameEngine } from "../GameEngine";

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export class ShopManager {
  engine: GameEngine;
  shopOpen: boolean = false;
  shopItems: ShopItem[] = [];

  constructor(engine: GameEngine) {
    this.engine = engine;

    // Initialize default shop inventory
    this.shopItems = [
      {
        id: "health_potion",
        name: "Health Potion",
        price: 10,
        description: "Restores 30 HP",
      },
      {
        id: "mana_potion",
        name: "Mana Potion",
        price: 15,
        description: "Restores 20 MP",
      },
      {
        id: "iron_sword",
        name: "Iron Sword",
        price: 50,
        description: "+5 Attack",
      },
      {
        id: "leather_armor",
        name: "Leather Armor",
        price: 45,
        description: "+3 Defense",
      },
    ];
  }

  openShop(shopId?: string) {
    console.log(`Opening shop${shopId ? ` ${shopId}` : ""}`);
    this.shopOpen = true;
    this.engine.setGameMode("shop");

    // If shopId is provided, we could load specific shop inventory
    if (shopId) {
      // For example, load shop-specific items
      this.loadShopInventory(shopId);
    }
  }

  // Helper method to load shop-specific inventory
  private loadShopInventory(shopId: string) {
    // This could be expanded to load different inventories based on the shop
    console.log(`Loading inventory for shop: ${shopId}`);

    // Just as an example - we could have different shops with different inventories
    if (shopId === "blacksmith") {
      this.shopItems = [
        {
          id: "sword_upgrade",
          name: "Sword Upgrade",
          price: 100,
          description: "Increases attack power",
        },
        {
          id: "shield",
          name: "Shield",
          price: 80,
          description: "Provides protection from attacks",
        },
      ];
    } else if (shopId === "potion_shop") {
      this.shopItems = [
        {
          id: "health_potion",
          name: "Health Potion",
          price: 10,
          description: "Restores 30 HP",
        },
        {
          id: "mana_potion",
          name: "Mana Potion",
          price: 15,
          description: "Restores 20 MP",
        },
      ];
    }
  }

  closeShop() {
    this.shopOpen = false;
    this.engine.setGameMode("exploration");
  }

  buyItem(itemId: string) {
    // Find the item
    const item = this.shopItems.find((item) => item.id === itemId);
    if (!item) {
      console.log("Item not found in shop");
      return;
    }

    // Check if player has enough gold
    if (this.engine.gameState.gold < item.price) {
      console.log("Not enough gold");
      return;
    }

    // Add item to inventory and subtract gold
    if (this.engine.inventoryManager) {
      this.engine.inventoryManager.addItem(itemId);

      // Update gold
      this.engine.updateGameState({
        gold: this.engine.gameState.gold - item.price,
      });
    }
  }

  sellItem(itemId: string) {
    // Make sure the item exists in player inventory
    if (!this.engine.gameState.inventory.includes(itemId)) {
      console.log("Item not in inventory");
      return;
    }

    // Get the sell price
    const sellPrice = this.getItemSellPrice(itemId);

    // Remove item from inventory and add gold
    if (this.engine.inventoryManager) {
      this.engine.inventoryManager.removeItem(itemId);

      // Update gold
      this.engine.updateGameState({
        gold: this.engine.gameState.gold + sellPrice,
      });
    }
  }

  getItemSellPrice(itemId: string): number {
    // Find the item in the shop
    const shopItem = this.shopItems.find((item) => item.id === itemId);

    // If item exists in shop, sell for half price
    if (shopItem) {
      return Math.floor(shopItem.price / 2);
    }

    // Default sell price for items not in shop
    return 5;
  }

  update(delta: number) {
    // Nothing to update for shop manager currently
  }
}
