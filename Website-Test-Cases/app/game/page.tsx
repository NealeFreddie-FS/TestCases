"use client";

import React, { useState, useEffect } from "react";
import { GameManagerProvider } from "../hooks/useGameManager";
import GameContainer from "../components/game/GameContainer";
import styles from "./page.module.css";
import { FaSkull } from "react-icons/fa";

export default function GamePage() {
  const [fadeIn, setFadeIn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Force hide navigation on component mount
  useEffect(() => {
    // Function to hide all navigation elements
    const hideAllNavigation = () => {
      // Target specific navigation elements we saw in the screenshot
      const realmOfFeedbackNav = Array.from(
        document.querySelectorAll("nav, header")
      ).find((el) => el.textContent?.includes("Realm of Feedback"));

      if (realmOfFeedbackNav) {
        (realmOfFeedbackNav as HTMLElement).style.display = "none";
      }

      // Hide all navigation elements that could be present
      const navElements = document.querySelectorAll(
        'nav, header, .navigation, [role="navigation"]'
      );
      navElements.forEach((nav) => {
        if (nav instanceof HTMLElement) {
          nav.style.display = "none";
          nav.style.visibility = "hidden";
          nav.style.opacity = "0";
        }
      });

      // Add a black overlay div that covers everything except our game
      const existingOverlay = document.getElementById("game-overlay");
      if (!existingOverlay) {
        const overlay = document.createElement("div");
        overlay.id = "game-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "#000";
        overlay.style.zIndex = "9998"; // Just below our game wrapper
        document.body.appendChild(overlay);
      }

      // Force body to be black and hide overflow
      document.body.style.backgroundColor = "#000";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };

    // Call immediately
    hideAllNavigation();

    // Call after a delay to handle any dynamic content
    const timeoutId = setTimeout(hideAllNavigation, 100);

    // Handle dynamic content changes with MutationObserver
    const observer = new MutationObserver(() => {
      hideAllNavigation();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Disable tab key and other browser controls globally
    const disableBrowserControls = (e: KeyboardEvent) => {
      // Disable tab key globally while on game page
      if (e.key === "Tab") {
        e.preventDefault();
        return false;
      }

      // Block browser keyboard shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p", "d", "u", "h", "b", "i", "j", "o"].includes(
          e.key.toLowerCase()
        )
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add global event listeners
    document.addEventListener("keydown", disableBrowserControls, {
      capture: true,
    });

    // Block right-click context menu
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Prevent default space bar behavior (scrolling)
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
      }
    });

    // Fade in the content after hiding navigation
    const fadeTimer = setTimeout(() => setFadeIn(true), 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fadeTimer);
      observer.disconnect();

      // Remove the overlay when component unmounts
      const overlay = document.getElementById("game-overlay");
      if (overlay) {
        document.body.removeChild(overlay);
      }

      // Reset body styles
      document.body.style.backgroundColor = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";

      // Remove global event listeners
      document.removeEventListener("keydown", disableBrowserControls, {
        capture: true,
      });
    };
  }, []);

  // Handle keyboard controls for the game
  useEffect(() => {
    if (!gameStarted) return;

    const handleGameControls = (e: KeyboardEvent) => {
      // Example game controls
      switch (e.code) {
        case "KeyW":
          console.log("Move forward");
          break;
        case "KeyS":
          console.log("Move backward");
          break;
        case "KeyA":
          console.log("Move left");
          break;
        case "KeyD":
          console.log("Move right");
          break;
        case "Space":
          console.log("Jump/Roll");
          break;
        case "KeyE":
          console.log("Use item/Interact");
          break;
        case "KeyQ":
          console.log("Switch weapon");
          break;
        case "ShiftLeft":
        case "ShiftRight":
          console.log("Block/Sprint");
          break;
      }
    };

    // Add game control event listener
    window.addEventListener("keydown", handleGameControls);

    return () => {
      window.removeEventListener("keydown", handleGameControls);
    };
  }, [gameStarted]);

  // Function to start the game with proper focus management
  const startGame = () => {
    setGameStarted(true);

    // After state update, focus on the game container
    setTimeout(() => {
      const gameContainer = document.querySelector('[class*="gameContainer"]');
      if (gameContainer instanceof HTMLElement) {
        gameContainer.focus();
      }
    }, 50);
  };

  return (
    <div className={styles.gameWrapper}>
      <GameManagerProvider>
        <GameContainer>
          <div
            className={`${styles.gameContent} ${fadeIn ? styles.fadeIn : ""}`}
          >
            {!gameStarted ? (
              <div className={styles.gameCenter}>
                <FaSkull className={styles.gameLogo} />
                <h1 className={styles.gameTitle}>DARK SOULS</h1>
                <h2 className={styles.gameSubtitle}>Web Edition</h2>

                <div className={styles.gameStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>DEATHS</span>
                    <span className={styles.statValue}>0</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>DIFFICULTY</span>
                    <span className={styles.statValue}>BRUTAL</span>
                  </div>
                </div>

                <button
                  className={styles.startButton}
                  onClick={startGame}
                  autoFocus // Auto-focus the start button
                >
                  START GAME
                </button>

                <div className={styles.gameControls}>
                  <div className={styles.controlItem}>
                    <kbd>W A S D</kbd>
                    <span>Movement</span>
                  </div>
                  <div className={styles.controlItem}>
                    <kbd>SPACE</kbd>
                    <span>Jump/Roll</span>
                  </div>
                  <div className={styles.controlItem}>
                    <kbd>MOUSE</kbd>
                    <span>Attack</span>
                  </div>
                  <div className={styles.controlItem}>
                    <kbd>SHIFT</kbd>
                    <span>Block</span>
                  </div>
                  <div className={styles.controlItem}>
                    <kbd>E</kbd>
                    <span>Use Item</span>
                  </div>
                  <div className={styles.controlItem}>
                    <kbd>ESC</kbd>
                    <span>Menu</span>
                  </div>
                </div>

                <p className={styles.gameInstruction}>
                  Press ESC to access the menu
                </p>
              </div>
            ) : (
              <div className={styles.gameplayScreen}>
                {/* Active gameplay screen */}
                <div className={styles.gameEnvironment}>
                  {/* This is where the actual game would render */}
                  <div className={styles.gameplayMessage}>
                    <h3>Game Active</h3>
                    <p>Use WASD to move, Mouse to look around</p>
                    <p>Press ESC to pause</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GameContainer>
      </GameManagerProvider>
    </div>
  );
}
