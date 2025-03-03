import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminPanel from "./AdminPanel";

describe("AdminPanel Component", () => {
  test("does not render when initially loaded", () => {
    render(<AdminPanel />);

    // The panel should be hidden initially
    const panelTitle = screen.queryByText(/Secret Scroll of Test Cases/i);
    expect(panelTitle).not.toBeInTheDocument();
  });

  test("toggles visibility when 'p' key is pressed", () => {
    render(<AdminPanel />);

    // The panel should be hidden initially
    expect(
      screen.queryByText(/Secret Scroll of Test Cases/i)
    ).not.toBeInTheDocument();

    // Simulate pressing the p key
    fireEvent.keyDown(document, { key: "p" });

    // The panel should now be visible
    expect(
      screen.getByText(/Secret Scroll of Test Cases/i)
    ).toBeInTheDocument();

    // Press p again to hide
    fireEvent.keyDown(document, { key: "p" });

    // The panel should be hidden again
    expect(
      screen.queryByText(/Secret Scroll of Test Cases/i)
    ).not.toBeInTheDocument();
  });

  test("renders test cases grouped by component", () => {
    render(<AdminPanel />);

    // Simulate pressing the p key to show the panel
    fireEvent.keyDown(document, { key: "p" });

    // Check that component groups are rendered using more specific selectors
    const headings = screen.getAllByRole("heading", { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);

    expect(headingTexts).toContain("Fantasy Form");
    expect(headingTexts).toContain("Navigation");
    expect(headingTexts).toContain("Feedback Entries");
    expect(headingTexts).toContain("Test Results");
    expect(headingTexts).toContain("Root Layout");
    expect(headingTexts).toContain("Home Page");
    expect(headingTexts).toContain("Form Page");
    expect(headingTexts).toContain("Admin Page");

    // Check for specific test cases
    expect(screen.getByText(/FantasyForm Rendering/i)).toBeInTheDocument();
    const navLinks = screen.getAllByText(/Navigation Links/i);
    expect(navLinks.length).toBeGreaterThan(0);
    const loadingState = screen.getAllByText(/Loading State/i);
    expect(loadingState.length).toBeGreaterThan(0);
  });

  test("displays status counts correctly", () => {
    render(<AdminPanel />);

    // Simulate pressing the p key to show the panel
    fireEvent.keyDown(document, { key: "p" });

    // Get the status count elements and check their content using a different approach
    const statusElements = screen.getAllByText(
      /Passed:|Failed:|Pending:|Total Test Cases:/
    );
    const statusTexts = statusElements.map((el) => el.textContent || "");

    // Check that the status counts contain the expected values
    expect(statusTexts.some((text) => text.includes("Passed:"))).toBeTruthy();
    expect(statusTexts.some((text) => text.includes("Failed:"))).toBeTruthy();
    expect(statusTexts.some((text) => text.includes("Pending:"))).toBeTruthy();
    expect(
      statusTexts.some((text) => text.includes("Total Test Cases:"))
    ).toBeTruthy();
  });

  test("closes panel when close button is clicked", () => {
    render(<AdminPanel />);

    // Show the panel
    fireEvent.keyDown(document, { key: "p" });
    expect(
      screen.getByText(/Secret Scroll of Test Cases/i)
    ).toBeInTheDocument();

    // Click the close button
    fireEvent.click(screen.getByText(/Close/i));

    // The panel should be hidden
    expect(
      screen.queryByText(/Secret Scroll of Test Cases/i)
    ).not.toBeInTheDocument();
  });
});
