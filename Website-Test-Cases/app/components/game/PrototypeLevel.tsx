import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import * as PIXI from "pixi.js";
import { GameEngine } from "./GameEngine";
import { Hour, TimeManager } from "./managers/TimeManager";
import dynamic from "next/dynamic";
import Image from "next/image";
import HorseStable, { Horse } from "./ui/HorseStable";
import FastTravelDialog from "./ui/FastTravelDialog";
import QuestLog, { Quest } from "./ui/QuestLog";
import LoadingScreen from "./ui/LoadingScreen";
import DirectionIndicator from "./ui/DirectionIndicator";

// Create a simplified version that only implements what we need
class SimplifiedGameEngine {
  timeManager: any;
  currentTime: number = 0; // Track time in minutes (0-1440 for a day)

  constructor() {
    // This creates a simplified game engine just for the prototype level
    console.log("Created simplified game engine for prototype level");
    this.timeManager = {
      currentHour: Hour.ZENITH,
      // Add methods for time management
      advanceMinute: () => {
        this.currentTime = (this.currentTime + 1) % 1440; // 24 hours * 60 minutes
        // Check if hour needs to change (every 60 minutes)
        const newHour = Math.floor(this.currentTime / 60) % 24;

        // Map 24-hour time to our Hour enum
        let gameHour = Hour.ZENITH;
        if (newHour >= 22 || newHour < 4) gameHour = Hour.MIDNIGHT;
        else if (newHour >= 4 && newHour < 8) gameHour = Hour.DAWN;
        else if (newHour >= 8 && newHour < 16) gameHour = Hour.ZENITH;
        else if (newHour >= 16 && newHour < 22) gameHour = Hour.DUSK;

        // Only update if hour has changed
        if (gameHour !== this.timeManager.currentHour) {
          this.timeManager.currentHour = gameHour;
          if (this.timeManager.onHourChanged) {
            this.timeManager.onHourChanged(gameHour);
          }
        }
      },
      advanceHour: () => {
        // Advance 60 minutes (1 hour)
        for (let i = 0; i < 60; i++) {
          this.timeManager.advanceMinute();
        }
      },
      setHour: (hour: Hour) => {
        this.timeManager.currentHour = hour;
        // Also set the currentTime appropriately
        switch (hour) {
          case Hour.MIDNIGHT:
            this.currentTime = 0; // 12 AM
            break;
          case Hour.DAWN:
            this.currentTime = 6 * 60; // 6 AM
            break;
          case Hour.ZENITH:
            this.currentTime = 12 * 60; // 12 PM
            break;
          case Hour.DUSK:
            this.currentTime = 18 * 60; // 6 PM
            break;
        }
      },
      onHourChanged: null,
    };
  }
}

// Player character state
interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  sprite?: PIXI.Graphics;
  direction: "left" | "right" | "up" | "down" | "idle";
  gold: number;
  horseInventory: Horse[];
  currentHorse: Horse | null;
}

// Map location for spawn selection
interface SpawnLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
}

// The components expect a TimeManager instance
interface TimeControlsProps {
  timeManager: TimeManager;
}

interface TimeControlsOverlayProps {
  timeManager: TimeManager;
}

// Dynamically import TimeControls with no SSR to avoid window object issues
const TimeControls = dynamic(() => import("./ui/TimeControls"), {
  ssr: false,
});

// Dynamically import TimeControlsOverlay
const TimeControlsOverlay = dynamic(() => import("./ui/TimeControlsOverlay"), {
  ssr: false,
});

interface PrototypeLevelProps {
  onBackToMenu: () => void;
}

const PrototypeLevel: React.FC<PrototypeLevelProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const timeManagerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentHour, setCurrentHour] = useState<Hour>(Hour.ZENITH);

  // Track if we're in map selection mode or gameplay mode
  const [showMapSelection, setShowMapSelection] = useState(true);

  // Track the selected spawn location
  const [selectedSpawn, setSelectedSpawn] = useState<SpawnLocation | null>(
    null
  );

  // Add new state for horse stable and fast travel
  const [showHorseStable, setShowHorseStable] = useState(false);
  const [isShowingFastTravel, setIsShowingFastTravel] = useState(false);
  const [fastTravelDestination, setFastTravelDestination] =
    useState<SpawnLocation | null>(null);

  // Initialize player state with horse-related properties
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 5,
    direction: "idle",
    gold: 1000, // Starting gold
    horseInventory: [], // Start with no horses
    currentHorse: null, // No current horse
  });

  // Track simplified game engine
  const gameEngineRef = useRef<SimplifiedGameEngine | null>(null);

  // Add new state for quests and quest log
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "stable_quest",
      title: "A Trusty Steed",
      description:
        "Visit the stable and purchase your first horse. Horses make traveling across the land much faster.",
      status: "active",
      reward: {
        gold: 200,
        experience: 100,
      },
      objectives: [
        {
          id: "visit_stable",
          description: "Visit the stable near the town entrance",
          completed: false,
        },
        {
          id: "buy_horse",
          description: "Purchase your first horse",
          completed: false,
        },
      ],
    },
  ]);
  const [isShowingQuestLog, setIsShowingQuestLog] = useState(false);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(
    "stable_quest"
  );

  // Add activeDirection and showRegionLabel states
  const [activeDirection, setActiveDirection] = useState<
    "north" | "south" | "east" | "west" | null
  >(null);
  const [showRegionLabel, setShowRegionLabel] = useState(false);

  // Define spawn locations
  const spawnLocations: SpawnLocation[] = [
    {
      id: "northern_peaks",
      name: "Northern Peaks",
      x: 0.18,
      y: 0.25,
      description:
        "A frigid mountain range where ancient dragons are rumored to slumber beneath the ice. Only the bravest adventurers dare to explore these treacherous heights.",
    },
    {
      id: "eastern_woods",
      name: "Whispering Woods",
      x: 0.75,
      y: 0.45,
      description:
        "An enchanted forest to the east where the trees speak in hushed tones. Many who enter are never seen again, though the magical herbs found here fetch high prices.",
    },
    {
      id: "southern_coast",
      name: "Sunhaven Harbor",
      x: 0.55,
      y: 0.78,
      description:
        "A bustling port town along the southern coast. Merchants, pirates, and adventurers from distant lands gather here to trade goods and tales of the sea.",
    },
    {
      id: "western_plains",
      name: "Amber Plains",
      x: 0.25,
      y: 0.6,
      description:
        "Rolling grasslands to the west dotted with ancient stone circles. The nomadic tribes that roam here are known for their horsemanship and prophetic visions.",
    },
  ];

  // Track which keys are currently pressed
  const keysPressed = useRef<Record<string, boolean>>({});

  // Function to cycle through time periods
  const cycleTime = () => {
    const hours = Object.values(Hour);
    const currentIndex = hours.indexOf(currentHour);
    const nextIndex = (currentIndex + 1) % hours.length;
    setCurrentHour(hours[nextIndex]);
  };

  // Function to handle spawn location selection
  const handleSpawnSelection = (location: SpawnLocation) => {
    setSelectedSpawn(location);

    // Set player position based on selected spawn
    playerState.x = window.innerWidth * location.x;
    playerState.y = window.innerHeight * location.y;

    // Enter gameplay mode
    setShowMapSelection(false);
  };

  // Get the time of day icon path based on current hour
  const getTimeOfDayIcon = () => {
    switch (currentHour) {
      case Hour.DAWN:
        return "/assets/Free Paper UI System/1 Sprites/Day & Night Cycle/Items Holder/1/1 Dawn/1.png";
      case Hour.ZENITH:
        return "/assets/Free Paper UI System/1 Sprites/Day & Night Cycle/Items Holder/1/3 Noon/1.png";
      case Hour.DUSK:
        return "/assets/Free Paper UI System/1 Sprites/Day & Night Cycle/Items Holder/1/2 Day/1.png";
      case Hour.MIDNIGHT:
        return "/assets/Free Paper UI System/1 Sprites/Day & Night Cycle/Items Holder/1/4 Night/1.png";
      default:
        return "/assets/Free Paper UI System/1 Sprites/Day & Night Cycle/Items Holder/1/3 Noon/1.png";
    }
  };

  // Create the map selection screen with paper UI assets
  const renderMapSelectionScreen = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-amber-100 p-6 overflow-auto">
        <div className="flex flex-col items-center max-w-6xl w-full">
          {/* Header with paper background */}
          <div className="relative w-full flex justify-center mb-6">
            <Image
              src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/2 Headers/2.png"
              alt="Header"
              width={400}
              height={100}
              className="object-contain"
            />
            <h2 className="absolute text-3xl text-amber-900 font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Choose Your Starting Region
            </h2>
          </div>

          {/* Map container with paper background */}
          <div className="relative w-full mb-8">
            <Image
              src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/15.png"
              alt="Map Paper"
              width={800}
              height={500}
              className="object-contain mx-auto"
            />

            {/* Map content overlaid on the paper */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-4/5 h-4/5">
                {/* Fantasy map background that changes with time of day */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `linear-gradient(to bottom, ${
                      currentHour === Hour.MIDNIGHT
                        ? "#0a1a3f"
                        : currentHour === Hour.DAWN
                        ? "#ffe8c4"
                        : currentHour === Hour.DUSK
                        ? "#ff7f50"
                        : "#87ceeb"
                    } 70%, #4a7c59 30%)`,
                    border: "4px solid #8b5a2b",
                    boxShadow: "0 0 20px rgba(0,0,0,0.5) inset",
                    backgroundImage: "url('/assets/parchment-texture.png')",
                    backgroundBlendMode: "overlay",
                    backgroundSize: "cover",
                  }}
                >
                  {/* Cardinal Direction Labels */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-bold text-amber-900 text-shadow">
                    <div
                      className="pixelated p-2"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      NORTH
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold text-amber-900 text-shadow">
                    <div
                      className="pixelated p-2"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      SOUTH
                    </div>
                  </div>
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold text-amber-900 text-shadow">
                    <div
                      className="pixelated p-2"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      WEST
                    </div>
                  </div>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 font-bold text-amber-900 text-shadow">
                    <div
                      className="pixelated p-2"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      EAST
                    </div>
                  </div>

                  {/* Northern Peaks (mountains) */}
                  <div
                    className="absolute"
                    style={{
                      top: "10%",
                      left: "10%",
                      width: "40%",
                      height: "20%",
                      background:
                        "linear-gradient(to bottom, #8c9ea3 30%, #d2d5d8 100%)",
                      clipPath:
                        "polygon(25% 0%, 50% 100%, 75% 0%, 100% 40%, 0% 40%)",
                      filter: "drop-shadow(0px 5px 2px rgba(0,0,0,0.3))",
                      opacity: currentHour === Hour.MIDNIGHT ? 0.6 : 1,
                    }}
                  ></div>

                  {/* Eastern Forest */}
                  <div
                    className="absolute"
                    style={{
                      top: "25%",
                      right: "10%",
                      width: "35%",
                      height: "40%",
                      backgroundColor: "#2d4a27",
                      borderRadius: "40%",
                      boxShadow: "0 0 20px rgba(0,0,0,0.2) inset",
                      opacity: currentHour === Hour.MIDNIGHT ? 0.6 : 1,
                    }}
                  >
                    {/* Trees */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={`tree-${i}`}
                        className="absolute"
                        style={{
                          width: 10 + Math.random() * 10,
                          height: 15 + Math.random() * 15,
                          backgroundColor: "#1a3612",
                          borderRadius: "50%",
                          left: `${Math.random() * 80}%`,
                          top: `${Math.random() * 80}%`,
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Southern Coast (water and port) */}
                  <div
                    className="absolute"
                    style={{
                      bottom: "5%",
                      right: "25%",
                      width: "60%",
                      height: "25%",
                      background:
                        "linear-gradient(to bottom, #4b6cb7 0%, #182848 100%)",
                      borderRadius: "30% 50% 0 0",
                      boxShadow: "0 0 10px rgba(255,255,255,0.2) inset",
                      opacity: currentHour === Hour.MIDNIGHT ? 0.6 : 1,
                    }}
                  >
                    {/* Port buildings */}
                    <div
                      className="absolute"
                      style={{
                        top: "10%",
                        left: "60%",
                        width: "20%",
                        height: "30%",
                        backgroundColor: "#8b4513",
                      }}
                    ></div>

                    {/* Pier */}
                    <div
                      className="absolute"
                      style={{
                        top: "40%",
                        left: "65%",
                        width: "25%",
                        height: "5%",
                        backgroundColor: "#6b4423",
                      }}
                    ></div>
                  </div>

                  {/* Western Plains */}
                  <div
                    className="absolute"
                    style={{
                      top: "50%",
                      left: "5%",
                      width: "40%",
                      height: "30%",
                      background:
                        "linear-gradient(to bottom, #d4b06a 0%, #c19a49 100%)",
                      borderRadius: "40%",
                      opacity: currentHour === Hour.MIDNIGHT ? 0.6 : 1,
                    }}
                  >
                    {/* Stone circles */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        top: "40%",
                        left: "50%",
                        width: "15%",
                        height: "15%",
                        border: "3px solid #999",
                      }}
                    ></div>
                    <div
                      className="absolute rounded-full"
                      style={{
                        top: "20%",
                        left: "30%",
                        width: "10%",
                        height: "10%",
                        border: "2px solid #999",
                      }}
                    ></div>
                  </div>

                  {/* Central Castle/City */}
                  <div
                    className="absolute"
                    style={{
                      top: "40%",
                      left: "40%",
                      width: "20%",
                      height: "20%",
                    }}
                  >
                    {/* Main castle */}
                    <div
                      className="absolute"
                      style={{
                        bottom: "0",
                        left: "25%",
                        width: "50%",
                        height: "60%",
                        backgroundColor: "#777",
                      }}
                    ></div>
                    {/* Castle tower */}
                    <div
                      className="absolute"
                      style={{
                        bottom: "20%",
                        left: "40%",
                        width: "20%",
                        height: "80%",
                        backgroundColor: "#666",
                      }}
                    ></div>
                    {/* Tower top */}
                    <div
                      className="absolute"
                      style={{
                        top: "0",
                        left: "35%",
                        width: "30%",
                        height: "10%",
                        backgroundColor: "#555",
                        clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
                      }}
                    ></div>
                  </div>

                  {/* Spawn location markers with item holder backgrounds */}
                  {spawnLocations.map((location) => (
                    <motion.div
                      key={location.id}
                      className="absolute cursor-pointer flex flex-col items-center justify-center z-10"
                      style={{
                        left: `${location.x * 100}%`,
                        top: `${location.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleSpawnSelection(location)}
                    >
                      <div className="relative">
                        <Image
                          src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/3 Item Holder/1.png"
                          alt="Location Marker"
                          width={50}
                          height={50}
                          className={`${
                            selectedSpawn?.id === location.id
                              ? "border-2 border-amber-400 rounded-full shadow-lg"
                              : ""
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={`/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/${
                              location.id === "northern_peaks"
                                ? "11.png"
                                : location.id === "eastern_woods"
                                ? "6.png"
                                : location.id === "southern_coast"
                                ? "29.png"
                                : "13.png" // western_plains - horse icon
                            }`}
                            alt={location.name}
                            width={24}
                            height={24}
                          />
                        </div>
                      </div>
                      <div className="text-amber-900 text-sm font-bold mt-1 text-center whitespace-nowrap drop-shadow-md">
                        {location.name}
                      </div>
                    </motion.div>
                  ))}

                  {/* Roads connecting locations */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: 0.6, pointerEvents: "none" }}
                  >
                    <path
                      d={`M ${spawnLocations[0].x * 100}% ${
                        spawnLocations[0].y * 100
                      }% 
                          L ${spawnLocations[3].x * 100}% ${
                        spawnLocations[3].y * 100
                      }% 
                          L ${spawnLocations[2].x * 100}% ${
                        spawnLocations[2].y * 100
                      }% 
                          L ${spawnLocations[1].x * 100}% ${
                        spawnLocations[1].y * 100
                      }%`}
                      stroke="#8b5a2b"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Time of day indicator */}
          <div className="flex items-center justify-center mb-6">
            <Image
              src={getTimeOfDayIcon()}
              alt="Time of Day"
              width={80}
              height={80}
              className="mr-4"
            />
            <button
              onClick={cycleTime}
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-amber-800 text-amber-100 hover:bg-amber-700 transition-colors"
            >
              <span>Change Time</span>
            </button>
            <div className="ml-4 text-amber-900 font-semibold">
              Current Time: {currentHour}
            </div>
          </div>

          {/* Location description with dialogue box */}
          <div className="relative w-full mb-6">
            <Image
              src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Dialogue Box/1.png"
              alt="Dialogue Box"
              width={700}
              height={200}
              className="object-contain mx-auto"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-16 py-8">
              {selectedSpawn ? (
                <>
                  <h3 className="text-xl text-amber-900 font-bold mb-2">
                    {selectedSpawn.name}
                  </h3>
                  <p className="text-amber-800 mb-4 text-center">
                    {selectedSpawn.description}
                  </p>
                </>
              ) : (
                <p className="text-amber-800 text-center">
                  Choose a region on the map to begin your adventure.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-6">
            <button onClick={onBackToMenu} className="relative group">
              <Image
                src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/5.png"
                alt="Button"
                width={150}
                height={60}
                className="object-contain transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center text-amber-900 font-bold">
                Back to Menu
              </span>
            </button>

            {selectedSpawn && (
              <button
                onClick={() => setShowMapSelection(false)}
                className="relative group"
              >
                <Image
                  src="/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/5.png"
                  alt="Button"
                  width={150}
                  height={60}
                  className="object-contain transition-transform group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center text-amber-900 font-bold">
                  Begin Adventure
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the handleKeyDown function to use the correct state names
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      // Toggle map with M key
      if (event.key === "m") {
        setShowRegionLabel(!showRegionLabel);
      }

      // Fast travel with T key
      if (event.key === "t" && !showMapSelection) {
        setIsShowingFastTravel(true);
      }

      // Quest log with Q key
      if (event.key === "q" && !showMapSelection) {
        setIsShowingQuestLog(true);
      }

      // Enter stable with E key
      if (event.key === "e" && !showMapSelection) {
        enterStable();
      }

      // Set cardinal direction based on movement keys
      if (event.key === "ArrowUp" || event.key === "w") {
        setActiveDirection("north");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (event.key === "ArrowDown" || event.key === "s") {
        setActiveDirection("south");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (event.key === "ArrowLeft" || event.key === "a") {
        setActiveDirection("west");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (event.key === "ArrowRight" || event.key === "d") {
        setActiveDirection("east");
        setTimeout(() => setActiveDirection(null), 300);
      }
    },
    [showMapSelection, showRegionLabel, enterStable]
  );

  // Game loop for player movement
  useEffect(() => {
    if (!appRef.current || isLoading || showMapSelection) return;

    let frameId: number;
    const player = playerState;

    // If we haven't selected a spawn and we're in game mode, use default position
    if (player.x === 0 && player.y === 0 && !selectedSpawn) {
      player.x = window.innerWidth / 2;
      player.y = window.innerHeight * 0.7; // Position a bit below center
    }

    const gameLoop = () => {
      // Reset velocity
      player.vx = 0;
      player.vy = 0;

      // Update player velocity based on keys pressed
      if (keysPressed.current["ArrowUp"] || keysPressed.current["w"]) {
        player.vy = -player.speed;
        player.direction = "up";
      }
      if (keysPressed.current["ArrowDown"] || keysPressed.current["s"]) {
        player.vy = player.speed;
        player.direction = "down";
      }
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) {
        player.vx = -player.speed;
        player.direction = "left";
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"]) {
        player.vx = player.speed;
        player.direction = "right";
      }

      // If not moving, set to idle
      if (player.vx === 0 && player.vy === 0) {
        player.direction = "idle";
      }

      // Update player position
      player.x += player.vx;
      player.y += player.vy;

      // Simple boundary checking
      player.x = Math.max(20, Math.min(window.innerWidth - 20, player.x));
      player.y = Math.max(20, Math.min(window.innerHeight - 20, player.y));

      // Update player sprite if it exists
      if (player.sprite) {
        player.sprite.x = player.x;
        player.sprite.y = player.y;

        // Change appearance based on direction
        updatePlayerAppearance();
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    // Update player appearance based on direction
    const updatePlayerAppearance = () => {
      if (!player.sprite) return;

      const sprite = player.sprite as PIXI.Graphics;

      // Clear previous graphics
      sprite.clear();

      // Basic player shape (a simple triangle shape based on direction)
      const size = 20;

      // Base shape
      sprite.fill({ color: 0x3366ff });

      // Change shape based on direction
      switch (player.direction) {
        case "left":
          sprite.moveTo(player.x, player.y);
          sprite.lineTo(player.x + size, player.y - size / 1.5);
          sprite.lineTo(player.x + size, player.y + size / 1.5);
          sprite.lineTo(player.x, player.y);
          break;
        case "right":
          sprite.moveTo(player.x, player.y);
          sprite.lineTo(player.x - size, player.y - size / 1.5);
          sprite.lineTo(player.x - size, player.y + size / 1.5);
          sprite.lineTo(player.x, player.y);
          break;
        case "up":
          sprite.moveTo(player.x, player.y);
          sprite.lineTo(player.x - size / 1.5, player.y + size);
          sprite.lineTo(player.x + size / 1.5, player.y + size);
          sprite.lineTo(player.x, player.y);
          break;
        case "down":
          sprite.moveTo(player.x, player.y);
          sprite.lineTo(player.x - size / 1.5, player.y - size);
          sprite.lineTo(player.x + size / 1.5, player.y - size);
          sprite.lineTo(player.x, player.y);
          break;
        case "idle":
        default:
          // Circle for idle
          sprite.circle(player.x, player.y, size / 1.2);
          break;
      }
    };

    // Start the game loop
    frameId = requestAnimationFrame(gameLoop);

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isLoading, showMapSelection, selectedSpawn]);

  // Create simplified game engine on init
  useEffect(() => {
    if (!gameEngineRef.current) {
      const engine = new SimplifiedGameEngine();
      gameEngineRef.current = engine;

      // Set initial time
      engine.timeManager.setHour(Hour.ZENITH);

      // Set callback for hour changes
      engine.timeManager.onHourChanged = (hour: Hour) => {
        setCurrentHour(hour);
      };
    }

    return () => {
      gameEngineRef.current = null;
    };
  }, []);

  // Create and initialize the time manager
  useEffect(() => {
    if (!timeManagerRef.current && gameEngineRef.current) {
      // Instead of creating a new TimeManager, use the one from our simplified game engine
      timeManagerRef.current = gameEngineRef.current.timeManager;

      // The current hour should be updated when the time manager's hour changes
      const timeManager = gameEngineRef.current.timeManager;
      if (timeManager && typeof timeManager.onHourChanged === "undefined") {
        timeManager.onHourChanged = (hour: Hour) => {
          setCurrentHour(hour);
        };
      }
    }

    return () => {
      // Cleanup
      timeManagerRef.current = null;
    };
  }, []); // Empty dependency array since we only want to run this once

  // Skip time manager integration for the prototype level
  // Instead, we'll focus on fixing the rendering issues first

  useEffect(() => {
    // Don't initialize PIXI if we're showing the map selection
    if (showMapSelection || !canvasRef.current) return;

    let app: PIXI.Application | null = null;
    let loadingInterval: NodeJS.Timeout | null = null;

    const initializeApp = async () => {
      try {
        // Create PIXI Application using the new two-step initialization pattern for v8
        app = new PIXI.Application();

        // Initialize with proper configuration
        await app.init({
          canvas: canvasRef.current as unknown as PIXI.ICanvas,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x87ceeb, // Bright blue sky for noon
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        appRef.current = app;

        // Set the time to noon
        console.log("Setting time to noon (Solarglow Zenith)");

        // Load textures
        const textures = [
          { name: "castle", url: "/assets/prototype/castle.png" },
          { name: "stables", url: "/assets/prototype/stables.png" },
          { name: "ground", url: "/assets/prototype/ground.png" },
          { name: "horse1", url: "/assets/prototype/horse1.png" },
          { name: "horse2", url: "/assets/prototype/horse2.png" },
          { name: "hay", url: "/assets/prototype/hay.png" },
          { name: "sky", url: "/assets/prototype/sky.png" },
        ];

        // Create a simple loading system
        let texturesLoaded = 0;
        const totalTextures = textures.length;

        // For demo purposes, simulate loading
        loadingInterval = setInterval(() => {
          texturesLoaded++;
          const progress = Math.min(
            Math.floor((texturesLoaded / totalTextures) * 100),
            100
          );
          setLoadingProgress(progress);

          if (texturesLoaded >= totalTextures) {
            if (loadingInterval) clearInterval(loadingInterval);
            setIsLoading(false);
            if (app) createScene(app);
          }
        }, 500);

        // Add resize handler
        const handleResize = () => {
          if (app && app.renderer) {
            app.renderer.resize(window.innerWidth, window.innerHeight);

            // Re-render the scene since we need to update positions
            if (!isLoading) {
              createScene(app);
            }
          }
        };

        // Add event listener for resize
        window.addEventListener("resize", handleResize);

        // Clean up
        return () => {
          if (loadingInterval) clearInterval(loadingInterval);
          window.removeEventListener("resize", handleResize);

          if (app) {
            try {
              app.destroy();
            } catch (error) {
              console.error("Error destroying PIXI application:", error);
            }
          }
        };
      } catch (error) {
        console.error("Error initializing application:", error);
        return () => {
          if (loadingInterval) clearInterval(loadingInterval);
        };
      }
    };

    // Initialize the application and get cleanup function
    let cleanupFn: (() => void) | undefined;

    initializeApp()
      .then((cleanup) => {
        cleanupFn = cleanup;
      })
      .catch((err) => {
        console.error("Failed to initialize app:", err);
      });

    // Clean up function
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [showMapSelection]);

  useEffect(() => {
    // If app is initialized and not loading, update the scene for the new time
    if (appRef.current && !isLoading) {
      createScene(appRef.current);
    }
  }, [currentHour, isLoading]);

  // Create scene with placeholders using modern PIXI v8 API
  const createScene = (app: PIXI.Application) => {
    // Clear previous stage if necessary
    app.stage.removeChildren();

    // Create layers for depth
    const skyLayer = new PIXI.Container();
    const farBackgroundLayer = new PIXI.Container();
    const backgroundLayer = new PIXI.Container();
    const middleLayer = new PIXI.Container();
    const playerLayer = new PIXI.Container(); // New layer for the player
    const foregroundLayer = new PIXI.Container();
    const uiLayer = new PIXI.Container();

    app.stage.addChild(skyLayer);
    app.stage.addChild(farBackgroundLayer);
    app.stage.addChild(backgroundLayer);
    app.stage.addChild(middleLayer);
    app.stage.addChild(playerLayer); // Add player layer
    app.stage.addChild(foregroundLayer);
    app.stage.addChild(uiLayer);

    // Set sky color based on time of day
    let skyColor = 0x87ceeb; // Default sky color (noon)

    switch (currentHour) {
      case Hour.DAWN:
        skyColor = 0xffe8c4; // Warm sunrise
        break;
      case Hour.ZENITH:
        skyColor = 0x87ceeb; // Bright day
        break;
      case Hour.DUSK:
        skyColor = 0xff7f50; // Sunset orange
        break;
      case Hour.MIDNIGHT:
        skyColor = 0x0a1a3f; // Deep night
        break;
    }

    // Sky background
    const sky = new PIXI.Graphics();
    sky.fill({ color: skyColor });
    sky.rect(0, 0, app.screen.width, app.screen.height);
    skyLayer.addChild(sky);

    // Add sun or moon based on time
    const celestialBody = new PIXI.Graphics();

    if (currentHour === Hour.MIDNIGHT) {
      // Moon for night
      celestialBody.fill({ color: 0xf0f0f0 });
      celestialBody.circle(app.screen.width * 0.8, app.screen.height * 0.2, 30);
    } else {
      // Sun for other times
      celestialBody.fill({
        color: currentHour === Hour.DUSK ? 0xffcc00 : 0xffff99,
      });
      celestialBody.circle(app.screen.width * 0.8, app.screen.height * 0.2, 40);
    }

    skyLayer.addChild(celestialBody);

    // Add clouds with appropriate visibility based on time
    const cloudOpacity =
      currentHour === Hour.MIDNIGHT
        ? 0.2 // Dark clouds at night
        : currentHour === Hour.DUSK
        ? 0.5 // Medium visibility at dusk
        : 1.0; // Fully visible during day

    for (let i = 0; i < 5; i++) {
      const cloud = new PIXI.Graphics();
      cloud.fill({ color: 0xffffff, alpha: cloudOpacity });
      cloud.ellipse(
        Math.random() * app.screen.width,
        app.screen.height * 0.1 + Math.random() * 100,
        40 + Math.random() * 30,
        20 + Math.random() * 10
      );
      skyLayer.addChild(cloud);
    }

    // Render the appropriate region based on selected spawn
    if (selectedSpawn) {
      switch (selectedSpawn.id) {
        case "northern_peaks":
          renderNorthernPeaks(
            app,
            farBackgroundLayer,
            backgroundLayer,
            middleLayer
          );
          break;
        case "eastern_woods":
          renderWhisperingWoods(
            app,
            farBackgroundLayer,
            backgroundLayer,
            middleLayer
          );
          break;
        case "southern_coast":
          renderSunhavenHarbor(
            app,
            farBackgroundLayer,
            backgroundLayer,
            middleLayer
          );
          break;
        case "western_plains":
          renderAmberPlains(
            app,
            farBackgroundLayer,
            backgroundLayer,
            middleLayer
          );
          break;
        default:
          // Fall back to a default scene if no spawn is selected
          renderDefaultScene(
            app,
            farBackgroundLayer,
            backgroundLayer,
            middleLayer
          );
      }
    } else {
      // Default scene if no spawn location is selected
      renderDefaultScene(app, farBackgroundLayer, backgroundLayer, middleLayer);
    }

    // Create player sprite
    const playerGraphic = new PIXI.Graphics();
    playerGraphic.fill({ color: 0x3366ff });

    // Draw initial player shape
    playerGraphic.circle(playerState.x, playerState.y, 20);

    // Save sprite reference for animation updates
    playerState.sprite = playerGraphic;

    // Add to player layer
    playerLayer.addChild(playerGraphic);

    // Add cardinal direction indicators
    addCardinalDirections(app, uiLayer);

    // Add a text showing the current time
    const timeText = new PIXI.Text(`Time: ${currentHour}`);
    timeText.style.fontFamily = "Arial";
    timeText.style.fontSize = 24;
    timeText.style.fill = currentHour === Hour.MIDNIGHT ? "#aaccff" : "white";
    timeText.x = 20;
    timeText.y = 20;
    uiLayer.addChild(timeText);

    // Add location text
    const locationText = new PIXI.Text(
      selectedSpawn ? selectedSpawn.name : "Unknown Lands"
    );
    locationText.style.fontFamily = "Arial";
    locationText.style.fontSize = 24;
    locationText.style.fill =
      currentHour === Hour.MIDNIGHT ? "#aaccff" : "white";
    locationText.x = 20;
    locationText.y = 50;
    uiLayer.addChild(locationText);

    // Add control instructions
    const controlsText = new PIXI.Text(
      "WASD or Arrow Keys to move (N,S,E,W) | E: Interact | M: Map | Q: Quests"
    );
    controlsText.style.fontFamily = "Arial";
    controlsText.style.fontSize = 18;
    controlsText.style.fill =
      currentHour === Hour.MIDNIGHT ? "#aaccff" : "white";
    controlsText.x = 20;
    controlsText.y = app.screen.height - 40;
    uiLayer.addChild(controlsText);
  };

  // Helper function to add cardinal direction indicators
  const addCardinalDirections = (
    app: PIXI.Application,
    layer: PIXI.Container
  ) => {
    const directions = [
      { label: "N", x: app.screen.width / 2, y: 80, arrowY: -1 },
      {
        label: "S",
        x: app.screen.width / 2,
        y: app.screen.height - 80,
        arrowY: 1,
      },
      {
        label: "E",
        x: app.screen.width - 80,
        y: app.screen.height / 2,
        arrowX: 1,
      },
      { label: "W", x: 80, y: app.screen.height / 2, arrowX: -1 },
    ];

    directions.forEach((dir) => {
      // Create a circular background
      const circle = new PIXI.Graphics();
      circle.fill({ color: 0x000000, alpha: 0.3 });
      circle.circle(dir.x, dir.y, 25);
      layer.addChild(circle);

      // Create directional text
      const text = new PIXI.Text(dir.label);
      text.style.fontFamily = "Arial";
      text.style.fontSize = 20;
      text.style.fontWeight = "bold";
      text.style.fill = "white";
      text.x = dir.x - 7;
      text.y = dir.y - 12;
      layer.addChild(text);

      // Draw arrow
      if (dir.arrowX || dir.arrowY) {
        const arrow = new PIXI.Graphics();
        arrow.setStrokeStyle({ color: 0xffffff, width: 3, alpha: 0.7 });
        const startX = dir.x + (dir.arrowX ? dir.arrowX * 5 : 0);
        const startY = dir.y + (dir.arrowY ? dir.arrowY * 5 : 0);
        arrow.moveTo(startX, startY);
        arrow.lineTo(
          startX + (dir.arrowX ? dir.arrowX * 15 : 0),
          startY + (dir.arrowY ? dir.arrowY * 15 : 0)
        );
        layer.addChild(arrow);
      }
    });
  };

  // Render the Northern Peaks region
  const renderNorthernPeaks = (
    app: PIXI.Application,
    farLayer: PIXI.Container,
    bgLayer: PIXI.Container,
    midLayer: PIXI.Container
  ) => {
    // Snow-covered mountains
    const mountains = new PIXI.Graphics();
    mountains.fill({ color: 0xd2d5d8 });

    // Mountain range
    for (let i = 0; i < 5; i++) {
      const startX = (i * app.screen.width) / 5;
      const width = app.screen.width / 5;
      const height = 100 + Math.random() * 150;

      mountains.moveTo(startX, app.screen.height * 0.4);
      mountains.lineTo(startX + width / 2, app.screen.height * 0.4 - height);
      mountains.lineTo(startX + width, app.screen.height * 0.4);
    }

    farLayer.addChild(mountains);

    // Snow ground
    const ground = new PIXI.Graphics();
    ground.fill({ color: 0xeeeeee });
    ground.rect(
      0,
      app.screen.height * 0.4,
      app.screen.width,
      app.screen.height * 0.6
    );
    bgLayer.addChild(ground);

    // Ice formation
    const ice = new PIXI.Graphics();
    ice.fill({ color: 0xadd8e6, alpha: 0.7 });
    ice.rect(
      app.screen.width * 0.1,
      app.screen.height * 0.55,
      app.screen.width * 0.3,
      app.screen.height * 0.1
    );
    midLayer.addChild(ice);

    // Add some pine trees
    for (let i = 0; i < 10; i++) {
      const tree = new PIXI.Graphics();
      tree.fill({ color: 0x006400 });

      const treeX = Math.random() * app.screen.width;
      const treeY =
        app.screen.height * 0.6 + Math.random() * (app.screen.height * 0.3);
      const treeHeight = 30 + Math.random() * 40;

      // Tree trunk
      tree.fill({ color: 0x8b4513 });
      tree.rect(treeX - 5, treeY - treeHeight / 4, 10, treeHeight / 4);

      // Tree triangles
      tree.fill({ color: 0x006400 });
      tree.moveTo(treeX - treeHeight / 2, treeY);
      tree.lineTo(treeX, treeY - treeHeight);
      tree.lineTo(treeX + treeHeight / 2, treeY);
      tree.lineTo(treeX - treeHeight / 2, treeY);

      tree.moveTo(treeX - treeHeight / 2.5, treeY - treeHeight / 3);
      tree.lineTo(treeX, treeY - treeHeight * 1.2);
      tree.lineTo(treeX + treeHeight / 2.5, treeY - treeHeight / 3);
      tree.lineTo(treeX - treeHeight / 2.5, treeY - treeHeight / 3);

      // Add some snow
      tree.fill({ color: 0xffffff, alpha: 0.7 });
      tree.moveTo(treeX - treeHeight / 5, treeY - treeHeight * 0.9);
      tree.lineTo(treeX, treeY - treeHeight * 1.1);
      tree.lineTo(treeX + treeHeight / 5, treeY - treeHeight * 0.9);
      tree.lineTo(treeX - treeHeight / 5, treeY - treeHeight * 0.9);

      midLayer.addChild(tree);
    }
  };

  // Render the Whispering Woods region
  const renderWhisperingWoods = (
    app: PIXI.Application,
    farLayer: PIXI.Container,
    bgLayer: PIXI.Container,
    midLayer: PIXI.Container
  ) => {
    // Distant hills
    const hills = new PIXI.Graphics();
    hills.fill({ color: 0x2d4a27 });

    for (let i = 0; i < 3; i++) {
      const hillX = app.screen.width * (0.2 + i * 0.3);
      const hillWidth = app.screen.width * 0.3;
      const hillHeight = 80 + Math.random() * 40;

      hills.ellipse(
        hillX,
        app.screen.height * 0.4 + hillHeight / 2,
        hillWidth / 2,
        hillHeight
      );
    }

    farLayer.addChild(hills);

    // Forest floor
    const ground = new PIXI.Graphics();
    ground.fill({ color: 0x3a5f38 });
    ground.rect(
      0,
      app.screen.height * 0.4,
      app.screen.width,
      app.screen.height * 0.6
    );
    bgLayer.addChild(ground);

    // Add fog
    const fog = new PIXI.Graphics();
    fog.fill({ color: 0xcccccc, alpha: 0.3 });

    for (let i = 0; i < 5; i++) {
      fog.ellipse(
        Math.random() * app.screen.width,
        app.screen.height * 0.5 + Math.random() * 100,
        100 + Math.random() * 200,
        30 + Math.random() * 20
      );
    }

    midLayer.addChild(fog);

    // Add trees
    for (let i = 0; i < 20; i++) {
      const tree = new PIXI.Graphics();

      const treeX = Math.random() * app.screen.width;
      const treeY =
        app.screen.height * 0.5 + Math.random() * (app.screen.height * 0.4);
      const treeHeight = 50 + Math.random() * 70;

      // Tree trunk
      tree.fill({ color: 0x654321 });
      tree.rect(treeX - 8, treeY - treeHeight / 2, 16, treeHeight / 2);

      // Tree canopy
      tree.fill({ color: 0x1a3612 });
      tree.circle(treeX, treeY - treeHeight / 1.5, treeHeight / 3);
      tree.circle(
        treeX - treeHeight / 5,
        treeY - treeHeight / 1.3,
        treeHeight / 4
      );
      tree.circle(
        treeX + treeHeight / 6,
        treeY - treeHeight / 1.4,
        treeHeight / 3.5
      );

      midLayer.addChild(tree);
    }

    // Add some mystical elements
    const magicCircle = new PIXI.Graphics();
    magicCircle.fill({ color: 0x9966cc, alpha: 0.1 });
    magicCircle.circle(app.screen.width * 0.6, app.screen.height * 0.7, 40);

    magicCircle.setStrokeStyle({ color: 0xcc99ff, width: 2, alpha: 0.7 });
    magicCircle.circle(app.screen.width * 0.6, app.screen.height * 0.7, 40);

    midLayer.addChild(magicCircle);
  };

  // Render the Sunhaven Harbor region
  const renderSunhavenHarbor = (
    app: PIXI.Application,
    farLayer: PIXI.Container,
    bgLayer: PIXI.Container,
    midLayer: PIXI.Container
  ) => {
    // Ocean
    const ocean = new PIXI.Graphics();
    ocean.fill({ color: 0x4b6cb7 });
    ocean.rect(
      0,
      app.screen.height * 0.5,
      app.screen.width,
      app.screen.height * 0.5
    );
    bgLayer.addChild(ocean);

    // Beach
    const beach = new PIXI.Graphics();
    beach.fill({ color: 0xf0e68c });
    beach.rect(0, app.screen.height * 0.5 - 20, app.screen.width, 30);
    bgLayer.addChild(beach);

    // Pier
    const pier = new PIXI.Graphics();
    pier.fill({ color: 0x8b4513 });
    pier.rect(
      app.screen.width * 0.6,
      app.screen.height * 0.5 - 10,
      30,
      app.screen.height * 0.3
    );
    midLayer.addChild(pier);

    // Port town buildings
    for (let i = 0; i < 5; i++) {
      const building = new PIXI.Graphics();
      const buildingX = app.screen.width * 0.1 + i * 80;
      const buildingHeight = 60 + Math.random() * 40;

      // Building base
      building.fill({ color: 0xdeb887 });
      building.rect(
        buildingX,
        app.screen.height * 0.5 - buildingHeight,
        60,
        buildingHeight
      );

      // Building roof
      building.fill({ color: 0x8b4513 });
      building.moveTo(buildingX - 10, app.screen.height * 0.5 - buildingHeight);
      building.lineTo(
        buildingX + 30,
        app.screen.height * 0.5 - buildingHeight - 30
      );
      building.lineTo(buildingX + 70, app.screen.height * 0.5 - buildingHeight);
      building.lineTo(buildingX - 10, app.screen.height * 0.5 - buildingHeight);

      // Window
      building.fill({ color: 0x87ceeb });
      building.rect(
        buildingX + 20,
        app.screen.height * 0.5 - buildingHeight + 20,
        20,
        20
      );

      midLayer.addChild(building);
    }

    // Add some boats
    for (let i = 0; i < 3; i++) {
      const boat = new PIXI.Graphics();
      const boatX = app.screen.width * 0.3 + i * 200;
      const boatY = app.screen.height * 0.7;

      // Boat hull
      boat.fill({ color: 0x8b4513 });
      boat.moveTo(boatX, boatY);
      boat.lineTo(boatX - 40, boatY + 20);
      boat.lineTo(boatX + 40, boatY + 20);
      boat.lineTo(boatX, boatY);

      // Boat mast
      boat.fill({ color: 0x8b4513 });
      boat.rect(boatX, boatY - 40, 5, 40);

      // Boat sail
      boat.fill({ color: 0xffffff });
      boat.moveTo(boatX, boatY - 40);
      boat.lineTo(boatX + 30, boatY - 20);
      boat.lineTo(boatX, boatY);
      boat.lineTo(boatX, boatY - 40);

      midLayer.addChild(boat);
    }
  };

  // Render the Amber Plains region
  const renderAmberPlains = (
    app: PIXI.Application,
    farLayer: PIXI.Container,
    bgLayer: PIXI.Container,
    midLayer: PIXI.Container
  ) => {
    // Rolling hills
    const hills = new PIXI.Graphics();
    hills.fill({ color: 0xd4b06a });

    for (let i = 0; i < 5; i++) {
      const hillX = app.screen.width * (0.1 + i * 0.2);
      const hillWidth = app.screen.width * 0.25;
      const hillHeight = 60 + Math.random() * 30;

      hills.ellipse(
        hillX,
        app.screen.height * 0.5 + hillHeight / 2,
        hillWidth / 2,
        hillHeight
      );
    }

    farLayer.addChild(hills);

    // Plains ground
    const ground = new PIXI.Graphics();
    ground.fill({ color: 0xc19a49 });
    ground.rect(
      0,
      app.screen.height * 0.5,
      app.screen.width,
      app.screen.height * 0.5
    );
    bgLayer.addChild(ground);

    // Stone circles
    for (let i = 0; i < 3; i++) {
      const stoneCircle = new PIXI.Graphics();
      const circleX = app.screen.width * (0.2 + i * 0.3);
      const circleY = app.screen.height * (0.6 + i * 0.1);
      const circleRadius = 30 + i * 10;

      stoneCircle.setStrokeStyle({ color: 0x999999, width: 5 });
      stoneCircle.circle(circleX, circleY, circleRadius);

      // Standing stones
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const stoneX = circleX + Math.cos(angle) * circleRadius;
        const stoneY = circleY + Math.sin(angle) * circleRadius;

        const stone = new PIXI.Graphics();
        stone.fill({ color: 0x999999 });
        stone.rect(stoneX - 4, stoneY - 15, 8, 30);

        midLayer.addChild(stone);
      }

      midLayer.addChild(stoneCircle);
    }

    // Add some horses
    for (let i = 0; i < 4; i++) {
      const horse = new PIXI.Graphics();
      const horseX = app.screen.width * (0.1 + i * 0.2);
      const horseY = app.screen.height * 0.75;
      const horseColor = [0x8b4513, 0x5c3317, 0xdeb887, 0x2f2f2f][i % 4];

      // Horse body
      horse.fill({ color: horseColor });
      horse.ellipse(horseX, horseY, 30, 15);

      // Horse neck and head
      horse.fill({ color: horseColor });
      horse.ellipse(horseX - 20, horseY - 20, 15, 8);
      horse.ellipse(horseX - 35, horseY - 25, 10, 7);

      // Horse legs
      horse.fill({ color: horseColor });
      horse.rect(horseX - 20, horseY, 4, 20);
      horse.rect(horseX - 10, horseY, 4, 20);
      horse.rect(horseX + 10, horseY, 4, 20);
      horse.rect(horseX + 20, horseY, 4, 20);

      midLayer.addChild(horse);
    }

    // Add some tall grass
    for (let i = 0; i < 100; i++) {
      const grass = new PIXI.Graphics();
      grass.fill({ color: 0xaaa04f });

      const grassX = Math.random() * app.screen.width;
      const grassY =
        app.screen.height * 0.5 + Math.random() * (app.screen.height * 0.4);
      const grassHeight = 5 + Math.random() * 10;

      grass.rect(grassX, grassY, 1, grassHeight);

      midLayer.addChild(grass);
    }
  };

  // Render a default scene (castle overview) when no specific region is selected
  const renderDefaultScene = (
    app: PIXI.Application,
    farLayer: PIXI.Container,
    bgLayer: PIXI.Container,
    midLayer: PIXI.Container
  ) => {
    // Castle in distance
    const castle = new PIXI.Graphics();
    castle.fill({ color: 0x888888 });
    castle.rect(app.screen.width * 0.6, app.screen.height * 0.3, 200, 150);

    // Castle tower
    castle.fill({ color: 0x666666 });
    castle.rect(app.screen.width * 0.7, app.screen.height * 0.2, 50, 150);
    farLayer.addChild(castle);

    // Ground
    const ground = new PIXI.Graphics();
    ground.fill({ color: 0x8b7355 }); // Brown dirt
    ground.rect(
      0,
      app.screen.height * 0.6,
      app.screen.width,
      app.screen.height * 0.4
    );
    bgLayer.addChild(ground);

    // Stables
    const stables = new PIXI.Graphics();
    stables.fill({ color: 0x8b4513 }); // Brown wood
    stables.rect(app.screen.width * 0.2, app.screen.height * 0.4, 300, 150);

    // Stable roof
    stables.fill({ color: 0x704214 });
    const roofPoints = [
      app.screen.width * 0.2,
      app.screen.height * 0.4,
      app.screen.width * 0.2 + 150,
      app.screen.height * 0.3,
      app.screen.width * 0.2 + 300,
      app.screen.height * 0.4,
    ];
    stables.poly(roofPoints);
    bgLayer.addChild(stables);

    // Horse pen
    const pen = new PIXI.Graphics();
    pen.setStrokeStyle({ width: 5, color: 0x8b4513 });
    pen.rect(app.screen.width * 0.1, app.screen.height * 0.6, 400, 150);
    midLayer.addChild(pen);

    // Horses (simple placeholders)
    const horse1 = new PIXI.Graphics();
    horse1.fill({ color: 0x8b4513 });
    horse1.ellipse(app.screen.width * 0.2, app.screen.height * 0.7, 40, 30);

    const horse2 = new PIXI.Graphics();
    horse2.fill({ color: 0x5c3317 });
    horse2.ellipse(app.screen.width * 0.4, app.screen.height * 0.75, 40, 30);

    midLayer.addChild(horse1);
    midLayer.addChild(horse2);

    // Hay piles
    const hay = new PIXI.Graphics();
    hay.fill({ color: 0xd4af37 });
    hay.ellipse(app.screen.width * 0.15, app.screen.height * 0.75, 20, 10);

    const hay2 = new PIXI.Graphics();
    hay2.fill({ color: 0xd4af37 });
    hay2.ellipse(app.screen.width * 0.3, app.screen.height * 0.8, 20, 10);

    midLayer.addChild(hay);
    midLayer.addChild(hay2);
  };

  // Function to update quest objective
  const updateQuestObjective = (
    questId: string,
    objectiveId: string,
    completed: boolean
  ) => {
    setQuests((prev) => {
      const newQuests = [...prev];
      const questIndex = newQuests.findIndex((q) => q.id === questId);

      if (questIndex >= 0) {
        const quest = { ...newQuests[questIndex] };
        const objectiveIndex = quest.objectives.findIndex(
          (o) => o.id === objectiveId
        );

        if (objectiveIndex >= 0) {
          quest.objectives = [...quest.objectives];
          quest.objectives[objectiveIndex] = {
            ...quest.objectives[objectiveIndex],
            completed,
          };

          // Check if all objectives are completed
          const allCompleted = quest.objectives.every((o) => o.completed);
          if (allCompleted && quest.status === "active") {
            quest.status = "completed";

            // Give rewards
            setPlayerState((prev) => ({
              ...prev,
              gold: prev.gold + quest.reward.gold,
            }));

            // Show completion message
            console.log(`Quest completed: ${quest.title}`);
            // Could add a UI notification here
          }

          newQuests[questIndex] = quest;
        }
      }

      return newQuests;
    });
  };

  // Function to handle entering the stable
  const enterStable = useCallback(() => {
    // Check if player is near the stable entrance
    const stableEntranceX = canvasRef.current?.width
      ? canvasRef.current.width * 0.2
      : 0;
    const stableEntranceY = canvasRef.current?.height
      ? canvasRef.current.height * 0.55
      : 0;

    const distanceToStable = Math.sqrt(
      Math.pow(playerState.x - stableEntranceX, 2) +
        Math.pow(playerState.y - stableEntranceY, 2)
    );

    // If player is close enough to the stable
    if (distanceToStable < 100) {
      setShowHorseStable(true);

      // Complete the "visit stable" objective
      updateQuestObjective("stable_quest", "visit_stable", true);
    } else {
      // Display message that player needs to be closer to the stable
      console.log("You need to be closer to the stable entrance.");
      // Could add a UI notification here
    }
  }, [playerState, updateQuestObjective]);

  // Function to handle horse purchase
  const handlePurchaseHorse = (horse: Horse) => {
    // Check if player has enough gold
    if (playerState.gold >= horse.price) {
      // Update player state
      setPlayerState((prev) => ({
        ...prev,
        gold: prev.gold - horse.price,
        horseInventory: [...prev.horseInventory, horse],
        // If this is their first horse, automatically equip it
        currentHorse: prev.currentHorse === null ? horse : prev.currentHorse,
      }));

      // Complete the "buy horse" objective if this is their first horse
      if (playerState.horseInventory.length === 0) {
        updateQuestObjective("stable_quest", "buy_horse", true);
      }
    }
  };

  // Function to handle selecting a horse
  const handleSelectHorse = (horse: Horse) => {
    setPlayerState((prev) => ({
      ...prev,
      currentHorse: horse,
    }));
  };

  // Function to handle fast travel
  const handleFastTravel = (location: SpawnLocation) => {
    // If we're already at this location, don't do anything
    if (location.id === selectedSpawn?.id) {
      console.log("You are already at this location.");
      return;
    }

    setFastTravelDestination(location);
    setIsShowingFastTravel(true);
  };

  // Function to confirm fast travel
  const confirmFastTravel = (timeToPass: number) => {
    // Get the game engine
    const engine = gameEngineRef.current;

    // Handle time passing
    if (engine && engine.timeManager) {
      // Advance time by the calculated amount (in minutes)
      for (let i = 0; i < timeToPass; i++) {
        engine.timeManager.advanceMinute();
      }
    }

    // Move player to new location
    if (fastTravelDestination) {
      setSelectedSpawn(fastTravelDestination);

      // Update player position
      setPlayerState((prev) => ({
        ...prev,
        x: fastTravelDestination.x * (canvasRef.current?.width || 0),
        y: fastTravelDestination.y * (canvasRef.current?.height || 0),
      }));
    }

    // Close the fast travel dialog
    setIsShowingFastTravel(false);
    setFastTravelDestination(null);
  };

  // Add useEffect for loading simulation
  useEffect(() => {
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    return () => {
      clearInterval(loadingInterval);
    };
  }, []);

  // Move function declarations above usage
  const handleTrackQuest = (questId: string) => {
    setActiveQuestId(questId);
    setIsShowingQuestLog(false);
  };

  const handleAbandonQuest = (questId: string) => {
    if (activeQuestId === questId) {
      setActiveQuestId(null);
    }

    // Optional: Mark quest as abandoned in the quests array
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, status: "abandoned" } : q))
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading screen */}
      {isLoading && (
        <LoadingScreen
          progress={loadingProgress}
          onComplete={() => setIsLoading(false)}
          title="The Realm of Eldoria"
        />
      )}

      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Map selection screen */}
      {showMapSelection && renderMapSelectionScreen()}

      {/* Cardinal direction indicators */}
      {!showMapSelection && !isLoading && (
        <>
          <DirectionIndicator
            direction="north"
            active={activeDirection === "north"}
            label={showRegionLabel ? "Northern Peaks" : undefined}
            onClick={() => setActiveDirection("north")}
          />
          <DirectionIndicator
            direction="south"
            active={activeDirection === "south"}
            label={showRegionLabel ? "Amber Plains" : undefined}
            onClick={() => setActiveDirection("south")}
          />
          <DirectionIndicator
            direction="east"
            active={activeDirection === "east"}
            label={showRegionLabel ? "Whispering Woods" : undefined}
            onClick={() => setActiveDirection("east")}
          />
          <DirectionIndicator
            direction="west"
            active={activeDirection === "west"}
            label={showRegionLabel ? "Sunhaven Harbor" : undefined}
            onClick={() => setActiveDirection("west")}
          />
        </>
      )}

      {/* Horse Stable Dialog */}
      {showHorseStable && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
          <HorseStable
            playerGold={playerState.gold}
            ownedHorses={playerState.horseInventory}
            currentHorse={playerState.currentHorse}
            onPurchaseHorse={handlePurchaseHorse}
            onSelectHorse={handleSelectHorse}
            onClose={() => setShowHorseStable(false)}
          />
        </div>
      )}

      {/* Fast Travel Dialog */}
      {isShowingFastTravel && fastTravelDestination && selectedSpawn && (
        <FastTravelDialog
          currentLocation={selectedSpawn}
          destination={fastTravelDestination}
          currentHorse={playerState.currentHorse}
          onConfirm={confirmFastTravel}
          onCancel={() => setIsShowingFastTravel(false)}
        />
      )}

      {/* Quest Log */}
      {isShowingQuestLog && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
          <QuestLog
            quests={quests}
            onQuestTrack={handleTrackQuest}
            onQuestAbandon={handleAbandonQuest}
            onClose={() => setIsShowingQuestLog(false)}
          />
        </div>
      )}

      {/* Active Quest Indicator */}
      {activeQuestId && !showMapSelection && !isLoading && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <div
            className="pixelated p-2 text-center"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              padding: "8px 16px",
            }}
          >
            <div className="text-xs text-paper-brown">
              {quests.find((q) => q.id === activeQuestId)?.title ||
                "Active Quest"}
            </div>
          </div>
        </div>
      )}

      {/* Controls help text */}
      {!showMapSelection && !isLoading && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
          <div
            className="pixelated p-2 text-center"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              padding: "8px 16px",
            }}
          >
            <div className="text-xs text-paper-brown">
              WASD: Move | E: Interact | M: Map | Q: Quests
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrototypeLevel;
