import React, { useState, useEffect } from "react";
import { GameEngine } from "../GameEngine";
import PaperUIFrame from "./PaperUIFrame";

interface FPSCounterProps {
  gameEngine: GameEngine;
}

/**
 * FPS Counter component that displays the current frame rate with Paper UI styling
 */
export default function FPSCounter({ gameEngine }: FPSCounterProps) {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);

  useEffect(() => {
    if (!gameEngine || !gameEngine.performanceManager) return;

    // Update function to get FPS from game engine
    const updateFPS = () => {
      setFps(gameEngine.performanceManager.getFps());
      setFrameTime(gameEngine.performanceManager.getAverageFrameTime());

      // Request next frame
      requestAnimationFrame(updateFPS);
    };

    // Start FPS display updates
    const animationId = requestAnimationFrame(updateFPS);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameEngine]);

  // Color coding based on performance
  const getFpsColor = () => {
    if (fps >= 55) return "text-green-800"; // Good performance
    if (fps >= 30) return "text-yellow-800"; // Acceptable performance
    return "text-red-800"; // Poor performance
  };

  return (
    <PaperUIFrame size="small" type="brown" title="Performance">
      <div className="flex flex-col">
        <div className={`font-medium ${getFpsColor()}`}>
          <span
            className="inline-block mr-1 pixelated"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/7.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              width: "16px",
              height: "16px",
              verticalAlign: "text-bottom",
            }}
          ></span>
          <span className="paper-tooltip" data-tooltip="Frames Per Second">
            FPS: {fps}
          </span>
        </div>
        <div className="text-paper-brown text-xs mt-1">
          <span
            className="inline-block mr-1 pixelated"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/14.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              width: "14px",
              height: "14px",
              verticalAlign: "text-bottom",
            }}
          ></span>
          <span className="paper-tooltip" data-tooltip="Milliseconds per frame">
            Frame: {frameTime.toFixed(2)}ms
          </span>
        </div>
      </div>
    </PaperUIFrame>
  );
}
