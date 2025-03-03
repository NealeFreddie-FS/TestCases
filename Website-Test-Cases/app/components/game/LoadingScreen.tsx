"use client";

import React from "react";
import { motion } from "framer-motion";

export interface LoadingScreenProps {
  progress?: number;
  message?: string;
  tip?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 0,
  message = "Loading Enchanted Realms...",
  tip = "Tip: Press 'M' during gameplay to open the world map.",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
      {/* Banner background */}
      <div className="relative w-96 mb-4">
        <img
          src="/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Right.png"
          alt="Loading Banner"
          className="w-full h-auto"
        />
        <h2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-100 font-pixelated text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {message}
        </h2>
      </div>

      {/* Loading panel */}
      <div className="relative w-96 flex flex-col items-center justify-center p-6">
        <div className="bg-indigo-900/70 p-6 rounded-lg border-2 border-indigo-700 w-full">
          {/* Loading icon */}
          <motion.div
            className="mb-4 mx-auto w-16 h-16 relative"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          >
            <img
              src="/assets/Tiny Swords (Update 010)/Effects/Explosion/Explosions.png"
              alt="Loading Icon"
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Loading bar with border image */}
          <div className="relative w-full h-8 mb-4">
            <img
              src="/assets/Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_Connection_Right_Pressed.png"
              alt="Loading Bar Background"
              className="w-full h-full object-fill"
            />
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center px-2">
              <motion.div
                className="h-4 bg-amber-500 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Loading tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-amber-200 text-sm font-pixelated text-center"
          >
            {tip}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
