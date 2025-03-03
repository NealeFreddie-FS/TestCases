import request from "supertest";
import app from "./app";
import { setupDatabase } from "./database/setup";

// Mock dependencies
jest.mock("./database/setup", () => ({
  setupDatabase: jest.fn().mockResolvedValue({}),
}));

jest.mock("./grading/code-grading", () => ({
  codeGradingRouter: jest.fn(),
}));

jest.mock("./grading/quiz-grading", () => ({
  quizGradingRouter: jest.fn(),
}));

describe("Main Application", () => {
  test("GET / should serve the main HTML page", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.type).toBe("text/html");
  });

  test("Application should setup database on startup", () => {
    expect(setupDatabase).toHaveBeenCalled();
  });

  test("Application should handle 404 routes", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });
});
