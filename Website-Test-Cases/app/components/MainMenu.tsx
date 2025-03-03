import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/MainMenu.module.css";
import { safeRedirect } from "../utils/game-utils";
import Button from "./core/Button";

// Define menu tab types
type MenuTab = "play" | "settings" | "achievements";

// Define save slot interface
interface SaveSlot {
  id: number;
  name: string;
  level: number;
  progress: number;
  lastPlayed: string;
  isEmpty: boolean;
}

const MainMenu: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MenuTab>("play");
  const [volume, setVolume] = useState(75);
  const [sfxVolume, setSfxVolume] = useState(100);
  const [pixelationLevel, setPixelationLevel] = useState(50);
  const [showFps, setShowFps] = useState(true);
  const [enableTutorials, setEnableTutorials] = useState(true);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([
    {
      id: 1,
      name: "Hero's Journey",
      level: 12,
      progress: 75,
      lastPlayed: "2 hours ago",
      isEmpty: false,
    },
    {
      id: 2,
      name: "Forest Adventure",
      level: 5,
      progress: 30,
      lastPlayed: "yesterday",
      isEmpty: false,
    },
    {
      id: 3,
      name: "",
      level: 0,
      progress: 0,
      lastPlayed: "",
      isEmpty: true,
    },
  ]);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    // Create audio references
    bgmRef.current = new Audio("/assets/audio/menu-music.mp3");
    clickSoundRef.current = new Audio("/assets/audio/click.mp3");
    hoverSoundRef.current = new Audio("/assets/audio/hover.mp3");

    if (bgmRef.current) {
      bgmRef.current.loop = true;
      bgmRef.current.volume = volume / 100;
      bgmRef.current.play().catch((error) => {
        console.log("Audio autoplay was prevented:", error);
      });
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      bgmRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = sfxVolume / 100;
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current
        .play()
        .catch((e) => console.log("Error playing sound:", e));
    }
  };

  const playHoverSound = () => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.volume = (sfxVolume / 100) * 0.5;
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current
        .play()
        .catch((e) => console.log("Error playing sound:", e));
    }
  };

  const handleStartGame = (slotId: number) => {
    playClickSound();
    // If empty slot, create new game
    const slot = saveSlots.find((slot) => slot.id === slotId);

    if (slot?.isEmpty) {
      console.log("Navigating to character creation...");
      // Use the utility function for safer navigation
      safeRedirect("/new-game");

      // Prevent any further execution
      return;
    } else {
      // Add a small delay to ensure audio plays before navigation
      setTimeout(() => {
        safeRedirect("/game");
      }, 100);
    }
  };

  const handleDeleteSave = (slotId: number) => {
    playClickSound();
    setSaveSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              name: "",
              level: 0,
              progress: 0,
              lastPlayed: "",
              isEmpty: true,
            }
          : slot
      )
    );
  };

  // Cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        cursorRef.current.style.display = "block";
      }
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = "none";
      }
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = "block";
      }
    };

    // Add hover effect for buttons
    const handleButtonHover = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = "translate(-50%, -50%) scale(1.2)";
      }
    };

    const handleButtonLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = "translate(-50%, -50%) scale(1)";
      }
    };

    // Add click animation
    const handleMouseDown = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add(styles.clicking);
      }
    };

    const handleMouseUp = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove(styles.clicking);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Add hover effect for interactive elements
    const buttons = document.querySelectorAll("button, a");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", handleButtonHover);
      button.addEventListener("mouseleave", handleButtonLeave);
    });

    // Add cursor-none class to body if screen is large enough
    if (window.innerWidth >= 769) {
      document.body.classList.add("js-cursor-none");
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      buttons.forEach((button) => {
        button.removeEventListener("mouseenter", handleButtonHover);
        button.removeEventListener("mouseleave", handleButtonLeave);
      });

      document.body.classList.remove("js-cursor-none");
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingTitle}>Fantasy RPG</div>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill}></div>
          </div>
          <div className={styles.loadingText}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Fantasy RPG - Main Menu</title>
        <meta
          name="description"
          content="An immersive fantasy RPG experience"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background with parallax effect */}
      <div className={styles.backgroundLayers}>
        <div className={styles.bgSky}></div>
        <div className={styles.bgMountains}></div>
        <div className={styles.bgTrees}></div>
        <div className={styles.bgFog}></div>
      </div>

      {/* Game title */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Fantasy RPG</h1>
        <div className={styles.subtitle}>An Epic Adventure</div>
      </div>

      {/* Main menu panel */}
      <div className={styles.menuPanel}>
        {/* Tab navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "play" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("play");
              playClickSound();
            }}
            onMouseEnter={playHoverSound}
          >
            Play
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "settings" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("settings");
              playClickSound();
            }}
            onMouseEnter={playHoverSound}
          >
            Settings
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "achievements" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("achievements");
              playClickSound();
            }}
            onMouseEnter={playHoverSound}
          >
            Achievements
          </button>
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {/* Play tab */}
          {activeTab === "play" && (
            <div className={styles.playTab}>
              <h2 className={styles.sectionTitle}>Select Save Slot</h2>
              <div className={styles.saveSlotList}>
                {saveSlots.map((slot) => (
                  <div key={slot.id} className={styles.saveSlot}>
                    {slot.isEmpty ? (
                      <>
                        <div className={styles.emptySlotIcon}>
                          <Image
                            src="/assets/placeholders/empty-save-slot.svg"
                            alt="Empty save slot"
                            width={300}
                            height={120}
                          />
                        </div>
                        <div className={styles.saveSlotActions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => handleStartGame(slot.id)}
                            onMouseEnter={playHoverSound}
                          >
                            New Game
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.saveSlotInfo}>
                          <Image
                            src="/assets/placeholders/save-slot.svg"
                            alt={slot.name}
                            width={300}
                            height={120}
                          />
                          <div className={styles.saveSlotOverlay}>
                            <h3 className={styles.saveSlotName}>{slot.name}</h3>
                            <div className={styles.saveSlotDetails}>
                              <span>Level {slot.level}</span>
                              <span>{slot.lastPlayed}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.saveSlotActions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => handleStartGame(slot.id)}
                            onMouseEnter={playHoverSound}
                          >
                            Continue
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteSave(slot.id)}
                            onMouseEnter={playHoverSound}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <div className={styles.settingsTab}>
              <h2 className={styles.sectionTitle}>Game Settings</h2>

              <div className={styles.settingsGroup}>
                <h3 className={styles.settingsGroupTitle}>Audio</h3>

                <div className={styles.settingItem}>
                  <label htmlFor="musicVolume">Music Volume: {volume}%</label>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      id="musicVolume"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className={styles.slider}
                    />
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <label htmlFor="sfxVolume">SFX Volume: {sfxVolume}%</label>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      id="sfxVolume"
                      min="0"
                      max="100"
                      value={sfxVolume}
                      onChange={(e) => {
                        setSfxVolume(parseInt(e.target.value));
                        if (clickSoundRef.current) {
                          clickSoundRef.current.volume =
                            parseInt(e.target.value) / 100;
                          clickSoundRef.current.currentTime = 0;
                          clickSoundRef.current
                            .play()
                            .catch((e) =>
                              console.log("Error playing sound:", e)
                            );
                        }
                      }}
                      className={styles.slider}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h3 className={styles.settingsGroupTitle}>Graphics</h3>

                <div className={styles.settingItem}>
                  <label htmlFor="pixelation">
                    Pixelation: {pixelationLevel}%
                  </label>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      id="pixelation"
                      min="0"
                      max="100"
                      value={pixelationLevel}
                      onChange={(e) =>
                        setPixelationLevel(parseInt(e.target.value))
                      }
                      className={styles.slider}
                    />
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <label htmlFor="showFps" className={styles.checkboxLabel}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        id="showFps"
                        checked={showFps}
                        onChange={() => setShowFps(!showFps)}
                        className={styles.checkbox}
                      />
                      <div className={styles.customCheckbox}>
                        {showFps && (
                          <Image
                            src="/assets/placeholders/checkbox.svg"
                            alt="Checked"
                            width={24}
                            height={24}
                          />
                        )}
                      </div>
                    </div>
                    Show FPS Counter
                  </label>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h3 className={styles.settingsGroupTitle}>Gameplay</h3>

                <div className={styles.settingItem}>
                  <label
                    htmlFor="enableTutorials"
                    className={styles.checkboxLabel}
                  >
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        id="enableTutorials"
                        checked={enableTutorials}
                        onChange={() => setEnableTutorials(!enableTutorials)}
                        className={styles.checkbox}
                      />
                      <div className={styles.customCheckbox}>
                        {enableTutorials && (
                          <Image
                            src="/assets/placeholders/checkbox.svg"
                            alt="Checked"
                            width={24}
                            height={24}
                          />
                        )}
                      </div>
                    </div>
                    Enable Tutorials
                  </label>
                </div>
              </div>

              <div className={styles.settingsActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    playClickSound();
                    // Save settings logic here
                  }}
                  onMouseEnter={playHoverSound}
                >
                  Save Settings
                </button>
                <button
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={() => {
                    playClickSound();
                    // Reset to defaults
                    setVolume(75);
                    setSfxVolume(100);
                    setPixelationLevel(50);
                    setShowFps(true);
                    setEnableTutorials(true);
                  }}
                  onMouseEnter={playHoverSound}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Achievements tab */}
          {activeTab === "achievements" && (
            <div className={styles.achievementsTab}>
              <h2 className={styles.sectionTitle}>Achievements</h2>

              <div className={styles.achievementList}>
                <div className={styles.achievement}>
                  <div className={styles.achievementIcon}>
                    <Image
                      src="/assets/placeholders/achievement.svg"
                      alt="First Steps"
                      width={70}
                      height={70}
                    />
                  </div>
                  <div className={styles.achievementInfo}>
                    <h3 className={styles.achievementTitle}>First Steps</h3>
                    <p className={styles.achievementDescription}>
                      Complete the tutorial
                    </p>
                    <div className={styles.achievementProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>Completed</span>
                    </div>
                  </div>
                </div>

                <div className={styles.achievement}>
                  <div className={styles.achievementIcon}>
                    <Image
                      src="/assets/placeholders/achievement.svg"
                      alt="Horse Tamer"
                      width={70}
                      height={70}
                    />
                  </div>
                  <div className={styles.achievementInfo}>
                    <h3 className={styles.achievementTitle}>Horse Tamer</h3>
                    <p className={styles.achievementDescription}>
                      Tame your first horse
                    </p>
                    <div className={styles.achievementProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>Completed</span>
                    </div>
                  </div>
                </div>

                <div className={styles.achievement}>
                  <div className={styles.achievementIcon}>
                    <Image
                      src="/assets/placeholders/achievement.svg"
                      alt="Traveler"
                      width={70}
                      height={70}
                    />
                  </div>
                  <div className={styles.achievementInfo}>
                    <h3 className={styles.achievementTitle}>Traveler</h3>
                    <p className={styles.achievementDescription}>
                      Visit all regions
                    </p>
                    <div className={styles.achievementProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>2/4 regions</span>
                    </div>
                  </div>
                </div>

                <div className={styles.achievement}>
                  <div className={styles.achievementIcon}>
                    <Image
                      src="/assets/placeholders/locked-achievement.svg"
                      alt="Locked Achievement"
                      width={70}
                      height={70}
                    />
                  </div>
                  <div className={styles.achievementInfo}>
                    <h3 className={styles.achievementTitle}>???</h3>
                    <p className={styles.achievementDescription}>
                      This achievement is locked
                    </p>
                    <div className={styles.achievementProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>Locked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with version and credits */}
      <div className={styles.footer}>
        <div className={styles.version}>v0.1.0 Alpha</div>
        <div className={styles.credits}>© 2023 Fantasy RPG Studios</div>
      </div>

      {/* Custom cursor */}
      <div className={styles.customCursor} ref={cursorRef}></div>

      <div className="flex flex-col space-y-6 mt-10 w-full max-w-md">
        <Link href="/gamestore" className="w-full">
          <Button
            size="large"
            variant="primary"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
          >
            Game Store
          </Button>
        </Link>

        <Link href="/game" className="w-full">
          <Button
            size="large"
            variant="secondary"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 border-amber-700"
          >
            Play Game
          </Button>
        </Link>

        <Link href="/settings" className="w-full">
          <Button
            size="large"
            variant="outline"
            className="w-full border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
          >
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MainMenu;
