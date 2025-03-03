"use client";

import React from "react";
import { motion } from "framer-motion";

interface MenuButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  isActive?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  onHover,
  onHoverEnd,
  isActive = false,
}) => {
  // Sound effect for hover
  const playHoverSound = () => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/hover.mp3");
      audio.volume = 0.1;
      audio.play().catch((e) => console.log("Audio play error:", e));
    }
    if (onHover) onHover();
  };

  return (
    <motion.div
      className="relative w-full flex items-center px-2 py-2 rounded-lg cursor-pointer"
      onClick={onClick}
      onHoverStart={playHoverSound}
      onHoverEnd={onHoverEnd}
      whileHover={{ scale: 1.05, x: 5 }}
      whileTap={{ scale: 0.95 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="relative w-full h-16 flex items-center justify-start">
        {/* Button glow effect on hover */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              boxShadow: [
                "0 0 10px 0px rgba(255,180,0,0.3)",
                "0 0 20px 5px rgba(255,180,0,0.5)",
                "0 0 10px 0px rgba(255,180,0,0.3)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Button background */}
        <motion.img
          src={
            isActive
              ? "/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Red.png"
              : "/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Blue.png"
          }
          alt="Button Background"
          className="absolute w-full h-full object-contain"
          animate={
            isActive
              ? {
                  scale: [1, 1.03, 1],
                  transition: { duration: 1.5, repeat: Infinity },
                }
              : {}
          }
        />

        {/* Button content */}
        <div className="z-10 flex items-center px-5 w-full">
          {/* Icon with subtle animation */}
          <motion.div
            className="h-10 w-10 flex items-center justify-center mr-3"
            animate={
              isActive
                ? {
                    rotate: [-5, 5, -5],
                    transition: { duration: 2, repeat: Infinity },
                  }
                : {}
            }
          >
            <motion.img
              src={icon}
              alt="Icon"
              className="h-8 w-8 object-contain"
              animate={
                isActive
                  ? {
                      scale: [1, 1.2, 1],
                      filter: [
                        "brightness(1)",
                        "brightness(1.3)",
                        "brightness(1)",
                      ],
                      transition: { duration: 1.5, repeat: Infinity },
                    }
                  : {}
              }
            />
          </motion.div>

          {/* Label text with glow effect */}
          <motion.span
            className={`font-pixelated text-lg ${
              isActive ? "text-amber-100" : "text-white"
            }`}
            animate={
              isActive
                ? {
                    textShadow: [
                      "0 0 5px rgba(255,255,255,0.3)",
                      "0 0 10px rgba(255,255,255,0.5)",
                      "0 0 5px rgba(255,255,255,0.3)",
                    ],
                    transition: { duration: 1.5, repeat: Infinity },
                  }
                : {}
            }
          >
            {label}
          </motion.span>
        </div>

        {/* Pointer indicator */}
        {isActive && (
          <motion.div
            className="absolute -right-3 w-6 h-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, 3, 0, -3, 0],
            }}
            transition={{
              x: { duration: 0.2 },
              y: { duration: 2, repeat: Infinity },
            }}
            exit={{ opacity: 0, x: -10 }}
          >
            <img
              src="/assets/Tiny Swords (Update 010)/UI/Pointers/02.png"
              alt="pointer"
              className="w-full h-full object-contain"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuButton;
