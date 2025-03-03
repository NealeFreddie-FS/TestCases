import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeedbackEntries from "./FeedbackEntries";

// Mock data for tests
const mockFeedbackEntries = [
  {
    id: "entry-1",
    adventurerName: "Thorin Oakenshield",
    characterClass: "warrior",
    realm: "Erebor",
    questExperience:
      "The form journey was well-crafted, though the validation spells were quite strict. I particularly enjoyed the responsive design that adjusted to my dwarf-sized viewing crystal.",
    magicalItems: ["UI Enchantment", "Form Validation"],
    rating: 4,
    timestamp: "2023-05-20T14:32:11Z",
  },
  {
    id: "entry-2",
    adventurerName: "Galadriel",
    characterClass: "mage",
    realm: "Lothlorien",
    questExperience:
      "The navigation was intuitive and elegant, befitting an elven design. The animations were smooth as flowing water, and the color palette was pleasing to immortal eyes.",
    magicalItems: ["Navigation Runes", "Aesthetic Charm"],
    rating: 5,
    timestamp: "2023-05-19T09:15:43Z",
  },
];

// Mock fetch globally
global.fetch = jest.fn();

describe("FeedbackEntries Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    // Mock fetch to return a promise that never resolves
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<FeedbackEntries />);
    expect(
      screen.getByText("Summoning ancient scrolls...")
    ).toBeInTheDocument();
  });

  it("renders error state when there's an error", async () => {
    // Mock fetch to reject with an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    render(<FeedbackEntries />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Failed to summon the feedback scrolls")
      ).toBeInTheDocument();
    });
  });

  it("renders feedback entries when loaded", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedbackEntries,
    });

    render(<FeedbackEntries />);

    // Wait for entries to load
    await waitFor(() => {
      expect(screen.getByText("Thorin Oakenshield")).toBeInTheDocument();
      expect(screen.getByText("Galadriel")).toBeInTheDocument();
    });
  });

  it("toggles entry details when clicked", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedbackEntries,
    });

    render(<FeedbackEntries />);

    // Wait for entries to load
    await waitFor(() => {
      expect(screen.getByText("Thorin Oakenshield")).toBeInTheDocument();
    });

    // Initially, the details should not be visible
    expect(screen.queryByText("UI Enchantment")).not.toBeInTheDocument();

    // Click on the first entry
    fireEvent.click(screen.getByText("Thorin Oakenshield").closest("div")!);

    // Now the details should be visible
    expect(screen.getByText("UI Enchantment")).toBeInTheDocument();
    expect(screen.getByText("Form Validation")).toBeInTheDocument();
  });
});
