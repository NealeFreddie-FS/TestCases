import React, { useState, useEffect } from "react";
import Image from "next/image";
import PaperUIFrame from "./PaperUIFrame";

interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  discovered?: boolean;
}

interface PixelMapProps {
  locations: MapLocation[];
  currentLocation?: string;
  onLocationSelect?: (location: MapLocation) => void;
  className?: string;
}

/**
 * A pixel map component using the Pocket Inventory Series #2 Pixel Map assets
 */
export default function PixelMap({
  locations,
  currentLocation,
  onLocationSelect,
  className = "",
}: PixelMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Set the initial selected location based on the current location
  useEffect(() => {
    if (currentLocation) {
      const location = locations.find((loc) => loc.id === currentLocation);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [currentLocation, locations]);

  // Handle location click
  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Toggle map expansion
  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map toggle button */}
      <button
        onClick={toggleMapExpansion}
        className="absolute top-2 right-2 z-20 paper-hover"
        style={{
          width: "32px",
          height: "32px",
          backgroundImage:
            "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Buttons/0.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      ></button>

      {/* Collapsed map view */}
      <div
        className={`relative transition-all duration-300 ${
          isMapExpanded ? "scale-100" : "scale-95"
        }`}
      >
        <div
          className="relative pixelated"
          style={{
            width: isMapExpanded ? "320px" : "240px",
            height: isMapExpanded ? "320px" : "240px",
            backgroundImage:
              "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Pixel Map Base/0.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            transition: "width 0.3s, height 0.3s",
          }}
        >
          {/* Map grid */}
          <div className="absolute inset-[15%] grid grid-cols-5 grid-rows-5">
            {/* Location markers */}
            {locations.map((location) => (
              <div
                key={location.id}
                className={`absolute cursor-pointer hover:scale-110 transition-transform ${
                  selectedLocation?.id === location.id ? "animate-pulse" : ""
                }`}
                style={{
                  left: `${location.x * 100}%`,
                  top: `${location.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleLocationClick(location)}
              >
                <div
                  className="w-6 h-6 pixelated"
                  style={{
                    backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Icons/${
                      selectedLocation?.id === location.id ? "1.png" : "0.png"
                    }')`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
              </div>
            ))}

            {/* Compass */}
            <div
              className="absolute top-2 left-2 w-10 h-10 pixelated"
              style={{
                backgroundImage:
                  "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Compass/0.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </div>

          {/* Location info display */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[80%] text-center">
              <div
                className="pixelated p-2"
                style={{
                  backgroundImage:
                    "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Holders/2.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="text-xs text-paper-brown font-pixel">
                  {selectedLocation.name}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded view additional information */}
      {isMapExpanded && selectedLocation && (
        <div
          className="absolute top-full left-0 mt-2 w-full pixelated p-3"
          style={{
            backgroundImage:
              "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Holders/0.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="text-xs text-paper-brown">
            <div className="font-semibold mb-1">{selectedLocation.name}</div>
            <div>{selectedLocation.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
