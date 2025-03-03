import React, { useState, useEffect } from "react";
import { TimeManager, Hour } from "../managers/TimeManager";
import PaperUIFrame from "./PaperUIFrame";

interface StardewTimeDisplayProps {
  timeManager: TimeManager;
}

/**
 * A time display component styled with the Paper UI theme
 */
export default function StardewTimeDisplay({
  timeManager,
}: StardewTimeDisplayProps) {
  const [currentHour, setCurrentHour] = useState<Hour>(Hour.DAWN);
  const [timeString, setTimeString] = useState<string>("");
  const [day, setDay] = useState<string>("");

  useEffect(() => {
    if (!timeManager) return;

    // Initial update
    updateFromTimeState();

    // Subscribe to time changes
    timeManager.onTimeChange(updateFromTimeState);

    // Cleanup on unmount
    return () => {
      // This cleanup function would ideally remove the listener
      // but TimeManager doesn't yet have a method to remove a specific callback
      // We'll assume it's safe enough for this UI component
    };
  }, [timeManager]);

  const updateFromTimeState = () => {
    const timeState = timeManager.getTimeState();
    setCurrentHour(timeState.hour);
    setDay(timeState.day);

    // Generate time string
    let hourString;
    let amPm;

    switch (timeState.hour) {
      case Hour.DAWN:
        hourString = "6:00";
        amPm = "AM";
        break;
      case Hour.ZENITH:
        hourString = "12:00";
        amPm = "PM";
        break;
      case Hour.DUSK:
        hourString = "6:00";
        amPm = "PM";
        break;
      case Hour.MIDNIGHT:
        hourString = "12:00";
        amPm = "AM";
        break;
      default:
        hourString = "6:00";
        amPm = "AM";
    }

    setTimeString(`${hourString} ${amPm}`);
  };

  // Get time icon based on current hour
  const getTimeIconPath = () => {
    switch (currentHour) {
      case Hour.DAWN:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/9.png"; // Sun rising
      case Hour.ZENITH:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/11.png"; // Full sun
      case Hour.DUSK:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/10.png"; // Setting sun
      case Hour.MIDNIGHT:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/12.png"; // Moon
      default:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/11.png";
    }
  };

  // Get animation class based on time of day
  const getAnimationClass = () => {
    switch (currentHour) {
      case Hour.MIDNIGHT:
        return "pulse-gentle";
      default:
        return "";
    }
  };

  return (
    <PaperUIFrame
      size="medium"
      title="Time"
      type={currentHour === Hour.MIDNIGHT ? "blue" : "brown"}
    >
      <div className="flex items-center gap-3">
        {/* Time icon */}
        <div
          className={`w-12 h-12 flex items-center justify-center pixelated ${getAnimationClass()}`}
          style={{
            backgroundImage:
              "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/9.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="w-8 h-8 pixelated"
            style={{
              backgroundImage: `url(${getTimeIconPath()})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>

        {/* Time text */}
        <div className="flex flex-col">
          <div className="font-medium text-paper-brown">{timeString}</div>
          <div
            className="flex gap-1 items-center pixelated"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Separators/2.png')",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              padding: "2px 8px",
            }}
          >
            <span className="text-xs text-paper-brown">{day}</span>
          </div>
        </div>
      </div>

      {/* Progress bar showing time of day */}
      <div
        className="mt-2 h-4 relative pixelated"
        style={{
          backgroundImage:
            "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/4.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute top-0 left-0 h-full pixelated progress-animate"
          style={{
            backgroundImage:
              "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/1.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            width: `${getTimeProgress()}%`,
          }}
        ></div>
      </div>
    </PaperUIFrame>
  );

  // Calculate time progress percentage through the day
  function getTimeProgress() {
    switch (currentHour) {
      case Hour.DAWN:
        return 0;
      case Hour.ZENITH:
        return 33;
      case Hour.DUSK:
        return 66;
      case Hour.MIDNIGHT:
        return 100;
      default:
        return 0;
    }
  }
}
