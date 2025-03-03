import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FantasyForm from "./FantasyForm";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock fetch for form submission test
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("FantasyForm Component", () => {
  test("renders first step of the form initially", () => {
    render(<FantasyForm />);

    // Check if the first step is visible
    expect(screen.getByText("Create Your Character")).toBeInTheDocument();
    expect(screen.getByLabelText(/Adventurer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Character Class/i)).toBeInTheDocument();
  });

  test("shows validation errors when required fields are not filled", async () => {
    render(<FantasyForm />);

    // Try to proceed without filling required fields
    fireEvent.click(screen.getByText("Continue Quest"));

    // Check for validation error messages
    await waitFor(() => {
      expect(
        screen.getByText(/Your name is required for the sacred scrolls/i)
      ).toBeInTheDocument();
    });
  });

  test("proceeds to next step when valid inputs are provided", async () => {
    render(<FantasyForm />);

    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/Adventurer Name/i), {
      target: { value: "Aragorn" },
    });

    // Fill out level
    fireEvent.change(screen.getByLabelText(/Experience Level/i), {
      target: { value: "42" },
    });

    // Click continue
    fireEvent.click(screen.getByText("Continue Quest"));

    // Check if we moved to step 2
    await waitFor(() => {
      expect(
        screen.getByText("Share Your Quest Experience")
      ).toBeInTheDocument();
    });
  });

  test("handles checkbox changes for magic items", async () => {
    render(<FantasyForm />);

    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/Adventurer Name/i), {
      target: { value: "Aragorn" },
    });

    // Fill out level
    fireEvent.change(screen.getByLabelText(/Experience Level/i), {
      target: { value: "42" },
    });

    // Click continue
    fireEvent.click(screen.getByText("Continue Quest"));

    // Wait for step 2 to appear
    await waitFor(() => {
      expect(
        screen.getByText("Share Your Quest Experience")
      ).toBeInTheDocument();
    });

    // Fill out required field in step 2
    fireEvent.change(
      screen.getByLabelText(/How was your journey through our realm\?/i),
      {
        target: { value: "It was a magical journey" },
      }
    );

    // Check a magic item
    const interfacePotionCheckbox = screen.getByLabelText(/Interface Potion/i);
    fireEvent.click(interfacePotionCheckbox);
    expect(interfacePotionCheckbox).toBeChecked();

    // Uncheck a magic item
    fireEvent.click(interfacePotionCheckbox);
    expect(interfacePotionCheckbox).not.toBeChecked();
  });

  test("allows going back to previous steps", async () => {
    render(<FantasyForm />);

    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/Adventurer Name/i), {
      target: { value: "Aragorn" },
    });

    // Fill out level
    fireEvent.change(screen.getByLabelText(/Experience Level/i), {
      target: { value: "42" },
    });

    // Click continue
    fireEvent.click(screen.getByText("Continue Quest"));

    // Wait for step 2 to appear
    await waitFor(() => {
      expect(
        screen.getByText("Share Your Quest Experience")
      ).toBeInTheDocument();
    });

    // Go back to step 1
    fireEvent.click(screen.getByText("Previous Scroll"));

    // Check if we're back on step 1
    await waitFor(() => {
      expect(screen.getByText("Create Your Character")).toBeInTheDocument();
    });
  });

  test("submits the form successfully", async () => {
    render(<FantasyForm />);

    // Fill out first step
    fireEvent.change(screen.getByLabelText(/Adventurer Name/i), {
      target: { value: "Gandalf" },
    });

    const classSelect = screen.getByLabelText(/Character Class/i);
    fireEvent.change(classSelect, { target: { value: "wizard" } });

    const levelInput = screen.getByLabelText(/Experience Level/i);
    fireEvent.change(levelInput, { target: { value: "10" } });

    const alignmentSelect = screen.getByLabelText(/Alignment/i);
    fireEvent.change(alignmentSelect, { target: { value: "neutral-good" } });

    const realmSelect = screen.getByLabelText(/Realm of Origin/i);
    fireEvent.change(realmSelect, { target: { value: "midgard" } });

    // Continue to next step
    fireEvent.click(screen.getByText("Continue Quest"));

    // Fill out second step
    await waitFor(() => {
      expect(
        screen.getByText("Share Your Quest Experience")
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByLabelText(/How was your journey through our realm\?/i),
      {
        target: { value: "It was an epic journey through the mountains." },
      }
    );

    // Check magical items
    const magicalItems = screen.getAllByRole("checkbox");
    fireEvent.click(magicalItems[0]); // Select first magical item

    // Continue to final step
    fireEvent.click(screen.getByText("Continue Quest"));

    // Check if review section is visible
    await waitFor(() => {
      expect(screen.getByText("Review Your Scroll")).toBeInTheDocument();
    });

    // Submit the form
    fireEvent.click(screen.getByText("Submit to the Council"));

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/Casting Spell/i)).toBeInTheDocument();
    });

    // Check for success message after the simulated API call (1500ms timeout)
    await waitFor(
      () => {
        expect(
          screen.getByText("Your Scroll Has Been Sealed!")
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
