import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  CharacterCreationProvider,
  useCharacterCreation,
} from "./CharacterCreationContext";
import * as gameUtils from "../utils/game-utils";

// Mock the game-utils module
jest.mock("../utils/game-utils", () => ({
  isCharacterCreationCompleted: jest.fn(),
  completeCharacterCreation: jest.fn(),
  resetCharacterCreation: jest.fn(),
  getCharacterInfo: jest.fn(),
  updateCharacterInfo: jest.fn(),
}));

// Test component that uses the character creation context
const TestComponent = () => {
  const {
    isCompleted,
    characterInfo,
    completeCreation,
    resetCreation,
    updateCharacter,
  } = useCharacterCreation();

  return (
    <div>
      <div data-testid="status">
        {isCompleted ? "Completed" : "Not Completed"}
      </div>

      {characterInfo && (
        <div data-testid="character-info">
          {characterInfo.name} - {characterInfo.class} - Level{" "}
          {characterInfo.level}
        </div>
      )}

      <button
        data-testid="complete-btn"
        onClick={() =>
          completeCreation({
            name: "Test Character",
            class: "warrior",
            level: 1,
          })
        }
      >
        Complete
      </button>

      <button data-testid="reset-btn" onClick={resetCreation}>
        Reset
      </button>

      <button
        data-testid="update-btn"
        onClick={() => updateCharacter({ level: 2 })}
      >
        Level Up
      </button>
    </div>
  );
};

describe("CharacterCreationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (gameUtils.isCharacterCreationCompleted as jest.Mock).mockReturnValue(
      false
    );
    (gameUtils.getCharacterInfo as jest.Mock).mockReturnValue(null);
  });

  test("provides default values", () => {
    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("Not Completed");
    expect(screen.queryByTestId("character-info")).not.toBeInTheDocument();
  });

  test("completes character creation", () => {
    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    fireEvent.click(screen.getByTestId("complete-btn"));

    expect(screen.getByTestId("status")).toHaveTextContent("Completed");
    expect(screen.getByTestId("character-info")).toHaveTextContent(
      "Test Character - warrior - Level 1"
    );
    expect(gameUtils.completeCharacterCreation).toHaveBeenCalledWith({
      name: "Test Character",
      class: "warrior",
      level: 1,
    });
  });

  test("resets character creation", () => {
    // Setup completed state
    (gameUtils.isCharacterCreationCompleted as jest.Mock).mockReturnValue(true);
    (gameUtils.getCharacterInfo as jest.Mock).mockReturnValue({
      name: "Test Character",
      class: "warrior",
      level: 1,
    });

    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    // Verify initial state
    expect(screen.getByTestId("status")).toHaveTextContent("Completed");
    expect(screen.getByTestId("character-info")).toBeInTheDocument();

    // Reset
    fireEvent.click(screen.getByTestId("reset-btn"));

    // Verify reset state
    expect(screen.getByTestId("status")).toHaveTextContent("Not Completed");
    expect(screen.queryByTestId("character-info")).not.toBeInTheDocument();
    expect(gameUtils.resetCharacterCreation).toHaveBeenCalled();
  });

  test("updates character information", () => {
    // Setup completed state with character
    (gameUtils.isCharacterCreationCompleted as jest.Mock).mockReturnValue(true);
    (gameUtils.getCharacterInfo as jest.Mock).mockReturnValue({
      name: "Test Character",
      class: "warrior",
      level: 1,
    });

    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    // Verify initial state
    expect(screen.getByTestId("character-info")).toHaveTextContent("Level 1");

    // Update character
    fireEvent.click(screen.getByTestId("update-btn"));

    // Verify updated state
    expect(screen.getByTestId("character-info")).toHaveTextContent("Level 2");
    expect(gameUtils.updateCharacterInfo).toHaveBeenCalledWith({
      name: "Test Character",
      class: "warrior",
      level: 2,
    });
  });

  test("initializes with persisted state", () => {
    // Setup persisted state
    (gameUtils.isCharacterCreationCompleted as jest.Mock).mockReturnValue(true);
    (gameUtils.getCharacterInfo as jest.Mock).mockReturnValue({
      name: "Persisted Character",
      class: "mage",
      level: 5,
    });

    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    // Verify state is loaded from persistence
    expect(screen.getByTestId("status")).toHaveTextContent("Completed");
    expect(screen.getByTestId("character-info")).toHaveTextContent(
      "Persisted Character - mage - Level 5"
    );
  });

  test("handles updates when no character exists", () => {
    // Setup with no character
    (gameUtils.isCharacterCreationCompleted as jest.Mock).mockReturnValue(
      false
    );
    (gameUtils.getCharacterInfo as jest.Mock).mockReturnValue(null);

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <CharacterCreationProvider>
        <TestComponent />
      </CharacterCreationProvider>
    );

    // Try to update non-existent character
    fireEvent.click(screen.getByTestId("update-btn"));

    // Verify warning was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      "Attempted to update character info when no character exists"
    );
    expect(gameUtils.updateCharacterInfo).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
