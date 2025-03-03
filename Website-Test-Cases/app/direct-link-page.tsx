"use client";

import React from "react";
import Link from "next/link";

export default function DirectLinkPage() {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        color: "white",
        backgroundColor: "#333",
        minHeight: "100vh",
      }}
    >
      <h1>Direct Navigation Test</h1>
      <p>Click the links below to test routing:</p>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "1rem",
            backgroundColor: "#444",
            borderRadius: "4px",
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            display: "block",
          }}
        >
          Main Menu
        </Link>

        <Link
          href="/new-game"
          style={{
            padding: "1rem",
            backgroundColor: "#7c3aed",
            borderRadius: "4px",
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            display: "block",
          }}
        >
          Character Creation Page
        </Link>

        <div style={{ marginTop: "2rem" }}>
          <p>
            <strong>Manual URL:</strong> If the links above don't work, try
            typing these URLs directly in your browser:
          </p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li style={{ padding: "0.5rem 0", borderBottom: "1px solid #444" }}>
              <code
                style={{
                  backgroundColor: "#222",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "2px",
                }}
              >
                http://localhost:3000/
              </code>{" "}
              - Main Menu
            </li>
            <li style={{ padding: "0.5rem 0", borderBottom: "1px solid #444" }}>
              <code
                style={{
                  backgroundColor: "#222",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "2px",
                }}
              >
                http://localhost:3000/new-game
              </code>{" "}
              - Character Creation
            </li>
            <li style={{ padding: "0.5rem 0", borderBottom: "1px solid #444" }}>
              <code
                style={{
                  backgroundColor: "#222",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "2px",
                }}
              >
                http://localhost:3000/direct-link-page
              </code>{" "}
              - This Test Page
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
