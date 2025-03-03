/**
 * Utility functions for game initialization
 */

// Ensure proper TypeScript typing of window object
declare global {
  interface Window {
    __characterCreationCompleted?: boolean;
  }
}

// Global state to track if character creation is complete
let characterCreationCompleted = false;

// Character classes available in Dark Souls
export type CharacterClass =
  | "knight"
  | "warrior"
  | "pyromancer"
  | "sorcerer"
  | "cleric";

// Character information interface
export interface CharacterInfo {
  name: string;
  class: CharacterClass;
  level: number;
  stats: {
    vitality: number;
    attunement: number;
    endurance: number;
    strength: number;
    dexterity: number;
    resistance: number;
    intelligence: number;
    faith: number;
    humanity: number;
  };
  alignment?: string; // Optional alignment property
  realm?: string; // Optional realm property
}

// Default character stats
const DEFAULT_STATS = {
  knight: {
    vitality: 14,
    attunement: 8,
    endurance: 12,
    strength: 14,
    dexterity: 14,
    resistance: 10,
    intelligence: 9,
    faith: 11,
    humanity: 0,
  },
  warrior: {
    vitality: 11,
    attunement: 8,
    endurance: 12,
    strength: 13,
    dexterity: 13,
    resistance: 11,
    intelligence: 9,
    faith: 9,
    humanity: 0,
  },
  pyromancer: {
    vitality: 10,
    attunement: 12,
    endurance: 11,
    strength: 12,
    dexterity: 9,
    resistance: 12,
    intelligence: 10,
    faith: 8,
    humanity: 0,
  },
  sorcerer: {
    vitality: 8,
    attunement: 15,
    endurance: 8,
    strength: 9,
    dexterity: 11,
    resistance: 8,
    intelligence: 15,
    faith: 8,
    humanity: 0,
  },
  cleric: {
    vitality: 11,
    attunement: 11,
    endurance: 9,
    strength: 12,
    dexterity: 8,
    resistance: 11,
    intelligence: 8,
    faith: 14,
    humanity: 0,
  },
};

// Default character
const DEFAULT_CHARACTER: CharacterInfo = {
  name: "Chosen Undead",
  class: "knight",
  level: 1,
  stats: DEFAULT_STATS.knight,
};

// Local storage keys
const CHARACTER_CREATION_COMPLETED_KEY = "characterCreationCompleted";
const CHARACTER_INFO_KEY = "characterInfo";

/**
 * Check if character creation is completed
 * @returns True if character creation is completed, false otherwise
 */
export const isCharacterCreationCompleted = (): boolean => {
  if (typeof window === "undefined") return false;

  const completed = localStorage.getItem(CHARACTER_CREATION_COMPLETED_KEY);
  return completed === "true";
};

/**
 * Mark character creation as completed and save character info
 * @param characterInfo - Character information to save
 */
export const completeCharacterCreation = (
  characterInfo: CharacterInfo
): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(CHARACTER_CREATION_COMPLETED_KEY, "true");
  localStorage.setItem(CHARACTER_INFO_KEY, JSON.stringify(characterInfo));

  // Set a global flag for other parts of the application to check
  if (typeof window !== "undefined") {
    (window as any).__characterCreationCompleted = true;
  }
};

/**
 * Reset character creation state
 */
export const resetCharacterCreation = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CHARACTER_CREATION_COMPLETED_KEY);
  localStorage.removeItem(CHARACTER_INFO_KEY);

  // Reset the global flag
  if (typeof window !== "undefined") {
    (window as any).__characterCreationCompleted = false;
  }
};

/**
 * Save character information to localStorage
 */
export function saveCharacterInfo(character: CharacterInfo): void {
  try {
    localStorage.setItem("darkSoulsCharacter", JSON.stringify(character));
    console.log("Character saved:", character.name);
  } catch (error) {
    console.error("Failed to save character:", error);
  }
}

/**
 * Get character information from localStorage
 */
export function getCharacterInfo(): CharacterInfo | null {
  try {
    const savedCharacter = localStorage.getItem("darkSoulsCharacter");
    if (savedCharacter) {
      return JSON.parse(savedCharacter) as CharacterInfo;
    }
    return DEFAULT_CHARACTER;
  } catch (error) {
    console.error("Failed to load character:", error);
    return DEFAULT_CHARACTER;
  }
}

/**
 * Create a new character with default stats
 */
export function createNewCharacter(
  name: string,
  characterClass: CharacterClass
): CharacterInfo {
  const newCharacter: CharacterInfo = {
    name,
    class: characterClass,
    level: 1,
    stats: DEFAULT_STATS[characterClass],
  };

  saveCharacterInfo(newCharacter);
  return newCharacter;
}

/**
 * Update character information
 * @param updates - Partial character information to update
 */
export const updateCharacterInfo = (updates: CharacterInfo): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(CHARACTER_INFO_KEY, JSON.stringify(updates));
};

/**
 * Initialize character creation state
 * This should be called early in the application lifecycle
 */
export const initializeGameState = (): void => {
  if (typeof window === "undefined") return;

  // Set the global flag based on localStorage
  (window as any).__characterCreationCompleted = isCharacterCreationCompleted();

  // Add a debug message
  console.debug(
    "Game state initialized, character creation completed:",
    isCharacterCreationCompleted()
  );
};

/**
 * Game initialization criteria
 */
interface GameInitCriteria {
  /** Is the user on a game path? */
  isGamePath: boolean;
  /** Is character creation completed? */
  characterCreationDone: boolean;
  /** Does the URL have character information? */
  hasCharacterInfo: boolean;
  /** Does the path contain 'new-game'? */
  isNewGamePath: boolean;
}

/**
 * Determines if the game engine should initialize based on the current route and character creation status
 * @returns {boolean} True if the game engine should initialize, false otherwise
 */
export function shouldInitializeGameEngine(): boolean {
  if (typeof window === "undefined") {
    return false; // Don't initialize during SSR
  }

  // Get the current path
  const path = window.location.pathname;

  // Collect criteria for initialization decision
  const criteria: GameInitCriteria = {
    isGamePath: path === "/game" || path.startsWith("/game/"),
    characterCreationDone: isCharacterCreationCompleted(),
    hasCharacterInfo:
      window.location.search.includes("name=") &&
      window.location.search.includes("class="),
    isNewGamePath: path.includes("new-game"),
  };

  // Don't initialize if:
  // 1. We're not on a game path, OR
  // 2. We're on a new-game path, OR
  // 3. Character creation isn't done AND we don't have character info in the URL
  const shouldInitialize =
    criteria.isGamePath &&
    !criteria.isNewGamePath &&
    (criteria.characterCreationDone || criteria.hasCharacterInfo);

  console.log(
    `Game Initialization Status:\n` +
      `- Path: ${path}\n` +
      `- Character creation completed: ${criteria.characterCreationDone}\n` +
      `- Has character info: ${criteria.hasCharacterInfo}\n` +
      `- Should initialize game engine: ${shouldInitialize}`
  );

  return shouldInitialize;
}

/**
 * Safely redirects to another page
 * @param {string} path The path to redirect to
 */
export function safeRedirect(path: string): void {
  if (typeof window !== "undefined") {
    console.log(`Redirecting to: ${path}`);
    window.location.href = path;
  }
}

/**
 * Create a URL with character parameters
 * @param character The character information to include in the URL
 * @returns The formatted URL string
 */
export function createCharacterUrl(character: CharacterInfo): string {
  return `/game?name=${encodeURIComponent(
    character.name
  )}&class=${encodeURIComponent(character.class)}&level=${encodeURIComponent(
    character.level.toString()
  )}${
    character.alignment
      ? `&alignment=${encodeURIComponent(character.alignment)}`
      : ""
  }${character.realm ? `&realm=${encodeURIComponent(character.realm)}` : ""}`;
}
