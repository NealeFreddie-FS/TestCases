"use client";

import { GameEngine } from "../GameEngine";
import { Enemy, EnemyType } from "../entities/Enemy";

export class CombatManager {
  engine: GameEngine;
  currentEnemy: Enemy | null = null;
  inCombat: boolean = false;
  playerTurn: boolean = true;
  turnDelay: number = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  setupCombat(enemyType: EnemyType, level?: number) {
    // Create an enemy with the specified type and level
    const enemyLevel =
      level ||
      Math.max(
        1,
        this.engine.gameState.level - 1 + Math.floor(Math.random() * 3)
      );

    // Start combat with this enemy type
    this.startCombat(enemyType);
  }

  startCombat(enemyType?: EnemyType) {
    // Default enemy type if none provided
    if (!enemyType) {
      enemyType = this.getRandomEnemyType();
    }

    // Create enemy data
    const enemyData = {
      type: enemyType,
      name: this.getEnemyName(enemyType),
      level: Math.max(
        1,
        this.engine.gameState.level - 1 + Math.floor(Math.random() * 3)
      ),
      health: 60 + Math.floor(Math.random() * 40),
      maxHealth: 100,
      attack: 5 + Math.floor(Math.random() * 5),
      defense: 3 + Math.floor(Math.random() * 3),
      experience: 20 + Math.floor(Math.random() * 20),
      gold: 5 + Math.floor(Math.random() * 15),
    };

    // Set max health to match initial health
    enemyData.maxHealth = enemyData.health;

    // Update game state
    this.engine.updateGameState({
      currentEnemy: enemyData,
    });

    // Create enemy entity (would be used in a real implementation)
    // this.currentEnemy = new Enemy(`enemy_${Date.now()}`, enemyData);

    // Set combat flag
    this.inCombat = true;
    this.playerTurn = true;

    // Change game mode
    this.engine.setGameMode("combat");
  }

  playerAttack() {
    if (!this.playerTurn || !this.engine.gameState.currentEnemy) return;

    // Calculate damage
    const damage = 10 + Math.floor(Math.random() * 5);

    // Update enemy health
    const enemy = { ...this.engine.gameState.currentEnemy };
    enemy.health = Math.max(0, enemy.health - damage);

    // Update game state
    this.engine.updateGameState({
      currentEnemy: enemy,
    });

    // Check if enemy defeated
    if (enemy.health <= 0) {
      this.endCombat(true);
      return;
    }

    // End player turn
    this.playerTurn = false;
    this.turnDelay = 1; // 1 second delay before enemy turn
  }

  useSkill(skillId: string) {
    if (!this.playerTurn || !this.engine.gameState.currentEnemy) return;

    // Check mana cost
    const manaCost = this.getSkillManaCost(skillId);
    if (this.engine.gameState.mana < manaCost) {
      console.log("Not enough mana!");
      return;
    }

    // Calculate damage
    const damage = this.getSkillDamage(skillId);

    // Update enemy health and player mana
    const enemy = { ...this.engine.gameState.currentEnemy };
    enemy.health = Math.max(0, enemy.health - damage);

    this.engine.updateGameState({
      currentEnemy: enemy,
      mana: this.engine.gameState.mana - manaCost,
    });

    // Check if enemy defeated
    if (enemy.health <= 0) {
      this.endCombat(true);
      return;
    }

    // End player turn
    this.playerTurn = false;
    this.turnDelay = 1; // 1 second delay before enemy turn
  }

  useItem(itemId: string) {
    if (!this.playerTurn) return;

    // Process item usage
    if (itemId === "health_potion") {
      const healAmount = 30;
      const newHealth = Math.min(
        100,
        this.engine.gameState.health + healAmount
      );

      // Remove item from inventory
      const newInventory = [...this.engine.gameState.inventory];
      const itemIndex = newInventory.indexOf(itemId);
      if (itemIndex !== -1) {
        newInventory.splice(itemIndex, 1);
      }

      // Update game state
      this.engine.updateGameState({
        health: newHealth,
        inventory: newInventory,
      });
    }

    // End player turn
    this.playerTurn = false;
    this.turnDelay = 1; // 1 second delay before enemy turn
  }

  enemyTurn() {
    if (this.playerTurn || !this.engine.gameState.currentEnemy) return;

    // Calculate damage
    const enemy = this.engine.gameState.currentEnemy;
    const damage = Math.max(1, enemy.attack - Math.floor(Math.random() * 3));

    // Update player health
    this.engine.updateGameState({
      health: Math.max(0, this.engine.gameState.health - damage),
    });

    // Check if player defeated
    if (this.engine.gameState.health <= 0) {
      this.endCombat(false);
      return;
    }

    // End enemy turn
    this.playerTurn = true;
  }

  flee() {
    // 50% chance to flee
    if (Math.random() > 0.5) {
      this.endCombat(false);
    } else {
      // Failed to flee, enemy gets a free attack
      this.playerTurn = false;
      this.enemyTurn();
    }
  }

  endCombat(victory: boolean) {
    this.inCombat = false;

    if (victory && this.engine.gameState.currentEnemy) {
      // Award experience and gold
      const enemy = this.engine.gameState.currentEnemy;
      const newExperience = this.engine.gameState.experience + enemy.experience;
      const newGold = this.engine.gameState.gold + enemy.gold;

      // Check for level up
      let newLevel = this.engine.gameState.level;
      const expNeeded = newLevel * 100;

      if (newExperience >= expNeeded) {
        newLevel++;
      }

      // Update game state
      this.engine.updateGameState({
        experience: newExperience,
        gold: newGold,
        level: newLevel,
        currentEnemy: undefined,
      });
    } else {
      // Just end combat
      this.engine.updateGameState({
        currentEnemy: undefined,
      });
    }

    // Return to exploration
    this.engine.setGameMode("exploration");
  }

  update(delta: number) {
    // Handle enemy turn after delay
    if (!this.playerTurn && this.turnDelay > 0) {
      this.turnDelay -= delta / 60; // Convert frames to seconds

      if (this.turnDelay <= 0) {
        this.enemyTurn();
      }
    }
  }

  // Helper methods
  getRandomEnemyType(): EnemyType {
    const enemyTypes: EnemyType[] = [
      EnemyType.OCTOROK,
      EnemyType.MOBLIN,
      EnemyType.TEKTITE,
      EnemyType.LEEVER,
      EnemyType.ZORA,
      EnemyType.LYNEL,
      EnemyType.LIKE_LIKE,
      EnemyType.PEAHAT,
      EnemyType.DARKNUT,
      EnemyType.GORIYA,
    ];
    return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  }

  getEnemyName(type: EnemyType): string {
    const names: Record<string, string[]> = {
      [EnemyType.OCTOROK]: ["Red Octorok", "Blue Octorok", "Water Spitter"],
      [EnemyType.MOBLIN]: ["Red Moblin", "Blue Moblin", "Spear Thrower"],
      [EnemyType.TEKTITE]: ["Red Tektite", "Blue Tektite", "Mountain Hopper"],
      [EnemyType.LEEVER]: ["Red Leever", "Blue Leever", "Sand Burrower"],
      [EnemyType.ZORA]: ["Zora Warrior", "Lake Guardian", "Water Shooter"],
      [EnemyType.LYNEL]: ["Red Lynel", "Blue Lynel", "Centaur Warrior"],
      [EnemyType.LIKE_LIKE]: ["Like Like", "Shield Eater", "Rupee Consumer"],
      [EnemyType.PEAHAT]: ["Peahat", "Flying Plant", "Spinning Terror"],
      [EnemyType.DARKNUT]: ["Red Darknut", "Blue Darknut", "Armored Knight"],
      [EnemyType.GORIYA]: ["Red Goriya", "Blue Goriya", "Boomerang Thrower"],
    };

    const typeNames = names[type] || ["Unknown Enemy"];
    return typeNames[Math.floor(Math.random() * typeNames.length)];
  }

  getSkillManaCost(skillId: string): number {
    const skills: Record<string, number> = {
      fireball: 5,
      iceSpike: 7,
      heal: 10,
      thunderBolt: 8,
    };

    return skills[skillId] || 5;
  }

  getSkillDamage(skillId: string): number {
    const damages: Record<string, number> = {
      fireball: 20,
      iceSpike: 15,
      thunderBolt: 25,
    };

    return damages[skillId] || 10;
  }
}
