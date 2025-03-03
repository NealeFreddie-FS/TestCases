import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PageContainer } from "./PageContainer";

// Mock the document.title for testing
const originalTitle = document.title;
beforeEach(() => {
  document.title = originalTitle;
});

describe("PageContainer Component", () => {
  // Basic rendering tests
  test("renders children correctly", () => {
    render(
      <PageContainer>
        <div data-testid="test-child">Test Content</div>
      </PageContainer>
    );
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toHaveTextContent("Test Content");
  });

  test("applies default classes", () => {
    render(<PageContainer>Content</PageContainer>);
    const container = screen.getByTestId("page-container");
    expect(container).toHaveClass("max-w-screen-lg");
    expect(container).toHaveClass("p-4");
    expect(container).toHaveClass("mx-auto");
  });

  // Max width tests
  test.each([
    ["sm", "max-w-screen-sm"],
    ["md", "max-w-screen-md"],
    ["lg", "max-w-screen-lg"],
    ["xl", "max-w-screen-xl"],
    ["2xl", "max-w-screen-2xl"],
    ["full", "max-w-full"],
  ])("applies correct max width class for %s", (size, expectedClass) => {
    render(<PageContainer maxWidth={size as any}>Content</PageContainer>);
    expect(screen.getByTestId("page-container")).toHaveClass(expectedClass);
  });

  // Padding tests
  test.each([
    ["none", "p-0"],
    ["sm", "p-2"],
    ["md", "p-4"],
    ["lg", "p-6"],
  ])("applies correct padding class for %s", (size, expectedClass) => {
    render(<PageContainer padding={size as any}>Content</PageContainer>);
    expect(screen.getByTestId("page-container")).toHaveClass(expectedClass);
  });

  // Centered test
  test("does not apply mx-auto when centered is false", () => {
    render(<PageContainer centered={false}>Content</PageContainer>);
    expect(screen.getByTestId("page-container")).not.toHaveClass("mx-auto");
  });

  // Background color test
  test("applies background color style when bgColor is provided", () => {
    render(<PageContainer bgColor="#f0f0f0">Content</PageContainer>);
    expect(screen.getByTestId("page-container")).toHaveStyle({
      backgroundColor: "#f0f0f0",
    });
  });

  // Title test
  test("sets document title when title prop is provided", () => {
    render(<PageContainer title="Test Page Title">Content</PageContainer>);
    expect(document.title).toBe("Test Page Title");
  });

  // Header content test
  test("renders header content when provided", () => {
    render(
      <PageContainer headerContent={<h1 data-testid="header">Header</h1>}>
        Content
      </PageContainer>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveTextContent("Header");
  });

  // Footer content test
  test("renders footer content when provided", () => {
    render(
      <PageContainer footerContent={<p data-testid="footer">Footer</p>}>
        Content
      </PageContainer>
    );
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toHaveTextContent("Footer");
  });

  // Custom className test
  test("applies custom className", () => {
    render(<PageContainer className="custom-class">Content</PageContainer>);
    expect(screen.getByTestId("page-container")).toHaveClass("custom-class");
  });
});
