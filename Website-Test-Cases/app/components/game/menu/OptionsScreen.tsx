"use client";

import React, { useState } from "react";
import styles from "../MenuScreens.module.css";

type OptionsTab = "game" | "display" | "controls";

interface KeyBindings {
  moveForward: string;
  moveBackward: string;
  moveLeft: string;
  moveRight: string;
  jump: string;
  attack: string;
  heavyAttack: string;
  block: string;
  dodge: string;
  use: string;
  lockOn: string;
  toggleRun: string;
  openMenu: string;
  interact: string;
}

const OptionsScreen: React.FC = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<OptionsTab>("game");

  // Game Settings
  const [musicVolume, setMusicVolume] = useState<number>(70);
  const [sfxVolume, setSfxVolume] = useState<number>(80);
  const [cameraSpeed, setCameraSpeed] = useState<number>(50);
  const [difficulty, setDifficulty] = useState<string>("normal");
  const [showHints, setShowHints] = useState<boolean>(true);
  const [showDamageNumbers, setShowDamageNumbers] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("english");

  // Display Settings
  const [brightness, setBrightness] = useState<number>(50);
  const [contrast, setContrast] = useState<number>(50);
  const [uiScale, setUiScale] = useState<number>(100);

  // Control Settings
  const [invertY, setInvertY] = useState<boolean>(false);
  const [keyBindings, setKeyBindings] = useState<KeyBindings>({
    moveForward: "W",
    moveBackward: "S",
    moveLeft: "A",
    moveRight: "D",
    jump: "Space",
    attack: "Left Click",
    heavyAttack: "Right Click",
    block: "Shift",
    dodge: "Space",
    use: "E",
    lockOn: "Tab",
    toggleRun: "Ctrl",
    openMenu: "Esc",
    interact: "F",
  });

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    // Game defaults
    setMusicVolume(70);
    setSfxVolume(80);
    setCameraSpeed(50);
    setDifficulty("normal");
    setShowHints(true);
    setShowDamageNumbers(true);
    setAutoSave(true);
    setLanguage("english");

    // Display defaults
    setBrightness(50);
    setContrast(50);
    setUiScale(100);

    // Control defaults
    setInvertY(false);
    setKeyBindings({
      moveForward: "W",
      moveBackward: "S",
      moveLeft: "A",
      moveRight: "D",
      jump: "Space",
      attack: "Left Click",
      heavyAttack: "Right Click",
      block: "Shift",
      dodge: "Space",
      use: "E",
      lockOn: "Tab",
      toggleRun: "Ctrl",
      openMenu: "Esc",
      interact: "F",
    });
  };

  // Handle key binding change
  const handleKeyBindingChange = (action: keyof KeyBindings, key: string) => {
    setKeyBindings((prev) => ({
      ...prev,
      [action]: key,
    }));
  };

  return (
    <div className={styles.optionsScreen}>
      {/* Options Tabs Navigation */}
      <div className={styles.optionsTabs}>
        <button
          className={`${styles.optionTab} ${
            activeTab === "game" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("game")}
        >
          Game
        </button>
        <button
          className={`${styles.optionTab} ${
            activeTab === "display" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("display")}
        >
          Display
        </button>
        <button
          className={`${styles.optionTab} ${
            activeTab === "controls" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("controls")}
        >
          Controls
        </button>
      </div>

      <div className={styles.optionsContent}>
        {/* Game Settings Tab */}
        {activeTab === "game" && (
          <>
            <div className={styles.optionsSection}>
              <h3 className={styles.sectionTitle}>Audio Settings</h3>

              <div className={styles.optionRow}>
                <label htmlFor="musicVolume">Music Volume</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    id="musicVolume"
                    className={styles.slider}
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                  />
                  <span className={styles.sliderValue}>{musicVolume}%</span>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label htmlFor="sfxVolume">SFX Volume</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    id="sfxVolume"
                    className={styles.slider}
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseInt(e.target.value))}
                  />
                  <span className={styles.sliderValue}>{sfxVolume}%</span>
                </div>
              </div>
            </div>

            <div className={styles.optionsSection}>
              <h3 className={styles.sectionTitle}>Gameplay Settings</h3>

              <div className={styles.optionRow}>
                <label htmlFor="cameraSpeed">Camera Speed</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    id="cameraSpeed"
                    className={styles.slider}
                    min="1"
                    max="100"
                    value={cameraSpeed}
                    onChange={(e) => setCameraSpeed(parseInt(e.target.value))}
                  />
                  <span className={styles.sliderValue}>{cameraSpeed}%</span>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label>Difficulty</label>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.difficultyButton} ${
                      difficulty === "easy" ? styles.selected : ""
                    }`}
                    onClick={() => handleDifficultyChange("easy")}
                  >
                    Easy
                  </button>
                  <button
                    className={`${styles.difficultyButton} ${
                      difficulty === "normal" ? styles.selected : ""
                    }`}
                    onClick={() => handleDifficultyChange("normal")}
                  >
                    Normal
                  </button>
                  <button
                    className={`${styles.difficultyButton} ${
                      difficulty === "hard" ? styles.selected : ""
                    }`}
                    onClick={() => handleDifficultyChange("hard")}
                  >
                    Hard
                  </button>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label htmlFor="showHints">Show Hints</label>
                <div className={styles.toggleContainer}>
                  <input
                    type="checkbox"
                    id="showHints"
                    className={styles.toggleCheckbox}
                    checked={showHints}
                    onChange={(e) => setShowHints(e.target.checked)}
                  />
                  <label
                    htmlFor="showHints"
                    className={styles.toggleLabel}
                  ></label>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label htmlFor="showDamageNumbers">Show Damage Numbers</label>
                <div className={styles.toggleContainer}>
                  <input
                    type="checkbox"
                    id="showDamageNumbers"
                    className={styles.toggleCheckbox}
                    checked={showDamageNumbers}
                    onChange={(e) => setShowDamageNumbers(e.target.checked)}
                  />
                  <label
                    htmlFor="showDamageNumbers"
                    className={styles.toggleLabel}
                  ></label>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label htmlFor="autoSave">Auto Save</label>
                <div className={styles.toggleContainer}>
                  <input
                    type="checkbox"
                    id="autoSave"
                    className={styles.toggleCheckbox}
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <label
                    htmlFor="autoSave"
                    className={styles.toggleLabel}
                  ></label>
                </div>
              </div>

              <div className={styles.optionRow}>
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  className={styles.selectInput}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="japanese">Japanese</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Display Settings Tab */}
        {activeTab === "display" && (
          <div className={styles.optionsSection}>
            <h3 className={styles.sectionTitle}>Display Settings</h3>

            <div className={styles.optionRow}>
              <label htmlFor="brightness">Brightness</label>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  id="brightness"
                  className={styles.slider}
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                />
                <span className={styles.sliderValue}>{brightness}%</span>
              </div>
            </div>

            <div className={styles.optionRow}>
              <label htmlFor="contrast">Contrast</label>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  id="contrast"
                  className={styles.slider}
                  min="0"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                />
                <span className={styles.sliderValue}>{contrast}%</span>
              </div>
            </div>

            <div className={styles.optionRow}>
              <label htmlFor="uiScale">UI Scale</label>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  id="uiScale"
                  className={styles.slider}
                  min="50"
                  max="150"
                  value={uiScale}
                  onChange={(e) => setUiScale(parseInt(e.target.value))}
                />
                <span className={styles.sliderValue}>{uiScale}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls Settings Tab */}
        {activeTab === "controls" && (
          <div className={styles.optionsSection}>
            <h3 className={styles.sectionTitle}>Control Settings</h3>

            <div className={styles.optionRow}>
              <label htmlFor="invertY">Invert Y-Axis</label>
              <div className={styles.toggleContainer}>
                <input
                  type="checkbox"
                  id="invertY"
                  className={styles.toggleCheckbox}
                  checked={invertY}
                  onChange={(e) => setInvertY(e.target.checked)}
                />
                <label htmlFor="invertY" className={styles.toggleLabel}></label>
              </div>
            </div>

            <h4 className={styles.sectionTitle}>Key Bindings</h4>

            {Object.entries(keyBindings).map(([action, key]) => (
              <div key={action} className={styles.optionRow}>
                <label>
                  {action
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
                <button className={styles.actionButton}>{key}</button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.optionsActions}>
          <button className={styles.actionButton} onClick={handleResetDefaults}>
            Reset to Defaults
          </button>
          <button className={`${styles.actionButton} ${styles.primary}`}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreen;
