import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  progress: number;
  onComplete?: () => void;
  title?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  onComplete,
  title = "Loading Game...",
}) => {
  const [showTips, setShowTips] = useState(0);

  // Array of loading tips to display
  const tips = [
    "Press M to view region names on the compass",
    "You can purchase horses at the stable",
    "Check your quest log with Q",
    "Use WASD or arrow keys to move",
    "Traveling between regions unlocks fast travel points",
    "Time passes as you play - watch the sky change",
    "Complete quests to earn rewards",
    "Press ESC to access the map and menus",
  ];

  // Rotate through tips every few seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setShowTips((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => clearInterval(tipInterval);
  }, [tips.length]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Game title */}
      <h1 className="text-4xl md:text-6xl font-medieval text-amber-400 mb-12 tracking-wider">
        {title}
      </h1>

      {/* Animated sword or fantasy icon */}
      <div className="mb-12">
        <div className="w-16 h-16 border-t-4 border-amber-500 rounded-full animate-spin"></div>
      </div>

      {/* Progress bar */}
      <div className="w-64 md:w-96 h-3 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Loading percentage */}
      <div className="text-amber-400 mb-8 font-mono">
        {Math.round(progress)}% LOADED
      </div>

      {/* Loading tip */}
      <div className="text-gray-400 max-w-md text-center px-4 h-6 transition-opacity duration-300">
        <p className="italic text-sm">{tips[showTips]}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
