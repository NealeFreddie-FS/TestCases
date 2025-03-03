"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorldMapProps {
  isVisible: boolean;
  onClose: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ isVisible, onClose }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const regions = [
    {
      id: "forest",
      name: "Whispering Woods",
      position: { x: 120, y: 150 },
      icon: "/assets/Tiny Swords (Update 010)/Resources/Trees/Tree.png",
    },
    {
      id: "mountain",
      name: "Frost Peak",
      position: { x: 250, y: 100 },
      icon: "/assets/Tiny Swords (Update 010)/Deco/12.png",
    },
    {
      id: "castle",
      name: "Eldoria Castle",
      position: { x: 300, y: 220 },
      icon: "/assets/Tiny Swords (Update 010)/Factions/Knights/Buildings/Castle/Castle_Blue.png",
    },
    {
      id: "village",
      name: "Riverside Village",
      position: { x: 180, y: 280 },
      icon: "/assets/Tiny Swords (Update 010)/Factions/Knights/Buildings/House/House_Blue.png",
    },
    {
      id: "ruins",
      name: "Ancient Ruins",
      position: { x: 400, y: 180 },
      icon: "/assets/Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Destroyed.png",
    },
  ];

  // Close map when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    setIsZoomed(true);
  };

  const handleBackToMap = () => {
    setIsZoomed(false);
    setTimeout(() => setSelectedRegion(null), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-[800px] h-[600px] bg-indigo-900 rounded-lg border-4 border-indigo-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Map title */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-64 h-16 flex items-center justify-center z-10">
              <img
                src="/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Right.png"
                alt="Title Banner"
                className="w-full h-full object-contain"
              />
              <h3 className="absolute font-pixelated text-amber-100 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                World Map
              </h3>
            </div>

            {/* Close button */}
            <motion.button
              className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center z-10"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img
                src="/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Red.png"
                alt="Close"
                className="w-full h-full object-contain"
              />
              <span className="absolute text-white text-lg font-bold">×</span>
            </motion.button>

            {!isZoomed ? (
              /* Main map view */
              <div className="absolute inset-0 pt-20 p-10" ref={mapRef}>
                {/* Map background - using Terrain tiles */}
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-[url('/assets/Tiny Swords (Update 010)/Terrain/Water/Water.png')] bg-repeat"></div>
                  <div className="absolute inset-0 top-[10%] left-[10%] right-[10%] bottom-[10%] bg-[url('/assets/Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Flat.png')] bg-repeat rounded-3xl"></div>

                  {/* Map locations */}
                  {regions.map((region) => (
                    <motion.button
                      key={region.id}
                      className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{
                        left: region.position.x,
                        top: region.position.y,
                      }}
                      onClick={() => handleRegionClick(region.id)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img
                        src={region.icon}
                        alt={region.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap bg-indigo-900/80 text-amber-100 px-2 py-1 rounded-md text-xs font-pixelated">
                        {region.name}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Map legend */}
                <div className="absolute bottom-6 right-6 w-60 p-4 bg-indigo-900/80 rounded-lg border-2 border-indigo-700">
                  <h4 className="font-pixelated text-amber-100 text-sm mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    Legend
                  </h4>
                  <div className="space-y-1">
                    {regions.map((region) => (
                      <div key={region.id} className="flex items-center">
                        <img
                          src={region.icon}
                          alt={region.name}
                          className="w-6 h-6 mr-2"
                        />
                        <span className="text-xs font-pixelated text-amber-100">
                          {region.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Zoomed in region view */
              <div className="absolute inset-0 pt-20 p-10">
                {selectedRegion && (
                  <div className="w-full h-full flex flex-col items-center">
                    <div className="relative w-full h-3/4 bg-indigo-900/50 rounded-lg border-2 border-indigo-700 overflow-hidden">
                      {/* Region decorations based on selected region */}
                      <div className="absolute inset-0">
                        {/* Water background */}
                        <div className="absolute inset-0 bg-[url('/assets/Tiny Swords (Update 010)/Terrain/Water/Water.png')] bg-repeat"></div>

                        {/* Ground layer */}
                        <div className="absolute inset-0 top-[15%] left-[15%] right-[15%] bottom-[15%] bg-[url('/assets/Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Flat.png')] bg-repeat rounded-3xl"></div>
                      </div>

                      {/* Region-specific elements */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.img
                          src={
                            regions.find((r) => r.id === selectedRegion)
                              ?.icon || ""
                          }
                          alt={`${selectedRegion} icon`}
                          className="w-32 h-32 object-contain"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        />
                      </div>

                      {/* Region name */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-60 h-12 flex items-center justify-center">
                        <img
                          src="/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Left.png"
                          alt="Region Banner"
                          className="w-full h-full object-contain"
                        />
                        <h3 className="absolute font-pixelated text-amber-100 text-base drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          {regions.find((r) => r.id === selectedRegion)?.name}
                        </h3>
                      </div>
                    </div>

                    {/* Back button */}
                    <motion.button
                      className="mt-4 flex items-center justify-center relative"
                      onClick={handleBackToMap}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src="/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Blue.png"
                        alt="Button Background"
                        className="h-12 w-36 object-contain"
                      />
                      <span className="absolute font-pixelated text-white">
                        Back to Map
                      </span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldMap;
