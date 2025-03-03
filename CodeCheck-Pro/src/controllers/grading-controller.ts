import { Request, Response } from "express";
import { CodeGrader } from "../grading/code-grading";
import { QuizGrader } from "../grading/quiz-grading";
import { DockerManager } from "../utils/docker-manager";
import { CSVParser, AnswerKey } from "../utils/csv-parser";
import * as fs from "fs";
import * as path from "path";

// Initialize Docker manager
const dockerManager = new DockerManager();

/**
 * Controller for handling grading-related API requests
 */
export class GradingController {
  /**
   * Submit code for grading
   * @param req Express request
   * @param res Express response
   */
  public static async submitCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, language } = req.body;

      // Validate request
      if (!code || !language) {
        res.status(400).json({ error: "Code and language are required" });
        return;
      }

      // Validate language
      if (language !== "python" && language !== "javascript") {
        res.status(400).json({
          error:
            "Unsupported language. Supported languages: python, javascript",
        });
        return;
      }

      // Ensure Docker containers are running
      const containersRunning = await dockerManager.startContainersIfNeeded();
      if (!containersRunning) {
        res.status(500).json({ error: "Failed to start Docker containers" });
        return;
      }

      // Execute code in Docker container
      let output: string;
      if (language === "python") {
        output = await dockerManager.executePythonCode(code);
      } else {
        output = await dockerManager.executeJavaScriptCode(code);
      }

      // Grade code
      const grader = new CodeGrader();
      const result = grader.gradeCode(code, language, output);

      // Store submission in database (simplified for prototype)
      const submissionId = Date.now();

      res.status(200).json({
        submissionId,
        score: result.score,
        feedback: result.feedback,
      });
    } catch (error) {
      console.error("Error grading code:", error);
      res.status(500).json({ error: "Failed to grade code" });
    }
  }

  /**
   * Get a code submission by ID
   * @param req Express request
   * @param res Express response
   */
  public static async getCodeSubmission(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      // In a real application, this would fetch from the database
      // For the prototype, we'll return a mock response
      res.status(200).json({
        id: parseInt(id),
        type: "code",
        language: "python",
        content: 'print("Hello, World!")',
        score: 85,
        feedback: "Great job! Your code runs successfully.",
      });
    } catch (error) {
      console.error("Error getting code submission:", error);
      res.status(500).json({ error: "Failed to get code submission" });
    }
  }

  /**
   * Submit quiz answers for grading
   * @param req Express request
   * @param res Express response
   */
  public static async submitQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { answers, answerKey } = req.body;

      // Validate request
      if (!answers || !answerKey) {
        res.status(400).json({ error: "Answers and answer key are required" });
        return;
      }

      // Grade quiz
      const grader = new QuizGrader();
      const result = grader.gradeQuiz(answers, answerKey);

      // Store submission in database (simplified for prototype)
      const submissionId = Date.now();

      res.status(200).json({
        submissionId,
        score: result.score,
        feedback: result.feedback,
      });
    } catch (error) {
      console.error("Error grading quiz:", error);
      res.status(500).json({ error: "Failed to grade quiz" });
    }
  }

  /**
   * Upload a CSV answer key
   * @param req Express request
   * @param res Express response
   */
  public static async uploadAnswerKey(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Save file to uploads directory
      const filePath = await CSVParser.saveUploadedFile(
        req.file.buffer,
        req.file.originalname
      );

      // Parse CSV file
      const answerKey = await CSVParser.parseAnswerKeyFile(filePath);

      res.status(200).json({ answerKey });
    } catch (error) {
      console.error("Error uploading answer key:", error);
      res.status(500).json({ error: "Failed to upload answer key" });
    }
  }

  /**
   * Get a quiz submission by ID
   * @param req Express request
   * @param res Express response
   */
  public static async getQuizSubmission(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      // In a real application, this would fetch from the database
      // For the prototype, we'll return a mock response
      res.status(200).json({
        id: parseInt(id),
        type: "quiz",
        content: {
          answers: { q1: "Paris", q2: "42" },
          answerKey: { q1: "Paris", q2: "42" },
        },
        score: 100,
        feedback: "Excellent! You have a great understanding of the material.",
      });
    } catch (error) {
      console.error("Error getting quiz submission:", error);
      res.status(500).json({ error: "Failed to get quiz submission" });
    }
  }

  /**
   * Get a sample answer key
   * @param req Express request
   * @param res Express response
   */
  public static getSampleAnswerKey(req: Request, res: Response): void {
    try {
      const sampleFilePath = path.join(
        process.cwd(),
        "public",
        "samples",
        "sample-answer-key.csv"
      );

      if (!fs.existsSync(sampleFilePath)) {
        res.status(404).json({ error: "Sample answer key not found" });
        return;
      }

      const csvData = fs.readFileSync(sampleFilePath, "utf8");
      const answerKey = CSVParser.parseCSVData(csvData);

      res.status(200).json({ answerKey });
    } catch (error) {
      console.error("Error getting sample answer key:", error);
      res.status(500).json({ error: "Failed to get sample answer key" });
    }
  }
}
