"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import AdventureJourney from "./AdventureJourney";
import { PlayerJourney, CharacterInfo } from "./ProphecyEngine";

// Define form types
type CharacterClass = "warrior" | "mage" | "ranger" | "bard" | "rogue";
type Alignment =
  | "lawful-good"
  | "chaotic-good"
  | "neutral"
  | "lawful-evil"
  | "chaotic-evil";
type Realm =
  | "elven-forests"
  | "dwarven-mountains"
  | "coastal-kingdoms"
  | "desert-empires"
  | "other";
type MagicItem = "ui" | "nav" | "responsive" | "acc" | "speed";

type FormData = {
  adventurerName: string;
  characterClass: CharacterClass;
  level: string;
  alignment: Alignment;
  realm: Realm;
  questExperience: string;
  magicItems: string[];
  questSuggestions: string;
};

export default function FantasyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adventureStarted, setAdventureStarted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    adventurerName: "",
    characterClass: "warrior",
    level: "",
    alignment: "neutral",
    realm: "coastal-kingdoms",
    questExperience: "",
    magicItems: [],
    questSuggestions: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    setFormData((prev) => {
      const currentItems = [...prev.magicItems];

      if (checked) {
        // Add item if not already in array
        if (!currentItems.includes(value)) {
          currentItems.push(value);
        }
      } else {
        // Remove item
        const index = currentItems.indexOf(value);
        if (index !== -1) {
          currentItems.splice(index, 1);
        }
      }

      return { ...prev, [name]: currentItems };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isStepValid()) {
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would submit the data to your API here
      console.log("Form submitted:", formData);

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Validate current step
  const isStepValid = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.adventurerName.trim()) {
        newErrors.adventurerName =
          "Your name is required for the sacred scrolls";
      }
      if (!formData.level) {
        newErrors.level = "Please share your experience level";
      } else if (isNaN(Number(formData.level)) || Number(formData.level) < 1) {
        newErrors.level = "Level must be a positive number";
      }
    } else if (currentStep === 2) {
      if (!formData.questExperience.trim()) {
        newErrors.questExperience = "Please share tales of your quest";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startAdventure = () => {
    setAdventureStarted(true);
  };

  const handleAdventureComplete = (journey: PlayerJourney) => {
    console.log("Adventure completed with journey:", journey);
    // You could save this journey data to a database here

    // Reset the form for a new character
    setCurrentStep(1);
    setSubmitted(false);
    setAdventureStarted(false);
    setFormData({
      adventurerName: "",
      characterClass: "warrior",
      level: "",
      alignment: "neutral",
      realm: "coastal-kingdoms",
      questExperience: "",
      magicItems: [],
      questSuggestions: "",
    });
  };

  // Success message after submission
  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-amber-400 mb-6">
            Your Tale Has Been Chronicled, {formData.adventurerName}!
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            The Council of Elders has recorded your details in the ancient
            scrolls.
          </p>

          <div className="bg-slate-800 p-6 rounded-lg mb-8 text-left">
            <h3 className="text-xl font-bold text-amber-300 mb-4">
              Character Summary
            </h3>
            <p className="text-gray-300">
              <span className="font-bold text-amber-200">Name:</span>{" "}
              {formData.adventurerName}
            </p>
            <p className="text-gray-300">
              <span className="font-bold text-amber-200">Class:</span>{" "}
              {formData.characterClass}
            </p>
            <p className="text-gray-300">
              <span className="font-bold text-amber-200">Level:</span>{" "}
              {formData.level}
            </p>
            <p className="text-gray-300">
              <span className="font-bold text-amber-200">Alignment:</span>{" "}
              {formData.alignment}
            </p>
            <p className="text-gray-300">
              <span className="font-bold text-amber-200">Realm:</span>{" "}
              {formData.realm}
            </p>
            {formData.magicItems && formData.magicItems.length > 0 && (
              <div className="mt-2">
                <p className="font-bold text-amber-200">Magical Items:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4">
                  {formData.magicItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-8">
            <p className="text-gray-300 mb-4">
              But your story doesn't end here, brave adventurer...
            </p>
            <p className="text-gray-300 mb-4">Two paths lie before you:</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={startAdventure}
              className="px-8 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transform hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Narrative Journey
              </span>
            </button>

            <button
              onClick={() => {
                // Save character data to localStorage
                localStorage.setItem("character", JSON.stringify(formData));

                // Redirect to game page
                window.location.href = `/game?name=${encodeURIComponent(
                  formData.adventurerName
                )}&class=${formData.characterClass}&level=${
                  formData.level
                }&alignment=${formData.alignment}&realm=${encodeURIComponent(
                  formData.realm
                )}`;
              }}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transform hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
                Start Interactive Game
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Render the AdventureJourney component if the adventure has started
  if (adventureStarted) {
    return (
      <AdventureJourney
        character={formData as CharacterInfo}
        onComplete={handleAdventureComplete}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg border border-amber-300/30 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-slate-900 p-4 border-b border-amber-300/20">
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-amber-200/60 text-xs mt-2">
          <span className={currentStep >= 1 ? "text-amber-300" : ""}>
            Character Creation
          </span>
          <span className={currentStep >= 2 ? "text-amber-300" : ""}>
            Quest Details
          </span>
          <span className={currentStep >= 3 ? "text-amber-300" : ""}>
            Final Enchantment
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Character Details */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              Create Your Character
            </h2>

            <div className="mb-4">
              <label htmlFor="adventurerName" className="label">
                Adventurer Name
              </label>
              <input
                type="text"
                id="adventurerName"
                name="adventurerName"
                value={formData.adventurerName}
                onChange={handleChange}
                placeholder="Enter thy name, brave one"
                className="input"
              />
              {errors.adventurerName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.adventurerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="characterClass" className="label">
                  Character Class
                </label>
                <select
                  id="characterClass"
                  name="characterClass"
                  value={formData.characterClass}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="warrior">Warrior</option>
                  <option value="mage">Mage</option>
                  <option value="ranger">Ranger</option>
                  <option value="bard">Bard</option>
                  <option value="rogue">Rogue</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="label">
                  Experience Level
                </label>
                <input
                  type="number"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  placeholder="1-100"
                  min="1"
                  max="100"
                  className="input"
                />
                {errors.level && (
                  <p className="text-red-400 text-sm mt-1">{errors.level}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="alignment" className="label">
                  Alignment
                </label>
                <select
                  id="alignment"
                  name="alignment"
                  value={formData.alignment}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="lawful-good">Lawful Good</option>
                  <option value="chaotic-good">Chaotic Good</option>
                  <option value="neutral">True Neutral</option>
                  <option value="lawful-evil">Lawful Evil</option>
                  <option value="chaotic-evil">Chaotic Evil</option>
                </select>
              </div>

              <div>
                <label htmlFor="realm" className="label">
                  Realm of Origin
                </label>
                <select
                  id="realm"
                  name="realm"
                  value={formData.realm}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="elven-forests">Elven Forests</option>
                  <option value="dwarven-mountains">Dwarven Mountains</option>
                  <option value="coastal-kingdoms">Coastal Kingdoms</option>
                  <option value="desert-empires">Desert Empires</option>
                  <option value="other">Other Mystical Lands</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Quest Experience */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              Share Your Quest Experience
            </h2>

            <div className="mb-4">
              <label htmlFor="questExperience" className="label">
                How was your journey through our realm?
              </label>
              <textarea
                id="questExperience"
                name="questExperience"
                value={formData.questExperience}
                onChange={handleChange}
                rows={5}
                placeholder="Share tales of your adventure..."
                className="input"
              ></textarea>
              {errors.questExperience && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.questExperience}
                </p>
              )}
            </div>

            <div className="mb-4">
              <fieldset>
                <legend className="label mb-2">
                  Which magical items were most useful?
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-ui"
                      name="magicItems"
                      value="ui"
                      checked={formData.magicItems.includes("ui")}
                      onChange={handleCheckboxChange}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="item-ui" className="text-amber-100">
                      Interface Potion
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-nav"
                      name="magicItems"
                      value="nav"
                      checked={formData.magicItems.includes("nav")}
                      onChange={handleCheckboxChange}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="item-nav" className="text-amber-100">
                      Navigation Crystal
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-responsive"
                      name="magicItems"
                      value="responsive"
                      checked={formData.magicItems.includes("responsive")}
                      onChange={handleCheckboxChange}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="item-responsive" className="text-amber-100">
                      Responsive Scroll
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-acc"
                      name="magicItems"
                      value="acc"
                      checked={formData.magicItems.includes("acc")}
                      onChange={handleCheckboxChange}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="item-acc" className="text-amber-100">
                      Accessibility Amulet
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="item-speed"
                      name="magicItems"
                      value="speed"
                      checked={formData.magicItems.includes("speed")}
                      onChange={handleCheckboxChange}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="item-speed" className="text-amber-100">
                      Speed Enchantment
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}

        {/* Step 3: Final Step */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              Final Enchantments
            </h2>

            <div className="mb-4">
              <label htmlFor="questSuggestions" className="label">
                Do you have any magical suggestions for future quests?
              </label>
              <textarea
                id="questSuggestions"
                name="questSuggestions"
                value={formData.questSuggestions}
                onChange={handleChange}
                rows={3}
                placeholder="Share your wisdom for future adventures..."
                className="input"
              ></textarea>
            </div>

            <div className="bg-amber-400/10 rounded-lg p-4 border border-amber-400/30">
              <h3 className="text-lg font-serif font-bold text-amber-300 mb-3">
                Review Your Scroll
              </h3>
              <div className="space-y-2 text-amber-100">
                <p>
                  <span className="text-amber-300/70">Name:</span>{" "}
                  {formData.adventurerName || "(Not provided)"}
                </p>
                <p>
                  <span className="text-amber-300/70">Class:</span>{" "}
                  {formData.characterClass.charAt(0).toUpperCase() +
                    formData.characterClass.slice(1)}
                </p>
                <p>
                  <span className="text-amber-300/70">Level:</span>{" "}
                  {formData.level || "(Not provided)"}
                </p>
                <p>
                  <span className="text-amber-300/70">Alignment:</span>{" "}
                  {formData.alignment
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
                <p>
                  <span className="text-amber-300/70">Realm:</span>{" "}
                  {formData.realm
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
            </div>

            <div className="text-sm text-amber-200/70 italic">
              By submitting this scroll, you agree to share your quest
              experiences with the Council of Elders. Your wisdom will be used
              to improve future adventures throughout the realm.
            </div>
          </motion.div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-slate-700 text-amber-200 rounded-md hover:bg-slate-600 transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous Scroll
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className={`px-4 py-2 bg-amber-500 text-slate-900 rounded-md hover:bg-amber-400 transition-colors ml-auto flex items-center ${
                currentStep > 1 ? "ml-0" : ""
              }`}
            >
              Continue Quest
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors flex items-center ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Casting Spell...
                </>
              ) : (
                <>
                  Submit to the Council
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
