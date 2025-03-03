import React, { useState, useEffect } from "react";
import PaperUIFrame from "./PaperUIFrame";
import PaperUIButton from "./PaperUIButton";
import { Horse } from "./HorseStable";

// Define MapLocation interface here since it's not exported from PixelMap
interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  discovered?: boolean;
}

interface FastTravelDialogProps {
  currentLocation: MapLocation;
  destination: MapLocation;
  currentHorse: Horse | null;
  onConfirm: (timeToPass: number) => void;
  onCancel: () => void;
}

// Base time cost calculation (in in-game minutes)
// Distance formula - sqrt of (x2-x1)^2 + (y2-y1)^2, scaled by factor
const calculateTimeCost = (from: MapLocation, to: MapLocation): number => {
  const distance = Math.sqrt(
    Math.pow((to.x - from.x) * 100, 2) + Math.pow((to.y - from.y) * 100, 2)
  );

  // Convert distance to time (10 mins per distance unit)
  const baseMinutes = Math.round(distance * 10);
  // Minimum of 30 minutes
  return Math.max(30, baseMinutes);
};

export default function FastTravelDialog({
  currentLocation,
  destination,
  currentHorse,
  onConfirm,
  onCancel,
}: FastTravelDialogProps) {
  // Calculate base time cost
  const baseTimeCost = calculateTimeCost(currentLocation, destination);

  // Apply horse speed reduction if a horse is equipped
  const actualTimeCost = currentHorse
    ? Math.round(baseTimeCost / currentHorse.speed)
    : baseTimeCost;

  // Format time for display (convert minutes to hours and minutes)
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""} ${
          mins > 0 ? `${mins} min${mins !== 1 ? "s" : ""}` : ""
        }`
      : `${mins} min${mins !== 1 ? "s" : ""}`;
  };

  // Calculate time savings
  const timeSaved = baseTimeCost - actualTimeCost;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <PaperUIFrame title="Fast Travel" size="large" type="brown">
        <div className="p-4 min-w-[300px]">
          <div className="mb-4">
            <div className="text-center mb-2">
              <div className="text-lg font-semibold text-paper-brown">
                {currentLocation.name} → {destination.name}
              </div>
            </div>
            <div
              className="w-full h-1 my-2"
              style={{
                backgroundImage:
                  "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Separators/4.png')",
                backgroundSize: "100% 8px",
                backgroundRepeat: "repeat-x",
              }}
            ></div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div
                className="w-6 h-6 mr-2 pixelated"
                style={{
                  backgroundImage:
                    "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/28.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              <div className="text-paper-brown">
                <span className="font-semibold">Base Travel Time:</span>{" "}
                {formatTime(baseTimeCost)}
              </div>
            </div>

            {currentHorse && (
              <div className="flex items-center mb-2">
                <div
                  className="w-6 h-6 mr-2 pixelated"
                  style={{
                    backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Icons/${currentHorse.tier}.png')`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
                <div className="text-paper-brown">
                  <span className="font-semibold">Horse Bonus:</span>{" "}
                  {currentHorse.name} saves you {formatTime(timeSaved)}
                </div>
              </div>
            )}

            <div
              className="bg-amber-50/30 p-2 rounded-md mt-3"
              style={{
                backgroundImage:
                  "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/10.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="text-center text-paper-brown font-semibold">
                Actual Travel Time: {formatTime(actualTimeCost)}
              </div>
            </div>
          </div>

          {!currentHorse && (
            <div className="mb-4 text-center text-xs text-paper-brown">
              Visit the stable to purchase a horse and reduce travel time!
            </div>
          )}

          <div className="flex justify-center gap-4 mt-4">
            <PaperUIButton
              type="green"
              onClick={() => onConfirm(actualTimeCost)}
            >
              Travel
            </PaperUIButton>
            <PaperUIButton type="red" onClick={onCancel}>
              Cancel
            </PaperUIButton>
          </div>
        </div>
      </PaperUIFrame>
    </div>
  );
}
