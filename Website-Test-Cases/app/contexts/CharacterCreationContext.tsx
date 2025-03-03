"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  completeCharacterCreation,
  resetCharacterCreation,
  isCharacterCreationCompleted,
  getCharacterInfo,
  updateCharacterInfo,
} from "../utils/game-utils";

/**
 * Define the character information type
 */
export interface CharacterInfo {
  name: string;
  class: string;
  level: number;
  attributes?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  [key: string]: any; // Allow for additional properties
}

/**
 * Define the context state type
 */
export interface CharacterCreationState {
  /** Whether character creation is completed */
  isCompleted: boolean;
  /** Current character information */
  characterInfo: CharacterInfo | null;
  /** Mark character creation as complete */
  completeCreation: (characterInfo: CharacterInfo) => void;
  /** Reset character creation */
  resetCreation: () => void;
  /** Update character information */
  updateCharacter: (updates: Partial<CharacterInfo>) => void;
}

/**
 * Create the context with a default value
 */
const CharacterCreationContext = createContext<
  CharacterCreationState | undefined
>(undefined);

/**
 * Character creation provider props
 */
export interface CharacterCreationProviderProps {
  children: ReactNode;
}

/**
 * Character creation context provider component
 */
export const CharacterCreationProvider: React.FC<
  CharacterCreationProviderProps
> = ({ children }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(
    null
  );

  // Initialize state from localStorage on mount
  useEffect(() => {
    const completed = isCharacterCreationCompleted();
    setIsCompleted(completed);

    if (completed) {
      const savedCharacter = getCharacterInfo();
      if (savedCharacter) {
        setCharacterInfo(savedCharacter);
      }
    }
  }, []);

  /**
   * Mark character creation as complete
   */
  const completeCreation = (newCharacterInfo: CharacterInfo) => {
    setCharacterInfo(newCharacterInfo);
    setIsCompleted(true);
    completeCharacterCreation(newCharacterInfo);
  };

  /**
   * Reset character creation
   */
  const resetCreation = () => {
    setCharacterInfo(null);
    setIsCompleted(false);
    resetCharacterCreation();
  };

  /**
   * Update character information
   */
  const updateCharacter = (updates: Partial<CharacterInfo>) => {
    if (!characterInfo) {
      console.warn(
        "Attempted to update character info when no character exists"
      );
      return;
    }

    const updatedInfo = { ...characterInfo, ...updates };
    setCharacterInfo(updatedInfo);
    updateCharacterInfo(updatedInfo);
  };

  // Context value
  const value: CharacterCreationState = {
    isCompleted,
    characterInfo,
    completeCreation,
    resetCreation,
    updateCharacter,
  };

  return (
    <CharacterCreationContext.Provider value={value}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

/**
 * Custom hook to use the character creation context
 */
export const useCharacterCreation = (): CharacterCreationState => {
  const context = useContext(CharacterCreationContext);

  if (context === undefined) {
    throw new Error(
      "useCharacterCreation must be used within a CharacterCreationProvider"
    );
  }

  return context;
};

export default CharacterCreationProvider;
