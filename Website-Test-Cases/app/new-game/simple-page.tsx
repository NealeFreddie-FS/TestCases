"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../styles/character-creation.css";
import { useRoutingDebug } from "../hooks/use-routing-debug";
import { completeCharacterCreation } from "../utils/game-utils";

export default function SimpleCharacterCreation() {
  const [characterName, setCharacterName] = useState("");
  const [selectedClass, setSelectedClass] = useState("warrior");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the routing debug hook
  useRoutingDebug("CharacterCreation");

  useEffect(() => {
    console.log("Simple character creation page loaded");
    document.title = "Character Creation";

    // Add body class for global styling
    document.body.classList.add("character-creation-page");

    // Clean up on unmount
    return () => {
      document.body.classList.remove("character-creation-page");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't allow multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newCharacter = {
      name: characterName,
      class: selectedClass,
      level: 1,
      alignment: "neutral",
      realm: "coastal-kingdoms",
    };

    console.log("Creating character:", newCharacter);

    // Mark character creation as complete in the global state and save character info
    completeCharacterCreation(newCharacter);

    // Add a small delay to ensure the completion state is set
    setTimeout(() => {
      // Redirect to the Sanctuary instead of directly to the game
      window.location.href = "/sanctuary";
    }, 100);
  };

  return (
    <div className="creation-container">
      <h1 className="creation-title">Create Your Character</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Choose your character's name and class to begin your adventure
      </p>

      <form className="creation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="characterName" className="form-label">
            Character Name
          </label>
          <input
            type="text"
            id="characterName"
            className="form-input"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter your hero's name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Character Class</label>
          <div className="class-options">
            <div
              className={`class-option ${
                selectedClass === "warrior" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("warrior")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>⚔️</span>
              </div>
              <h3 className="class-name">Warrior</h3>
            </div>

            <div
              className={`class-option ${
                selectedClass === "mage" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("mage")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>🧙</span>
              </div>
              <h3 className="class-name">Mage</h3>
            </div>

            <div
              className={`class-option ${
                selectedClass === "ranger" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("ranger")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>🏹</span>
              </div>
              <h3 className="class-name">Ranger</h3>
            </div>

            <div
              className={`class-option ${
                selectedClass === "rogue" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("rogue")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>🗡️</span>
              </div>
              <h3 className="class-name">Rogue</h3>
            </div>

            <div
              className={`class-option ${
                selectedClass === "cleric" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("cleric")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>✨</span>
              </div>
              <h3 className="class-name">Cleric</h3>
            </div>

            <div
              className={`class-option ${
                selectedClass === "bard" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("bard")}
            >
              <div className="class-icon">
                <span style={{ fontSize: "48px" }}>🎵</span>
              </div>
              <h3 className="class-name">Bard</h3>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/" className="btn btn-secondary">
            Back to Menu
          </Link>
          <button type="submit" className="btn btn-primary">
            Start Adventure
          </button>
        </div>
      </form>
    </div>
  );
}
