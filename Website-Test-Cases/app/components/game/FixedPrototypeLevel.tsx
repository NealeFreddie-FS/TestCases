import React, { useEffect, useState, useRef, useCallback } from "react";
import LoadingScreen from "./ui/LoadingScreen";
import DirectionIndicator from "./ui/DirectionIndicator";
import QuestLog from "./ui/QuestLog";

// Define types
interface PrototypeLevelProps {
  onBackToMenu: () => void;
}

interface SpawnLocation {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "failed";
  reward: {
    gold: number;
    items?: string[];
    experience?: number;
  };
  objectives: {
    id: string;
    description: string;
    completed: boolean;
  }[];
}

interface PlayerState {
  x: number;
  y: number;
  coins: number;
  inventory: string[];
  currentHorse: string | null;
  horses: string[];
  quests: string[];
}

// Main component
const FixedPrototypeLevel: React.FC<PrototypeLevelProps> = ({
  onBackToMenu,
}) => {
  // Canvas and rendering refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stableRef = useRef<{ x: number; y: number }>({ x: 400, y: 300 });

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Game state
  const [showMapSelection, setShowMapSelection] = useState(true);
  const [selectedSpawn, setSelectedSpawn] = useState<string | null>(null);
  const [activeDirection, setActiveDirection] = useState<
    "north" | "south" | "east" | "west" | null
  >(null);
  const [showRegionLabel, setShowRegionLabel] = useState(false);

  // Quest system
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "horse-quest",
      title: "A Trusty Steed",
      description:
        "Visit the stable and purchase your first horse to aid in your travels around the realm.",
      status: "active",
      reward: {
        gold: 50,
        items: ["Saddle Bags"],
        experience: 100,
      },
      objectives: [
        {
          id: "visit-stable",
          description: "Visit the stable",
          completed: false,
        },
        {
          id: "purchase-horse",
          description: "Purchase a horse",
          completed: false,
        },
      ],
    },
  ]);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(
    "horse-quest"
  );
  const [isShowingQuestLog, setIsShowingQuestLog] = useState(false);

  // Horse & stable system
  const [isShowingStable, setIsShowingStable] = useState(false);
  const [stableTooDirty, setStableTooDirty] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 0,
    y: 0,
    coins: 100,
    inventory: [],
    currentHorse: null,
    horses: [],
    quests: ["horse-quest"],
  });

  // Fast travel system
  const [isShowingFastTravel, setIsShowingFastTravel] = useState(false);
  const [fastTravelDestination, setFastTravelDestination] = useState<
    string | null
  >(null);

  // Spawn locations
  const spawnLocations: SpawnLocation[] = [
    {
      id: "northern-peaks",
      name: "Northern Peaks",
      description: "Snow-capped mountains with ancient dwarven ruins",
      x: 200,
      y: 100,
    },
    {
      id: "whispering-woods",
      name: "Whispering Woods",
      description: "Dense forest filled with magical creatures",
      x: 600,
      y: 300,
    },
    {
      id: "sunhaven-harbor",
      name: "Sunhaven Harbor",
      description: "Bustling port town with merchants from distant lands",
      x: 150,
      y: 500,
    },
    {
      id: "amber-plains",
      name: "Amber Plains",
      description: "Vast grasslands where wild horses roam free",
      x: 450,
      y: 450,
    },
  ];

  // Handle quest tracking and abandoning
  const handleTrackQuest = (quest: Quest) => {
    setActiveQuestId(quest.id);
    setIsShowingQuestLog(false);
  };

  const handleAbandonQuest = (quest: Quest) => {
    if (activeQuestId === quest.id) {
      setActiveQuestId(null);
    }

    // Mark quest as failed in the quests array
    setQuests((prev) =>
      prev.map((q) =>
        q.id === quest.id ? { ...q, status: "failed" as const } : q
      )
    );
  };

  // Calculate distance between two points
  const calculateDistance = (
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  // Update quest objectives and check completion
  const updateQuestObjective = useCallback(
    (questId: string, objectiveId: string, completed: boolean) => {
      setQuests((prev) => {
        const updatedQuests = prev.map((quest) => {
          if (quest.id === questId) {
            const updatedObjectives = quest.objectives.map((obj) =>
              obj.id === objectiveId ? { ...obj, completed } : obj
            );

            // Check if all objectives are completed
            const allCompleted = updatedObjectives.every(
              (obj) => obj.completed
            );

            return {
              ...quest,
              objectives: updatedObjectives,
              status: allCompleted ? ("completed" as const) : quest.status,
            };
          }
          return quest;
        });

        return updatedQuests;
      });
    },
    []
  );

  // Function to handle entering the stable
  const enterStable = useCallback(() => {
    if (
      playerRef.current &&
      stableRef.current &&
      calculateDistance(playerRef.current, stableRef.current) < 100
    ) {
      setIsShowingStable(true);
      // Update quest objective if applicable
      if (quests.some((q) => q.id === "horse-quest" && q.status === "active")) {
        updateQuestObjective("horse-quest", "visit-stable", true);
      }
    } else {
      setStableTooDirty(true);
      setTimeout(() => {
        setStableTooDirty(false);
      }, 2000);
    }
  }, [quests, updateQuestObjective]);

  // Function to handle horse purchase
  const handlePurchaseHorse = useCallback(
    (horseName: string, price: number) => {
      if (playerState.coins >= price) {
        setPlayerState((prev) => ({
          ...prev,
          coins: prev.coins - price,
          horses: [...prev.horses, horseName],
          currentHorse: prev.currentHorse || horseName,
        }));

        // Update quest objective
        if (
          quests.some((q) => q.id === "horse-quest" && q.status === "active")
        ) {
          updateQuestObjective("horse-quest", "purchase-horse", true);
        }

        setIsShowingStable(false);
      }
    },
    [playerState, quests, updateQuestObjective]
  );

  // Function to handle fast travel confirmation
  const confirmFastTravel = useCallback(() => {
    if (fastTravelDestination) {
      const destination = spawnLocations.find(
        (loc) => loc.id === fastTravelDestination
      );
      if (destination) {
        playerRef.current = { x: destination.x, y: destination.y };
        setSelectedSpawn(fastTravelDestination);
      }
      setIsShowingFastTravel(false);
    }
  }, [fastTravelDestination, spawnLocations]);

  // Key press handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Movement - set active direction
      if (e.key === "w" || e.key === "ArrowUp") {
        setActiveDirection("north");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (e.key === "s" || e.key === "ArrowDown") {
        setActiveDirection("south");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (e.key === "a" || e.key === "ArrowLeft") {
        setActiveDirection("west");
        setTimeout(() => setActiveDirection(null), 300);
      } else if (e.key === "d" || e.key === "ArrowRight") {
        setActiveDirection("east");
        setTimeout(() => setActiveDirection(null), 300);
      }

      // Toggle map
      if (e.key === "m" && !showMapSelection && !isLoading) {
        setShowRegionLabel((prev) => !prev);
      }

      // Toggle quest log
      if (e.key === "q" && !showMapSelection && !isLoading) {
        setIsShowingQuestLog((prev) => !prev);
      }

      // Interaction key
      if (e.key === "e" && !showMapSelection && !isLoading) {
        enterStable();
      }

      // ESC key to show map or close UI
      if (e.key === "Escape") {
        if (isShowingQuestLog) {
          setIsShowingQuestLog(false);
        } else if (isShowingStable) {
          setIsShowingStable(false);
        } else if (isShowingFastTravel) {
          setIsShowingFastTravel(false);
        } else if (!showMapSelection && !isLoading) {
          setShowMapSelection(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showMapSelection,
    isLoading,
    isShowingQuestLog,
    isShowingStable,
    isShowingFastTravel,
    enterStable,
  ]);

  // Loading simulation effect
  useEffect(() => {
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

  // Render map selection screen
  const renderMapSelection = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
      <div className="fantasy-frame parchment-bg p-8 max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-paper-brown">
          Welcome to the Realm of Eldoria
        </h2>
        <p className="text-paper-brown mb-8 text-center">
          Choose a region to begin your adventure:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {spawnLocations.map((location) => (
            <button
              key={location.id}
              className="fantasy-button w-full"
              onClick={() => {
                setSelectedSpawn(location.id);
                setShowMapSelection(false);
              }}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

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

      {/* Canvas for game rendering */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Map selection screen */}
      {showMapSelection && !isLoading && renderMapSelection()}

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

      {/* Back to menu button */}
      <button
        className="absolute top-4 left-4 fantasy-button z-10"
        onClick={onBackToMenu}
      >
        Back to Menu
      </button>
    </div>
  );
};

export default FixedPrototypeLevel;
