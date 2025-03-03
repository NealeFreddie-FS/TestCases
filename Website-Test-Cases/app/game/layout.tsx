"use client";

import React, { useEffect } from "react";
import { Inter, Cinzel } from "next/font/google";
import "../globals.css"; // Ensure we load the global CSS

// Import fonts but don't include Navigation or AdminPanel
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force hide navigation on mount with even more aggressive approach
  useEffect(() => {
    // Function to aggressively hide navigation
    function hideNavigation() {
      // Direct targeting by class and position
      const navElements = document.querySelectorAll(
        'nav, header, .navigation, [class*="nav-"]'
      );
      navElements.forEach((nav) => {
        if (nav instanceof HTMLElement) {
          nav.style.display = "none";
          nav.style.visibility = "hidden";
          nav.style.opacity = "0";
          nav.style.position = "absolute";
          nav.style.zIndex = "-9999";
        }
      });

      // Target the top-positioned elements that might be navigation
      const topElements = document.querySelectorAll(
        '[class*="top-0"], [class*="fixed"], [class*="sticky"]'
      );
      topElements.forEach((el) => {
        if (
          el instanceof HTMLElement &&
          (el.offsetTop < 50 || el.style.top === "0px" || el.style.top === "0")
        ) {
          el.style.display = "none";
          el.style.visibility = "hidden";
        }
      });

      // Find elements by text content that matches navigation items
      document.querySelectorAll("a, span, div").forEach((el) => {
        if (
          el.textContent &&
          (el.textContent.includes("Realm of Feedback") ||
            el.textContent.includes("Home Kingdom") ||
            el.textContent.includes("Questionnaire Scroll") ||
            el.textContent.includes("Council Chambers") ||
            el.textContent.includes("Enchanted Tests"))
        ) {
          // Try to find parent that could be navigation
          let parent = el.parentElement;
          while (parent && parent.tagName !== "BODY") {
            if (
              parent.tagName === "NAV" ||
              parent.className.includes("nav") ||
              parent.style.position === "fixed" ||
              parent.style.position === "sticky"
            ) {
              if (parent instanceof HTMLElement) {
                parent.style.display = "none";
                break;
              }
            }
            parent = parent.parentElement;
          }
        }
      });

      // Create an overlay to cover any navigation
      const existingOverlay = document.getElementById(
        "game-fullscreen-overlay"
      );
      if (!existingOverlay) {
        const overlay = document.createElement("div");
        overlay.id = "game-fullscreen-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "#000";
        overlay.style.zIndex = "99990";
        overlay.style.pointerEvents = "none";

        document.body.insertBefore(overlay, document.body.firstChild);

        // Now add the game content over this overlay
        const gameContent = document.querySelector(".gameWrapper");
        if (gameContent instanceof HTMLElement) {
          gameContent.style.position = "relative";
          gameContent.style.zIndex = "99999";
        }
      }
    }

    // Run the function immediately
    hideNavigation();

    // Set an interval to keep checking and hiding navigation
    const intervalId = setInterval(hideNavigation, 100);

    // Set a timeout to clear the interval after 2 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);

      const overlay = document.getElementById("game-fullscreen-overlay");
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
  }, []);

  return (
    <html lang="en" className="game-mode">
      <body
        className={`${inter.variable} ${cinzel.variable} game-mode`}
        style={{ margin: 0, padding: 0, overflow: "hidden" }}
      >
        {children}
      </body>
    </html>
  );
}
