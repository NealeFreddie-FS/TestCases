import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import AdventureJourney from "./AdventureJourney";
import * as ProphecyEngineModule from "./ProphecyEngine";
import "@testing-library/jest-dom";

// Mock the ProphecyEngine functions
jest.mock("./ProphecyEngine", () => ({
  generateProphecyForCharacter: jest.fn().mockReturnValue([
    {
      id: "test_prophecy",
      title: "Test Prophecy",
      description: "This is a test prophecy",
      outcome: "You completed the prophecy",
      rewardDescription: "You gained a reward",
      requirements: {
        choices: ["test_choice"],
        events: ["crossroads"],
      },
    },
  ]),
  generateEvents: jest.fn().mockReturnValue([
    {
      id: "crossroads",
      title: "Test Crossroads",
      description: "You are at a crossroads",
      background: "test-background.jpg",
      choices: [
        {
          id: "test_choice",
          text: "Make a test choice",
          outcome: "You made the test choice",
          effect: {
            unlockEvent: "next_event",
            addTrait: "test_trait",
          },
        },
      ],
    },
    {
      id: "next_event",
      title: "Next Event",
      description: "This is the next event",
      background: "test-background-2.jpg",
      choices: [
        {
          id: "final_choice",
          text: "Make final choice",
          outcome: "You made the final choice",
          effect: {
            unlockEvent: "journey_end",
          },
        },
      ],
    },
  ]),
}));

// Mock the character data
const mockCharacter = {
  adventurerName: "Test Adventurer",
  characterClass: "warrior" as const,
  level: "10",
  alignment: "Lawful Good",
  realm: "Elven Forests",
  questExperience: "Lots of quests",
  magicItems: ["Sword of Testing", "Shield of Jest"],
  questSuggestions: "More tests please",
};

// Mock the onComplete callback
const mockOnComplete = jest.fn();

// Mock setTimeout to execute immediately
jest.useFakeTimers();

describe("AdventureJourney Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the initial event", () => {
    render(
      <AdventureJourney character={mockCharacter} onComplete={mockOnComplete} />
    );

    // Check that the first event title is shown
    expect(screen.getByText("Test Crossroads")).toBeInTheDocument();

    // Check that the first event description is shown
    expect(screen.getByText("You are at a crossroads")).toBeInTheDocument();

    // Check that the choice is shown
    expect(screen.getByText("Make a test choice")).toBeInTheDocument();
  });

  test("allows player to make a choice", async () => {
    render(
      <AdventureJourney character={mockCharacter} onComplete={mockOnComplete} />
    );

    // Click the choice
    fireEvent.click(screen.getByText("Make a test choice"));

    // Check that the outcome is shown
    expect(screen.getByText("You made the test choice")).toBeInTheDocument();

    // Advance timers
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Check that the next event is shown
    expect(screen.getByText("Next Event")).toBeInTheDocument();
  });

  test("shows prophecy tome when button is clicked", () => {
    render(
      <AdventureJourney character={mockCharacter} onComplete={mockOnComplete} />
    );

    // Check that the prophecy tome button exists
    const prophecyButton = screen.getByText("Prophecy Tome");
    expect(prophecyButton).toBeInTheDocument();

    // Click the prophecy tome button
    fireEvent.click(prophecyButton);

    // Check that the prophecy view is shown
    expect(screen.getByText("Prophecies of the Realms")).toBeInTheDocument();
    expect(screen.getByText("Test Prophecy")).toBeInTheDocument();
    expect(screen.getByText("This is a test prophecy")).toBeInTheDocument();
  });
});
