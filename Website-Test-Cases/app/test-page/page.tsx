"use client";

import React from "react";
import Link from "next/link";

export default function TestPage() {
  console.log("Test page loaded and rendered");

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Test Page</h1>
      <p>This is a simple test page to verify routing is working correctly.</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Navigation Links</h2>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/new-game">Character Creation</Link>
          </li>
          <li>
            <Link href="/game">Game</Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Direct Navigation Buttons</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => (window.location.href = "/")}
            style={{ padding: "0.5rem 1rem" }}
          >
            Home (Direct)
          </button>
          <button
            onClick={() => (window.location.href = "/new-game")}
            style={{ padding: "0.5rem 1rem" }}
          >
            Character Creation (Direct)
          </button>
          <button
            onClick={() => (window.location.href = "/game")}
            style={{ padding: "0.5rem 1rem" }}
          >
            Game (Direct)
          </button>
        </div>
      </div>
    </div>
  );
}
