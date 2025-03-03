import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserForm from "./UserForm";

describe("UserForm Component", () => {
  test("renders the form with all fields", () => {
    render(<UserForm />);

    // Check if all form elements are present
    expect(screen.getByTestId("user-form")).toBeInTheDocument();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-type-select")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-textarea")).toBeInTheDocument();
    expect(screen.getByTestId("rating-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  test("allows entering values in all fields", () => {
    render(<UserForm />);

    // Get form elements
    const nameInput = screen.getByTestId("name-input");
    const emailInput = screen.getByTestId("email-input");
    const feedbackTypeSelect = screen.getByTestId("feedback-type-select");
    const feedbackTextarea = screen.getByTestId("feedback-textarea");
    const ratingInput = screen.getByTestId("rating-input");

    // Enter values
    fireEvent.change(nameInput, { target: { value: "Sir Galahad" } });
    fireEvent.change(emailInput, { target: { value: "knight@camelot.realm" } });
    fireEvent.change(feedbackTypeSelect, { target: { value: "praise" } });
    fireEvent.change(feedbackTextarea, {
      target: { value: "The realm's services are most excellent!" },
    });
    fireEvent.change(ratingInput, { target: { value: "9" } });

    // Check if values were entered correctly
    expect(nameInput).toHaveValue("Sir Galahad");
    expect(emailInput).toHaveValue("knight@camelot.realm");
    expect(feedbackTypeSelect).toHaveValue("praise");
    expect(feedbackTextarea).toHaveValue(
      "The realm's services are most excellent!"
    );
    expect(ratingInput).toHaveValue("9");
  });

  test("shows success message on form submission", async () => {
    render(<UserForm />);

    // Fill out the form
    fireEvent.change(screen.getByTestId("name-input"), {
      target: { value: "Lady Guinevere" },
    });
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "lady@camelot.realm" },
    });
    fireEvent.change(screen.getByTestId("feedback-textarea"), {
      target: { value: "The kingdom's services are most splendid!" },
    });

    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));

    // Check if submitting state is shown
    expect(screen.getByText("Submitting...")).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(
        screen.getByText(
          "Thank you for your feedback! We've received your submission."
        )
      ).toBeInTheDocument();
    });

    // Check if form was reset
    expect(screen.getByTestId("name-input")).toHaveValue("");
    expect(screen.getByTestId("email-input")).toHaveValue("");
    expect(screen.getByTestId("feedback-textarea")).toHaveValue("");
  });
});
