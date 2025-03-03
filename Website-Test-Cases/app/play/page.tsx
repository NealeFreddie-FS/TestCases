"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../components/game/LoadingScreen";
import MainMenu from "../components/game/MainMenu";
import GameBackground from "../components/game/GameBackground";
import WorldMap from "../components/game/WorldMap";

// Add global CSS for animations
import "../styles/game-animations.css";

export default function PlayPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [loadingTip, setLoadingTip] = useState(
    "Tip: Press 'M' during gameplay to open the world map."
  );
  // Sound effect state
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Reference to store the background music audio element
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Simulate loading progress
  useEffect(() => {
    // Preload important assets
    const preloadImages = [
      "/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Up.png",
      "/assets/Tiny Swords (Update 010)/UI/Banners/Banner_Connection_Down.png",
      "/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Red.png",
      "/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Blue.png",
      "/assets/Tiny Swords (Update 010)/Factions/Knights/Troops/Warrior/Red/Warrior_Red.png",
      "/assets/Tiny Swords (Update 010)/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png",
    ];

    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Loading progress simulation
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5; // More realistic random progress
      });
    }, 400);

    // Add tips rotation
    const tips = [
      "Tip: Press 'M' during gameplay to open the world map.",
      "Tip: Complete quests to earn experience and gold.",
      "Tip: Remember to save your game regularly.",
      "Tip: Explore the Whispering Woods to find rare herbs.",
      "Tip: Visit the blacksmith in Riverside Village to upgrade your weapons.",
      "Tip: Some treasures are hidden behind illusionary walls.",
      "Tip: Being well-rested before battle provides stat bonuses.",
      "Tip: Different weapons are effective against different enemy types.",
    ];

    const tipInterval = setInterval(() => {
      setLoadingTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
      // Cleanup any playing music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Effect to play main menu music when loading is complete
  useEffect(() => {
    // Only play music when loading is complete and main menu is shown
    if (!isLoading && soundEnabled) {
      // Play main menu music
      const playMainMenuMusic = () => {
        try {
          // Create new audio element for the main menu music
          const menuMusic = new Audio(
            "/assets/Pixel Music Pack/mp3/main-menu.mp3"
          );
          menuMusic.volume = 0.2;
          menuMusic.loop = true;

          // Store the audio element in the ref for later cleanup
          backgroundMusicRef.current = menuMusic;

          // Play the music
          menuMusic.play().catch((e) => console.log("Audio play error:", e));
        } catch (error) {
          console.error("Failed to play main menu music:", error);
        }
      };

      playMainMenuMusic();
    } else if (isLoading && backgroundMusicRef.current) {
      // If loading screen is showing, pause any playing music
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }

    // Cleanup function to stop music when component unmounts or dependencies change
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, [isLoading, soundEnabled]);

  // Effect to handle sound enabled/disabled toggle
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (soundEnabled) {
        backgroundMusicRef.current
          .play()
          .catch((e) => console.log("Audio play error:", e));
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [soundEnabled]);

  // Handle main menu option selection
  const handleMenuOption = (option: string) => {
    // Play sound effect
    if (soundEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.volume = 0.3;
      audio.play().catch((e) => console.log("Audio play error:", e));
    }

    // Process the selection after a short delay for animation to complete
    setTimeout(() => {
      switch (option) {
        case "newGame":
          window.location.href = "/new-game";
          break;
        case "continue":
          // Animate a notification that no saves exist
          alert("No saved games found. Please start a new game.");
          break;
        case "options":
          // Toggle sound as a simple option
          setSoundEnabled(!soundEnabled);
          alert(`Sound ${!soundEnabled ? "enabled" : "disabled"}.`);
          break;
        case "credits":
          alert("Credits would appear here.");
          break;
        case "exit":
          window.location.href = "/gamestore";
          break;
      }
    }, 300);
  };

  // Toggle world map visibility
  const handleToggleMap = () => {
    // Play map toggle sound
    if (soundEnabled) {
      const audio = new Audio("/sounds/map.mp3");
      audio.volume = 0.2;
      audio.play().catch((e) => console.log("Audio play error:", e));
    }

    setShowMap((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game background */}
      <GameBackground />

      {/* Animated corner decorations */}
      <div className="fixed top-4 left-4 z-10">
        <motion.img
          src="/assets/Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_2.png"
          alt="Corner Decoration"
          className="w-16 h-16 object-contain opacity-80"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        />
      </div>

      <div className="fixed top-4 right-4 z-10">
        <motion.img
          src="/assets/Tiny Swords (Update 010)/UI/Ribbons/Ribbon_Blue_2.png"
          alt="Corner Decoration"
          className="w-16 h-16 object-contain opacity-80 -scale-x-100"
          initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        />
      </div>

      {/* Loading screen with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen
            progress={loadingProgress}
            message={`Loading Enchanted Realms... ${loadingProgress}%`}
            tip={loadingTip}
          />
        )}
      </AnimatePresence>

      {/* Main Menu with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MainMenu
              onSelectOption={handleMenuOption}
              onToggleMap={handleToggleMap}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* World Map with improved transition */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <WorldMap isVisible={true} onClose={() => setShowMap(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button with improved animation */}
      <motion.button
        className="fixed top-4 right-4 z-50 flex items-center justify-center"
        onClick={() => {
          if (soundEnabled) {
            const audio = new Audio("/sounds/click.mp3");
            audio.volume = 0.2;
            audio.play().catch((e) => console.log("Audio play error:", e));
          }
          setTimeout(() => (window.location.href = "/gamestore"), 300);
        }}
        whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        <motion.div
          className="relative"
          animate={{
            rotate: [0, -2, 0, 2, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/assets/Tiny Swords (Update 010)/UI/Buttons/Button_Red.png"
            alt="Exit Button"
            className="w-14 h-14 object-contain"
          />
          <img
            src="/assets/Tiny Swords (Update 010)/UI/Icons/Regular_05.png"
            alt="Exit Icon"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 object-contain"
          />
        </motion.div>
      </motion.button>

      {/* Sound indicator */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 flex items-center justify-center"
        onClick={() => setSoundEnabled(!soundEnabled)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 3 }}
      >
        <img
          src={`/assets/Tiny Swords (Update 010)/UI/Icons/Regular_${
            soundEnabled ? "09" : "10"
          }.png`}
          alt={soundEnabled ? "Sound On" : "Sound Off"}
          className="w-8 h-8 object-contain"
        />
      </motion.button>
    </div>
  );
}
