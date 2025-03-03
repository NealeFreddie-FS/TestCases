"use client";

// ProphecyEngine.tsx
// This is a utility class for generating prophecies and story elements

// Define the CharacterInfo type here to avoid circular imports
export type CharacterInfo = {
  adventurerName: string;
  characterClass: "warrior" | "mage" | "ranger" | "bard" | "rogue";
  level: string;
  alignment: string;
  realm: string;
  questExperience: string;
  magicItems: string[];
  questSuggestions?: string;
};

// Define types for the prophecy system
export type Prophecy = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  rewardDescription: string;
  consequence?: string;
  requirements: {
    choices: string[];
    events: string[];
    characterTraits?: Record<string, any>;
  };
  fulfilled?: boolean;
};

export type Effect = {
  unlockEvent?: string;
  addTrait?: string;
  removeTrait?: string;
  rewardItem?: string;
  applyStatus?: string;
  removeStatus?: string;
};

export type Choice = {
  id: string;
  text: string;
  outcome: string;
  effect: Effect;
  availability?: (character: CharacterInfo, choices: string[]) => boolean;
};

export type StoryEvent = {
  id: string;
  title: string;
  description: string;
  background: string;
  choices: Choice[];
  condition?: (character: CharacterInfo, choices: string[]) => boolean;
};

export type PlayerJourney = {
  choices: string[];
  visitedEvents: string[];
  fulfilledProphecies: string[];
  traits: string[];
};

// Background images for different locations
const backgroundImages = {
  forest: "/images/backgrounds/forest.jpg",
  mountains: "/images/backgrounds/mountains.jpg",
  dungeon: "/images/backgrounds/dungeon.jpg",
  village: "/images/backgrounds/village.jpg",
  castle: "/images/backgrounds/castle.jpg",
  tavern: "/images/backgrounds/tavern.jpg",
  crossroads: "/images/backgrounds/crossroads.jpg",
  cave: "/images/backgrounds/cave.jpg",
  ruins: "/images/backgrounds/ruins.jpg",
  battlefield: "/images/backgrounds/battlefield.jpg",
};

// Fallback for images that don't exist yet
const defaultBackground =
  "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?q=80&w=1000&auto=format&fit=crop";

// Helper to safely get background image URL
const getBackgroundImage = (key: string) => {
  return (
    backgroundImages[key as keyof typeof backgroundImages] || defaultBackground
  );
};

/**
 * Generate prophecies based on character attributes
 */
export function generateProphecyForCharacter(
  character: CharacterInfo
): Prophecy[] {
  const prophecies: Prophecy[] = [];

  // Basic prophecy that applies to all characters
  prophecies.push({
    id: "destiny_awaits",
    title: "Destiny Awaits",
    description:
      "The stars align to reveal the beginning of a great journey. Your path shall cross three important thresholds.",
    outcome:
      "You have embraced your destiny and taken the first steps on your heroic journey.",
    rewardDescription:
      "The arcane energies that guide fate now recognize your name.",
    requirements: {
      choices: [],
      events: ["crossroads", "tavern", "ruins"],
    },
  });

  // Class-specific prophecies
  switch (character.characterClass) {
    case "warrior":
      prophecies.push({
        id: "blade_of_heroes",
        title: "Blade of Heroes",
        description:
          "Your weapon shall taste the blood of a worthy opponent, and in victory, you shall claim a trophy.",
        outcome:
          "You have defeated a formidable foe and claimed your trophy, earning the title 'Blade of Heroes'.",
        rewardDescription:
          "Your reputation as a warrior spreads throughout the realm.",
        requirements: {
          choices: ["defeat_bandit_leader", "take_trophy"],
          events: ["battlefield"],
          characterTraits: {
            characterClass: "warrior",
          },
        },
      });
      break;

    case "mage":
      prophecies.push({
        id: "ancient_knowledge",
        title: "Keeper of Ancient Knowledge",
        description:
          "Within forgotten ruins lies knowledge of the ancients. You shall discover a secret that has been lost for centuries.",
        outcome:
          "You have uncovered ancient magical wisdom and added it to your repertoire.",
        rewardDescription: "A new spell has been added to your grimoire.",
        requirements: {
          choices: ["study_ancient_tome", "solve_arcane_puzzle"],
          events: ["ruins"],
          characterTraits: {
            characterClass: "mage",
          },
        },
      });
      break;

    case "ranger":
      prophecies.push({
        id: "forest_guardian",
        title: "Guardian of the Verdant Realms",
        description:
          "The trees whisper of corruption. You shall face a choice between balance and power.",
        outcome:
          "You have defended the forest from corruption and earned the blessing of nature.",
        rewardDescription: "Animals now recognize you as a friend of the wild.",
        requirements: {
          choices: ["defend_forest", "refuse_power"],
          events: ["forest"],
          characterTraits: {
            characterClass: "ranger",
          },
        },
      });
      break;

    case "bard":
      prophecies.push({
        id: "greatest_tale",
        title: "The Greatest Tale Ever Told",
        description:
          "Your songs shall move hearts and change minds. A performance of legendary proportions awaits.",
        outcome:
          "Your performance has been etched into the memories of all who heard it.",
        rewardDescription: "Your name is now sung in taverns across the realm.",
        requirements: {
          choices: ["perform_tavern", "inspire_crowd"],
          events: ["tavern"],
          characterTraits: {
            characterClass: "bard",
          },
        },
      });
      break;

    case "rogue":
      prophecies.push({
        id: "shadow_master",
        title: "Master of Shadows",
        description:
          "In darkness you shall find your greatest strength. A treasure beyond value awaits those with nimble fingers.",
        outcome:
          "You have acquired a legendary treasure through cunning and stealth.",
        rewardDescription:
          "Shadows seem to embrace you, making you harder to detect.",
        requirements: {
          choices: ["choose_stealth", "steal_artifact"],
          events: ["castle", "dungeon"],
          characterTraits: {
            characterClass: "rogue",
          },
        },
      });
      break;
  }

  // Alignment-based prophecies
  if (character.alignment.includes("Good")) {
    prophecies.push({
      id: "light_bringer",
      title: "Bringer of Light",
      description:
        "Where darkness falls, you shall be the beacon that guides others to safety.",
      outcome:
        "You have brought hope to those who had none, and your legend grows brighter.",
      rewardDescription:
        "Your presence now naturally comforts those in distress.",
      requirements: {
        choices: ["help_villagers", "sacrifice_reward"],
        events: ["village"],
        characterTraits: {
          alignment: character.alignment,
        },
      },
    });
  } else if (character.alignment.includes("Evil")) {
    prophecies.push({
      id: "shadow_ascendant",
      title: "Ascendant of Shadows",
      description:
        "Power comes to those who seize it. Your ambition shall be rewarded with dominion.",
      outcome:
        "You have embraced the darkness within and bent others to your will.",
      rewardDescription: "Those of weaker will now cower in your presence.",
      requirements: {
        choices: ["intimidate_villagers", "claim_power"],
        events: ["village", "ruins"],
        characterTraits: {
          alignment: character.alignment,
        },
      },
    });
  } else {
    // Neutral
    prophecies.push({
      id: "balance_keeper",
      title: "Keeper of the Balance",
      description:
        "Between light and dark, you shall stand as the fulcrum. A crucial choice will test your resolve.",
      outcome: "You have maintained balance in a world of extremes.",
      rewardDescription:
        "Your judgments now carry more weight with both allies and adversaries.",
      requirements: {
        choices: ["negotiate_peace", "refuse_extremes"],
        events: ["village", "battlefield"],
        characterTraits: {
          alignment: character.alignment,
        },
      },
    });
  }

  // Add realm-specific prophecy
  switch (character.realm) {
    case "Elven Forests":
      prophecies.push({
        id: "elven_heritage",
        title: "Heir to Elven Wisdom",
        description:
          "The ancient trees remember your bloodline. Return to the forest of your ancestors to claim your birthright.",
        outcome:
          "The spirits of the forest have acknowledged your connection to this land.",
        rewardDescription: "You can now understand the whispers of the trees.",
        requirements: {
          choices: ["commune_with_nature", "honor_ancestors"],
          events: ["forest"],
          characterTraits: {
            realm: "Elven Forests",
          },
        },
      });
      break;

    case "Dwarven Mountains":
      prophecies.push({
        id: "mountain_heart",
        title: "Heart of the Mountain",
        description:
          "Deep within the stone lies a secret known only to the most devoted dwarven kin.",
        outcome: "You have uncovered the ancient forge of your ancestors.",
        rewardDescription:
          "Your craftsmanship with metal and stone has improved significantly.",
        requirements: {
          choices: ["mine_rare_ore", "craft_artifact"],
          events: ["mountains", "cave"],
          characterTraits: {
            realm: "Dwarven Mountains",
          },
        },
      });
      break;

    case "Coastal Kingdoms":
      prophecies.push({
        id: "sea_caller",
        title: "Caller of Tides",
        description:
          "The ocean stirs at your approach. A secret of the depths shall be revealed to one of coastal blood.",
        outcome:
          "The sea has shared its secrets with you, recognizing your heritage.",
        rewardDescription:
          "You can now sense approaching storms and navigate treacherous waters with ease.",
        requirements: {
          choices: ["sail_storm", "rescue_sailor"],
          events: ["village"],
          characterTraits: {
            realm: "Coastal Kingdoms",
          },
        },
      });
      break;

    case "Desert Empires":
      prophecies.push({
        id: "sand_sovereign",
        title: "Sovereign of the Shifting Sands",
        description:
          "The desert tests all who cross it, but to its children, it offers hidden oases of power.",
        outcome: "You have proven yourself worthy of the desert's blessing.",
        rewardDescription:
          "Heat and thirst affect you less, and you can navigate the sands without a guide.",
        requirements: {
          choices: ["survive_desert", "find_oasis"],
          events: ["ruins"],
          characterTraits: {
            realm: "Desert Empires",
          },
        },
      });
      break;

    default:
      prophecies.push({
        id: "wanderer_fate",
        title: "Fate of the Wanderer",
        description:
          "With no ties to bind you, your destiny is truly your own to forge. The crossroads of fate offer endless possibilities.",
        outcome:
          "You have forged your own path, unburdened by heritage or tradition.",
        rewardDescription:
          "Your adaptability has increased, allowing you to blend into any culture or environment.",
        requirements: {
          choices: ["forge_path", "reject_tradition"],
          events: ["crossroads"],
          characterTraits: {
            realm: "Other Mystical Lands",
          },
        },
      });
  }

  return prophecies;
}

/**
 * Generate initial story events based on character and journey
 */
export function generateEvents(
  character: CharacterInfo,
  journey: PlayerJourney
): StoryEvent[] {
  // Base events available to all characters
  const events: StoryEvent[] = [
    {
      id: "crossroads",
      title: "The Crossroads of Destiny",
      description: `${character.adventurerName}, you stand at the crossroads where many paths diverge. The cool breeze carries whispers of adventure, danger, and destiny. Which path calls to your spirit?`,
      background: getBackgroundImage("crossroads"),
      choices: [
        {
          id: "follow_forest_path",
          text: "Follow the ancient path into the verdant forest depths",
          outcome:
            "The trees seem to part before you, inviting you deeper into their realm of shadow and light.",
          effect: {
            unlockEvent: "forest_encounter",
            addTrait: "nature_affinity",
          },
        },
        {
          id: "climb_mountain_trail",
          text: "Ascend the rocky trail toward the mountain peaks",
          outcome:
            "The air grows thinner as you climb, but your determination pushes you forward into the rugged landscape.",
          effect: {
            unlockEvent: "mountain_pass",
            addTrait: "mountaineer",
          },
        },
        {
          id: "enter_village",
          text: "Make your way toward the lights of a nearby village",
          outcome:
            "The sounds of life and community grow louder as you approach the settlement.",
          effect: {
            unlockEvent: "village_arrival",
          },
        },
        {
          id: "investigate_ruins",
          text: "Investigate the ancient ruins visible in the distance",
          outcome:
            "The crumbling stonework whispers of forgotten ages as you approach the once-magnificent structure.",
          effect: {
            unlockEvent: "ruins_exploration",
            addTrait: "curious_archaeologist",
          },
        },
      ],
    },
    {
      id: "forest_encounter",
      title: "Whispers Among the Leaves",
      description:
        "The forest canopy filters the sunlight into emerald beams. As you walk the moss-covered path, a sense of being watched prickles at the back of your neck. Strange symbols carved into the ancient trees suggest this forest has many secrets.",
      background: getBackgroundImage("forest"),
      choices: [
        {
          id: "follow_lights",
          text: "Follow the mysterious lights deeper into the forest",
          outcome:
            "The dancing lights weave between the trees, leading you to places unseen by mortal eyes for centuries.",
          effect: {
            unlockEvent: "fairy_circle",
            addTrait: "fey_touched",
          },
        },
        {
          id: "commune_with_nature",
          text: "Meditate and attempt to commune with the forest spirits",
          outcome:
            "You center yourself, opening your senses to the subtle energies of the forest. A gentle presence acknowledges your respect.",
          effect: {
            unlockEvent:
              character.characterClass === "ranger"
                ? "spirit_conversation"
                : "forest_blessing",
            addTrait: "spirit_speaker",
          },
        },
        {
          id: "defend_forest",
          text: "Investigate signs of corruption that seem to be affecting some of the trees",
          outcome:
            "You find unnatural growths and a sickly miasma affecting a section of the forest. Whatever is causing this must be stopped.",
          effect: {
            unlockEvent: "corruption_source",
            addTrait: "forest_defender",
          },
        },
        {
          id: "honor_ancestors",
          text: "Pay respects at what appears to be an ancient shrine",
          outcome:
            "As you bow your head in reverence, a warm energy seems to acknowledge your gesture.",
          effect: {
            unlockEvent:
              character.realm === "Elven Forests"
                ? "ancestral_connection"
                : "forest_blessing",
          },
        },
      ],
    },
    {
      id: "mountain_pass",
      title: "The Windswept Heights",
      description:
        "The mountain air is crisp and thin. Far below, the landscape stretches out like a tapestry. A narrow pass winds between towering peaks, and the distant sound of hammers on stone echoes through the crags.",
      background: getBackgroundImage("mountains"),
      choices: [
        {
          id: "explore_cave",
          text: "Investigate a dark cave entrance partially hidden by boulders",
          outcome:
            "The cave mouth yawns before you, exhaling cool air from the mountain's depths.",
          effect: {
            unlockEvent: "cave_discovery",
            addTrait: "spelunker",
          },
        },
        {
          id: "follow_sounds",
          text: "Follow the sounds of mining toward what might be a settlement",
          outcome:
            "The rhythmic clanging grows louder as you navigate the treacherous path.",
          effect: {
            unlockEvent:
              character.realm === "Dwarven Mountains"
                ? "dwarven_outpost"
                : "mining_camp",
          },
        },
        {
          id: "climb_peak",
          text: "Attempt to reach the summit of the nearest peak",
          outcome:
            "Each step brings you closer to the clouds. The view becomes increasingly breathtaking.",
          effect: {
            unlockEvent: "mountain_summit",
            addTrait: "peak_conqueror",
          },
        },
        {
          id: "mine_rare_ore",
          text: "Search for valuable minerals in an exposed vein of rock",
          outcome:
            "Your keen eye spots an unusual shimmer in the stone. This could be valuable indeed.",
          effect: {
            unlockEvent: "mineral_discovery",
            addTrait: "prospector",
          },
        },
      ],
    },
    {
      id: "village_arrival",
      title: "Welcome to Oakridge",
      description:
        "The village of Oakridge welcomes you with warm hearths and curious glances. Thatched cottages line the main road, and a weathered sign creaks in the breeze outside the local tavern. The villagers seem both cautious and hopeful at your arrival.",
      background: getBackgroundImage("village"),
      choices: [
        {
          id: "visit_tavern",
          text: "Visit the tavern to gather information and perhaps find work",
          outcome:
            "The tavern door swings open to reveal a lively scene of locals sharing tales over frothy mugs.",
          effect: {
            unlockEvent: "tavern_gathering",
          },
        },
        {
          id: "help_villagers",
          text: "Offer your assistance to the village elder who seems troubled",
          outcome:
            "The elder's weathered face brightens at your offer. 'Perhaps the prophecies were true,' they murmur.",
          effect: {
            unlockEvent: "village_problem",
            addTrait: "village_friend",
          },
        },
        {
          id: "investigate_rumors",
          text: "Ask about strange rumors you've heard about this region",
          outcome:
            "The villagers exchange nervous glances before one steps forward to speak of the troubles that have been plaguing them.",
          effect: {
            unlockEvent: "rumor_truth",
          },
        },
        {
          id: "intimidate_villagers",
          text: "Assert your presence and demand respect and accommodations",
          outcome:
            "The villagers shrink back from your display of authority, quickly offering what you demand.",
          effect: {
            unlockEvent: "village_submission",
            addTrait: "feared",
          },
          availability: (character) => character.alignment.includes("Evil"),
        },
      ],
    },
    {
      id: "ruins_exploration",
      title: "Echoes of a Forgotten Age",
      description:
        "Crumbling columns and moss-covered stones are all that remain of what must have been a magnificent structure. Faded inscriptions hint at the power and knowledge that once dwelled here. The air feels charged with dormant magic.",
      background: getBackgroundImage("ruins"),
      choices: [
        {
          id: "decipher_inscriptions",
          text: "Attempt to decipher the ancient inscriptions on the central altar",
          outcome:
            "The symbols begin to make sense as you trace them with your fingers. They speak of a power sealed away long ago.",
          effect: {
            unlockEvent: "ancient_secret",
            addTrait: "scholar_of_antiquity",
          },
        },
        {
          id: "explore_depths",
          text: "Search for an entrance to whatever might lie beneath the ruins",
          outcome:
            "Your careful inspection reveals a hidden passage, concealed by centuries of debris and clever craftsmanship.",
          effect: {
            unlockEvent: "hidden_chambers",
            addTrait: "dungeon_delver",
          },
        },
        {
          id: "study_ancient_tome",
          text: "Examine a partially intact book resting on a stone pedestal",
          outcome:
            "The pages are brittle with age, but the knowledge contained within still resonates with power.",
          effect: {
            unlockEvent:
              character.characterClass === "mage"
                ? "arcane_revelation"
                : "historical_discovery",
          },
        },
        {
          id: "claim_power",
          text: "Attempt to harness the lingering magical energy for yourself",
          outcome:
            "The dormant energies respond to your will, swirling around you in patterns of light and shadow.",
          effect: {
            unlockEvent: "power_price",
            addTrait: "power_seeker",
          },
          availability: (character) =>
            character.characterClass === "mage" ||
            character.alignment.includes("Evil"),
        },
      ],
    },
    {
      id: "tavern_gathering",
      title: "The Gilded Goblet Tavern",
      description:
        "The tavern is alive with conversation and laughter. A bard plays a lively tune in the corner while patrons share tales of adventure and rumors of danger. The aroma of hearty stew and fresh bread fills the air.",
      background: getBackgroundImage("tavern"),
      choices: [
        {
          id: "join_card_game",
          text: "Join a group of locals in a game of Dragon's Fortune cards",
          outcome:
            "You take a seat at the table, and the dealers eyes twinkle with interest as they deal you in.",
          effect: {
            unlockEvent: "fortunes_game",
            addTrait: "gambler",
          },
        },
        {
          id: "listen_rumors",
          text: "Listen quietly to the conversations around you",
          outcome:
            "Snippets of interesting information reach your ears as you sip your drink and observe.",
          effect: {
            unlockEvent: "overheard_plot",
          },
        },
        {
          id: "perform_tavern",
          text: "Offer to perform or share tales of your own adventures",
          outcome:
            "The crowd turns their attention to you as you begin your performance.",
          effect: {
            unlockEvent:
              character.characterClass === "bard"
                ? "legendary_performance"
                : "tavern_performance",
            addTrait: "storyteller",
          },
        },
        {
          id: "approach_mysterious_figure",
          text: "Approach the hooded figure watching from the shadows",
          outcome:
            "The figure nods almost imperceptibly as you approach, as if they've been waiting for you specifically.",
          effect: {
            unlockEvent: "mysterious_offer",
          },
        },
      ],
    },
    {
      id: "battlefield",
      title: "Aftermath of Conflict",
      description:
        "You come upon a recent battlefield, the ground still scarred by violence. Abandoned weapons and supplies suggest the conflict was fierce but brief. Ravens circle overhead, and the breeze carries the metallic scent of blood.",
      background: getBackgroundImage("battlefield"),
      choices: [
        {
          id: "search_survivors",
          text: "Search for survivors who might need aid",
          outcome:
            "Among the fallen, you discover signs of life - someone has survived this carnage.",
          effect: {
            unlockEvent: "survivor_rescue",
            addTrait: "compassionate",
          },
        },
        {
          id: "investigate_cause",
          text: "Look for clues about what caused this battle",
          outcome:
            "Examining banners and equipment reveals this was no random skirmish, but part of a larger conflict.",
          effect: {
            unlockEvent: "conflict_discovery",
          },
        },
        {
          id: "salvage_equipment",
          text: "Salvage useful equipment from the battlefield",
          outcome:
            "Among the discarded weapons and armor, you find several pieces worth taking.",
          effect: {
            unlockEvent: "valuable_salvage",
            addTrait: "pragmatic",
          },
        },
        {
          id: "honor_fallen",
          text: "Perform a brief ritual to honor the fallen warriors",
          outcome:
            "As you finish your solemn gesture, a sense of peace seems to settle over the battlefield.",
          effect: {
            unlockEvent: "spirit_gratitude",
            addTrait: "respectful",
          },
        },
      ],
    },
    {
      id: "cave_discovery",
      title: "Crystal Caverns",
      description:
        "The cave opens into a vast chamber where crystals of every color catch and reflect your light source. Stalactites hang like frozen waterfalls from the ceiling, and the air is cool and still. Somewhere in the distance, water drips rhythmically.",
      background: getBackgroundImage("cave"),
      choices: [
        {
          id: "harvest_crystals",
          text: "Carefully harvest some of the smaller crystals",
          outcome:
            "The crystals break free with surprising ease, as if offering themselves to you.",
          effect: {
            unlockEvent: "crystal_power",
            addTrait: "crystal_keeper",
          },
        },
        {
          id: "follow_water",
          text: "Follow the sound of dripping water deeper into the cave",
          outcome:
            "The passage narrows and descends, the dripping growing louder with each step.",
          effect: {
            unlockEvent: "underground_lake",
          },
        },
        {
          id: "examine_drawings",
          text: "Study what appear to be ancient drawings on one wall",
          outcome:
            "The crude images tell a story of beings who once dwelled in these depths, worshipping something that slumbered below.",
          effect: {
            unlockEvent: "ancient_warning",
            addTrait: "cautious",
          },
        },
        {
          id: "craft_artifact",
          text: "Use the unique properties of the cave to craft or enhance an item",
          outcome:
            "The resonant energies of the cave respond to your crafting efforts, imbuing your work with subtle power.",
          effect: {
            unlockEvent: "empowered_creation",
            addTrait: "artificer",
          },
          availability: (character) =>
            character.realm === "Dwarven Mountains" ||
            character.characterClass === "mage",
        },
      ],
    },
  ];

  return events;
}
