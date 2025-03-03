"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterInfo } from "../ProphecyEngine";
import { GameMode } from "../GameContainer";
import { GameState } from "./GameEngine";
import dynamic from "next/dynamic";
import "./ui/PaperUI.css";

// Dynamic imports for components
const SoundControls = dynamic(() => import("./ui/SoundControls"), {
  ssr: false,
});
const PaperUIHUD = dynamic(() => import("./ui/PaperUIHUD"), {
  ssr: false,
});

type GameUIProps = {
  gameMode: GameMode;
  gameState: GameState;
  character: CharacterInfo;
  onAction: (action: string, data?: any) => void;
  isFullscreen: boolean;
  isMobile: boolean;
  gameEngine?: any;
};

export default function GameUI({
  gameMode,
  gameState,
  character,
  onAction,
  isFullscreen,
  isMobile,
  gameEngine,
}: GameUIProps) {
  // Add state for sound controls visibility
  const [showSoundControls, setShowSoundControls] = useState(false);

  // Add a function to toggle sound controls
  const toggleSoundControls = () => {
    setShowSoundControls(!showSoundControls);
  };

  return (
    <div className="relative w-full h-full">
      {/* UI overlay sits on top of the game canvas but is pointer-events-none except for specific interactive elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Paper UI HUD with FPS counter, time display, and other UI elements */}
        {gameEngine && <PaperUIHUD gameEngine={gameEngine} />}

        {/* Game settings buttons - add sound button with paper UI style */}
        <div className="absolute top-4 right-20 flex space-x-2 z-30 pointer-events-auto">
          {/* Sound settings button */}
          <button
            className="w-10 h-10 flex items-center justify-center cursor-pointer pixelated paper-hover paper-shadow paper-tooltip"
            onClick={toggleSoundControls}
            aria-label="Sound Settings"
            data-tooltip="Sound Settings"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/2 Icons Rounded/12.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div
              className="w-6 h-6 pixelated"
              style={{
                backgroundImage:
                  "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/27.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </button>
        </div>

        {/* Mode-specific UI */}
        <AnimatePresence mode="wait">
          {gameMode === "dialog" && (
            <div className="pointer-events-auto">
              <DialogUI onAction={onAction} />
            </div>
          )}

          {gameMode === "combat" && (
            <div className="pointer-events-auto">
              <CombatUI
                gameState={gameState}
                character={character}
                onAction={onAction}
                isMobile={isMobile}
              />
            </div>
          )}

          {gameMode === "shop" && (
            <div className="pointer-events-auto">
              <ShopUI
                gameState={gameState}
                onAction={onAction}
                isMobile={isMobile}
              />
            </div>
          )}

          {gameMode === "inventory" && (
            <div className="pointer-events-auto">
              <InventoryUI
                gameState={gameState}
                onAction={onAction}
                isMobile={isMobile}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Sound controls modal */}
      {showSoundControls && (
        <div className="absolute inset-0 z-50">
          <SoundControls
            gameEngine={gameEngine}
            isOpen={showSoundControls}
            onClose={() => setShowSoundControls(false)}
          />
        </div>
      )}
    </div>
  );
}

function DialogUI({
  onAction,
}: {
  onAction: (action: string, data?: any) => void;
}) {
  // Example dialog state - in a real app, this would be managed by the dialog manager
  const [dialogState] = useState({
    npcName: "Mysterious Sage",
    text: "Greetings, traveler. The path ahead is fraught with danger, but great rewards await those with courage.",
    options: [
      { id: "ask_more", text: "Tell me more about these dangers" },
      { id: "ask_rewards", text: "What kind of rewards?" },
      { id: "decline", text: "I must be on my way" },
    ],
  });

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto"
    >
      <div className="bg-slate-900/90 backdrop-blur-sm border-t-2 border-amber-500/50 border-l border-r border-b rounded-t-xl rounded-b-lg p-4 max-w-4xl mx-auto shadow-2xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mr-3 border border-amber-500/50">
            <span className="text-amber-400 text-xl font-bold">?</span>
          </div>
          <h3 className="text-amber-400 font-bold text-xl">
            {dialogState.npcName}
          </h3>
        </div>

        <p className="text-gray-200 mb-5 font-medium leading-relaxed">
          {dialogState.text}
        </p>

        <div className="space-y-2">
          {dialogState.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ x: 5 }}
              className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-md border border-amber-500/20 text-gray-200 transition-colors flex items-center"
              onClick={() => onAction("dialog.choose", option.id)}
            >
              <svg
                className="w-4 h-4 mr-2 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {option.text}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CombatUI({
  gameState,
  character,
  onAction,
  isMobile,
}: {
  gameState: GameState;
  character: CharacterInfo;
  onAction: (action: string, data?: any) => void;
  isMobile: boolean;
}) {
  // Get the current enemy from combat state
  const currentEnemy = gameState.currentEnemy || {
    name: "Forest Troll",
    health: 80,
    maxHealth: 100,
    type: "troll",
    level: 5,
    attack: 8,
    defense: 5,
    experience: 50,
    gold: 25,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Enemy */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-5 mb-6 border border-amber-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center border border-red-500/50">
                <span className="text-red-400 text-sm font-bold">
                  {currentEnemy.level}
                </span>
              </div>
              <div>
                <h3 className="text-xl text-red-400 font-bold">
                  {currentEnemy.name}
                </h3>
                <div className="text-xs text-gray-400">
                  {getEnemyTypeDescription(currentEnemy.type)}
                </div>
              </div>
            </div>
            <div className="text-gray-300 text-sm">
              HP: {currentEnemy.health}/{currentEnemy.maxHealth}
            </div>
          </div>

          <div className="h-3 bg-gray-900 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (currentEnemy.health / currentEnemy.maxHealth) * 100
                }%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm text-gray-300">
              <span className="text-red-400 font-medium">ATK:</span>{" "}
              {currentEnemy.attack}
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-cyan-400 font-medium">DEF:</span>{" "}
              {currentEnemy.defense}
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-emerald-400 font-medium">XP:</span>{" "}
              {currentEnemy.experience}
            </div>
            <div className="text-sm text-amber-300">
              <span className="text-amber-400 font-medium">Gold:</span>{" "}
              {currentEnemy.gold}
            </div>
          </div>

          <div className="flex justify-center py-4">
            <div className="relative">
              <div
                className={`w-40 h-40 rounded-lg flex items-center justify-center overflow-hidden ${getEnemyBackgroundClass(
                  currentEnemy.type
                )}`}
              >
                <EnemyIcon type={currentEnemy.type} size="large" />
              </div>

              {/* Combat effects */}
              <CombatEffects type={currentEnemy.type} />
            </div>
          </div>
        </motion.div>

        {/* Combat actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-4"
        >
          <h4 className="text-amber-400 font-bold mb-3">Combat Actions</h4>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 bg-gradient-to-br from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-md text-white font-medium shadow-md flex items-center justify-center gap-2"
              onClick={() => onAction("combat.attack")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Attack
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 bg-gradient-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 rounded-md text-white font-medium shadow-md flex items-center justify-center gap-2"
              onClick={() => onAction("combat.skill", "fireball")}
              disabled={gameState.mana < 5}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
              Fireball (5 MP)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 bg-gradient-to-br from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 rounded-md text-white font-medium shadow-md flex items-center justify-center gap-2"
              onClick={() => onAction("combat.item", "health_potion")}
              disabled={!gameState.inventory.includes("health_potion")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Use Health Potion
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 bg-gradient-to-br from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-md text-white font-medium shadow-md flex items-center justify-center gap-2"
              onClick={() => onAction("combat.flee")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              Flee
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Helper function to get enemy type description
function getEnemyTypeDescription(type: string): string {
  switch (type) {
    case "skeleton":
      return "Undead • Immune to poison";
    case "goblin":
      return "Humanoid • Weak to fire";
    case "troll":
      return "Giant • Regenerates health";
    case "drake":
      return "Dragon • Resistant to magic";
    case "slime":
      return "Ooze • Resistant to physical";
    case "bandit":
      return "Humanoid • Steals gold";
    case "ghost":
      return "Undead • Can phase through armor";
    case "spider":
      return "Beast • Poisons attacks";
    case "witch":
      return "Humanoid • Strong magic attacks";
    default:
      return "Unknown creature";
  }
}

// Helper function to get background styling based on enemy type
function getEnemyBackgroundClass(type: string): string {
  switch (type) {
    case "skeleton":
      return "bg-gradient-to-br from-gray-700 to-gray-900";
    case "goblin":
      return "bg-gradient-to-br from-green-900 to-green-950";
    case "troll":
      return "bg-gradient-to-br from-stone-700 to-stone-900";
    case "drake":
      return "bg-gradient-to-br from-red-800 to-red-950";
    case "slime":
      return "bg-gradient-to-br from-emerald-700 to-emerald-900";
    case "bandit":
      return "bg-gradient-to-br from-slate-700 to-slate-900";
    case "ghost":
      return "bg-gradient-to-br from-blue-700 to-blue-900";
    case "spider":
      return "bg-gradient-to-br from-purple-900 to-black";
    case "witch":
      return "bg-gradient-to-br from-violet-700 to-violet-950";
    default:
      return "bg-gradient-to-br from-gray-700 to-gray-900";
  }
}

// Visual placeholder for the enemy icon
function EnemyIcon({
  type,
  size = "medium",
}: {
  type: string;
  size?: "small" | "medium" | "large";
}) {
  // Size classes
  const sizeClass =
    size === "large" ? "text-7xl" : size === "medium" ? "text-5xl" : "text-3xl";

  // Get appropriate emoji based on enemy type
  const getEnemyEmoji = () => {
    switch (type) {
      case "skeleton":
        return "💀";
      case "goblin":
        return "👺";
      case "troll":
        return "👹";
      case "drake":
        return "🐉";
      case "slime":
        return "🟢";
      case "bandit":
        return "🗡️";
      case "ghost":
        return "👻";
      case "spider":
        return "🕷️";
      case "witch":
        return "🧙";
      default:
        return "👾";
    }
  };

  return <div className={`${sizeClass} animate-pulse`}>{getEnemyEmoji()}</div>;
}

// Add visual effects based on enemy type
function CombatEffects({ type }: { type: string }) {
  return (
    <>
      {type === "ghost" && (
        <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-lg"></div>
      )}

      {type === "drake" && (
        <div className="absolute -right-4 top-0 w-8 h-8">
          <div className="absolute w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
          <div
            className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
            style={{ animationDelay: "300ms" }}
          ></div>
          <div
            className="absolute w-1 h-1 bg-yellow-500 rounded-full animate-ping"
            style={{ animationDelay: "600ms" }}
          ></div>
        </div>
      )}

      {type === "slime" && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div
            className="w-1 h-3 bg-green-400 rounded-full animate-bounce mx-1"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-1 h-5 bg-green-400 rounded-full animate-bounce mx-1"
            style={{ animationDelay: "300ms" }}
          ></div>
          <div
            className="w-1 h-4 bg-green-400 rounded-full animate-bounce mx-1"
            style={{ animationDelay: "600ms" }}
          ></div>
        </div>
      )}

      {type === "witch" && (
        <div className="absolute -top-2 -right-2 w-6 h-6">
          <div className="w-full h-full rounded-full bg-purple-500/50 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs">
            ✨
          </div>
        </div>
      )}
    </>
  );
}

function ShopUI({
  gameState,
  onAction,
  isMobile,
}: {
  gameState: GameState;
  onAction: (action: string, data?: any) => void;
  isMobile: boolean;
}) {
  // Example shop inventory - in a real app, this would be managed by the shop manager
  const [shopItems] = useState([
    {
      id: "health_potion",
      name: "Health Potion",
      price: 10,
      description: "Restores 30 HP",
    },
    {
      id: "mana_potion",
      name: "Mana Potion",
      price: 15,
      description: "Restores 20 MP",
    },
    {
      id: "iron_sword",
      name: "Iron Sword",
      price: 50,
      description: "+5 Attack",
    },
    {
      id: "leather_armor",
      name: "Leather Armor",
      price: 45,
      description: "+3 Defense",
    },
  ]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onAction("shop.exit")}
      />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-amber-500/30 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl text-amber-400 font-bold">
            Merchant's Wares
          </h3>
          <div className="text-amber-300">
            <span className="text-amber-500 mr-1">⦿</span> {gameState.gold} gold
          </div>
        </div>

        <div className="grid gap-3 mb-4">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-slate-800 p-3 rounded-lg"
            >
              <div>
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-gray-400 text-sm">{item.description}</div>
              </div>

              <div className="flex items-center">
                <div className="text-amber-300 mr-4">
                  <span className="text-amber-500 mr-1">⦿</span> {item.price}
                </div>

                <button
                  className={`px-3 py-1 rounded ${
                    gameState.gold >= item.price
                      ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={gameState.gold < item.price}
                  onClick={() => onAction("shop.buy", item.id)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-amber-500/20 pt-4">
          <h4 className="text-amber-400 font-bold mb-3">Your Items for Sale</h4>

          {gameState.inventory.length > 0 ? (
            <div className="grid gap-2">
              {gameState.inventory.map((itemId, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-800 p-2 rounded"
                >
                  <div className="text-white">{itemId.replace("_", " ")}</div>

                  <button
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-600 rounded text-white"
                    onClick={() => onAction("shop.sell", itemId)}
                  >
                    Sell
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-3">
              No items to sell
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
            onClick={() => onAction("shop.exit")}
          >
            Leave Shop
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InventoryUI({
  gameState,
  onAction,
  isMobile,
}: {
  gameState: GameState;
  onAction: (action: string, data?: any) => void;
  isMobile: boolean;
}) {
  // Map for item icons to display in the grid
  const itemIcons: Record<string, string> = {
    health_potion: "❤️",
    mana_potion: "🔷",
    iron_sword: "🗡️",
    leather_armor: "🛡️",
    bow: "🏹",
    bomb: "💣",
    key: "🔑",
    map: "🗺️",
    compass: "🧭",
    boomerang: "🪃",
    magic_rod: "🪄",
  };

  // Group items by category for Zelda-style inventory
  const weaponItems = gameState.inventory.filter((id) =>
    ["iron_sword", "bow", "boomerang", "magic_rod"].includes(id)
  );

  const consumableItems = gameState.inventory.filter((id) =>
    ["health_potion", "mana_potion", "bomb"].includes(id)
  );

  const keyItems = gameState.inventory.filter((id) =>
    ["key", "map", "compass"].includes(id)
  );

  // Selected item controls
  const [selectedCategory, setSelectedCategory] = React.useState<
    "weapons" | "items" | "keyItems"
  >("weapons");
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") {
        setSelectedCategory((prev) =>
          prev === "weapons"
            ? "keyItems"
            : prev === "items"
            ? "weapons"
            : "items"
        );
      } else if (e.code === "ArrowDown") {
        setSelectedCategory((prev) =>
          prev === "weapons"
            ? "items"
            : prev === "items"
            ? "keyItems"
            : "weapons"
        );
      } else if (e.code === "ArrowLeft") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === "ArrowRight") {
        const maxIndex =
          selectedCategory === "weapons"
            ? weaponItems.length - 1
            : selectedCategory === "items"
            ? consumableItems.length - 1
            : keyItems.length - 1;
        setSelectedIndex((prev) => Math.min(maxIndex, prev + 1));
      } else if (e.code === "KeyA") {
        // 'A' button - use selected item
        const selectedItems =
          selectedCategory === "weapons"
            ? weaponItems
            : selectedCategory === "items"
            ? consumableItems
            : keyItems;

        if (selectedItems.length > 0 && selectedIndex < selectedItems.length) {
          onAction("useItem", selectedItems[selectedIndex]);
        }
      } else if (e.code === "KeyB" || e.code === "Escape") {
        // 'B' button - close inventory
        onAction("toggleInventory");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCategory,
    selectedIndex,
    weaponItems,
    consumableItems,
    keyItems,
    onAction,
  ]);

  // Item display name helper
  const itemDisplayName = (id: string) => {
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/70"
    >
      <div className="w-full h-full max-w-4xl max-h-[650px] bg-slate-800 border-4 border-amber-600 p-6 m-4 flex flex-col">
        {/* Zelda-style title banner */}
        <div className="bg-amber-600 text-slate-950 font-bold text-center py-2 px-4 mb-6 text-xl uppercase">
          Subscreen
        </div>

        {/* Character info */}
        <div className="flex mb-4 justify-between">
          <div className="bg-slate-900 p-4 rounded-lg">
            <h3 className="text-amber-400 mb-2">Character</h3>
            <div className="flex items-center space-x-2">
              <span className="text-white">❤️ {gameState.health}</span>
              <span className="text-white">🔷 {gameState.mana}</span>
              <span className="text-amber-400">💰 {gameState.gold}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white mb-1">LEVEL</div>
            <div className="text-amber-400 text-xl font-bold">
              {gameState.level}
            </div>
          </div>
        </div>

        {/* Inventory grid - Zelda style */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Weapons section */}
          <div
            className={`${
              selectedCategory === "weapons" ? "border-2 border-amber-400" : ""
            } bg-slate-900 p-3 rounded-lg`}
          >
            <h3 className="text-amber-400 mb-2 uppercase font-bold">Weapons</h3>
            <div className="grid grid-cols-8 gap-2">
              {weaponItems.length > 0 ? (
                weaponItems.map((itemId, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedCategory("weapons");
                      setSelectedIndex(index);
                    }}
                    className={`h-12 w-12 flex items-center justify-center 
                      ${
                        selectedCategory === "weapons" &&
                        selectedIndex === index
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      } 
                      cursor-pointer text-2xl border border-slate-600`}
                  >
                    {itemIcons[itemId] || "❓"}
                  </div>
                ))
              ) : (
                <div className="col-span-8 text-gray-400 text-sm py-2 px-3">
                  No weapons
                </div>
              )}
              {/* Fill empty slots */}
              {Array(Math.max(0, 8 - weaponItems.length))
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`empty-weapon-${i}`}
                    className="h-12 w-12 bg-slate-700/40 border border-slate-700/60"
                  ></div>
                ))}
            </div>
          </div>

          {/* Items section */}
          <div
            className={`${
              selectedCategory === "items" ? "border-2 border-amber-400" : ""
            } bg-slate-900 p-3 rounded-lg`}
          >
            <h3 className="text-amber-400 mb-2 uppercase font-bold">Items</h3>
            <div className="grid grid-cols-8 gap-2">
              {consumableItems.length > 0 ? (
                consumableItems.map((itemId, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedCategory("items");
                      setSelectedIndex(index);
                    }}
                    className={`h-12 w-12 flex items-center justify-center 
                      ${
                        selectedCategory === "items" && selectedIndex === index
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      } 
                      cursor-pointer text-2xl border border-slate-600`}
                  >
                    {itemIcons[itemId] || "❓"}
                  </div>
                ))
              ) : (
                <div className="col-span-8 text-gray-400 text-sm py-2 px-3">
                  No items
                </div>
              )}
              {/* Fill empty slots */}
              {Array(Math.max(0, 8 - consumableItems.length))
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`empty-item-${i}`}
                    className="h-12 w-12 bg-slate-700/40 border border-slate-700/60"
                  ></div>
                ))}
            </div>
          </div>

          {/* Key Items section */}
          <div
            className={`${
              selectedCategory === "keyItems" ? "border-2 border-amber-400" : ""
            } bg-slate-900 p-3 rounded-lg`}
          >
            <h3 className="text-amber-400 mb-2 uppercase font-bold">
              Key Items
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {keyItems.length > 0 ? (
                keyItems.map((itemId, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedCategory("keyItems");
                      setSelectedIndex(index);
                    }}
                    className={`h-12 w-12 flex items-center justify-center 
                      ${
                        selectedCategory === "keyItems" &&
                        selectedIndex === index
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      } 
                      cursor-pointer text-2xl border border-slate-600`}
                  >
                    {itemIcons[itemId] || "❓"}
                  </div>
                ))
              ) : (
                <div className="col-span-8 text-gray-400 text-sm py-2 px-3">
                  No key items
                </div>
              )}
              {/* Fill empty slots */}
              {Array(Math.max(0, 8 - keyItems.length))
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`empty-key-${i}`}
                    className="h-12 w-12 bg-slate-700/40 border border-slate-700/60"
                  ></div>
                ))}
            </div>
          </div>
        </div>

        {/* Item details */}
        <div className="mt-6 flex justify-between items-center">
          <div className="bg-slate-900 p-3 rounded-lg flex-1">
            {(() => {
              const selectedItems =
                selectedCategory === "weapons"
                  ? weaponItems
                  : selectedCategory === "items"
                  ? consumableItems
                  : keyItems;

              if (
                selectedItems.length > 0 &&
                selectedIndex < selectedItems.length
              ) {
                const itemId = selectedItems[selectedIndex];
                return (
                  <div>
                    <div className="text-amber-400 font-bold">
                      {itemDisplayName(itemId)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {itemId === "health_potion" && "Restores health"}
                      {itemId === "mana_potion" && "Restores mana"}
                      {itemId === "iron_sword" && "A basic sword for combat"}
                      {itemId === "bow" && "Fires arrows at enemies"}
                      {itemId === "bomb" && "Explodes walls and enemies"}
                      {itemId === "key" && "Opens locked doors"}
                      {itemId === "map" && "Shows dungeon layout"}
                      {itemId === "compass" && "Points to hidden treasures"}
                    </div>
                  </div>
                );
              } else {
                return <div className="text-gray-400">No item selected</div>;
              }
            })()}
          </div>

          {/* Button mappings - Zelda style */}
          <div className="flex ml-4 space-x-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold">
                B
              </div>
              <div className="text-white text-xs mt-1">Back</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div className="text-white text-xs mt-1">Use</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
