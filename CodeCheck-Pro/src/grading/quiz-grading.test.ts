import request from "supertest";
import express from "express";
import { quizGradingRouter } from "./quiz-grading";
import { getDatabase } from "../database/setup";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Mock dependencies
jest.mock("../database/setup", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock("csv-parse/sync", () => ({
  parse: jest.fn(),
}));

describe("Quiz Grading Router", () => {
  let app: express.Application;
  let mockDb: any;

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
            type: "quiz",
            content: JSON.stringify({
              answers: { q1: "Paris", q2: "42" },
              answerKey: { q1: "Paris", q2: "42" },
            }),
            created_at: new Date().toISOString(),
            score: 100,
            feedback:
              "Excellent! You have a great understanding of the material.",
          });
      }),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Setup mock fs
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      "question_id,answer\nq1,Paris\nq2,42"
    );

    // Setup mock CSV parser
    (parse as jest.Mock).mockReturnValue([
      { question_id: "q1", answer: "Paris" },
      { question_id: "q2", answer: "42" },
    ]);

    // Setup express app with router
    app = express();
    app.use(express.json());
    app.use("/api/grade/quiz", quizGradingRouter);
  });

  test("POST /submit should grade quiz successfully", async () => {
    const response = await request(app)
      .post("/api/grade/quiz/submit")
      .send({
        answers: { q1: "Paris", q2: "42" },
        answerKey: { q1: "Paris", q2: "42" },
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("submissionId", 1);
    expect(response.body).toHaveProperty("score", 100);
    expect(response.body).toHaveProperty("feedback");

    // Check if submission was saved to database
    expect(mockDb.run).toHaveBeenCalledWith(
      "INSERT INTO submissions (type, content) VALUES (?, ?)",
      ["quiz", expect.any(String)],
      expect.any(Function)
    );

    // Check if result was saved to database
    expect(mockDb.run).toHaveBeenCalledWith(
      "INSERT INTO results (submission_id, score, feedback) VALUES (?, ?, ?)",
      expect.arrayContaining([1]),
      expect.any(Function)
    );
  });

  test("POST /upload-key should parse CSV answer key", async () => {
    // Mock the multer middleware
    const mockFile = {
      path: "/tmp/upload.csv",
      originalname: "answers.csv",
    };

    // Create a mock request with file
    app.use("/test-upload", (req, res, next) => {
      req.file = mockFile as any;
      next();
    });

    const response = await request(app).post(
      "/test-upload/api/grade/quiz/upload-key"
    );

    expect(fs.readFileSync).toHaveBeenCalledWith("/tmp/upload.csv", "utf8");
    expect(parse).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/upload.csv");
  });

  test("GET /:id should return a submission by ID", async () => {
    const response = await request(app).get("/api/grade/quiz/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("type", "quiz");
    expect(response.body).toHaveProperty("content");
    expect(response.body.content).toHaveProperty("answers");
    expect(response.body.content).toHaveProperty("answerKey");
    expect(response.body).toHaveProperty("score", 100);

    // Check if database was queried
    expect(mockDb.get).toHaveBeenCalledWith(
      expect.stringContaining("SELECT s.*, r.score, r.feedback"),
      [1],
      expect.any(Function)
    );
  });

  test("POST /submit should return 400 if no answers are provided", async () => {
    const response = await request(app)
      .post("/api/grade/quiz/submit")
      .send({
        answerKey: { q1: "Paris", q2: "42" },
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "No answers provided or invalid format"
    );
  });

  test("POST /submit should return 400 if no answer key is provided", async () => {
    const response = await request(app)
      .post("/api/grade/quiz/submit")
      .send({
        answers: { q1: "Paris", q2: "42" },
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "No answer key provided or invalid format"
    );
  });

  test("GET /:id should return 400 if ID is invalid", async () => {
    const response = await request(app).get("/api/grade/quiz/invalid");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid submission ID");
  });

  test("GET /:id should return 404 if submission is not found", async () => {
    mockDb.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });

    const response = await request(app).get("/api/grade/quiz/999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Submission not found");
  });
});
