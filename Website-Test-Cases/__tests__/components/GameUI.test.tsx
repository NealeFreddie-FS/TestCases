import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameUI from "../../app/components/game/GameUI";
import { GameMode } from "../../app/components/GameContainer";
import { GameState } from "../../app/components/game/GameEngine";

// Mock framer-motion
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
      ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("GameUI Component", () => {
  // Sample props for testing
  const mockCharacter = {
    adventurerName: "Test Character",
    characterClass: "warrior" as const,
    level: "5",
    alignment: "lawful good",
    realm: "mountains",
    questExperience: "moderate",
    magicItems: ["sword", "shield"],
    questSuggestions: "none",
  };

  const mockGameState: GameState = {
    health: 80,
    mana: 40,
    gold: 100,
    experience: 250,
    level: 5,
    inventory: ["health_potion", "iron_sword"],
    quests: ["quest_lost_amulet"],
    currentLocation: "Forest Path",
    currentEnemy: {
      name: "Forest Troll",
      type: "troll",
      level: 4,
      health: 60,
      maxHealth: 100,
      attack: 8,
      defense: 5,
      experience: 50,
      gold: 30,
    },
  };

  const mockOnAction = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    mockOnAction.mockClear();
  });

  test("renders status bar in exploration mode", () => {
    render(
      <GameUI
        gameMode="exploration"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Check for status bar elements
    expect(screen.getByText("Test Character")).toBeInTheDocument();
    expect(screen.getByText(/Lvl 5/i)).toBeInTheDocument();
    expect(screen.getByText(/HP/i)).toBeInTheDocument();
    expect(screen.getByText(/MP/i)).toBeInTheDocument();
    expect(screen.getByText(/XP/i)).toBeInTheDocument();
    expect(screen.getByText("Forest Path")).toBeInTheDocument();
  });

  test("renders combat UI in combat mode", () => {
    render(
      <GameUI
        gameMode="combat"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Check for combat elements
    expect(screen.getByText("Forest Troll")).toBeInTheDocument();
    expect(screen.getByText("Combat Actions")).toBeInTheDocument();
    expect(screen.getByText("Attack")).toBeInTheDocument();
    expect(screen.getByText(/Fireball/i)).toBeInTheDocument();
  });

  test("renders dialog UI in dialog mode", () => {
    render(
      <GameUI
        gameMode="dialog"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Check for dialog elements
    expect(screen.getByText("Mysterious Sage")).toBeInTheDocument();
  });

  test("renders shop UI in shop mode", () => {
    render(
      <GameUI
        gameMode="shop"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Check for shop elements
    expect(screen.getByText("Merchant's Wares")).toBeInTheDocument();
    expect(screen.getByText("Health Potion")).toBeInTheDocument();
    expect(screen.getByText("Mana Potion")).toBeInTheDocument();
  });

  test("renders inventory UI in inventory mode", () => {
    render(
      <GameUI
        gameMode="inventory"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Check for inventory elements
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Health Potion")).toBeInTheDocument();
    expect(screen.getByText("Iron Sword")).toBeInTheDocument();
  });

  test("handles interactions through onAction callback", () => {
    render(
      <GameUI
        gameMode="combat"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={false}
      />
    );

    // Click the attack button in combat
    fireEvent.click(screen.getByText("Attack"));
    expect(mockOnAction).toHaveBeenCalledWith("combat.attack");

    // Click the fireball button in combat
    fireEvent.click(screen.getByText(/Fireball/i));
    expect(mockOnAction).toHaveBeenCalledWith("combat.skill", "fireball");
  });

  test("adapts layout for mobile devices", () => {
    render(
      <GameUI
        gameMode="exploration"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={false}
        isMobile={true}
      />
    );

    // In a real test, we would check for mobile-specific classes or components
    // This is a placeholder test until the mobile UI is fully implemented
    expect(screen.getByText("Test Character")).toBeInTheDocument();
  });

  test("applies fullscreen styles when in fullscreen mode", () => {
    render(
      <GameUI
        gameMode="exploration"
        gameState={mockGameState}
        character={mockCharacter}
        onAction={mockOnAction}
        isFullscreen={true}
        isMobile={false}
      />
    );

    // In a real test, we would check for fullscreen-specific classes
    // This is a placeholder test until the fullscreen UI adjustments are implemented
    expect(screen.getByText("Test Character")).toBeInTheDocument();
  });
});
