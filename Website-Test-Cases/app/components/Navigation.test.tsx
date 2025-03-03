import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navigation from "./Navigation";

// Mock the usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from "next/navigation";

describe("Navigation Component", () => {
  beforeEach(() => {
    // Reset the mock before each test
    (usePathname as jest.Mock).mockReset();
  });

  test("renders all navigation links", () => {
    // Mock the usePathname to return '/'
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navigation />);

    // Check if all navigation links are present
    expect(screen.getAllByText("Home Kingdom")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Questionnaire Scroll")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Council Chambers")[0]).toBeInTheDocument();
  });

  test("highlights the active link correctly - Home", () => {
    // Mock the usePathname to return '/'
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navigation />);

    // Get all the links
    const homeLink = screen.getAllByText("Home Kingdom")[0].closest("a");
    const feedbackLink = screen
      .getAllByText("Questionnaire Scroll")[0]
      .closest("a");
    const adminLink = screen.getAllByText("Council Chambers")[0].closest("a");

    // Check if the correct link is highlighted
    expect(homeLink).toHaveClass("bg-amber-500/20");
    expect(feedbackLink).not.toHaveClass("bg-amber-500/20");
    expect(adminLink).not.toHaveClass("bg-amber-500/20");
  });

  test("highlights the active link correctly - Form", () => {
    // Mock the usePathname to return '/form'
    (usePathname as jest.Mock).mockReturnValue("/form");

    render(<Navigation />);

    // Get all the links
    const homeLink = screen.getAllByText("Home Kingdom")[0].closest("a");
    const feedbackLink = screen
      .getAllByText("Questionnaire Scroll")[0]
      .closest("a");
    const adminLink = screen.getAllByText("Council Chambers")[0].closest("a");

    // Check if the correct link is highlighted
    expect(homeLink).not.toHaveClass("bg-amber-500/20");
    expect(feedbackLink).toHaveClass("bg-amber-500/20");
    expect(adminLink).not.toHaveClass("bg-amber-500/20");
  });

  test("highlights the active link correctly - Admin", () => {
    // Mock the usePathname to return '/admin'
    (usePathname as jest.Mock).mockReturnValue("/admin");

    render(<Navigation />);

    // Get all the links
    const homeLink = screen.getAllByText("Home Kingdom")[0].closest("a");
    const feedbackLink = screen
      .getAllByText("Questionnaire Scroll")[0]
      .closest("a");
    const adminLink = screen.getAllByText("Council Chambers")[0].closest("a");

    // Check if the correct link is highlighted
    expect(homeLink).not.toHaveClass("bg-amber-500/20");
    expect(feedbackLink).not.toHaveClass("bg-amber-500/20");
    expect(adminLink).toHaveClass("bg-amber-500/20");
  });
});
