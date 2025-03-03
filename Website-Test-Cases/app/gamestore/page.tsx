"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  resetCharacterCreation,
  completeCharacterCreation,
} from "../utils/game-utils";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/core/Button";

export default function GameStorePage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("description");
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  // Game details - in a real app, you would fetch these from an API
  const gameDetails = {
    title: "Enchanted Realms: The Crystal Prophecy",
    creator: "Pixie Forge Studios",
    price: "Free",
    description: `
      Embark on an epic journey through the mystical world of Eldoria in this fantasy RPG adventure created with the Pixie Forge Engine. As the chosen hero, you must uncover the secrets of the ancient Crystal Prophecy and prevent the dark lord Malakar from unleashing chaos upon the realm.
      
      Enchanted Realms features a rich, story-driven gameplay experience with deep character progression, strategic turn-based combat, and a vast open world filled with magical creatures, hidden treasures, and challenging quests.
      
      Key Features:
      • Create and customize your hero with unique abilities, skills, and appearances
      • Engage in tactical turn-based combat with an innovative spell-crafting system
      • Explore a vast fantasy world with diverse environments and hidden secrets
      • Make meaningful choices that impact the storyline and world around you
      • Build relationships with companions who join your quest, each with their own stories
      • Craft powerful equipment and brew magical potions to aid your adventure
      • Face challenging boss battles that require strategy and preparation
      • Original soundtrack that adapts to your journey and actions
    `,
    releaseDate: "November 2023",
    tags: [
      "Fantasy RPG",
      "Turn-based",
      "Story-rich",
      "Open World",
      "Magic",
      "Adventure",
      "Character Customization",
    ],
    platforms: ["Windows", "macOS", "Linux", "Browser"],
    screenshots: [
      {
        src: "https://placehold.co/800x450/1a1a2e/6a5acd?text=Combat+in+the+Enchanted+Forest",
        alt: "Turn-based combat in the Enchanted Forest",
        description: "Strategic turn-based combat against forest creatures",
      },
      {
        src: "https://placehold.co/800x450/1a1a2e/6a5acd?text=The+Crystal+Caverns",
        alt: "Exploring the Crystal Caverns",
        description: "Discovering magical crystals in the ancient caverns",
      },
      {
        src: "https://placehold.co/800x450/1a1a2e/6a5acd?text=Eldoria+Village",
        alt: "Interacting with NPCs in Eldoria Village",
        description: "Gathering quests and information in Eldoria Village",
      },
      {
        src: "https://placehold.co/800x450/1a1a2e/6a5acd?text=Character+Customization",
        alt: "Character customization screen",
        description: "Detailed character customization options",
      },
    ],
    minRequirements: {
      os: "Windows 7/8/10/11, macOS 10.13+, or Linux",
      processor: "Intel i3 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "Integrated graphics",
      storage: "1 GB available space",
    },
    recommendedRequirements: {
      os: "Windows 10/11, macOS 11+, or Linux",
      processor: "Intel i5 or AMD equivalent",
      memory: "8 GB RAM",
      graphics: "Dedicated graphics card with 2GB VRAM",
      storage: "2 GB available space",
    },
  };

  // Function to handle starting a new game
  const handlePlayGame = (e: React.MouseEvent) => {
    e.preventDefault();

    console.log("Starting new adventure - preparing character creation");

    // Reset character creation to ensure proper flow
    resetCharacterCreation();

    // Redirect to character creation
    window.location.href = "/new-game";
  };

  // Add a function to handle continuing a game with an existing character
  const handleContinueGame = () => {
    console.log("Continuing adventure with existing hero");

    // Mark character creation as completed since we're bypassing that step
    completeCharacterCreation({
      name: "Veteran Hero",
      class: "mage",
      level: 5,
      attributes: {
        strength: 10,
        dexterity: 12,
        constitution: 14,
        intelligence: 18,
        wisdom: 16,
        charisma: 14,
      },
    });

    // Small delay to ensure the character creation state is set
    setTimeout(() => {
      window.location.href = "/game";
    }, 100);
  };

  // Function to handle playing the game in browser
  const handlePlayInBrowser = () => {
    console.log("Launching fantasy RPG in browser");

    // Redirect to the dedicated fantasy RPG full-screen play page
    window.location.href = "/play";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageContainer maxWidth="full" padding="none" bgColor="#0a0a1f">
      {/* Navigation bar - stylized for Pixie Forge */}
      <header className="bg-indigo-950 py-4 border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-white font-bold text-xl flex items-center"
            >
              <span className="text-2xl mr-2">✨</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Pixie Forge Engine
              </span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/gamestore"
                className="text-purple-300 hover:text-white transition-colors"
              >
                Game Store
              </Link>
              <Link
                href="/docs"
                className="text-purple-300 hover:text-white transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/community"
                className="text-purple-300 hover:text-white transition-colors"
              >
                Community
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create Game
            </Button>
            <Button
              variant="outline"
              className="text-purple-300 border-purple-500"
            >
              Log in
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        className="max-w-7xl mx-auto p-4 md:p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            {/* Game title for mobile */}
            <motion.div className="lg:hidden mb-6" variants={itemVariants}>
              <h1 className="text-2xl font-bold text-white">
                {gameDetails.title}
              </h1>
              <p className="text-purple-300">A game by {gameDetails.creator}</p>
            </motion.div>

            {/* Featured screenshot */}
            <motion.div
              className="mb-6 relative bg-indigo-950 rounded-lg overflow-hidden aspect-video border border-purple-800"
              variants={itemVariants}
            >
              <img
                src={gameDetails.screenshots[activeScreenshot]?.src}
                alt={gameDetails.screenshots[activeScreenshot]?.alt}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-indigo-950/80 backdrop-blur-sm p-3 text-sm text-purple-200">
                {gameDetails.screenshots[activeScreenshot]?.description}
              </div>
            </motion.div>

            {/* Screenshot thumbnails */}
            <motion.div
              className="grid grid-cols-4 gap-2 mb-8"
              variants={itemVariants}
            >
              {gameDetails.screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreenshot(index)}
                  className={`aspect-video rounded overflow-hidden border ${
                    activeScreenshot === index
                      ? "border-purple-500"
                      : "border-indigo-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={screenshot.src}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </motion.div>

            {/* Game info tabs */}
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="border-b border-indigo-800 flex">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "description"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-purple-300 hover:text-white"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "features"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-purple-300 hover:text-white"
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("community")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "community"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-purple-300 hover:text-white"
                  }`}
                >
                  Community
                </button>
              </div>

              <div className="py-6">
                {activeTab === "description" && (
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-xl font-bold mb-4 text-white">
                      About this game
                    </h2>
                    <div className="whitespace-pre-line text-purple-200">
                      {gameDetails.description}
                    </div>

                    <h3 className="text-lg font-bold mt-6 mb-3 text-white">
                      System Requirements
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="font-bold text-sm text-purple-300 mb-2">
                          MINIMUM:
                        </h4>
                        <ul className="text-sm space-y-1 text-purple-200">
                          <li>
                            <span className="text-purple-400">OS:</span>{" "}
                            {gameDetails.minRequirements.os}
                          </li>
                          <li>
                            <span className="text-purple-400">Processor:</span>{" "}
                            {gameDetails.minRequirements.processor}
                          </li>
                          <li>
                            <span className="text-purple-400">Memory:</span>{" "}
                            {gameDetails.minRequirements.memory}
                          </li>
                          <li>
                            <span className="text-purple-400">Graphics:</span>{" "}
                            {gameDetails.minRequirements.graphics}
                          </li>
                          <li>
                            <span className="text-purple-400">Storage:</span>{" "}
                            {gameDetails.minRequirements.storage}
                          </li>
                        </ul>
                      </div>
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="font-bold text-sm text-purple-300 mb-2">
                          RECOMMENDED:
                        </h4>
                        <ul className="text-sm space-y-1 text-purple-200">
                          <li>
                            <span className="text-purple-400">OS:</span>{" "}
                            {gameDetails.recommendedRequirements.os}
                          </li>
                          <li>
                            <span className="text-purple-400">Processor:</span>{" "}
                            {gameDetails.recommendedRequirements.processor}
                          </li>
                          <li>
                            <span className="text-purple-400">Memory:</span>{" "}
                            {gameDetails.recommendedRequirements.memory}
                          </li>
                          <li>
                            <span className="text-purple-400">Graphics:</span>{" "}
                            {gameDetails.recommendedRequirements.graphics}
                          </li>
                          <li>
                            <span className="text-purple-400">Storage:</span>{" "}
                            {gameDetails.recommendedRequirements.storage}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="text-purple-200">
                    <h3 className="text-xl font-bold mb-4 text-white">
                      Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="text-lg font-medium mb-2 text-purple-300">
                          Character Customization
                        </h4>
                        <p>
                          Create a unique hero with a vast array of
                          customization options. Choose your race, class,
                          appearance, and distribute attribute points to create
                          the perfect champion for your playstyle.
                        </p>
                      </div>
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="text-lg font-medium mb-2 text-purple-300">
                          Strategic Combat
                        </h4>
                        <p>
                          Master the art of turn-based combat with our
                          innovative spell-crafting system. Combine elemental
                          powers, position your characters strategically, and
                          outsmart your enemies.
                        </p>
                      </div>
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="text-lg font-medium mb-2 text-purple-300">
                          Vast Open World
                        </h4>
                        <p>
                          Explore the diverse lands of Eldoria, from mystical
                          forests and treacherous mountains to ancient ruins and
                          bustling cities. Each region has its own unique
                          challenges and secrets.
                        </p>
                      </div>
                      <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                        <h4 className="text-lg font-medium mb-2 text-purple-300">
                          Meaningful Choices
                        </h4>
                        <p>
                          Shape the world through your decisions. Your choices
                          impact the storyline, relationships with characters,
                          and even the fate of entire settlements. Every
                          decision has consequences.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "community" && (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-medium mb-4 text-white">
                      Community
                    </h3>
                    <p className="text-purple-300 mb-6">
                      Join our thriving community of players and creators to
                      share your adventures, get tips, and connect with fellow
                      heroes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="primary"
                        className="bg-indigo-700 hover:bg-indigo-600"
                      >
                        <span className="mr-2">💬</span> Join Discord
                      </Button>
                      <Button
                        variant="outline"
                        className="border-indigo-600 text-indigo-300"
                      >
                        <span className="mr-2">🎮</span> Player Forums
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Reviews section */}
            <motion.div
              className="mt-8 border-t border-indigo-800 pt-6"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-4 text-white">
                Player Reviews
              </h3>
              <div className="space-y-4">
                <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-purple-200 font-medium">
                      Elyndria
                    </span>
                  </div>
                  <p className="text-purple-200">
                    "Enchanted Realms is one of the most immersive fantasy RPGs
                    I've played in years. The story is captivating, the combat
                    system is satisfying, and the world is beautifully crafted.
                    Highly recommended for any fantasy fan!"
                  </p>
                </div>
                <div className="bg-indigo-950/50 p-4 rounded border border-indigo-800">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="ml-2 text-purple-200 font-medium">
                      ThornWarrior
                    </span>
                  </div>
                  <p className="text-purple-200">
                    "Great game with deep tactical combat, though some of the
                    later quests feel a bit grindy. The spell-crafting system is
                    innovative and adds a lot of depth to the gameplay. Looking
                    forward to future updates!"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            {/* Game title and creator - desktop */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold text-white">
                {gameDetails.title}
              </h1>
              <p className="text-purple-300">A game by {gameDetails.creator}</p>
            </div>

            {/* Play & Download buttons */}
            <div className="bg-indigo-950/70 rounded-lg overflow-hidden mb-6 border border-indigo-800">
              {/* Play in Browser button */}
              <button
                onClick={handlePlayInBrowser}
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-4 px-6 rounded-t font-bold text-white text-center text-lg cursor-pointer shadow-lg transition-all hover:shadow-purple-500/20"
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Play in Browser
                </span>
              </button>

              <button className="w-full bg-indigo-800/50 hover:bg-indigo-700/50 py-3 px-6 rounded-b font-bold text-white mb-3 mt-2 transition-all hover:bg-indigo-700/70 border border-indigo-700/30">
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Game
                </span>
              </button>

              <div className="text-center text-sm text-purple-300 p-2">
                Supports {gameDetails.platforms.join(", ")}
              </div>
            </div>

            {/* Game metadata */}
            <div className="bg-indigo-950/70 rounded-lg p-4 mb-6 border border-indigo-800">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-purple-300 mb-1">
                  Released
                </h3>
                <div className="text-white">{gameDetails.releaseDate}</div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-purple-300 mb-1">
                  Status
                </h3>
                <div className="text-white">
                  <span className="inline-block px-2 py-1 bg-green-800/50 text-green-400 rounded text-xs">
                    Ready to Play
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-purple-300 mb-1">
                  Platforms
                </h3>
                <div className="text-white">
                  {gameDetails.platforms.join(", ")}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-purple-300 mb-1">
                  Rating
                </h3>
                <div className="flex items-center">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-white">4.8/5</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-purple-300 mb-1">
                  Developer
                </h3>
                <a href="#" className="text-blue-400 hover:underline">
                  {gameDetails.creator}
                </a>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-indigo-950/70 rounded-lg p-4 mb-6 border border-indigo-800">
              <h3 className="text-sm font-bold text-purple-300 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {gameDetails.tags.map((tag, index) => (
                  <a
                    key={index}
                    href="#"
                    className="bg-indigo-800/50 hover:bg-indigo-700 text-sm px-3 py-1 rounded-full text-purple-200"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>

            {/* More games */}
            <div className="bg-indigo-950/70 rounded-lg p-4 border border-indigo-800">
              <h3 className="text-sm font-bold text-purple-300 mb-3">
                More Pixie Forge Games
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="#" className="group">
                  <div className="rounded-lg overflow-hidden border border-indigo-800 mb-1">
                    <img
                      src="https://placehold.co/160x120/1a1a2e/6a5acd?text=Shadowmancer"
                      alt="Shadowmancer"
                      className="w-full group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-purple-200 group-hover:text-white">
                    Shadowmancer: Dark Rituals
                  </p>
                </a>
                <a href="#" className="group">
                  <div className="rounded-lg overflow-hidden border border-indigo-800 mb-1">
                    <img
                      src="https://placehold.co/160x120/1a1a2e/6a5acd?text=Celestial+Kingdoms"
                      alt="Celestial Kingdoms"
                      className="w-full group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-purple-200 group-hover:text-white">
                    Celestial Kingdoms
                  </p>
                </a>
                <a href="#" className="group">
                  <div className="rounded-lg overflow-hidden border border-indigo-800 mb-1">
                    <img
                      src="https://placehold.co/160x120/1a1a2e/6a5acd?text=Dragon+Rider"
                      alt="Dragon Rider"
                      className="w-full group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-purple-200 group-hover:text-white">
                    Dragon Rider Chronicles
                  </p>
                </a>
                <a href="#" className="group">
                  <div className="rounded-lg overflow-hidden border border-indigo-800 mb-1">
                    <img
                      src="https://placehold.co/160x120/1a1a2e/6a5acd?text=Mystic+Tales"
                      alt="Mystic Tales"
                      className="w-full group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-purple-200 group-hover:text-white">
                    Mystic Tales: Legends
                  </p>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="mt-12 bg-indigo-950 py-12 text-sm text-purple-300 border-t border-purple-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Link
                href="/"
                className="flex items-center text-white font-bold text-lg mb-2"
              >
                <span className="text-2xl mr-2">✨</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Pixie Forge Engine
                </span>
              </Link>
              <p>Crafting magical interactive experiences since 2023</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div>
                <h4 className="font-bold text-white mb-3">Engine</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/features"
                      className="hover:text-white transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs"
                      className="hover:text-white transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/showcase"
                      className="hover:text-white transition-colors"
                    >
                      Showcase
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3">Games</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/gamestore"
                      className="hover:text-white transition-colors"
                    >
                      Browse Games
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/create"
                      className="hover:text-white transition-colors"
                    >
                      Create Game
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tutorials"
                      className="hover:text-white transition-colors"
                    >
                      Tutorials
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3">Community</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/forum"
                      className="hover:text-white transition-colors"
                    >
                      Forums
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/discord"
                      className="hover:text-white transition-colors"
                    >
                      Discord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>© 2023 Pixie Forge Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
}
