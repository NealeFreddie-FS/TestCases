import React, { useState } from "react";
import PaperUIFrame from "./PaperUIFrame";
import PaperUIButton from "./PaperUIButton";

export interface Horse {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  speed: number; // Speed factor for fast travel (higher = faster)
  price: number;
  description: string;
  image: string;
  color: string;
}

interface HorseStableProps {
  playerGold: number;
  ownedHorses: Horse[];
  currentHorse: Horse | null;
  onPurchaseHorse: (horse: Horse) => void;
  onSelectHorse: (horse: Horse) => void;
  onClose: () => void;
}

// Default horse options available for purchase
const AVAILABLE_HORSES: Horse[] = [
  {
    id: "basic_horse",
    name: "Farm Horse",
    tier: 1,
    speed: 1.5,
    price: 500,
    description: "A reliable farm horse. Reduces fast travel time by 33%.",
    image: "0.png", // Will use pixel map assets
    color: "brown",
  },
  {
    id: "swift_horse",
    name: "Swift Steed",
    tier: 2,
    speed: 2,
    price: 1500,
    description: "A faster breed. Reduces fast travel time by 50%.",
    image: "1.png",
    color: "chestnut",
  },
  {
    id: "noble_steed",
    name: "Noble Steed",
    tier: 3,
    speed: 3,
    price: 5000,
    description: "A prized stallion. Reduces fast travel time by 66%.",
    image: "2.png",
    color: "black",
  },
];

export default function HorseStable({
  playerGold,
  ownedHorses,
  currentHorse,
  onPurchaseHorse,
  onSelectHorse,
  onClose,
}: HorseStableProps) {
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter out horses the player already owns
  const availableHorses = AVAILABLE_HORSES.filter(
    (horse) => !ownedHorses.some((owned) => owned.id === horse.id)
  );

  const handleSelectHorse = (horse: Horse) => {
    setSelectedHorse(horse);
    setShowConfirmation(false);
  };

  const handlePurchaseAttempt = () => {
    if (!selectedHorse) return;

    if (playerGold >= selectedHorse.price) {
      setShowConfirmation(true);
    } else {
      // Not enough gold - show message
      alert("Not enough gold to purchase this horse!");
    }
  };

  const confirmPurchase = () => {
    if (selectedHorse) {
      onPurchaseHorse(selectedHorse);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="relative pixelated p-4"
        style={{
          width: "500px",
          minHeight: "460px",
          backgroundImage:
            "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/1 Paper/1.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 paper-hover"
          style={{
            width: "32px",
            height: "32px",
            backgroundImage:
              "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Buttons/3.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        ></button>

        {/* Stable title */}
        <div className="text-center mb-6">
          <div
            className="pixelated p-2 inline-block"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/9 Separators/1.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="text-lg text-paper-brown font-semibold">
              Horse Stable
            </div>
          </div>
        </div>

        {/* Player's gold */}
        <div className="flex items-center justify-center mb-4">
          <div
            className="w-6 h-6 mr-2 pixelated"
            style={{
              backgroundImage:
                "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/20.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          <div className="text-paper-brown font-semibold">
            {playerGold} gold
          </div>
        </div>

        {/* Available horses */}
        <div className="mb-6">
          <PaperUIFrame title="Available Horses" size="large">
            <div className="grid grid-cols-1 gap-3 p-2">
              {availableHorses.length > 0 ? (
                availableHorses.map((horse) => (
                  <div
                    key={horse.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                      selectedHorse?.id === horse.id
                        ? "bg-amber-50"
                        : "hover:bg-amber-50/50"
                    }`}
                    onClick={() => handleSelectHorse(horse)}
                  >
                    <div
                      className="w-12 h-12 mr-3 pixelated"
                      style={{
                        backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Icons/${horse.tier}.png')`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-paper-brown">
                        {horse.name} (Tier {horse.tier})
                      </div>
                      <div className="text-xs text-paper-brown">
                        {horse.description}
                      </div>
                    </div>
                    <div className="text-paper-brown font-semibold">
                      {horse.price} gold
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-paper-brown py-4">
                  You own all available horses!
                </div>
              )}
            </div>
          </PaperUIFrame>
        </div>

        {/* Your horses */}
        <div className="mb-6">
          <PaperUIFrame title="Your Horses" size="large">
            <div className="grid grid-cols-1 gap-3 p-2">
              {ownedHorses.length > 0 ? (
                ownedHorses.map((horse) => (
                  <div
                    key={horse.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                      currentHorse?.id === horse.id
                        ? "bg-amber-50"
                        : "hover:bg-amber-50/50"
                    }`}
                    onClick={() => onSelectHorse(horse)}
                  >
                    <div
                      className="w-12 h-12 mr-3 pixelated"
                      style={{
                        backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Icons/${horse.tier}.png')`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-paper-brown">
                        {horse.name} (Tier {horse.tier})
                      </div>
                      <div className="text-xs text-paper-brown">
                        {horse.description}
                      </div>
                    </div>
                    {currentHorse?.id === horse.id && (
                      <div
                        className="w-6 h-6 ml-2 pixelated"
                        style={{
                          backgroundImage:
                            "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Plain/8 Icons/13.png')",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                        }}
                      ></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-paper-brown py-4">
                  You don't own any horses yet.
                </div>
              )}
            </div>
          </PaperUIFrame>
        </div>

        {/* Purchase button */}
        {selectedHorse && (
          <div className="flex justify-center gap-4">
            <PaperUIButton
              type="green"
              onClick={handlePurchaseAttempt}
              disabled={
                playerGold < selectedHorse.price ||
                ownedHorses.some((h) => h.id === selectedHorse.id)
              }
            >
              Purchase - {selectedHorse.price} gold
            </PaperUIButton>
          </div>
        )}

        {/* Purchase confirmation dialog */}
        {showConfirmation && selectedHorse && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <PaperUIFrame title="Confirm Purchase" size="medium" type="brown">
              <div className="text-center mb-4">
                <p className="text-paper-brown mb-2">
                  Purchase {selectedHorse.name} for {selectedHorse.price} gold?
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <PaperUIButton type="green" onClick={confirmPurchase}>
                  Confirm
                </PaperUIButton>
                <PaperUIButton
                  type="red"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </PaperUIButton>
              </div>
            </PaperUIFrame>
          </div>
        )}
      </div>
    </div>
  );
}
