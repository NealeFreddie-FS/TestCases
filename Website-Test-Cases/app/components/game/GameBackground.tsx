"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const GameBackground: React.FC = () => {
  const [decorations, setDecorations] = useState<React.ReactNode[]>([]);

  // Generate decorations only on the client side
  useEffect(() => {
    setDecorations([
      ...generateDecorations("tree", 7),
      ...generateDecorations("cloud", 5),
    ]);
  }, []);

  // Create decorative elements (trees, clouds, etc.)
  const generateDecorations = (type: "tree" | "cloud", count: number) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const randomX = Math.floor(Math.random() * 100); // percentage for position
      const randomScale = 0.7 + Math.random() * 0.6; // scale between 0.7 and 1.3
      const randomDelay = Math.random() * 4; // random animation delay

      if (type === "tree") {
        const treeTypes = ["01", "12", "13"];
        const treeType =
          treeTypes[Math.floor(Math.random() * treeTypes.length)];

        items.push(
          <motion.div
            key={`tree-${i}`}
            className="absolute bottom-0 z-10"
            style={{
              left: `${randomX}%`,
              transform: `scale(${randomScale})`,
              opacity: 0.8,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ delay: randomDelay, duration: 1 }}
          >
            <img
              src={`/assets/Tiny Swords (Update 010)/Deco/${treeType}.png`}
              alt="Tree"
              className="w-16 h-24 object-contain"
            />
          </motion.div>
        );
      } else if (type === "cloud") {
        const yPos = 20 + Math.random() * 30; // random y position (20-50%)

        items.push(
          <motion.div
            key={`cloud-${i}`}
            className="absolute z-10"
            style={{
              left: `${randomX}%`,
              top: `${yPos}%`,
              transform: `scale(${randomScale})`,
              opacity: 0.8,
            }}
            animate={{
              x: [0, 10, 0],
              y: [0, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 10 + Math.random() * 20,
              delay: randomDelay,
              ease: "easeInOut",
            }}
          >
            <img
              src="/assets/Tiny Swords (Update 010)/Effects/Fire/Fire.png"
              alt="Cloud"
              className="w-24 h-12 object-contain opacity-50"
            />
          </motion.div>
        );
      }
    }
    return items;
  };

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-blue-800 to-purple-900">
        {/* Stars effect */}
        <div className="absolute inset-0 bg-[url('/assets/Tiny Swords (Update 010)/Effects/Fire/Fire.png')] bg-repeat opacity-40 animate-twinkle"></div>
      </div>

      {/* Distant mountains */}
      <div className="absolute bottom-0 w-full h-1/3" style={{ zIndex: 1 }}>
        <div className="relative w-full h-full">
          <img
            src="/assets/Tiny Swords (Update 010)/Terrain/Ground/Shadows.png"
            alt="Mountains"
            className="absolute bottom-0 w-full object-cover opacity-40 h-64"
            style={{ filter: "brightness(0.4) contrast(0.8)" }}
          />
        </div>
      </div>

      {/* Midground terrain */}
      <div className="absolute bottom-0 w-full h-1/4" style={{ zIndex: 2 }}>
        <div className="relative w-full h-full">
          <img
            src="/assets/Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Flat.png"
            alt="Hills"
            className="absolute bottom-0 w-full object-cover opacity-70 h-48"
            style={{ filter: "brightness(0.6) contrast(0.9)" }}
          />
        </div>
      </div>

      {/* Foreground terrain */}
      <div className="absolute bottom-0 w-full h-1/5" style={{ zIndex: 3 }}>
        <div className="relative w-full h-full">
          <img
            src="/assets/Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Elevation.png"
            alt="Ground"
            className="absolute bottom-0 w-full object-cover h-32"
          />
        </div>
      </div>

      {/* Decorative elements - only rendered client-side */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {decorations}
      </div>
    </div>
  );
};

export default GameBackground;
