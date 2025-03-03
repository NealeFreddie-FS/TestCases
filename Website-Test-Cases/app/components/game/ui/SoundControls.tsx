import React, { useState, useEffect } from "react";
import { SoundCategory } from "../managers/SoundManager";

interface SoundControlsProps {
  gameEngine: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundControls({
  gameEngine,
  isOpen,
  onClose,
}: SoundControlsProps) {
  const [masterVolume, setMasterVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.9);
  const [ambientVolume, setAmbientVolume] = useState(0.6);
  const [uiVolume, setUiVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Get sound manager from game engine
  const soundManager = gameEngine?.soundManager;

  // Initialize state from sound manager on mount
  useEffect(() => {
    if (soundManager) {
      setMasterVolume(soundManager.getVolume());
      setMusicVolume(soundManager.getCategoryVolume(SoundCategory.MUSIC));
      setSfxVolume(soundManager.getCategoryVolume(SoundCategory.COMBAT));
      setAmbientVolume(soundManager.getCategoryVolume(SoundCategory.AMBIENT));
      setUiVolume(soundManager.getCategoryVolume(SoundCategory.INTERFACE));
      setIsMuted(soundManager.isMuted());
    }
  }, [soundManager]);

  // Handle master volume change
  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMasterVolume(newVolume);
    if (soundManager) {
      soundManager.setMasterVolume(newVolume);
    }
  };

  // Handle music volume change
  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    if (soundManager) {
      soundManager.setCategoryVolume(SoundCategory.MUSIC, newVolume);
    }
  };

  // Handle SFX volume change
  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setSfxVolume(newVolume);
    if (soundManager) {
      // Set multiple related categories
      soundManager.setCategoryVolume(SoundCategory.COMBAT, newVolume);
      soundManager.setCategoryVolume(SoundCategory.MOVEMENT, newVolume);
      soundManager.setCategoryVolume(SoundCategory.VOICE, newVolume);
    }
  };

  // Handle ambient volume change
  const handleAmbientVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(e.target.value);
    setAmbientVolume(newVolume);
    if (soundManager) {
      soundManager.setCategoryVolume(SoundCategory.AMBIENT, newVolume);
      soundManager.setCategoryVolume(SoundCategory.ENVIRONMENT, newVolume);
    }
  };

  // Handle UI volume change
  const handleUiVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setUiVolume(newVolume);
    if (soundManager) {
      soundManager.setCategoryVolume(SoundCategory.INTERFACE, newVolume);
    }
  };

  // Toggle mute state
  const toggleMute = () => {
    if (soundManager) {
      const newMuteState = soundManager.toggleMute();
      setIsMuted(newMuteState);
    }
  };

  // Play a UI sound effect for testing
  const playSoundTest = (type: string) => {
    if (!soundManager) return;

    switch (type) {
      case "ui":
        soundManager.playUIClick();
        break;
      case "music":
        soundManager.playMusic("music_main_theme");
        break;
      case "sfx":
        soundManager.playPlayerAttack();
        break;
      case "ambient":
        soundManager.playAmbient("ambient_night", { loop: false });
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-xl w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100">Sound Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Master Volume with mute toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 flex items-center">
                <button
                  onClick={toggleMute}
                  className="mr-2 text-gray-400 hover:text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        clipRule="evenodd"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      ></path>
                    </svg>
                  )}
                </button>
                Master Volume
              </label>
              <span className="text-gray-400 text-sm">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={handleMasterVolumeChange}
              className="w-full bg-gray-700 appearance-none rounded-lg h-2 outline-none"
              style={{
                backgroundImage: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                  masterVolume * 100
                }%, #4B5563 ${masterVolume * 100}%, #4B5563 100%)`,
              }}
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  ></path>
                </svg>
                Music
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => playSoundTest("music")}
                  className="mr-2 text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded"
                >
                  Test
                </button>
                <span className="text-gray-400 text-sm w-10 text-right">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              className="w-full bg-gray-700 appearance-none rounded-lg h-2 outline-none"
              style={{
                backgroundImage: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                  musicVolume * 100
                }%, #4B5563 ${musicVolume * 100}%, #4B5563 100%)`,
              }}
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  ></path>
                </svg>
                Sound Effects
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => playSoundTest("sfx")}
                  className="mr-2 text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded"
                >
                  Test
                </button>
                <span className="text-gray-400 text-sm w-10 text-right">
                  {Math.round(sfxVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="w-full bg-gray-700 appearance-none rounded-lg h-2 outline-none"
              style={{
                backgroundImage: `linear-gradient(to right, #EC4899 0%, #EC4899 ${
                  sfxVolume * 100
                }%, #4B5563 ${sfxVolume * 100}%, #4B5563 100%)`,
              }}
            />
          </div>

          {/* Ambient Sound Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  ></path>
                </svg>
                Ambient
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => playSoundTest("ambient")}
                  className="mr-2 text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded"
                >
                  Test
                </button>
                <span className="text-gray-400 text-sm w-10 text-right">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVolume}
              onChange={handleAmbientVolumeChange}
              className="w-full bg-gray-700 appearance-none rounded-lg h-2 outline-none"
              style={{
                backgroundImage: `linear-gradient(to right, #10B981 0%, #10B981 ${
                  ambientVolume * 100
                }%, #4B5563 ${ambientVolume * 100}%, #4B5563 100%)`,
              }}
            />
          </div>

          {/* UI Sound Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                  ></path>
                </svg>
                Interface
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => playSoundTest("ui")}
                  className="mr-2 text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded"
                >
                  Test
                </button>
                <span className="text-gray-400 text-sm w-10 text-right">
                  {Math.round(uiVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={uiVolume}
              onChange={handleUiVolumeChange}
              className="w-full bg-gray-700 appearance-none rounded-lg h-2 outline-none"
              style={{
                backgroundImage: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${
                  uiVolume * 100
                }%, #4B5563 ${uiVolume * 100}%, #4B5563 100%)`,
              }}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
