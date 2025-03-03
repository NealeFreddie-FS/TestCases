import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormPage from "./page";

// Mock the FantasyForm component since we're testing it separately
jest.mock("../components/FantasyForm", () => {
  return () => <div data-testid="fantasy-form">Mocked Fantasy Form</div>;
});

describe("Form Page", () => {
  test("renders the page title and description", () => {
    render(<FormPage />);

    // Check for page title and description
    expect(
      screen.getByText(/The Grand Questionnaire of the Realm/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Brave traveler, the Council of Elders seeks your wisdom/i
      )
    ).toBeInTheDocument();
  });

  test("renders the FantasyForm component", () => {
    render(<FormPage />);

    // Check if the FantasyForm component is rendered
    expect(screen.getByTestId("fantasy-form")).toBeInTheDocument();
  });

  test("has proper fantasy theme styling", () => {
    render(<FormPage />);

    // Get main container
    const container = screen
      .getByText(/The Grand Questionnaire of the Realm/i)
      .closest("div");

    // Check for fantasy theme classes
    expect(container).toHaveClass("bg-gradient-to-br");
    expect(container).toHaveClass("from-indigo-900");
    expect(container).toHaveClass("to-purple-900");
    expect(container).toHaveClass("border-amber-300");
  });
});
