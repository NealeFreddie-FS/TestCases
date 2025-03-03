import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RootLayout from "./layout";

// Mock the Navigation component
jest.mock("./components/Navigation", () => {
  return () => <div data-testid="navigation">Mocked Navigation</div>;
});

// Mock the Next.js font loading
jest.mock("next/font/google", () => ({
  Inter: () => ({ className: "mocked-inter-font" }),
  Cinzel: () => ({ className: "mocked-cinzel-font" }),
}));

// Mock the html and body elements since we can't render them directly in jsdom
const originalRender = render;
const customRender = (ui: React.ReactElement) => {
  return originalRender(ui, {
    // @ts-ignore - this is a test utility
    container: document.body,
  });
};

describe("RootLayout Component", () => {
  test("renders the navigation component", () => {
    customRender(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });

  test("renders the child components", () => {
    customRender(
      <RootLayout>
        <div>Test Child Content</div>
      </RootLayout>
    );

    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  test("contains the footer with fantasy theme text", () => {
    customRender(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    expect(screen.getByText(/Crafted with ancient magic/i)).toBeInTheDocument();
  });

  test("applies the correct classes to the container", () => {
    customRender(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    // Check for container classes
    const container = screen
      .getByText("Test Child")
      .closest("div.flex.flex-col");
    expect(container).toBeInTheDocument();
  });

  test("has the correct footer copyright text", () => {
    customRender(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    // Check for copyright text
    expect(
      screen.getByText(/© \d{4} The Fantasy Realm of Feedback/)
    ).toBeInTheDocument();
  });
});
