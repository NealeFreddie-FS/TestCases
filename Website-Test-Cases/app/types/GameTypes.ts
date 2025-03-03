/**
 * Types for the game system
 */

// Character class types
export type CharacterClass =
  | "knight"
  | "warrior"
  | "sorcerer"
  | "pyromancer"
  | "cleric"
  | "deprived";

// Character attributes
export interface CharacterStats {
  vitality: number;
  attunement: number;
  endurance: number;
  strength: number;
  dexterity: number;
  resistance: number;
  intelligence: number;
  faith: number;
  humanity: number;
}

// Character information
export interface CharacterInfo {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  souls: number;
  stats?: CharacterStats;
  created?: Date;
  currentLocation?: string;
  bonfires?: string[];
  equipment?: Record<string, any>;
}

// Game state interface
export interface GameState {
  character: CharacterInfo | null;
  paused: boolean;
  loading: boolean;
  currentArea: string;
  areas: Record<string, AreaInfo>;
  npcs: Record<string, NpcInfo>;
  inventory: InventoryItem[];
}

// Area information
export interface AreaInfo {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  connectedAreas: string[];
  enemies: string[];
  npcs: string[];
  items: string[];
  bonfires: string[];
}

// NPC information
export interface NpcInfo {
  id: string;
  name: string;
  description: string;
  dialogue: DialogueLine[];
  quests: Quest[];
  merchant: boolean;
  hostile: boolean;
  location: string;
}

// Dialogue structure
export interface DialogueLine {
  id: string;
  text: string;
  condition?: () => boolean;
  responses?: DialogueResponse[];
}

export interface DialogueResponse {
  id: string;
  text: string;
  action?: () => void;
  next?: string;
}

// Quest structure
export interface Quest {
  id: string;
  name: string;
  description: string;
  steps: QuestStep[];
  rewards: Reward[];
  completed: boolean;
}

export interface QuestStep {
  id: string;
  description: string;
  completed: boolean;
}

// Rewards
export interface Reward {
  type: "item" | "souls" | "stat";
  id?: string;
  amount: number;
}

// Inventory item
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "weapon" | "armor" | "consumable" | "key" | "spell" | "material";
  stackable: boolean;
  quantity: number;
  stats?: Record<string, number | string>;
  icon?: string;
}
