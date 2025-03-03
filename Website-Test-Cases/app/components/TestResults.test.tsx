import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TestResults from "./TestResults";
import { act } from "react-dom/test-utils";

// Mock data for tests
const mockTestResults = [
  {
    id: "test-1",
    component: "FantasyForm",
    name: "passed test",
    status: "passed",
    duration: 42,
    timestamp: "2023-05-20T14:32:11Z",
  },
  {
    id: "test-3",
    component: "FantasyForm",
    name: "failed test",
    status: "failed",
    duration: 103,
    error: "Error message",
    timestamp: "2023-05-20T14:32:13Z",
  },
  {
    id: "test-4",
    component: "Navigation",
    name: "pending test",
    status: "pending",
    duration: 0,
    timestamp: "2023-05-20T14:32:14Z",
  },
];

// Mock fetch globally
global.fetch = jest.fn();

describe("TestResults Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    // Mock fetch to return a promise that never resolves
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TestResults />);
    expect(screen.getByText("Conjuring test results...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    // Mock fetch to reject with an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    render(<TestResults />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Failed to summon the test results scroll")
      ).toBeInTheDocument();
    });
  });

  it("renders test results when loaded successfully", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestResults,
    });

    render(<TestResults />);

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText("passed test")).toBeInTheDocument();
      expect(screen.getByText("failed test")).toBeInTheDocument();
      expect(screen.getByText("pending test")).toBeInTheDocument();
    });
  });

  it("displays correct summary counts", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestResults,
    });

    render(<TestResults />);

    // Wait for summary counts to appear
    await waitFor(() => {
      const passedCount = screen.getByText("1", {
        selector: ".text-green-200",
      });
      const failedCount = screen.getByText("1", { selector: ".text-red-200" });
      const pendingCount = screen.getByText("1", {
        selector: ".text-amber-200",
      });
      const totalCount = screen.getByText("3", { selector: ".text-blue-200" });

      expect(passedCount).toBeInTheDocument();
      expect(failedCount).toBeInTheDocument();
      expect(pendingCount).toBeInTheDocument();
      expect(totalCount).toBeInTheDocument();
    });
  });

  it("filters results when filter buttons are clicked", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestResults,
    });

    render(<TestResults />);

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText("passed test")).toBeInTheDocument();
    });

    // Find the "Passed" filter button (using getAllByText since there might be multiple elements with "Passed")
    const passedButtons = screen.getAllByText("Passed");
    // Find the button among them (the one that's a button element)
    const passedButton = passedButtons.find(
      (el) => el.tagName.toLowerCase() === "button"
    );

    // Click on the "Passed" filter button
    if (passedButton) {
      fireEvent.click(passedButton);

      // Check that only passed tests are shown
      expect(screen.getByText("passed test")).toBeInTheDocument();
      expect(screen.queryByText("failed test")).not.toBeInTheDocument();
      expect(screen.queryByText("pending test")).not.toBeInTheDocument();
    }
  });

  it("formats duration correctly", async () => {
    // Mock fetch to resolve with mock data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestResults,
    });

    render(<TestResults />);

    // Wait for durations to appear
    await waitFor(() => {
      expect(screen.getByText("42ms")).toBeInTheDocument();
      expect(screen.getByText("103ms")).toBeInTheDocument();
    });
  });
});
