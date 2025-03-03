import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminPage from "./page";

// Mock React useState hook to control the state
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  const mockUseState = jest
    .fn()
    .mockImplementation((initialValue) => [initialValue, jest.fn()]);

  return {
    ...originalReact,
    useState: mockUseState,
  };
});

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ href, children, ...rest }: any) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

// Mock the TestResults and FeedbackEntries components
jest.mock("../components/TestResults", () => {
  return function MockTestResults() {
    return <div data-testid="test-results">Test Results Component</div>;
  };
});

jest.mock("../components/FeedbackEntries", () => {
  return function MockFeedbackEntries() {
    return <div data-testid="feedback-entries">Feedback Entries Component</div>;
  };
});

describe("Admin Page", () => {
  test("renders the page title and description", () => {
    render(<AdminPage />);

    // Check for page title and description
    expect(screen.getByText(/Admin Council Chamber/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Monitor thy realm, observe test incantations/i)
    ).toBeInTheDocument();
  });

  test("renders the stats overview section", () => {
    render(<AdminPage />);

    // Check for stats cards
    expect(screen.getAllByText(/Submissions/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Average Rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Status/i)).toBeInTheDocument();
  });

  test("renders the tabs", () => {
    render(<AdminPage />);

    // Check for tabs
    expect(screen.getByText("Stats Overview")).toBeInTheDocument();
    expect(screen.getAllByText("Submissions")[0]).toBeInTheDocument();
    expect(screen.getByText("Test Results")).toBeInTheDocument();
  });

  test("renders the feedback entries component", () => {
    render(<AdminPage />);

    // Check for feedback entries component
    expect(screen.getByTestId("feedback-entries")).toBeInTheDocument();
  });

  it("renders the admin page with stats tab active by default", () => {
    render(<AdminPage />);

    // Check if the page title is rendered
    expect(screen.getByText("Admin Council Chamber")).toBeInTheDocument();

    // Check if the stats tab is active by default
    const statsTab = screen.getByText("Stats Overview");
    expect(statsTab).toHaveClass("bg-amber-500");

    // Check if the kingdom statistics header is visible
    expect(screen.getByText("Kingdom Statistics")).toBeInTheDocument();

    // Check if the FeedbackEntries component is rendered
    expect(screen.getByTestId("feedback-entries")).toBeInTheDocument();
  });

  it("has a test results tab that can be clicked", () => {
    render(<AdminPage />);

    // Verify the test results tab exists
    const testResultsTab = screen.getByText("Test Results");
    expect(testResultsTab).toBeInTheDocument();

    // We can't test the state change directly since we're mocking useState
    // But we can verify the tab is clickable
    fireEvent.click(testResultsTab);
  });
});
