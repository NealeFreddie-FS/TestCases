"use client";

import { GameEngine } from "../GameEngine";

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: {
    id: string;
    description: string;
    completed: boolean;
    count?: number;
    required?: number;
  }[];
  rewards: {
    gold?: number;
    experience?: number;
    items?: string[];
  };
  completed: boolean;
  npcId?: string;
}

export class QuestManager {
  engine: GameEngine;
  quests: Record<string, Quest> = {};
  activeQuestId: string | null = null;

  constructor(engine: GameEngine) {
    this.engine = engine;

    // Initialize default quests
    this.quests = {
      quest_lost_amulet: {
        id: "quest_lost_amulet",
        title: "The Lost Amulet",
        description:
          "A village elder has lost a family heirloom - a magical amulet. Find it in the ancient ruins to the east.",
        objectives: [
          {
            id: "find_amulet",
            description: "Find the lost amulet",
            completed: false,
          },
          {
            id: "return_amulet",
            description: "Return the amulet to the elder",
            completed: false,
          },
        ],
        rewards: {
          gold: 50,
          experience: 100,
          items: ["health_potion"],
        },
        completed: false,
        npcId: "village_elder",
      },
      quest_delivery: {
        id: "quest_delivery",
        title: "Delivery Run",
        description:
          "The shopkeeper needs you to deliver a package to the neighboring town.",
        objectives: [
          {
            id: "take_package",
            description: "Take the package from the shopkeeper",
            completed: false,
          },
          {
            id: "deliver_package",
            description: "Deliver the package to the town guard",
            completed: false,
          },
        ],
        rewards: {
          gold: 30,
          experience: 50,
        },
        completed: false,
        npcId: "shopkeeper",
      },
    };
  }

  handleQuestInteraction(questId: string) {
    // Check if the quest exists
    const quest = this.quests[questId];
    if (!quest) {
      console.warn(`Quest with ID ${questId} not found`);
      return;
    }

    // If the quest is not already assigned, add it
    if (!this.engine.gameState.quests.includes(questId)) {
      this.addQuest(questId);

      // Show dialog if it exists
      if (this.engine.dialogManager) {
        this.engine.dialogManager.startDialog(
          quest.npcId || "quest_giver",
          questId
        );
      }
      return;
    }

    // If the quest is already assigned but not completed
    if (!quest.completed) {
      // Check if all objectives are completed
      const allCompleted = quest.objectives.every((o) => o.completed);

      if (allCompleted) {
        // Complete the quest
        this.completeQuest(questId);
        return;
      }

      // Update a relevant objective if any
      for (const objective of quest.objectives) {
        if (!objective.completed) {
          this.updateObjective(questId, objective.id);
          return;
        }
      }
    }
  }

  getQuest(questId: string): Quest | null {
    return this.quests[questId] || null;
  }

  getActiveQuests(): Quest[] {
    return Object.values(this.quests).filter(
      (quest) =>
        !quest.completed && this.engine.gameState.quests.includes(quest.id)
    );
  }

  getCompletedQuests(): Quest[] {
    return Object.values(this.quests).filter(
      (quest) =>
        quest.completed && this.engine.gameState.quests.includes(quest.id)
    );
  }

  addQuest(questId: string) {
    // Check if the quest exists
    if (!this.quests[questId]) {
      console.log("Quest doesn't exist");
      return;
    }

    // Check if player already has this quest
    if (this.engine.gameState.quests.includes(questId)) {
      console.log("Quest already accepted");
      return;
    }

    // Add quest to player's active quests
    const newQuests = [...this.engine.gameState.quests, questId];
    this.engine.updateGameState({
      quests: newQuests,
    });
  }

  updateObjective(questId: string, objectiveId: string, progress: number = 1) {
    // Find the quest
    const quest = this.quests[questId];
    if (!quest) return;

    // Find the objective
    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (!objective) return;

    // If objective has count tracking
    if (objective.count !== undefined && objective.required !== undefined) {
      objective.count += progress;

      // Check if objective is completed
      objective.completed = objective.count >= objective.required;
    } else {
      // Simple completion
      objective.completed = true;
    }

    // Check if all objectives are completed
    const allCompleted = quest.objectives.every((o) => o.completed);

    // If all objectives completed, mark quest as completed
    if (allCompleted && !quest.completed) {
      this.completeQuest(questId);
    }
  }

  completeQuest(questId: string) {
    // Find the quest
    const quest = this.quests[questId];
    if (!quest) return;

    // Mark as completed
    quest.completed = true;

    // Award rewards
    if (quest.rewards) {
      const rewards = quest.rewards;

      // Update player stats
      const updates: any = {};

      if (rewards.gold) {
        updates.gold = this.engine.gameState.gold + rewards.gold;
      }

      if (rewards.experience) {
        const newExperience =
          this.engine.gameState.experience + rewards.experience;
        updates.experience = newExperience;

        // Check for level up
        const currentLevel = this.engine.gameState.level;
        const expNeeded = currentLevel * 100;

        if (newExperience >= expNeeded) {
          updates.level = currentLevel + 1;
        }
      }

      // Update game state with rewards
      this.engine.updateGameState(updates);

      // Add reward items to inventory if any
      if (rewards.items && rewards.items.length > 0) {
        rewards.items.forEach((itemId) => {
          if (this.engine.inventoryManager) {
            this.engine.inventoryManager.addItem(itemId);
          }
        });
      }
    }
  }

  abandonQuest(questId: string) {
    // Remove quest from player's active quests
    const newQuests = this.engine.gameState.quests.filter(
      (id) => id !== questId
    );
    this.engine.updateGameState({
      quests: newQuests,
    });
  }

  interactWithNPC(npcId: string) {
    // Check for quests associated with this NPC
    const npcQuests = Object.values(this.quests).filter(
      (q) => q.npcId === npcId
    );

    if (npcQuests.length === 0) return;

    // First, check for completable quests
    const completableQuests = npcQuests.filter(
      (q) =>
        !q.completed &&
        this.engine.gameState.quests.includes(q.id) &&
        q.objectives.every((o) => o.completed)
    );

    if (completableQuests.length > 0) {
      // Complete the first completable quest
      this.completeQuest(completableQuests[0].id);
      return;
    }

    // Next, check for in-progress quests
    const inProgressQuests = npcQuests.filter(
      (q) => !q.completed && this.engine.gameState.quests.includes(q.id)
    );

    if (inProgressQuests.length > 0) {
      // Update first quest's objectives that can be updated by talking to this NPC
      const quest = inProgressQuests[0];
      const objectives = quest.objectives.filter(
        (o) =>
          (!o.completed && o.id.includes("talk_to")) ||
          o.id.includes("return_to")
      );

      if (objectives.length > 0) {
        this.updateObjective(quest.id, objectives[0].id);
      }

      return;
    }

    // Finally, check for available quests
    const availableQuests = npcQuests.filter(
      (q) => !this.engine.gameState.quests.includes(q.id)
    );

    if (availableQuests.length > 0) {
      // Add the first available quest
      this.addQuest(availableQuests[0].id);
    }
  }

  update(delta: number) {
    // Nothing to update for quest manager currently
  }
}
