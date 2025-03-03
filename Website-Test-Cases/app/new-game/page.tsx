"use client";

import { useEffect } from "react";
import SimpleCharacterCreation from "./simple-page";
import { resetCharacterCreation } from "../utils/game-utils";

// Force the client component rendering to prevent hydration issues
export const dynamic = "force-dynamic";

export default function NewGamePage() {
  // Log for debugging
  useEffect(() => {
    console.log(
      "NewGamePage component rendered - forcing character creation flow"
    );

    // Explicitly preventing game engine initialization
    if (typeof window !== "undefined") {
      console.log(
        "Character creation page - game engine initialization should NOT happen here"
      );

      // Add a class to the body to help identify this page
      document.body.classList.add("character-creation-page");

      // Set page title
      document.title = "Character Creation";

      // Reset any existing character creation completion state
      // We'll set this to true when the character creation form is submitted
      resetCharacterCreation();
    }

    return () => {
      // Clean up
      if (typeof window !== "undefined") {
        document.body.classList.remove("character-creation-page");
      }
    };
  }, []);

  // Use the simplified version
  return <SimpleCharacterCreation />;
}
