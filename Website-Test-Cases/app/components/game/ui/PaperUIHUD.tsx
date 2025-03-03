import React from "react";
import { GameEngine } from "../GameEngine";
import FPSCounter from "./FPSCounter";
import StardewTimeDisplay from "./StardewTimeDisplay";
import PaperUIFrame from "./PaperUIFrame";
import PaperUIButton from "./PaperUIButton";
import PaperUILayout from "./PaperUILayout";

interface PaperUIHUDProps {
  gameEngine: GameEngine;
}

/**
 * Paper UI styled HUD component that displays game information
 */
export default function PaperUIHUD({ gameEngine }: PaperUIHUDProps) {
  const { gameState } = gameEngine;

  return (
    <PaperUILayout>
      <div className="w-full h-full pointer-events-none">
        {/* Top left - FPS Counter */}
        <div className="absolute top-2 left-2 pointer-events-auto paper-shadow">
          <FPSCounter gameEngine={gameEngine} />
        </div>

        {/* Top right - Time Display */}
        <div className="absolute top-2 right-2 pointer-events-auto paper-shadow">
          <StardewTimeDisplay timeManager={gameEngine.timeManager} />
        </div>

        {/* Bottom left - Character Stats */}
        <div className="absolute bottom-2 left-2 pointer-events-auto paper-shadow">
          <PaperUIFrame title="Character" size="medium">
            <div className="flex items-center">
              <div
                className="w-12 h-12 mr-2 pixelated"
                style={{
                  backgroundImage:
                    "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/12.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="text-lg font-semibold text-paper-brown">
                  {gameState.level}
                </div>
              </div>

              <div className="flex flex-col">
                {/* Health Bar */}
                <div className="flex items-center mb-1">
                  <div
                    className="w-4 h-4 mr-1 pixelated"
                    style={{
                      backgroundImage:
                        "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/1.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                    }}
                  ></div>
                  <div
                    className="h-3 w-32 relative pixelated"
                    style={{
                      backgroundImage:
                        "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/9.png')",
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full progress-animate pixelated"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/6.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        width: `${gameState.health}%`,
                      }}
                    ></div>
                    <div className="absolute top-0 w-full text-center">
                      <span className="text-[8px] font-semibold text-paper-brown">
                        {gameState.health}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mana Bar */}
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 mr-1 pixelated"
                    style={{
                      backgroundImage:
                        "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/22.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                    }}
                  ></div>
                  <div
                    className="h-3 w-32 relative pixelated"
                    style={{
                      backgroundImage:
                        "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/9.png')",
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full progress-animate pixelated"
                      style={{
                        backgroundImage:
                          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/7 Sliders/8.png')",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        width: `${(gameState.mana / 50) * 100}%`,
                      }}
                    ></div>
                    <div className="absolute top-0 w-full text-center">
                      <span className="text-[8px] font-semibold text-paper-brown">
                        {gameState.mana}/50
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PaperUIFrame>
        </div>

        {/* Bottom right - Action Buttons */}
        <div className="absolute bottom-2 right-2 pointer-events-auto paper-shadow">
          <PaperUIFrame title="Actions" size="medium">
            <div className="flex gap-2">
              <PaperUIButton
                type="default"
                size="small"
                className="paper-hover"
                onClick={() => gameEngine.handleAction("toggleInventory")}
              >
                Inventory
              </PaperUIButton>
              <PaperUIButton
                type="green"
                size="small"
                className="paper-hover"
                onClick={() => gameEngine.handleAction("attack")}
              >
                Attack
              </PaperUIButton>
              <PaperUIButton
                type="blue"
                size="small"
                className="paper-hover"
                onClick={() => gameEngine.handleAction("interact")}
              >
                Interact
              </PaperUIButton>
            </div>
          </PaperUIFrame>
        </div>

        {/* Center Top - Location */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-auto paper-shadow">
          <div
            className="pixelated float"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Separators/1.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              padding: "8px 16px",
            }}
          >
            <div className="text-paper-brown font-semibold text-lg">
              {gameState.currentLocation}
            </div>
          </div>
        </div>
      </div>
    </PaperUILayout>
  );
}
