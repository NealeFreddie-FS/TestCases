import request from "supertest";
import express from "express";
import { codeGradingRouter } from "./code-grading";
import { getDatabase } from "../database/setup";
import Docker from "dockerode";
import fs from "fs";
import path from "path";

// Mock dependencies
jest.mock("../database/setup", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("dockerode");
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe("Code Grading Router", () => {
  let app: express.Application;
  let mockDb: any;
  let mockContainer: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock database
    mockDb = {
      run: jest.fn((query, params, callback) => {
        if (callback) callback.call({ lastID: 1 });
      }),
      get: jest.fn((query, params, callback) => {
        if (callback)
          callback(null, {
            id: 1,
            type: "code",
            language: "python",
            content: 'print("Hello, World!")',
            created_at: new Date().toISOString(),
            score: 80,
            feedback: "Great job! Your code is working well.",
          });
      }),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Setup mock Docker
    mockContainer = {
      start: jest.fn().mockResolvedValue({}),
      logs: jest.fn().mockResolvedValue(Buffer.from("Hello, World!")),
    };
    (Docker.prototype.createContainer as jest.Mock).mockResolvedValue(
      mockContainer
    );

    // Setup mock fs
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('print("Hello, World!")');

    // Setup express app with router
    app = express();
    app.use(express.json());
    app.use("/api/grade/code", codeGradingRouter);
  });

  test("POST /submit should grade Python code successfully", async () => {
    const response = await request(app).post("/api/grade/code/submit").send({
      code: 'print("Hello, World!")',
      language: "python",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("submissionId", 1);
    expect(response.body).toHaveProperty("score");
    expect(response.body).toHaveProperty("feedback");

    // Check if Docker container was created
    expect(Docker.prototype.createContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        Image: "python:3.9-slim",
        Cmd: ["python", "-c", 'print("Hello, World!")'],
      })
    );

    // Check if submission was saved to database
    expect(mockDb.run).toHaveBeenCalledWith(
      "INSERT INTO submissions (type, language, content) VALUES (?, ?, ?)",
      ["code", "python", 'print("Hello, World!")'],
      expect.any(Function)
    );

    // Check if result was saved to database
    expect(mockDb.run).toHaveBeenCalledWith(
      "INSERT INTO results (submission_id, score, feedback) VALUES (?, ?, ?)",
      expect.arrayContaining([1]),
      expect.any(Function)
    );
  });

  test("GET /:id should return a submission by ID", async () => {
    const response = await request(app).get("/api/grade/code/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("type", "code");
    expect(response.body).toHaveProperty("language", "python");
    expect(response.body).toHaveProperty("content", 'print("Hello, World!")');
    expect(response.body).toHaveProperty("score", 80);

    // Check if database was queried
    expect(mockDb.get).toHaveBeenCalledWith(
      expect.stringContaining("SELECT s.*, r.score, r.feedback"),
      [1],
      expect.any(Function)
    );
  });

  test("POST /submit should return 400 if no code is provided", async () => {
    const response = await request(app).post("/api/grade/code/submit").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "No code provided");
  });

  test("POST /submit should return 400 if language is not supported", async () => {
    const response = await request(app).post("/api/grade/code/submit").send({
      code: 'console.log("Hello, World!")',
      language: "ruby",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Unsupported language");
  });

  test("GET /:id should return 400 if ID is invalid", async () => {
    const response = await request(app).get("/api/grade/code/invalid");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid submission ID");
  });

  test("GET /:id should return 404 if submission is not found", async () => {
    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });

    const response = await request(app).get("/api/grade/code/999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Submission not found");
  });
});
