"use client";

import React, { useEffect } from "react";

// Add type declaration for the window object to include our custom property
declare global {
  interface Window {
    __characterCreationCompleted?: boolean;
  }
}

// This is a special debugging page to find syntax errors
export default function DebugSyntaxPage() {
  useEffect(() => {
    // Check for window initialization
    console.log("Debug page loaded");

    // Check for issues with the __characterCreationCompleted property
    if (typeof window !== "undefined") {
      try {
        // Test accessing the property
        console.log(
          "Window property access test:",
          window.__characterCreationCompleted
        );

        // Test setting the property
        window.__characterCreationCompleted = true;
        console.log(
          "Window property set test:",
          window.__characterCreationCompleted
        );
      } catch (err) {
        console.error("Error accessing window custom property:", err);
      }
    }
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#333",
        color: "white",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <h1>Debug Syntax Page</h1>
      <p>
        This page helps identify syntax errors in the application. Check the
        browser console for details.
      </p>

      <div style={{ marginTop: "20px" }}>
        <h2>Common Syntax Issues:</h2>
        <ul style={{ listStyle: "none", padding: "0", lineHeight: "1.8" }}>
          <li>✓ Check for mismatched quotes or brackets</li>
          <li>✓ Check for missing semicolons at statement end</li>
          <li>✓ Check for invalid property names in objects</li>
          <li>✓ Check for property access on undefined objects</li>
          <li>✓ Check for invalid TypeScript types or interfaces</li>
        </ul>
      </div>

      <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
        <a
          href="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#7c3aed",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Back to Home
        </a>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
