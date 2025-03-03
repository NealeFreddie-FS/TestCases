"use client";

import React, { useEffect, useRef, useState } from "react";
import { CharacterInfo } from "./ProphecyEngine";
import { GameEngine, GameState } from "./game/GameEngine";
import GameUI from "./game/GameUI";
import MainMenu from "./game/MainMenu";
import CharacterCreation from "./game/CharacterCreation";
import PrototypeLevel from "./game/PrototypeLevel";
import dynamic from "next/dynamic";
import LoadingScreen from "./game/LoadingScreen";
import {
  shouldInitializeGameEngine,
  completeCharacterCreation,
  isCharacterCreationCompleted,
} from "../game-utils";

// Dynamically import TimeControls with no SSR to avoid issues with window object
const TimeControls = dynamic(() => import("./game/ui/TimeControls"), {
  ssr: false,
});

// Dynamically import TimeControlsOverlay
const TimeControlsOverlay = dynamic(
  () => import("./game/ui/TimeControlsOverlay"),
  {
    ssr: false,
  }
);

// Types
export type GameMode =
  | "exploration"
  | "combat"
  | "dialog"
  | "shop"
  | "inventory"
  | "quest";

export type GameScreenState =
  | "mainMenu"
  | "characterCreation"
  | "gameplay"
  | "prototype";

interface GameContainerProps {
  character?: CharacterInfo;
  isFullscreen?: boolean;
  initialGameScreen?: GameScreenState;
}

export default function GameContainer({
  character: initialCharacter,
  isFullscreen: externalFullscreen,
  initialGameScreen = "mainMenu",
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Add a state to track which screen to display
  const [gameScreenState, setGameScreenState] =
    useState<GameScreenState>(initialGameScreen);
  const [character, setCharacter] = useState<CharacterInfo | null>(
    initialCharacter || null
  );

  const [gameMode, setGameMode] = useState<GameMode>("exploration");
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    mana: 50,
    gold: 25,
    experience: 0,
    level: parseInt(character?.level || "1"),
    inventory: ["health_potion", "iron_sword"],
    quests: [],
    currentLocation: "Crossroads",
    loading: initialGameScreen !== "mainMenu",
    loadingProgress: 0,
    loadingMessage: "Initializing...",
  });

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen =
    externalFullscreen !== undefined ? externalFullscreen : internalFullscreen;

  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape"
  );
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );

  // Add state to track development mode
  const [isDevelopmentMode] = useState(
    () => process.env.NODE_ENV === "development"
  );

  // Add a reference to store the timeManager for admin panel access
  const timeManagerRef = useRef<any>(null);

  // Add state to track if we should initialize the game engine
  const [shouldInitEngine, setShouldInitEngine] = useState(false);

  // Check if we should initialize the game engine based on game state and path
  useEffect(() => {
    // Only check on client side
    if (typeof window === "undefined") return;

    const checkShouldInitialize = () => {
      const shouldInit = shouldInitializeGameEngine();
      console.log(
        `GameContainer checking if should initialize engine: ${shouldInit}`
      );
      setShouldInitEngine(shouldInit);
    };

    // Check initially
    checkShouldInitialize();

    // Also check when screen state changes
    if (gameScreenState === "gameplay" && character) {
      completeCharacterCreation(); // Mark character creation as complete
      checkShouldInitialize();
    }
  }, [gameScreenState, character]);

  // Handle character creation completion
  const handleCharacterCreationComplete = (newCharacter: CharacterInfo) => {
    setCharacter(newCharacter);
    // Update game state with character info
    setGameState((prevState) => ({
      ...prevState,
      level: parseInt(newCharacter.level || "1"),
    }));

    // Mark character creation as complete in our global state
    completeCharacterCreation();

    // Transition to gameplay
    setGameScreenState("gameplay");
  };

  // Start the game from main menu
  const handleStartGame = () => {
    if (character) {
      // If we already have a character, go straight to gameplay
      setGameScreenState("gameplay");
    } else {
      // Otherwise, go to character creation first
      setGameScreenState("characterCreation");
    }

    // The music fade out is handled in the MainMenu component's handleStartGame method
  };

  // Return to main menu
  const handleBackToMainMenu = () => {
    setGameScreenState("mainMenu");

    // If we have a game engine with sound manager, stop any game music
    if (gameEngineRef.current?.soundManager) {
      gameEngineRef.current.soundManager.stopMusic();
    }

    // Start main menu music (handled by MainMenu component on mount)
  };

  // Launch prototype level
  const handleStartPrototype = () => {
    setGameScreenState("prototype");

    // The music fade out is handled in the MainMenu component's handleStartGame method
  };

  // Initialize Game Engine
  useEffect(() => {
    // Only run if we should initialize the engine
    if (!shouldInitEngine) {
      console.log("Skipping game engine initialization - not ready yet");
      return;
    }

    // Ensure character exists
    if (!character) {
      console.log("Skipping game engine initialization - no character");
      return;
    }

    // Initialize the application asynchronously
    const initGameEngine = async () => {
      try {
        // Reset any previous errors
        setInitializationError(null);

        if (!canvasRef.current) {
          setInitializationError("Canvas not initialized");
          return;
        }

        if (!containerRef.current) {
          setInitializationError("Container not initialized");
          return;
        }

        // Ensure character is not null before proceeding
        if (!character) {
          setInitializationError("Character not initialized");
          return;
        }

        // Dynamically import PixiJS
        const PIXI = await import("pixi.js");

        // Detect if we're on a mobile device
        const checkMobile = () => {
          const width = window.innerWidth;
          const isMobileDevice =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            );
          const isMobileSize = width < 768;
          setIsMobile(isMobileDevice || isMobileSize);

          // Set orientation
          setOrientation(
            window.innerHeight > window.innerWidth ? "portrait" : "landscape"
          );
        };

        // Run initial mobile check
        checkMobile();

        // Get container dimensions - use full window size if fullscreen
        let containerWidth = containerRef.current.clientWidth;
        let containerHeight = containerRef.current.clientHeight;

        // If fullscreen, use the window dimensions
        if (isFullscreen) {
          containerWidth = window.innerWidth;
          containerHeight = window.innerHeight;
        }

        // Configure WebGL context options to prevent shader uniform errors
        // These settings help with shader program management
        const contextOptions = {
          antialias: true,
          backgroundAlpha: 1,
          backgroundColor: 0x333333,
          clearBeforeRender: true,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance" as const, // This helps with performance
        };

        // Create PixiJS application with proper configuration
        const app = new PIXI.Application();

        // Initialize the application with the canvas and proper settings
        await app.init({
          canvas: canvasRef.current,
          width: containerWidth,
          height: containerHeight,
          antialias: contextOptions.antialias,
          backgroundAlpha: contextOptions.backgroundAlpha,
          backgroundColor: contextOptions.backgroundColor,
          clearBeforeRender: contextOptions.clearBeforeRender,
          powerPreference: contextOptions.powerPreference,
        });

        console.log("PIXI Application initialized:", app);

        // Check WebGL context and any errors
        if (app.renderer) {
          console.log("Renderer type:", app.renderer.type);

          // Check for WebGL specific errors - TypeScript type assertion for proper access
          try {
            // For WebGL renderer
            if ("gl" in app.renderer) {
              const gl = (app.renderer as any).gl as WebGLRenderingContext;
              const error = gl.getError();
              if (error !== gl.NO_ERROR) {
                console.error("WebGL error code:", error);
              } else {
                console.log("WebGL context is valid with no errors");
              }

              // Log WebGL capabilities
              console.log(
                "Max texture size:",
                gl.getParameter(gl.MAX_TEXTURE_SIZE)
              );
              console.log("WebGL version:", gl.getParameter(gl.VERSION));
            } else {
              console.log(
                "Not using WebGL renderer - using an alternative renderer"
              );
            }
          } catch (error) {
            console.error("Error checking WebGL context:", error);
          }
        }

        // Ensure the canvas is properly sized
        if (canvasRef.current) {
          canvasRef.current.style.width = "100%";
          canvasRef.current.style.height = "100%";
        }

        // Configure WebGL context after initialization to address uniform binding issues
        try {
          // In PixiJS v8, we need to check if the renderer is a WebGL renderer first
          if (app.renderer && "gl" in app.renderer) {
            const gl = (app.renderer as any).gl as WebGLRenderingContext;

            // Ensure extensions are properly loaded
            if (gl) {
              // Explicitly lose and restore context if needed
              // This can help with WebGL errors in some browsers
              if (gl.getError() !== gl.NO_ERROR) {
                console.warn(
                  "WebGL errors detected, attempting to fix context..."
                );

                // Get the context loss extension
                const ext = gl.getExtension("WEBGL_lose_context");
                if (ext) {
                  console.log("Attempting WebGL context reset");
                  ext.loseContext();

                  // Wait a moment before restoring
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  ext.restoreContext();
                  console.log("WebGL context reset completed");
                }
              }
            }
          } else {
            console.log(
              "Non-WebGL renderer detected, skipping WebGL context fixes"
            );
          }
        } catch (glError) {
          console.warn("WebGL context manipulation failed:", glError);
          // Continue anyway - this is just an optimization attempt
        }

        // Initialize the game engine with the app
        const callbacks = {
          onGameModeChange: (mode: GameMode) => setGameMode(mode),
          onGameStateChange: (newState: Partial<GameState>) =>
            setGameState((prev) => ({ ...prev, ...newState })),
        };

        // Create and store game engine reference
        gameEngineRef.current = new GameEngine(app, character, callbacks);

        console.log("Starting game engine initialization...");
        console.log(
          "Initializing with canvas: ",
          canvasRef.current,
          "Using PIXI app: ",
          app,
          "Character: ",
          character
        );

        await gameEngineRef.current.init();

        console.log("Game engine initialized successfully");

        // Debug world creation
        if (gameEngineRef.current.world) {
          console.log(
            "World created successfully:",
            gameEngineRef.current.world
          );
          console.log(
            "World container:",
            gameEngineRef.current.world.container
          );
          console.log(
            "World entities count:",
            gameEngineRef.current.world.entities.length
          );
        } else {
          console.error("World initialization failed!");
        }

        // Debug player creation
        if (gameEngineRef.current.player) {
          console.log(
            "Player created successfully:",
            gameEngineRef.current.player
          );
          console.log(
            "Player position:",
            gameEngineRef.current.player.sprite?.x,
            gameEngineRef.current.player.sprite?.y
          );
        } else {
          console.error("Player initialization failed!");
        }

        // Make game engine available globally for admin panel
        if (gameEngineRef.current) {
          (window as any).gameEngine = gameEngineRef.current;

          // Store time manager for admin panel if available
          if (gameEngineRef.current.timeManager) {
            timeManagerRef.current = gameEngineRef.current.timeManager;
            (window as any).gameTimeManager = gameEngineRef.current.timeManager;
          }
        }

        // Handle resize events
        const handleResize = () => {
          if (!containerRef.current || !gameEngineRef.current) return;

          // Get new dimensions
          let newWidth = containerRef.current.clientWidth;
          let newHeight = containerRef.current.clientHeight;

          // If fullscreen, use the window dimensions
          if (isFullscreen) {
            newWidth = window.innerWidth;
            newHeight = window.innerHeight;
          }

          // Check if mobile status changed
          checkMobile();

          // Update game engine with new dimensions
          gameEngineRef.current.resize(newWidth, newHeight);
        };

        // Add resize listener
        window.addEventListener("resize", handleResize);

        // Handle fullscreen changes
        const handleFullscreenChange = () => {
          if (externalFullscreen === undefined) {
            setInternalFullscreen(!!document.fullscreenElement);
          }

          // When fullscreen changes, also trigger a resize
          handleResize();
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        // Handle orientation changes on mobile
        window.addEventListener("orientationchange", handleResize);

        // Clean up
        return () => {
          window.removeEventListener("resize", handleResize);
          document.removeEventListener(
            "fullscreenchange",
            handleFullscreenChange
          );
          window.removeEventListener("orientationchange", handleResize);

          // Remove global references
          delete (window as any).gameEngine;
          delete (window as any).gameTimeManager;

          if (gameEngineRef.current) {
            gameEngineRef.current.destroy();
            gameEngineRef.current = null;
          }

          // Properly destroy the PIXI application
          app.destroy(true, { children: true, texture: true });
        };
      } catch (error) {
        console.error("Failed to initialize game engine:", error);
        setInitializationError(
          error instanceof Error
            ? error.message
            : "Unknown error initializing the game"
        );
      }
    };

    // Initialize the game engine when transitioning to gameplay
    if (gameScreenState === "gameplay" && character && !gameEngineRef.current) {
      initGameEngine();
    }
  }, [
    gameScreenState,
    character,
    isFullscreen,
    externalFullscreen,
    shouldInitEngine,
  ]);

  // Handle game UI actions
  const handleAction = (action: string, data?: any) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.handleAction(action, data);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen ? "fixed inset-0" : "relative"
      } w-full h-full bg-black overflow-hidden`}
    >
      {/* Display appropriate screen based on game state */}
      {gameScreenState === "mainMenu" && (
        <MainMenu
          onStartGame={handleStartGame}
          onPrototype={handleStartPrototype}
        />
      )}

      {gameScreenState === "characterCreation" && (
        <CharacterCreation
          onComplete={handleCharacterCreationComplete}
          onBack={handleBackToMainMenu}
        />
      )}

      {gameScreenState === "gameplay" && (
        <>
          <canvas
            ref={canvasRef}
            className={`${
              isMobile ? "touch-manipulation" : ""
            } block w-full h-full bg-black`}
          ></canvas>

          {gameState && (
            <GameUI
              gameState={gameState}
              gameMode={gameMode}
              character={
                character || {
                  adventurerName: "Player",
                  characterClass: "warrior",
                  level: "1",
                  realm: "Forest Enclaves",
                  alignment: "Neutral Good",
                  questExperience: "Novice",
                  magicItems: [],
                }
              }
              onAction={handleAction}
              isFullscreen={isFullscreen}
              isMobile={isMobile}
              gameEngine={gameEngineRef.current}
            />
          )}

          {timeManagerRef.current && (
            <TimeControlsOverlay timeManager={timeManagerRef.current} />
          )}
        </>
      )}

      {gameScreenState === "prototype" && (
        <PrototypeLevel onBackToMenu={handleBackToMainMenu} />
      )}

      {/* Show loading overlay during initialization - only if not in main menu */}
      {gameState.loading && gameScreenState !== "mainMenu" && (
        <LoadingScreen
          progress={gameState.loadingProgress}
          message={gameState.loadingMessage}
        />
      )}

      {/* Display errors if any occur during initialization */}
      {initializationError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-red-900 border border-red-700 p-6 mx-4 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-200 mb-2">
              Initialization Error
            </h2>
            <p className="text-red-100">{initializationError}</p>
            <button
              onClick={handleBackToMainMenu}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 transition-colors text-white rounded"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Mobile warning for portrait orientation */}
      {isMobile && orientation === "portrait" && !gameState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 p-6">
          <div className="bg-amber-900 border border-amber-700 p-6 rounded-lg shadow-lg text-center">
            <svg
              className="w-16 h-16 mx-auto text-amber-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-amber-200 mb-2">
              Rotate Your Device
            </h2>
            <p className="text-amber-100">
              This game is best experienced in landscape mode. Please rotate
              your device for an optimal experience.
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen toggle button - only show in development mode or when not in fullscreen */}
      {(isDevelopmentMode || !isFullscreen) && (
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 p-2 bg-slate-800/80 text-white rounded-md hover:bg-slate-700/80 transition-colors z-50"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isFullscreen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 9h6v6H9z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
