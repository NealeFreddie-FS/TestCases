import React from "react";

interface PaperUIButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "default" | "green" | "blue" | "red";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

/**
 * A paper-styled button component using the Free Paper UI System assets
 */
export default function PaperUIButton({
  onClick,
  children,
  className = "",
  type = "default",
  size = "medium",
  disabled = false,
}: PaperUIButtonProps) {
  // Determine button background image based on type
  const getButtonImage = () => {
    if (disabled) {
      return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/8.png";
    }

    switch (type) {
      case "green":
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/16.png";
      case "blue":
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/14.png";
      case "red":
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/13.png";
      default:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/1.png";
    }
  };

  // Determine size-specific classes
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "py-1 px-2 text-xs";
      case "large":
        return "py-3 px-5 text-base";
      default:
        return "py-2 px-4 text-sm";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative transition-transform pixelated ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-105 active:scale-95 cursor-pointer"
      } ${getSizeClass()} ${className}`}
      style={{
        backgroundImage: `url(${getButtonImage()})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <span
        className={`font-medium ${
          disabled ? "text-gray-600" : "text-paper-brown"
        }`}
      >
        {children}
      </span>
    </button>
  );
}
