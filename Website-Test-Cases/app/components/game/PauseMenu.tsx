"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameManager } from "../../hooks/useGameManager";
import { CharacterInfo } from "../../types/GameTypes";
import styles from "./PauseMenu.module.css";
import EquipmentScreen from "./menu/EquipmentScreen";
import StatsScreen from "./menu/StatsScreen";
import MapScreen from "./menu/MapScreen";
import OptionsScreen from "./menu/OptionsScreen";

type TabName = "equipment" | "stats" | "map" | "options";

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterInfo | null;
}

const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  const [activeTab, setActiveTab] = useState<TabName>("equipment");
  const menuRef = useRef<HTMLDivElement>(null);
  const { setPaused } = useGameManager();

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          navigateTab(-1);
          break;
        case "ArrowRight":
          navigateTab(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab, onClose]);

  // Pause the game when menu is open
  useEffect(() => {
    setPaused(isOpen);
  }, [isOpen, setPaused]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  // Tab navigation
  const navigateTab = (direction: number) => {
    const tabs: TabName[] = ["equipment", "stats", "map", "options"];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  // Render appropriate screen based on active tab
  const renderScreen = () => {
    switch (activeTab) {
      case "equipment":
        return <EquipmentScreen character={character} />;
      case "stats":
        return <StatsScreen character={character} />;
      case "map":
        return <MapScreen character={character} />;
      case "options":
        return <OptionsScreen />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.pauseMenuOverlay}>
      <div className={styles.pauseMenu} ref={menuRef} tabIndex={0}>
        <h2 className={styles.menuTitle}>MENU</h2>

        <div className={styles.menuTabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "equipment" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("equipment")}
          >
            Equipment
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "stats" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "map" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "options" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("options")}
          >
            Options
          </button>
        </div>

        <div className={styles.menuContent}>{renderScreen()}</div>

        <div className={styles.menuControls}>
          <div className={styles.controlHint}>
            <span className={styles.keyHint}>←→</span> Change Tab
          </div>
          <div className={styles.controlHint}>
            <span className={styles.keyHint}>ESC</span> Close Menu
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
