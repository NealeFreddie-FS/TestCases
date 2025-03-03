"use client";

import React, { useState, useEffect } from "react";
import styles from "./MenuScreens.module.css";
import { CharacterInfo } from "../../../utils/game-utils";
import { FaShield, FaSword, FaHatWizard, FaRing, FaGem } from "react-icons/fa";
import {
  GiArmorPants,
  GiChestArmor,
  GiGauntlet,
  GiWingedShield,
} from "react-icons/gi";

// Define equipment slots and item types for Dark Souls
export type EquipmentSlot =
  | "weapon"
  | "shield"
  | "helmet"
  | "chest"
  | "gauntlets"
  | "leggings"
  | "ring1"
  | "ring2"
  | "spell1"
  | "spell2";

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentSlot;
  description: string;
  stats: Record<string, number | string>;
  icon: React.ReactNode;
}

// Define default equipment based on character class
const defaultEquipment: Record<
  string,
  Record<EquipmentSlot, EquipmentItem | null>
> = {
  knight: {
    weapon: {
      id: "knight-sword",
      name: "Longsword",
      type: "weapon",
      description:
        "A standard straight sword, widely used for its reliability and versatility in combat.",
      stats: {
        "Physical Damage": 120,
        "Magic Damage": 0,
        "Fire Damage": 0,
        "Lightning Damage": 0,
        Scaling: "Strength: C, Dexterity: C",
        Weight: 3.0,
        Durability: 200,
      },
      icon: <FaSword />,
    },
    shield: {
      id: "knight-shield",
      name: "Knight Shield",
      type: "shield",
      description:
        "A metal kite shield bearing a crest. Standard equipment for knights in various kingdoms.",
      stats: {
        "Physical Defense": 100,
        "Magic Defense": 40,
        "Fire Defense": 60,
        "Lightning Defense": 40,
        Stability: 58,
        Weight: 5.5,
        Durability: 250,
      },
      icon: <GiWingedShield />,
    },
    helmet: {
      id: "knight-helmet",
      name: "Knight Helm",
      type: "helmet",
      description:
        "Standard knight helmet forged from quality steel. Provides good protection against physical strikes.",
      stats: {
        "Physical Defense": 30,
        "Magic Defense": 10,
        "Fire Defense": 20,
        "Lightning Defense": 15,
        Weight: 4.5,
        Durability: 220,
      },
      icon: <FaHatWizard />,
    },
    chest: {
      id: "knight-chest",
      name: "Knight Armor",
      type: "chest",
      description:
        "Sturdy metal chest armor worn by knights. Heavy but offers excellent protection.",
      stats: {
        "Physical Defense": 42,
        "Magic Defense": 15,
        "Fire Defense": 30,
        "Lightning Defense": 15,
        Poise: 28,
        Weight: 10.0,
        Durability: 280,
      },
      icon: <GiChestArmor />,
    },
    gauntlets: {
      id: "knight-gauntlets",
      name: "Knight Gauntlets",
      type: "gauntlets",
      description:
        "Metal gauntlets offering good protection for the hands and forearms.",
      stats: {
        "Physical Defense": 20,
        "Magic Defense": 8,
        "Fire Defense": 14,
        "Lightning Defense": 7,
        Weight: 2.5,
        Durability: 200,
      },
      icon: <GiGauntlet />,
    },
    leggings: {
      id: "knight-leggings",
      name: "Knight Leggings",
      type: "leggings",
      description:
        "Leg armor worn by knights. Provides good protection while allowing reasonable mobility.",
      stats: {
        "Physical Defense": 25,
        "Magic Defense": 10,
        "Fire Defense": 15,
        "Lightning Defense": 8,
        Weight: 5.5,
        Durability: 240,
      },
      icon: <GiArmorPants />,
    },
    ring1: {
      id: "ring-favor",
      name: "Ring of Favor and Protection",
      type: "ring1",
      description:
        "Ring symbolizing the goddess Fina's favor and protection. Boosts HP, stamina, and equip load.",
      stats: {
        Effect: "Increases HP by 20%, Stamina by 20%, and Equip Load by 20%",
        Special: "Breaks if removed",
        Weight: 0.0,
      },
      icon: <FaRing />,
    },
    ring2: {
      id: "havel-ring",
      name: "Havel's Ring",
      type: "ring2",
      description:
        "Ring of the mighty Havel the Rock. Boosts maximum equipment load.",
      stats: {
        Effect: "Increases maximum equipment load by 50%",
        Weight: 0.0,
      },
      icon: <FaRing />,
    },
    spell1: null,
    spell2: null,
  },
  warrior: {
    weapon: {
      id: "battle-axe",
      name: "Battle Axe",
      type: "weapon",
      description:
        "A standard battle axe. Its large blade delivers powerful blows.",
      stats: {
        "Physical Damage": 140,
        "Magic Damage": 0,
        "Fire Damage": 0,
        "Lightning Damage": 0,
        Scaling: "Strength: C, Dexterity: D",
        Weight: 4.0,
        Durability: 180,
      },
      icon: <FaSword />,
    },
    shield: {
      id: "round-shield",
      name: "Round Shield",
      type: "shield",
      description:
        "A small round shield. Good for parrying, but offers less protection than larger shields.",
      stats: {
        "Physical Defense": 80,
        "Magic Defense": 30,
        "Fire Defense": 40,
        "Lightning Defense": 30,
        Stability: 45,
        Weight: 2.5,
        Durability: 200,
      },
      icon: <GiWingedShield />,
    },
    helmet: {
      id: "warrior-helm",
      name: "Warrior Helm",
      type: "helmet",
      description:
        "Light helm favored by warriors. Offers decent protection without restricting vision.",
      stats: {
        "Physical Defense": 22,
        "Magic Defense": 6,
        "Fire Defense": 16,
        "Lightning Defense": 8,
        Weight: 3.0,
        Durability: 180,
      },
      icon: <FaHatWizard />,
    },
    chest: null,
    gauntlets: null,
    leggings: null,
    ring1: null,
    ring2: null,
    spell1: null,
    spell2: null,
  },
  sorcerer: {
    weapon: {
      id: "sorcerer-staff",
      name: "Sorcerer's Catalyst",
      type: "weapon",
      description:
        "A catalyst used by sorcerers of Vinheim Dragon School to cast sorceries.",
      stats: {
        "Magic Adjust": 110,
        Scaling: "Intelligence: B",
        Weight: 2.0,
        Durability: 90,
      },
      icon: <FaSword />,
    },
    shield: null,
    helmet: {
      id: "sorcerer-hat",
      name: "Sorcerer Hat",
      type: "helmet",
      description:
        "Hat worn by sorcerers of Vinheim. Enhances intelligence at the cost of physical defense.",
      stats: {
        "Physical Defense": 10,
        "Magic Defense": 20,
        "Fire Defense": 15,
        "Lightning Defense": 5,
        Intelligence: "+2",
        Weight: 1.2,
        Durability: 120,
      },
      icon: <FaHatWizard />,
    },
    chest: null,
    gauntlets: null,
    leggings: null,
    ring1: null,
    ring2: null,
    spell1: {
      id: "soul-arrow",
      name: "Soul Arrow",
      type: "spell1",
      description:
        "Basic sorcery taught to Vinheim apprentices. Fires a magical soul arrow.",
      stats: {
        Type: "Sorcery",
        Damage: 90,
        Uses: 30,
        Slots: 1,
        "Intelligence Required": 10,
      },
      icon: <FaGem />,
    },
    spell2: null,
  },
  pyromancer: {
    weapon: {
      id: "hand-axe",
      name: "Hand Axe",
      type: "weapon",
      description:
        "A small axe used primarily as a tool. Its hacking attacks are effective in close combat.",
      stats: {
        "Physical Damage": 105,
        "Magic Damage": 0,
        "Fire Damage": 0,
        "Lightning Damage": 0,
        Scaling: "Strength: D, Dexterity: D",
        Weight: 1.5,
        Durability: 160,
      },
      icon: <FaSword />,
    },
    shield: null,
    helmet: null,
    chest: null,
    gauntlets: null,
    leggings: null,
    ring1: null,
    ring2: null,
    spell1: {
      id: "fireball",
      name: "Fireball",
      type: "spell1",
      description:
        "Basic pyromancy from the Great Swamp. Hurls a ball of fire.",
      stats: {
        Type: "Pyromancy",
        Damage: 100,
        Uses: 8,
        Slots: 1,
      },
      icon: <FaGem />,
    },
    spell2: null,
  },
  cleric: {
    weapon: {
      id: "mace",
      name: "Mace",
      type: "weapon",
      description:
        "A blunt weapon used by clerics on their pilgrimages. Deals strike damage effective against armor.",
      stats: {
        "Physical Damage": 115,
        "Magic Damage": 0,
        "Fire Damage": 0,
        "Lightning Damage": 0,
        Scaling: "Strength: B, Dexterity: -",
        Weight: 4.0,
        Durability: 220,
      },
      icon: <FaSword />,
    },
    shield: {
      id: "sanctus",
      name: "Sanctus",
      type: "shield",
      description:
        "An ancient holy shield with a prayer engraved on it. Slowly restores HP.",
      stats: {
        "Physical Defense": 95,
        "Magic Defense": 45,
        "Fire Defense": 55,
        "Lightning Defense": 65,
        Stability: 62,
        Special: "Restores 2 HP every 2 seconds",
        Weight: 3.0,
        Durability: 180,
      },
      icon: <GiWingedShield />,
    },
    helmet: null,
    chest: null,
    gauntlets: null,
    leggings: null,
    ring1: null,
    ring2: null,
    spell1: {
      id: "heal",
      name: "Heal",
      type: "spell1",
      description:
        "Basic miracle used by clerics. Restores a moderate amount of HP.",
      stats: {
        Type: "Miracle",
        Effect: "Restores 350 HP",
        Uses: 5,
        Slots: 1,
        "Faith Required": 12,
      },
      icon: <FaGem />,
    },
    spell2: null,
  },
};

interface EquipmentScreenProps {
  character: CharacterInfo | null;
}

const EquipmentScreen: React.FC<EquipmentScreenProps> = ({ character }) => {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>("weapon");
  const [equipment, setEquipment] = useState<
    Record<EquipmentSlot, EquipmentItem | null>
  >({
    weapon: null,
    shield: null,
    helmet: null,
    chest: null,
    gauntlets: null,
    leggings: null,
    ring1: null,
    ring2: null,
    spell1: null,
    spell2: null,
  });

  // Load equipment based on character class
  useEffect(() => {
    if (character?.class && defaultEquipment[character.class.toLowerCase()]) {
      setEquipment(defaultEquipment[character.class.toLowerCase()]);
    } else {
      // Default to knight equipment if character class not found
      setEquipment(defaultEquipment.knight);
    }
  }, [character]);

  // Slot names for display
  const slotNames: Record<EquipmentSlot, string> = {
    weapon: "Weapon",
    shield: "Shield",
    helmet: "Helmet",
    chest: "Chest Armor",
    gauntlets: "Gauntlets",
    leggings: "Leggings",
    ring1: "Ring 1",
    ring2: "Ring 2",
    spell1: "Spell 1",
    spell2: "Spell 2",
  };

  // Default icons for slots
  const defaultIcons: Record<EquipmentSlot, React.ReactNode> = {
    weapon: <FaSword />,
    shield: <FaShield />,
    helmet: <FaHatWizard />,
    chest: <GiChestArmor />,
    gauntlets: <GiGauntlet />,
    leggings: <GiArmorPants />,
    ring1: <FaRing />,
    ring2: <FaRing />,
    spell1: <FaGem />,
    spell2: <FaGem />,
  };

  return (
    <div className={styles.equipmentScreen}>
      <div className={styles.equipmentLayout}>
        {/* Left Column: Equipment Slots */}
        <div className={styles.slotsColumn}>
          <h3 className={styles.columnTitle}>Equipment</h3>
          <div className={styles.equipmentSlots}>
            {Object.keys(slotNames).map((slot) => (
              <div
                key={slot}
                className={`${styles.slot} ${
                  selectedSlot === slot ? styles.selected : ""
                }`}
                onClick={() => setSelectedSlot(slot as EquipmentSlot)}
              >
                <div className={styles.slotIcon}>
                  {equipment[slot as EquipmentSlot]?.icon ||
                    defaultIcons[slot as EquipmentSlot]}
                </div>
                <div className={styles.slotInfo}>
                  <div className={styles.slotName}>
                    {slotNames[slot as EquipmentSlot]}
                  </div>
                  <div className={styles.itemName}>
                    {equipment[slot as EquipmentSlot]?.name || "Empty"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Item Details */}
        <div className={styles.detailsColumn}>
          {equipment[selectedSlot] ? (
            <div className={styles.itemDetails}>
              <div className={styles.itemHeader}>
                <div className={styles.largeIcon}>
                  {equipment[selectedSlot]?.icon || defaultIcons[selectedSlot]}
                </div>
                <div className={styles.itemHeaderInfo}>
                  <h3 className={styles.itemName}>
                    {equipment[selectedSlot]?.name}
                  </h3>
                  <div className={styles.itemType}>
                    {equipment[selectedSlot]?.type}
                  </div>
                </div>
              </div>

              <div className={styles.itemDescription}>
                {equipment[selectedSlot]?.description}
              </div>

              <h4 className={styles.statsTitle}>Item Statistics</h4>
              <div className={styles.statsList}>
                {equipment[selectedSlot] &&
                  Object.entries(equipment[selectedSlot]?.stats || {}).map(
                    ([statName, value]) => (
                      <div key={statName} className={styles.statRow}>
                        <div className={styles.statName}>{statName}</div>
                        <div className={styles.statValue}>{value}</div>
                      </div>
                    )
                  )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyMessage}>
                No item equipped in this slot
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;
