"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameManager } from "../../hooks/useGameManager";
import PauseMenu from "./PauseMenu";
import GameHUD from "./GameHUD";
import styles from "./GameContainer.module.css";

interface GameContainerProps {
  children: React.ReactNode;
}

const GameContainer: React.FC<GameContainerProps> = ({ children }) => {
  const { isPaused, setPaused, character } = useGameManager();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Hide navigation immediately on component mount
  useEffect(() => {
    // Immediate removal of navigation (no delay)
    const hideNavigationImmediately = () => {
      // Target the specific navigation shown in the screenshot
      document
        .querySelectorAll(
          'nav, .navigation, header, [class*="nav-"], [id*="nav-"]'
        )
        .forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
            el.style.visibility = "hidden";
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el.setAttribute("aria-hidden", "true");
          }
        });

      // Direct targeting of "Realm of Feedback" navigation by link text
      document.querySelectorAll("a").forEach((link) => {
        if (
          link.textContent?.includes("Realm of Feedback") ||
          link.textContent?.includes("Home Kingdom") ||
          link.textContent?.includes("Questionnaire Scroll") ||
          link.textContent?.includes("Council Chambers") ||
          link.textContent?.includes("Enchanted Tests")
        ) {
          const navParent = link.closest("nav") || link.closest("header");
          if (navParent && navParent instanceof HTMLElement) {
            navParent.style.display = "none";
            navParent.style.visibility = "hidden";
          }
        }
      });
    };

    // Call immediately
    hideNavigationImmediately();

    // Also call after a short delay to catch dynamically rendered navigation
    const timeoutId = setTimeout(hideNavigationImmediately, 100);

    // Create an observer to watch for navigation elements being added
    const observer = new MutationObserver((mutations) => {
      // If new nodes are added to the DOM, check if they're navigation elements
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hideNavigationImmediately();
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set up event listeners to disable browser controls and trap focus
    const trapFocus = () => {
      // Get all focusable elements in the game container
      if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElementsRef.current = Array.from(
          focusableElements
        ) as HTMLElement[];

        // If there are focusable elements, focus the first one
        if (focusableElementsRef.current.length > 0) {
          focusableElementsRef.current[0].focus();
        } else {
          // If no focusable elements, make the container itself focusable
          containerRef.current.tabIndex = 0;
          containerRef.current.focus();
        }
      }
    };

    // Call trap focus after navigation is hidden
    setTimeout(trapFocus, 200);

    // Extended keyboard event handler to prevent Tab and other keys
    const handleKeyboardControls = (e: KeyboardEvent) => {
      // Prevent default for Tab key to stop tabbing out of the game
      if (e.key === "Tab") {
        e.preventDefault();

        if (focusableElementsRef.current.length <= 1) {
          return; // Nothing to tab to
        }

        // Find the currently focused element
        const currentIndex = focusableElementsRef.current.findIndex(
          (el) => el === document.activeElement
        );

        // Calculate the next index based on Shift+Tab or Tab
        let nextIndex = 0;
        if (e.shiftKey) {
          // Go to previous element or wrap to the last
          nextIndex =
            currentIndex <= 0
              ? focusableElementsRef.current.length - 1
              : currentIndex - 1;
        } else {
          // Go to next element or wrap to the first
          nextIndex =
            currentIndex >= focusableElementsRef.current.length - 1
              ? 0
              : currentIndex + 1;
        }

        // Focus the next element
        focusableElementsRef.current[nextIndex].focus();
      }

      // Block ALL browser shortcuts
      const shortcutKeys = [
        // Navigation shortcuts
        "Tab",
        "F6",
        // Browser shortcuts
        "F5",
        "F11",
        "F12",
        // Page shortcuts
        "Home",
        "End",
        "PageUp",
        "PageDown",
        // History shortcuts
        "Backspace",
        "Alt+ArrowLeft",
        "Alt+ArrowRight",
      ];

      // Check if key is a browser shortcut or uses a modifier key (except for game controls)
      const isShortcut =
        shortcutKeys.includes(e.key) ||
        ((e.ctrlKey || e.altKey || e.metaKey) &&
          !["KeyW", "KeyA", "KeyS", "KeyD", "Space", "KeyE", "KeyQ"].includes(
            e.code
          ));

      if (isShortcut) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Toggle pause menu on Escape key
      if (e.key === "Escape") {
        setPaused(!isPaused);
        e.preventDefault();
      }
    };

    // Prevent scrolling with scrolling keys
    const preventScrollKeys = (e: KeyboardEvent) => {
      if (
        [
          " ",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
          "PageUp",
          "PageDown",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    // Prevent right click menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent mouse wheel scrolling
    const preventMouseWheel = (e: WheelEvent) => {
      if (!isPaused) {
        e.preventDefault();
      }
    };

    // Prevent browser back button
    const preventBackButton = (e: PopStateEvent) => {
      if (!isPaused) {
        history.pushState(null, "", window.location.href);
      }
    };

    // Force the window to keep focus
    const forceWindowFocus = () => {
      if (!isPaused && containerRef.current) {
        containerRef.current.focus();
      }
    };

    // Initial focus
    if (containerRef.current) {
      containerRef.current.focus();
    }

    // Handle if something tries to steal focus
    document.addEventListener("focusin", forceWindowFocus);

    // Add listeners
    document.addEventListener("keydown", handleKeyboardControls, {
      capture: true,
    });
    document.addEventListener("keydown", preventScrollKeys);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("wheel", preventMouseWheel, { passive: false });

    // Push a history state so we can intercept the back button
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBackButton);

    // Focus on the container every second to ensure focus is trapped
    const focusInterval = setInterval(forceWindowFocus, 1000);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      // Show navigation elements again when component unmounts
      const navElements = document.querySelectorAll("nav, header");
      navElements.forEach((nav) => {
        if (nav instanceof HTMLElement) {
          nav.style.display = "";
        }
      });

      // Reset body styles
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";

      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", handleKeyboardControls, {
        capture: true,
      });
      document.removeEventListener("keydown", preventScrollKeys);
      document.removeEventListener("wheel", preventMouseWheel);
      document.removeEventListener("focusin", forceWindowFocus);
      window.removeEventListener("popstate", preventBackButton);
      clearInterval(focusInterval);
    };
  }, [isPaused, setPaused]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            // Re-focus on container when entering fullscreen
            containerRef.current?.focus();
          })
          .catch((err) =>
            console.error(
              `Error attempting to enable fullscreen: ${err.message}`
            )
          );
      }
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
            // Re-focus on container when exiting fullscreen
            containerRef.current?.focus();
          })
          .catch((err) =>
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          );
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.gameContainer} ${
        isFullscreen ? styles.fullscreen : ""
      } ${!isPaused ? styles.gameplay : ""}`}
      tabIndex={0}
      onBlur={(e) => {
        // If focus is leaving the container and not going to a child, force focus back
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          e.currentTarget.focus();
        }
      }}
    >
      {/* Game Content */}
      <div className={styles.gameContent}>{children}</div>

      {/* HUD */}
      <GameHUD showHUD={!isPaused} />

      {/* Pause Menu */}
      <PauseMenu
        isOpen={isPaused}
        onClose={() => setPaused(false)}
        character={character}
      />

      {/* Fullscreen Button */}
      <button
        className={styles.fullscreenButton}
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
};

export default GameContainer;
