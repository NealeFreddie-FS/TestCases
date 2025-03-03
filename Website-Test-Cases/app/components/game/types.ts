// Basic direction type used throughout the game
export type Direction = "up" | "down" | "left" | "right";

// Character animation states
export type AnimationState = "idle" | "walking" | "attack" | "damaged" | "dead";

// Item types
export type ItemType =
  | "weapon"
  | "shield"
  | "potion"
  | "key"
  | "rupee"
  | "heart"
  | "bomb"
  | "bow";

// Game modes
export type GameMode =
  | "exploration"
  | "dialogue"
  | "menu"
  | "paused"
  | "game_over"
  | "victory";

// Time phases for the day/night cycle
export type TimePhase = "dawn" | "zenith" | "dusk" | "midnight";

// Time-based effect types
export type TimeEffect =
  | "lighting"
  | "weather"
  | "npc_behavior"
  | "quest_availability"
  | "enemy_spawn";

// Prophecy-related time events
export type ProphecyEvent =
  | "lunar_alignment"
  | "solar_eclipse"
  | "convergence"
  | "celestial_storm";
