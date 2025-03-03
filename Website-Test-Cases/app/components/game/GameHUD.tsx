"use client";

import React from "react";
import { useGameManager } from "../../hooks/useGameManager";
import styles from "./GameHUD.module.css";
import { FaStar, FaSkull } from "react-icons/fa";
import { GiHeartBottle, GiMagicSwirl } from "react-icons/gi";

interface GameHUDProps {
  showHUD: boolean;
}

const GameHUD: React.FC<GameHUDProps> = ({ showHUD }) => {
  const { character } = useGameManager();

  if (!showHUD) return null;

  // Default character data if none is provided
  const defaultCharacter = {
    class: "knight",
    souls: 1250,
    stats: {
      vitality: 12,
      endurance: 10,
      humanity: 3,
    },
  };

  // Use character data if available, otherwise use defaults
  const currentCharacter = character || defaultCharacter;

  // Calculate HP and Stamina percentages
  const maxHP = 500 + (currentCharacter.stats?.vitality || 10) * 20;
  const currentHP = maxHP; // In a real game, this would be the current HP value
  const hpPercentage = (currentHP / maxHP) * 100;

  const maxStamina = 80 + (currentCharacter.stats?.endurance || 10) * 2;
  const currentStamina = maxStamina; // In a real game, this would be the current stamina value
  const staminaPercentage = (currentStamina / maxStamina) * 100;

  // Mock values for souls, humanity, etc.
  const souls = currentCharacter.souls || 0;
  const humanity = currentCharacter.stats?.humanity || 0;
  const estusFlasks = 5; // Mock value

  return (
    <div className={styles.hudContainer}>
      {/* Top-left corner stats */}
      <div className={styles.statsContainer}>
        <div className={styles.soulsContainer}>
          <FaStar className={styles.soulsIcon} />
          <span className={styles.soulsCount}>{souls.toLocaleString()}</span>
        </div>

        <div className={styles.humanityContainer}>
          <FaSkull className={styles.humanityIcon} />
          <span className={styles.humanityCount}>{humanity}</span>
        </div>
      </div>

      {/* Health and Stamina Bars - bottom left */}
      <div className={styles.barsContainer}>
        <div className={styles.barWrapper}>
          <div className={styles.barLabel}>HP</div>
          <div className={styles.healthBar}>
            <div
              className={styles.healthFill}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
          <div className={styles.barValue}>
            {currentHP}/{maxHP}
          </div>
        </div>

        <div className={styles.barWrapper}>
          <div className={styles.barLabel}>STA</div>
          <div className={styles.staminaBar}>
            <div
              className={styles.staminaFill}
              style={{ width: `${staminaPercentage}%` }}
            ></div>
          </div>
          <div className={styles.barValue}>
            {currentStamina}/{maxStamina}
          </div>
        </div>
      </div>

      {/* Bottom right - Quick items */}
      <div className={styles.quickItemsContainer}>
        <div className={styles.quickItem}>
          <GiHeartBottle className={styles.itemIcon} />
          <span className={styles.itemCount}>{estusFlasks}</span>
        </div>

        <div className={styles.quickItem}>
          <GiMagicSwirl className={styles.itemIcon} />
        </div>
      </div>

      {/* Center bottom - Current equipped items */}
      <div className={styles.equippedContainer}>
        <div className={styles.equippedWeapon}>
          {currentCharacter.class === "knight" && (
            <FaStar className={styles.weaponIcon} />
          )}
          {currentCharacter.class === "sorcerer" && (
            <GiMagicSwirl className={styles.weaponIcon} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
