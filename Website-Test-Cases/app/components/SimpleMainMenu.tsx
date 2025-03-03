"use client";

import React, { useState, useEffect } from "react";
import { resetCharacterCreation } from "../utils/game-utils";

// A simplified version of the main menu to replace the complex one
export default function SimpleMainMenu() {
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  // Show a brief loading animation
  useEffect(() => {
    // Reset any previous character creation state
    resetCharacterCreation();

    // Simply a brief loading delay to show the title animation
    const timer = setTimeout(() => {
      setLoadingAnimation(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle navigation to the character creation screen
  const handleNewGame = () => {
    console.log("Starting new game - navigating to character creation");
    // Make sure we reset character creation since we're starting a new character
    resetCharacterCreation();
    // Navigate to the character creation page
    window.location.href = "/new-game";
  };

  if (loadingAnimation) {
    return (
      <div
        className="loading-screen"
        style={{
          backgroundColor: "#000",
          color: "#fff",
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          Fantasy RPG
        </h1>
        <div
          style={{
            width: "200px",
            height: "6px",
            backgroundColor: "#333",
            borderRadius: "3px",
            overflow: "hidden",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: "#7c3aed",
              animation: "progress 1s ease-in-out infinite alternate",
            }}
          ></div>
        </div>
        <p style={{ marginTop: "1rem", color: "#aaa" }}>Loading...</p>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes progress {
            from {
              width: 0%;
              left: 0;
            }
            to {
              width: 70%;
              left: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="main-menu"
      style={{
        backgroundColor: "#000",
        color: "#fff",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("/assets/bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          marginBottom: "2rem",
          textShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
        }}
      >
        Fantasy RPG
      </h1>

      <div
        className="menu-buttons"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
          width: "100%",
        }}
      >
        <button
          onClick={handleNewGame}
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            padding: "1rem",
            fontSize: "1.2rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#6d28d9")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#7c3aed")
          }
        >
          New Game
        </button>

        <button
          onClick={() => (window.location.href = "/game")}
          style={{
            backgroundColor: "#e11d48",
            color: "white",
            border: "none",
            padding: "1rem",
            fontSize: "1.2rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#be123c")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#e11d48")
          }
        >
          Play Game (Fullscreen)
        </button>

        <button
          onClick={() => (window.location.href = "/gamestore")}
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "1rem",
            fontSize: "1.2rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#059669")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#10b981")
          }
        >
          Game Store
        </button>

        <button
          style={{
            backgroundColor: "#4b5563",
            color: "white",
            border: "none",
            padding: "1rem",
            fontSize: "1.2rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#374151")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4b5563")
          }
        >
          Continue (Coming Soon)
        </button>

        <button
          style={{
            backgroundColor: "#1f2937",
            color: "white",
            border: "none",
            padding: "1rem",
            fontSize: "1.2rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#111827")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#1f2937")
          }
        >
          Settings
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          color: "#666",
          fontSize: "0.9rem",
        }}
      >
        v0.1.0 © 2023 Fantasy RPG Studios
      </div>
    </div>
  );
}
