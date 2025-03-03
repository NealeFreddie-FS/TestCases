"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  safeRedirect,
  getCharacterInfo,
  createCharacterUrl,
} from "../utils/game-utils";
import SanctuaryLevel from "../components/game/SanctuaryLevel";
import "../styles/sanctuary.css";
import "../styles/game-animations.css";

export default function SanctuaryPage() {
  const [characterInfo, setCharacterInfo] = useState<any>(null);
  const [showTomeContent, setShowTomeContent] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [levelLoaded, setLevelLoaded] = useState(false);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);
  const tomeSoundRef = useRef<HTMLAudioElement | null>(null);
  const [audioAvailable, setAudioAvailable] = useState({
    ambient: false,
    tome: false,
  });

  useEffect(() => {
    // Set page title and apply styling
    document.title = "The Sanctuary - Enchanted Realms";
    document.body.classList.add("sanctuary-page");

    // Retrieve character information
    if (typeof window !== "undefined") {
      const characterData = getCharacterInfo();
      if (characterData) {
        setCharacterInfo(characterData);
      } else {
        // If no character info is found, redirect to character creation
        setTimeout(() => {
          safeRedirect("/new-game");
        }, 500);
      }
    }

    // Fade in effect
    setTimeout(() => {
      setFadeIn(true);
    }, 300);

    // Initialize audio references
    if (typeof window !== "undefined") {
      // Initialize ambient audio
      ambientSoundRef.current = new Audio(
        "/assets/audio/ambient_sanctuary.mp3"
      );
      ambientSoundRef.current.loop = true;
      ambientSoundRef.current.volume = 0.4;
      setAudioAvailable((prev) => ({ ...prev, ambient: true }));

      // Initialize tome audio
      tomeSoundRef.current = new Audio("/assets/audio/page_turn.mp3");
      tomeSoundRef.current.volume = 0.6;
      setAudioAvailable((prev) => ({ ...prev, tome: true }));
    }

    // Cleanup function
    return () => {
      document.body.classList.remove("sanctuary-page");
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause();
      }
      if (tomeSoundRef.current) {
        tomeSoundRef.current.pause();
      }
    };
  }, []);

  // Handle audio toggle
  const toggleAudio = () => {
    if (!audioEnabled && audioAvailable.ambient && ambientSoundRef.current) {
      ambientSoundRef.current
        .play()
        .catch((err) => console.error("Error playing ambient sound:", err));
      setAudioEnabled(true);
    } else if (audioEnabled && ambientSoundRef.current) {
      ambientSoundRef.current.pause();
      setAudioEnabled(false);
    }
  };

  // Handle tome interaction
  const handleTomeClick = () => {
    if (audioEnabled && audioAvailable.tome && tomeSoundRef.current) {
      tomeSoundRef.current.currentTime = 0;
      tomeSoundRef.current
        .play()
        .catch((err) => console.error("Error playing tome sound:", err));
    }
    setShowTomeContent(!showTomeContent);
  };

  // Handle level loaded
  const handleLevelLoaded = () => {
    setLevelLoaded(true);
  };

  const handleStartAdventure = () => {
    if (characterInfo) {
      // Use the utility function to create the character URL and redirect
      const gameUrl = createCharacterUrl(characterInfo);
      safeRedirect(gameUrl);
    }
  };

  return (
    <div className={`sanctuary-container ${fadeIn ? "fade-in" : ""}`}>
      {/* Game Level */}
      <div
        className="sanctuary-level-wrapper"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <SanctuaryLevel onLoaded={handleLevelLoaded} />
      </div>

      {/* UI Overlay */}
      <div
        className="sanctuary-ui-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div className="sanctuary-header">
          <h1 className="sanctuary-title">The Sanctuary</h1>
          <p className="sanctuary-subtitle">
            A place of respite for weary adventurers
          </p>
        </div>
      </div>

      {/* Interactive UI Elements (keep pointer-events active) */}
      <div
        className="sanctuary-interactive-ui"
        style={{
          position: "absolute",
          bottom: "30px",
          left: 0,
          width: "100%",
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="sanctuary-actions" style={{ pointerEvents: "auto" }}>
          <motion.button
            className="action-button tome-button"
            onClick={handleTomeClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ancient Tome
          </motion.button>

          <motion.button
            className="action-button adventure-button"
            onClick={handleStartAdventure}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Begin Adventure
          </motion.button>

          <motion.button
            className="action-button sound-button"
            onClick={toggleAudio}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {audioEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </motion.button>
        </div>
      </div>

      {/* Tome Modal (keep existing code) */}
      <AnimatePresence>
        {showTomeContent && (
          <motion.div
            className="tome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tome-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="tome-header">
                <h2>The Ancient Tome</h2>
                <button
                  className="tome-close"
                  onClick={() => setShowTomeContent(false)}
                >
                  ✕
                </button>
              </div>
              <div className="tome-scroll">
                <h3>Welcome, {characterInfo?.name || "Adventurer"}</h3>
                <p>
                  You stand in The Sanctuary, a mystical haven between realms.
                  Here, you may rest, train, and prepare for the challenges that
                  lie ahead.
                </p>
                <p>
                  This sacred ground is protected by ancient magic, keeping the
                  forces of darkness at bay. Take your time to explore and
                  gather your strength.
                </p>
                <h4>Your Journey Begins</h4>
                <p>
                  As a{" "}
                  {characterInfo?.class
                    ? characterInfo.class.toLowerCase()
                    : "warrior"}
                  , you have been chosen to face the growing shadows. The path
                  ahead will test your courage, wisdom, and strength.
                </p>
                <p>
                  When you are ready, step beyond The Sanctuary and venture into
                  the world beyond. Remember, you can always return here to rest
                  and recover.
                </p>
                <h4>The Ways of Combat</h4>
                <p>
                  In this world, you will face many foes. Use WASD to move, left
                  click to attack in the direction of your mouse, and right
                  click to block incoming attacks.
                </p>
                <p>
                  Perfect your timing - a well-timed block can stagger your
                  opponent, opening them to counterattack.
                </p>
                <h4>May Fortune Favor You</h4>
                <p>
                  The threads of destiny have brought you here, brave one. What
                  becomes of this realm now rests in your hands.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
