import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface DirectionIndicatorProps {
  direction: "north" | "south" | "east" | "west";
  onClick?: () => void;
  active?: boolean;
  label?: string;
}

const DirectionIndicator: React.FC<DirectionIndicatorProps> = ({
  direction,
  active = false,
  label,
  onClick,
}) => {
  // Position based on direction
  const getPositionClasses = () => {
    switch (direction) {
      case "north":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "south":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "east":
        return "right-4 top-1/2 transform -translate-y-1/2";
      case "west":
        return "left-4 top-1/2 transform -translate-y-1/2";
    }
  };

  // Abbreviation for the direction
  const getDirectionAbbr = () => {
    switch (direction) {
      case "north":
        return "N";
      case "south":
        return "S";
      case "east":
        return "E";
      case "west":
        return "W";
    }
  };

  // Get appropriate arrow symbol for each direction
  const getArrowSymbol = () => {
    switch (direction) {
      case "north":
        return "↑";
      case "south":
        return "↓";
      case "east":
        return "→";
      case "west":
        return "←";
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} z-50 flex flex-col items-center`}
      onClick={onClick}
    >
      {/* Direction indicator */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
          transition-all duration-300 cursor-pointer
          ${
            active
              ? "bg-amber-500 scale-125 shadow-lg shadow-amber-500/50"
              : "bg-slate-800/80 hover:bg-slate-700/80"
          }
        `}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm">{getDirectionAbbr()}</span>
          <span className="text-xs">{getArrowSymbol()}</span>
        </div>
      </div>

      {/* Label (region name) */}
      {label && (
        <div className="mt-2 px-3 py-1 bg-black/70 rounded-lg text-white text-sm whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};

export default DirectionIndicator;
