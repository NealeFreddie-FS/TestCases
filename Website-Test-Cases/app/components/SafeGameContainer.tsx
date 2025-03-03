"use client";

import React, { useEffect, useRef, useState } from "react";
import { CharacterInfo } from "./ProphecyEngine";
import { isCharacterCreationCompleted } from "../utils/game-utils";

// This is a completely new, simplified game container that strictly enforces
// character creation before game initialization

export default function SafeGameContainer({
  character,
  onError,
}: {
  character: CharacterInfo | null;
  onError?: (message: string) => void;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Strict check for character creation before any game logic runs
  useEffect(() => {
    const characterCreationCompleted = isCharacterCreationCompleted();
    const hasCharacter = !!character;

    console.log("[SafeGameContainer] Initialization checks:", {
      characterCreationCompleted,
      hasCharacter,
      character,
    });

    if (!characterCreationCompleted && !hasCharacter) {
      const errorMessage =
        "Cannot initialize game: Character creation not completed";
      console.error(errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    // If we get here, we have a character and can proceed with game initialization
    const initializeGame = async () => {
      try {
        console.log(
          "[SafeGameContainer] Starting game initialization with character:",
          character
        );

        // Create a blank canvas - we'll use this later for the actual game
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            // Draw a placeholder screen showing we've started
            ctx.fillStyle = "#333";
            ctx.fillRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.fillStyle = "#FFF";
            ctx.font = "20px Arial";
            ctx.fillText("Game world initializing...", 20, 50);
            ctx.fillText(
              `Character: ${character?.adventurerName || "Unknown"}`,
              20,
              80
            );
            ctx.fillText(
              `Class: ${character?.characterClass || "Unknown"}`,
              20,
              110
            );
          }
        }

        // Here we would initialize the actual game engine
        // This is a placeholder for where we'd import and initialize the game engine
        // e.g., const gameEngine = new GameEngine(canvas, character, ...);

        // Mark as initialized
        setIsInitialized(true);
        console.log("[SafeGameContainer] Game initialization complete");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error initializing game";
        console.error(
          "[SafeGameContainer] Initialization error:",
          errorMessage
        );
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    // Only start initialization if we have a character
    if (hasCharacter) {
      initializeGame();
    }

    // Cleanup function
    return () => {
      console.log("[SafeGameContainer] Cleaning up game instance");
      // Here we would clean up any game resources
      // e.g., gameEngine.destroy();
    };
  }, [character, onError]);

  if (error) {
    return (
      <div
        className="game-error-container"
        style={{
          backgroundColor: "#300",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          margin: "20px auto",
          textAlign: "center",
        }}
      >
        <h2>Game Initialization Error</h2>
        <p>{error}</p>
        <div style={{ marginTop: "20px" }}>
          <a
            href="/new-game"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#c44",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          >
            Create Character
          </a>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#444",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Back to Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="safe-game-container"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#000",
        }}
      />

      {/* Game UI would go here */}
      <div
        className="game-ui"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        {isInitialized && (
          <div style={{ padding: "20px", pointerEvents: "auto" }}>
            {/* Game UI components would go here */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              <div>Character: {character?.adventurerName}</div>
              <div>Class: {character?.characterClass}</div>
              <div>Level: {character?.level}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
