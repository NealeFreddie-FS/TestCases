"use client";

import { useState, useEffect } from "react";
import SanctuaryLevel from "./SanctuaryLevel";
import CharacterCreation from "./CharacterCreation";
import { getCharacterInfo } from "../../utils/game-utils";

export default function GameManager() {
  const [gameState, setGameState] = useState<
    "loading" | "character_creation" | "playing"
  >("loading");

  // Check for existing character on component mount
  useEffect(() => {
    const character = getCharacterInfo();

    if (character) {
      // If character exists, go straight to game
      setGameState("playing");
    } else {
      // Otherwise, go to character creation
      setGameState("character_creation");
    }
  }, []);

  const handleCharacterCreationComplete = () => {
    setGameState("loading");

    // Simulate loading time
    setTimeout(() => {
      setGameState("playing");
    }, 1500);
  };

  // Show loading screen
  if (gameState === "loading") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl mb-4 font-serif tracking-wider text-amber-500">
          DARK SOULS
        </h1>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 animate-pulse rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-400 italic">
          Preparing your journey to Lordran...
        </p>
      </div>
    );
  }

  // Show character creation
  if (gameState === "character_creation") {
    return <CharacterCreation onComplete={handleCharacterCreationComplete} />;
  }

  // Show the game
  return <SanctuaryLevel />;
}
