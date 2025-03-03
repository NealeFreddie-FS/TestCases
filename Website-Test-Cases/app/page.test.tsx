import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "./page";

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

describe("Home Page", () => {
  test("renders hero section with title and call-to-action", () => {
    render(<HomePage />);

    // Check for hero title
    expect(
      screen.getByText(/The Mystical Realm of Feedback/i)
    ).toBeInTheDocument();

    // Check for call-to-action buttons
    const beginQuestButtons = screen.getAllByText(/Begin Thy Quest/i);
    expect(beginQuestButtons.length).toBeGreaterThan(0);

    const councilChambersLink = screen.getByText(/Council Chambers/i);
    expect(councilChambersLink).toBeInTheDocument();
  });

  test("renders feature cards section", () => {
    render(<HomePage />);

    // Check for feature section title
    expect(
      screen.getByText(/Magical Features of Our Realm/i)
    ).toBeInTheDocument();

    // Check for feature cards
    expect(screen.getByText(/Character Creation/i)).toBeInTheDocument();
    expect(screen.getByText(/Epic Quest Stories/i)).toBeInTheDocument();
    expect(screen.getByText(/Enchanted Archives/i)).toBeInTheDocument();
  });

  test("renders call-to-action section", () => {
    render(<HomePage />);

    // Check for CTA section
    expect(screen.getByText(/Join Our Quest Today/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The fate of our magical realm/i)
    ).toBeInTheDocument();

    // Check for CTA button
    const ctaButtons = screen.getAllByText(/Begin Thy Quest/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  test("links point to correct routes", () => {
    render(<HomePage />);

    // Check for form link
    const beginQuestLinks = screen.getAllByText(/Begin Thy Quest/i);
    expect(beginQuestLinks[0].closest("a")).toHaveAttribute("href", "/form");

    // Check for admin link
    const councilChambersLink = screen.getByText(/Council Chambers/i);
    expect(councilChambersLink.closest("a")).toHaveAttribute("href", "/admin");
  });
});
