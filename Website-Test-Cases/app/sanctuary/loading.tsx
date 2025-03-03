"use client";

import React from "react";

export default function SanctuaryLoading() {
  return (
    <div className="sanctuary-loading">
      <div className="loading-container">
        <div className="loading-circle"></div>
        <p className="loading-text">Entering The Sanctuary...</p>
      </div>
      <style jsx>{`
        .sanctuary-loading {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0a0a14 0%, #1a1a2e 100%);
          color: #e0d8c0;
        }

        .loading-container {
          text-align: center;
        }

        .loading-circle {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          border: 3px solid rgba(224, 216, 192, 0.3);
          border-top-color: #ffd700;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
        }

        .loading-text {
          font-size: 1.2rem;
          letter-spacing: 0.1em;
          animation: pulse 1.5s infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
