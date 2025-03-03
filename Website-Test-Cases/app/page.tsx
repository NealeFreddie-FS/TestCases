"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "./components/core/Button";
import PageContainer from "./components/layout/PageContainer";

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set the loaded state after a brief delay for animation purposes
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "Immersive Gameplay",
      description:
        "Dive into rich, interactive worlds with stunning visuals and engaging mechanics.",
      icon: "🎮",
    },
    {
      title: "Character Customization",
      description:
        "Create unique heroes with deep customization options for appearance, skills, and abilities.",
      icon: "👤",
    },
    {
      title: "Epic Storylines",
      description:
        "Experience branching narratives with meaningful choices that impact your journey.",
      icon: "📜",
    },
    {
      title: "Dynamic Combat",
      description:
        "Master tactical real-time combat with intuitive controls and strategic depth.",
      icon: "⚔️",
    },
    {
      title: "Magical World",
      description:
        "Explore vast landscapes filled with mystery, magic, and ancient secrets.",
      icon: "✨",
    },
    {
      title: "Community-Driven",
      description:
        "Join a thriving community of players and creators sharing adventures and mods.",
      icon: "🤝",
    },
  ];

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <PageContainer maxWidth="full" padding="none" bgColor="#0f172a">
      {/* Hero Section */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center text-center text-white px-4 py-16 bg-gradient-to-b from-blue-900 to-indigo-900"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={heroVariants}
      >
        <motion.div variants={itemVariants} className="mb-6 text-6xl">
          ✨
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
        >
          Pixie Forge Engine
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl mb-8 max-w-3xl text-blue-100"
        >
          Craft immersive fantasy worlds and embark on epic adventures with our
          powerful game creation platform
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/gamestore">
            <Button
              size="large"
              variant="primary"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              Visit Game Store
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-indigo-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Powerful Engine Features
            </h2>
            <p className="text-lg text-blue-300 max-w-3xl mx-auto">
              Built from the ground up for fantasy RPG creators and players
              alike
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-indigo-900/50 p-6 rounded-lg shadow-xl border border-indigo-800 hover:border-purple-500 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-blue-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 px-4 bg-gradient-to-t from-blue-900 to-indigo-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-blue-200 mb-8">
            Explore our collection of games or create your own adventures with
            the Pixie Forge Engine.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/gamestore">
              <Button
                size="large"
                variant="primary"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              >
                Browse Games
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="large"
                variant="outline"
                className="border-2 border-blue-400 text-blue-200 hover:bg-blue-900/30"
              >
                Engine Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-950 text-blue-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Pixie Forge Engine
            </h3>
            <p className="mb-4">
              Unleashing creativity through magical interactive experiences
            </p>
            <p className="text-sm">© 2023 Pixie Forge. All rights reserved.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="hover:text-purple-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className="hover:text-purple-400 transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="hover:text-purple-400 transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-purple-400 transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/github"
                  className="hover:text-purple-400 transition-colors"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="/discord"
                  className="hover:text-purple-400 transition-colors"
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href="/twitter"
                  className="hover:text-purple-400 transition-colors"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-purple-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
}
