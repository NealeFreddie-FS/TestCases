import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "./Button";

describe("Button Component", () => {
  // Basic rendering tests
  test("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  test("applies default variant and size classes", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600"); // Primary variant
    expect(button).toHaveClass("text-base"); // Medium size
  });

  // Variant tests
  test.each([
    ["primary", "bg-blue-600"],
    ["secondary", "bg-gray-600"],
    ["danger", "bg-red-600"],
    ["success", "bg-green-600"],
    ["outline", "border-gray-300"],
    ["text", "bg-transparent"],
  ])("applies correct classes for %s variant", (variant, expectedClass) => {
    render(<Button variant={variant as any}>Variant Button</Button>);
    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  // Size tests
  test.each([
    ["small", "text-sm"],
    ["medium", "text-base"],
    ["large", "text-lg"],
  ])("applies correct classes for %s size", (size, expectedClass) => {
    render(<Button size={size as any}>Size Button</Button>);
    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  // Full width test
  test("applies full width class when fullWidth is true", () => {
    render(<Button fullWidth>Full Width Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  // Icon test
  test("renders with icon", () => {
    render(
      <Button icon={<span data-testid="test-icon">🔍</span>}>
        Icon Button
      </Button>
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  // Loading state test
  test("shows loading spinner and disables button when isLoading is true", () => {
    render(<Button isLoading>Loading Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  // Disabled state test
  test("applies disabled styles when disabled is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveClass("opacity-50");
    expect(screen.getByRole("button")).toHaveClass("cursor-not-allowed");
  });

  // Event handling test
  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Button</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Custom className test
  test("applies custom className", () => {
    render(<Button className="custom-class">Custom Class Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  // Does not call onClick when disabled
  test("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Does not call onClick when loading
  test("does not call onClick when loading", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} isLoading>
        Loading Button
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
