"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterClass, createNewCharacter } from "../../utils/game-utils";
import styles from "./CharacterCreation.module.css";

interface CharacterCreationProps {
  onComplete: () => void;
}

export default function CharacterCreation({
  onComplete,
}: CharacterCreationProps) {
  const router = useRouter();
  const [name, setName] = useState("Chosen Undead");
  const [characterClass, setCharacterClass] =
    useState<CharacterClass>("knight");
  const [step, setStep] = useState<"name" | "class" | "confirm">("name");

  // Class options with descriptions
  const classOptions: {
    value: CharacterClass;
    name: string;
    description: string;
    stats: {
      vitality: number;
      attunement: number;
      endurance: number;
      strength: number;
      dexterity: number;
      resistance: number;
      intelligence: number;
      faith: number;
    };
  }[] = [
    {
      value: "knight",
      name: "Knight",
      description:
        "A knight from a fallen land. High HP and solid armor, but slow movement.",
      stats: {
        vitality: 14,
        attunement: 8,
        endurance: 12,
        strength: 14,
        dexterity: 14,
        resistance: 10,
        intelligence: 9,
        faith: 11,
      },
    },
    {
      value: "warrior",
      name: "Warrior",
      description: "A battle-hardened warrior. Well-balanced for melee combat.",
      stats: {
        vitality: 11,
        attunement: 8,
        endurance: 12,
        strength: 13,
        dexterity: 13,
        resistance: 11,
        intelligence: 9,
        faith: 9,
      },
    },
    {
      value: "pyromancer",
      name: "Pyromancer",
      description:
        "A pyromancer from the Great Swamp. Controls fire and wields a hand axe.",
      stats: {
        vitality: 10,
        attunement: 12,
        endurance: 11,
        strength: 12,
        dexterity: 9,
        resistance: 12,
        intelligence: 10,
        faith: 8,
      },
    },
    {
      value: "sorcerer",
      name: "Sorcerer",
      description:
        "A sorcerer from Vinheim Dragon School. Casts powerful spells with high intelligence.",
      stats: {
        vitality: 8,
        attunement: 15,
        endurance: 8,
        strength: 9,
        dexterity: 11,
        resistance: 8,
        intelligence: 15,
        faith: 8,
      },
    },
    {
      value: "cleric",
      name: "Cleric",
      description:
        "A cleric on a mission. Wields divine miracles with high faith.",
      stats: {
        vitality: 11,
        attunement: 11,
        endurance: 9,
        strength: 12,
        dexterity: 8,
        resistance: 11,
        intelligence: 8,
        faith: 14,
      },
    },
  ];

  // Handle character creation and start the game
  const startGame = () => {
    // Create character and save to localStorage
    createNewCharacter(name, characterClass);
    onComplete();
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case "name":
        return (
          <div className={styles.nameSelection}>
            <h2 className={styles.stepTitle}>Choose Your Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.nameInput}
              maxLength={20}
              placeholder="Enter your name"
            />
            <button
              className={styles.nextButton}
              onClick={() => setStep("class")}
              disabled={!name.trim()}
            >
              Next
            </button>
          </div>
        );

      case "class":
        return (
          <div className={styles.classSelection}>
            <h2 className={styles.stepTitle}>Choose Your Class</h2>
            <div className={styles.classOptions}>
              {classOptions.map((option) => (
                <div
                  key={option.value}
                  className={`${styles.classOption} ${
                    characterClass === option.value ? styles.selected : ""
                  }`}
                  onClick={() => setCharacterClass(option.value)}
                >
                  <h3>{option.name}</h3>
                  <p className={styles.classDescription}>
                    {option.description}
                  </p>

                  <div className={styles.statGrid}>
                    <div className={styles.statColumn}>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Vitality:</span>
                        <span className={styles.statValue}>
                          {option.stats.vitality}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Attunement:</span>
                        <span className={styles.statValue}>
                          {option.stats.attunement}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Endurance:</span>
                        <span className={styles.statValue}>
                          {option.stats.endurance}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Strength:</span>
                        <span className={styles.statValue}>
                          {option.stats.strength}
                        </span>
                      </div>
                    </div>
                    <div className={styles.statColumn}>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Dexterity:</span>
                        <span className={styles.statValue}>
                          {option.stats.dexterity}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Resistance:</span>
                        <span className={styles.statValue}>
                          {option.stats.resistance}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Intelligence:</span>
                        <span className={styles.statValue}>
                          {option.stats.intelligence}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Faith:</span>
                        <span className={styles.statValue}>
                          {option.stats.faith}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.navigationButtons}>
              <button
                className={styles.backButton}
                onClick={() => setStep("name")}
              >
                Back
              </button>
              <button
                className={styles.nextButton}
                onClick={() => setStep("confirm")}
              >
                Next
              </button>
            </div>
          </div>
        );

      case "confirm":
        const selectedClass = classOptions.find(
          (c) => c.value === characterClass
        )!;

        return (
          <div className={styles.confirmStep}>
            <h2 className={styles.stepTitle}>Confirm Your Character</h2>

            <div className={styles.confirmationDetails}>
              <div className={styles.characterSummary}>
                <h3>{name}</h3>
                <p>Class: {selectedClass.name}</p>
                <p className={styles.classSummary}>
                  {selectedClass.description}
                </p>
              </div>

              <div className={styles.statSummary}>
                <h4>Starting Stats:</h4>
                <div className={styles.statGrid}>
                  <div className={styles.statColumn}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Vitality:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.vitality}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Attunement:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.attunement}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Endurance:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.endurance}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Strength:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.strength}
                      </span>
                    </div>
                  </div>
                  <div className={styles.statColumn}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Dexterity:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.dexterity}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Resistance:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.resistance}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Intelligence:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.intelligence}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Faith:</span>
                      <span className={styles.statValue}>
                        {selectedClass.stats.faith}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.navigationButtons}>
              <button
                className={styles.backButton}
                onClick={() => setStep("class")}
              >
                Back
              </button>
              <button className={styles.startButton} onClick={startGame}>
                Begin Journey
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DARK SOULS</h1>
      <div className={styles.creationContainer}>{renderStep()}</div>
    </div>
  );
}
