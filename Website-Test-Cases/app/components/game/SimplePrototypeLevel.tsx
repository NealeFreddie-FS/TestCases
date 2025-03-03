import React, { useEffect, useState } from "react";
import LoadingScreen from "./ui/LoadingScreen";
import DirectionIndicator from "./ui/DirectionIndicator";

interface SimplePrototypeLevelProps {
  onBackToMenu: () => void;
}

/**
 * A simplified version of the PrototypeLevel component
 * This serves as a temporary replacement while fixing syntax errors
 */
const SimplePrototypeLevel: React.FC<SimplePrototypeLevelProps> = ({
  onBackToMenu,
}) => {
  // Basic state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeDirection, setActiveDirection] = useState<
    "north" | "south" | "east" | "west" | null
  >(null);
  const [showRegionLabel, setShowRegionLabel] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Loading simulation
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

    return () => clearInterval(loadingInterval);
  }, []);

  // Keyboard event handling for directions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

      // Toggle region labels with M key
      if (event.key === "m") {
        setShowRegionLabel((prev) => !prev);
      }

      // Toggle map with ESC key
      if (event.key === "Escape") {
        setShowMap((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEnterWorld = () => {
    setShowMap(false);
  };

  // Simplified map selection screen
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
          {[
            "Northern Peaks",
            "Whispering Woods",
            "Sunhaven Harbor",
            "Amber Plains",
          ].map((region, index) => (
            <button
              key={index}
              className="fantasy-button w-full"
              onClick={handleEnterWorld}
            >
              {region}
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

      {/* Canvas would go here in the actual implementation */}
      <div className="w-full h-full bg-gradient-to-b from-sky-800 to-indigo-900">
        {/* Placeholder for game content */}
        {!showMap && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-xl">Game World</p>
          </div>
        )}
      </div>

      {/* Map selection screen */}
      {showMap && !isLoading && renderMapSelection()}

      {/* Cardinal direction indicators */}
      {!showMap && !isLoading && (
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

      {/* Controls helper */}
      {!showMap && !isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-lg text-white text-sm">
          <div className="text-center">
            <span className="font-bold">WASD/Arrows</span>: Move |
            <span className="font-bold"> M</span>: Show Labels |
            <span className="font-bold"> ESC</span>: Menu
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

export default SimplePrototypeLevel;
