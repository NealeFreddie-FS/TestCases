"use client";

import React, { useState, useEffect } from "react";
import styles from "./MenuScreens.module.css";
import { CharacterInfo } from "../../../types/GameTypes";

interface StatsScreenProps {
  character: CharacterInfo | null;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ character }) => {
  // Default stats for a knight if no character is provided
  const [baseStats, setBaseStats] = useState({
    level: 1,
    souls: 0,
    soulsToLevel: 673,
    vitality: 10,
    attunement: 8,
    endurance: 10,
    strength: 13,
    dexterity: 12,
    resistance: 11,
    intelligence: 9,
    faith: 9,
    humanity: 0,
  });

  // Update stats based on character info
  useEffect(() => {
    if (character) {
      // If we have character data, use it
      setBaseStats({
        level: character.level || 1,
        souls: character.souls || 0,
        soulsToLevel:
          Math.floor(character.level * character.level * 100) || 673,
        vitality: character.stats?.vitality || 10,
        attunement: character.stats?.attunement || 8,
        endurance: character.stats?.endurance || 10,
        strength: character.stats?.strength || 13,
        dexterity: character.stats?.dexterity || 12,
        resistance: character.stats?.resistance || 11,
        intelligence: character.stats?.intelligence || 9,
        faith: character.stats?.faith || 9,
        humanity: character.stats?.humanity || 0,
      });
    }
  }, [character]);

  // Calculate derived stats
  const derivedStats = {
    // Health & Stamina
    hp: Math.floor(500 + baseStats.vitality * 20),
    stamina: Math.floor(80 + baseStats.endurance * 2),
    equipLoad: Math.floor(40 + baseStats.endurance * 1.5),
    poise: Math.floor(baseStats.vitality / 2),

    // Attack power
    physicalAttack: Math.floor(
      baseStats.strength * 2.5 + baseStats.dexterity * 1.5
    ),
    magicAttack: Math.floor(baseStats.intelligence * 3),
    fireAttack: Math.floor(
      baseStats.intelligence * 1.5 + baseStats.faith * 1.5
    ),
    lightningAttack: Math.floor(baseStats.faith * 3),

    // Defense
    physicalDefense: Math.floor(baseStats.vitality * 1.5 + baseStats.endurance),
    magicDefense: Math.floor(baseStats.intelligence * 2 + baseStats.resistance),
    fireDefense: Math.floor(baseStats.resistance * 2 + baseStats.vitality),
    lightningDefense: Math.floor(baseStats.faith * 1.5 + baseStats.resistance),

    // Resistances
    bleedResist: Math.floor(
      baseStats.endurance * 2 + baseStats.resistance * 1.5
    ),
    poisonResist: Math.floor(baseStats.resistance * 3 + baseStats.vitality),
    curseResist: Math.floor(baseStats.faith * 2 + baseStats.vitality),
  };

  // Stat descriptions
  const statDescriptions = {
    vitality: "Determines HP and physical defense.",
    attunement: "Determines attunement slots for spells.",
    endurance: "Determines stamina, equip load and bleed resistance.",
    strength:
      "Required to wield heavy weapons. Increases physical attack power.",
    dexterity:
      "Required to wield dexterous weapons. Increases attack power and cast speed.",
    resistance: "Increases various resistances to status effects.",
    intelligence: "Required to cast sorceries. Increases magic attack power.",
    faith: "Required to cast miracles. Increases lightning attack power.",
    humanity: "Increases item discovery and curse resistance.",
  };

  return (
    <div className={styles.statsScreen}>
      <div className={styles.statsLayout}>
        {/* Left Column: Base Stats */}
        <div className={styles.statsColumn}>
          <div className={styles.levelSection}>
            <h3 className={styles.columnTitle}>Level & Souls</h3>
            <div className={styles.levelDisplay}>
              <div className={styles.levelNumber}>{baseStats.level}</div>
              <div className={styles.levelInfo}>
                <div className={styles.soulsRow}>
                  <span className={styles.soulsLabel}>Souls:</span>
                  <span className={styles.soulsValue}>
                    {baseStats.souls.toLocaleString()}
                  </span>
                </div>
                <div className={styles.soulsRow}>
                  <span className={styles.soulsLabel}>Next Level:</span>
                  <span className={styles.soulsValue}>
                    {baseStats.soulsToLevel.toLocaleString()}
                  </span>
                </div>
                <div className={styles.soulsRow}>
                  <span className={styles.soulsLabel}>Humanity:</span>
                  <span className={styles.soulsValue}>
                    {baseStats.humanity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 className={styles.columnTitle}>Character Stats</h3>
          <div className={styles.statsList}>
            <div className={styles.statsRow}>
              <div className={styles.statName}>Vitality</div>
              <div className={styles.statValue}>{baseStats.vitality}</div>
              <div className={styles.statDescription}>
                {statDescriptions.vitality}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Attunement</div>
              <div className={styles.statValue}>{baseStats.attunement}</div>
              <div className={styles.statDescription}>
                {statDescriptions.attunement}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Endurance</div>
              <div className={styles.statValue}>{baseStats.endurance}</div>
              <div className={styles.statDescription}>
                {statDescriptions.endurance}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Strength</div>
              <div className={styles.statValue}>{baseStats.strength}</div>
              <div className={styles.statDescription}>
                {statDescriptions.strength}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Dexterity</div>
              <div className={styles.statValue}>{baseStats.dexterity}</div>
              <div className={styles.statDescription}>
                {statDescriptions.dexterity}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Resistance</div>
              <div className={styles.statValue}>{baseStats.resistance}</div>
              <div className={styles.statDescription}>
                {statDescriptions.resistance}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Intelligence</div>
              <div className={styles.statValue}>{baseStats.intelligence}</div>
              <div className={styles.statDescription}>
                {statDescriptions.intelligence}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statName}>Faith</div>
              <div className={styles.statValue}>{baseStats.faith}</div>
              <div className={styles.statDescription}>
                {statDescriptions.faith}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Derived Stats */}
        <div className={styles.statsColumn}>
          <h3 className={styles.columnTitle}>Derived Stats</h3>
          <div className={styles.derivedStatsList}>
            <div className={styles.derivedStatsSection}>
              <h4 className={styles.sectionTitle}>Health & Stamina</h4>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>HP</div>
                <div className={styles.derivedStatBar}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${Math.min(100, derivedStats.hp / 10)}%` }}
                  ></div>
                </div>
                <div className={styles.derivedStatValue}>{derivedStats.hp}</div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Stamina</div>
                <div className={styles.derivedStatBar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${Math.min(100, derivedStats.stamina / 1.5)}%`,
                    }}
                  ></div>
                </div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.stamina}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Equip Load</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.equipLoad}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Poise</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.poise}
                </div>
              </div>
            </div>

            <div className={styles.derivedStatsSection}>
              <h4 className={styles.sectionTitle}>Attack Power</h4>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Physical</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.physicalAttack}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Magic</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.magicAttack}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Fire</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.fireAttack}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Lightning</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.lightningAttack}
                </div>
              </div>
            </div>

            <div className={styles.derivedStatsSection}>
              <h4 className={styles.sectionTitle}>Defense</h4>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Physical</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.physicalDefense}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Magic</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.magicDefense}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Fire</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.fireDefense}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Lightning</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.lightningDefense}
                </div>
              </div>
            </div>

            <div className={styles.derivedStatsSection}>
              <h4 className={styles.sectionTitle}>Resistances</h4>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Bleed</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.bleedResist}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Poison</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.poisonResist}
                </div>
              </div>

              <div className={styles.derivedStatsRow}>
                <div className={styles.derivedStatName}>Curse</div>
                <div className={styles.derivedStatValue}>
                  {derivedStats.curseResist}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
