"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuButton from "./MenuButton";

export interface MainMenuProps {
  onSelectOption: (option: string) => void;
  onToggleMap: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectOption, onToggleMap }) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showDecoration, setShowDecoration] = useState(false);

  useEffect(() => {
    // Staggered animation sequence
    const titleTimer = setTimeout(() => setShowTitle(true), 400);
    const charTimer = setTimeout(() => setShowCharacters(true), 800);
    const decoTimer = setTimeout(() => setShowDecoration(true), 1200);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(charTimer);
      clearTimeout(decoTimer);
    };
  }, []);

  // Menu options with icons that actually exist in the assets
  const menuOptions = [
    {
      id: "newGame",
      label: "New Adventure",
      icon: "/assets/Tiny Swords (Update 010)/UI/Icons/Regular_01.png",
    },
    {
      id: "continue",
      label: "Continue Journey",
      icon: "/assets/Tiny Swords (Update 010)/UI/Icons/Regular_02.png",
    },
    {
      id: "options",
      label: "Options",
      icon: "/assets/Tiny Swords (Update 010)/UI/Icons/Regular_03.png",
    },
    {
      id: "credits",
      label: "Credits",
      icon: "/assets/Tiny Swords (Update 010)/UI/Icons/Regular_04.png",
    },
    {
      id: "exit",
      label: "Return to Store",
      icon: "/assets/Tiny Swords (Update 010)/UI/Icons/Regular_05.png",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="relative w-full max-w-4xl h-full max-h-screen flex flex-col items-center justify-center">
        {/* Decorative elements - animated torches */}
        <AnimatePresence>
          {showDecoration && (
            <>
              <motion.div
                className="absolute left-24 top-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src="/assets/Tiny Swords (Update 010)/Effects/Fire/Fire.png"
                  alt="Torch"
                  className="w-16 h-16 object-contain"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
              <motion.div
                className="absolute right-24 top-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src="/assets/Tiny Swords (Update 010)/Effects/Fire/Fire.png"
                  alt="Torch"
                  className="w-16 h-16 object-contain"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Title area with frame */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={showTitle ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.7 }}
        >
          <motion.img
            src="/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Up.png"
            alt="Title Frame"
            className="w-96 h-32 object-contain"
            animate={pulseAnimation}
          />
          <motion.h1
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-pixelated text-5xl text-center text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            animate={floatingAnimation}
          >
            Enchanted Realms
          </motion.h1>
        </motion.div>

        {/* Menu container */}
        <div className="relative">
          <motion.img
            src="/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Down.png"
            alt="Menu Background"
            className="w-[500px] h-[450px] object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Scroll decoration */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <img
              src="/assets/Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_3.png"
              alt="Scroll decoration"
              className="w-32 h-16 object-contain"
            />
          </motion.div>

          {/* Menu buttons */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 space-y-5 mt-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {menuOptions.map((option, index) => (
              <MenuButton
                key={option.id}
                icon={option.icon}
                label={option.label}
                onClick={() => onSelectOption(option.id)}
                onHover={() => setHoveredOption(option.id)}
                onHoverEnd={() => setHoveredOption(null)}
                isActive={hoveredOption === option.id}
              />
            ))}
          </motion.div>
        </div>

        {/* World map button with hovering effect */}
        <motion.button
          className="absolute bottom-8 right-8 flex items-center justify-center"
          onClick={onToggleMap}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.img
            src="/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Blue.png"
            alt="Map Button"
            className="w-16 h-16 object-contain"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
          <img
            src="/assets/Tiny Swords (Update 010)/UI/Icons/Regular_06.png"
            alt="Map Icon"
            className="absolute w-8 h-8 object-contain"
          />
        </motion.button>

        {/* Decorative characters with improved animations */}
        <AnimatePresence>
          {showCharacters && (
            <>
              {/* Knight character */}
              <motion.div
                className="absolute bottom-20 left-24"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src="/assets/Tiny Swords (Update 010)/Factions/Knights/Troops/Warrior/Red/Warrior_Red.png"
                    alt="Warrior"
                    className="w-24 h-32 object-contain"
                  />
                  {/* Weapon effect */}
                  <motion.img
                    src="/assets/Tiny Swords (Update 010)/Effects/Explosion/Explosions.png"
                    alt="Weapon Effect"
                    className="absolute -top-6 -right-6 w-12 h-12 object-contain"
                    animate={{
                      opacity: [0, 0.7, 0],
                      scale: [0.7, 1.2, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Archer character */}
              <motion.div
                className="absolute bottom-20 right-24"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, -2, 0, 2, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <img
                    src="/assets/Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png"
                    alt="Archer"
                    className="w-24 h-32 object-contain"
                  />
                  {/* Arrow effect */}
                  <motion.img
                    src="/assets/Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Arrow/Arrow.png"
                    alt="Arrow"
                    className="absolute top-8 -left-12 w-12 h-6 object-contain"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: [-20, -60, -100],
                      y: [0, -10, -5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 4,
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Add a small decorative element */}
              <motion.div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <motion.img
                  src="/assets/Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Yellow_1.png"
                  alt="Decoration"
                  className="w-32 h-8 object-contain opacity-70"
                  animate={pulseAnimation}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainMenu;
