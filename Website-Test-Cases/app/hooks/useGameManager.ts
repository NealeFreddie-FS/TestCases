"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GameState, CharacterInfo } from "../types/GameTypes";

interface GameManagerContextType {
  gameState: GameState;
  character: CharacterInfo | null;
  isPaused: boolean;
  isLoading: boolean;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateCharacter: (character: CharacterInfo) => void;
}

// Default game state
const defaultGameState: GameState = {
  character: null,
  paused: false,
  loading: false,
  currentArea: "firelink-shrine",
  areas: {},
  npcs: {},
  inventory: [],
};

// Create context with a default value
const GameManagerContext = createContext<GameManagerContextType>({
  gameState: defaultGameState,
  character: null,
  isPaused: false,
  isLoading: false,
  setPaused: () => {},
  setLoading: () => {},
  updateCharacter: () => {},
});

// Provider component
export const GameManagerProvider = ({ children }: { children: ReactNode }) => {
  // Main game state
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  // Helper functions to update state
  const setPaused = (paused: boolean) => {
    setGameState((prev) => ({ ...prev, paused }));
  };

  const setLoading = (loading: boolean) => {
    setGameState((prev) => ({ ...prev, loading }));
  };

  const updateCharacter = (character: CharacterInfo) => {
    setGameState((prev) => ({ ...prev, character }));
  };

  // Initial game setup
  useEffect(() => {
    // Load character data from storage or use default
    const defaultCharacter: CharacterInfo = {
      id: "player1",
      name: "Chosen Undead",
      class: "knight",
      level: 10,
      souls: 2500,
      stats: {
        vitality: 14,
        attunement: 8,
        endurance: 12,
        strength: 14,
        dexterity: 14,
        resistance: 10,
        intelligence: 9,
        faith: 11,
        humanity: 1,
      },
    };

    // Set the initial character
    updateCharacter(defaultCharacter);
  }, []);

  // The context value that will be provided
  const contextValue = {
    gameState,
    character: gameState.character,
    isPaused: gameState.paused,
    isLoading: gameState.loading,
    setPaused,
    setLoading,
    updateCharacter,
  };

  return (
    <GameManagerContext.Provider value={contextValue}>
      {children}
    </GameManagerContext.Provider>
  );
};

// Custom hook to use the game manager
export const useGameManager = () => {
  const context = useContext(GameManagerContext);
  if (!context) {
    throw new Error("useGameManager must be used within a GameManagerProvider");
  }
  return context;
};

export default useGameManager;
