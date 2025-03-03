import React, { ReactNode } from "react";

interface PaperUIFrameProps {
  children: ReactNode;
  title?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  type?: "brown" | "gray" | "blue";
}

/**
 * A reusable paper-themed UI frame component using the Free Paper UI System assets
 */
export default function PaperUIFrame({
  children,
  title,
  className = "",
  size = "medium",
  type = "brown",
}: PaperUIFrameProps) {
  // Get size-specific classes
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "p-2 min-w-[120px]";
      case "large":
        return "p-4 min-w-[240px]";
      default:
        return "p-3 min-w-[180px]";
    }
  };

  // Get background image based on type
  const getBackgroundImage = () => {
    switch (type) {
      case "gray":
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Folded/Ticket/1.png";
      case "blue":
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Folded/Ticket/3.png";
      default:
        return "/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Folded/Ticket/2.png";
    }
  };

  return (
    <div
      className={`relative ${getSizeClass()} ${className} paper-shadow pointer-events-auto`}
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    >
      {title && (
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3 pixelated float"
          style={{
            backgroundImage:
              "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Separators/1.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            padding: "0.5rem 1.5rem",
          }}
        >
          <span className="text-center text-paper-brown font-semibold whitespace-nowrap text-sm">
            {title}
          </span>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
