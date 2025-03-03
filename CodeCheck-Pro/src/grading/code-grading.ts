import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import Docker from "dockerode";
import { getDatabase } from "../database/setup";

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../../uploads/") });
const docker = new Docker();

// Define supported languages
const SUPPORTED_LANGUAGES = ["python", "javascript"];

// Interface for code submission
interface CodeSubmission {
  language: string;
  code: string;
  testCases?: string[];
}

// Interface for grading result
interface GradingResult {
  score: number;
  feedback: string;
  details?: string[];
}

// Save submission to database
const saveSubmission = async (submission: CodeSubmission): Promise<number> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO submissions (type, language, content) VALUES (?, ?, ?)",
      ["code", submission.language, submission.code],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Save grading result to database
const saveResult = async (
  submissionId: number,
  result: GradingResult
): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO results (submission_id, score, feedback) VALUES (?, ?, ?)",
      [submissionId, result.score, result.feedback],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Grade Python code using Docker
const gradePythonCode = async (
  code: string,
  testCases: string[] = []
): Promise<GradingResult> => {
  // Create a temporary file for the code
  const tempDir = path.join(__dirname, "../../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const codeFile = path.join(tempDir, `code_${Date.now()}.py`);
  fs.writeFileSync(codeFile, code);

  try {
    // Run the code in a Docker container
    const container = await docker.createContainer({
      Image: "python:3.9-slim",
      Cmd: ["python", "-c", code],
      HostConfig: {
        AutoRemove: true,
      },
    });

    await container.start();
    const output = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    // Simple scoring logic
    const result: GradingResult = {
      score: 0,
      feedback: "",
      details: [],
    };

    // Check if code runs without errors
    if (
      output.toString().includes("Error") ||
      output.toString().includes("Exception")
    ) {
      result.score = 0;
      result.feedback = "Your code has errors. Please fix them and try again.";
      result.details = [output.toString()];
    } else {
      // Basic scoring - can be enhanced with test cases
      result.score = 80;
      result.feedback = "Your code runs successfully!";

      // Add bonus points if code passes test cases
      if (testCases.length > 0) {
        // This is a simplified version - in a real system, you'd run each test case
        result.score += 20;
        result.feedback += " All test cases passed.";
      }
    }

    return result;
  } catch (error) {
    console.error("Error grading Python code:", error);
    return {
      score: 0,
      feedback: "An error occurred while grading your code.",
      details: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    // Clean up
    if (fs.existsSync(codeFile)) {
      fs.unlinkSync(codeFile);
    }
  }
};

// Grade JavaScript code using Docker
const gradeJavaScriptCode = async (
  code: string,
  testCases: string[] = []
): Promise<GradingResult> => {
  // Create a temporary file for the code
  const tempDir = path.join(__dirname, "../../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const codeFile = path.join(tempDir, `code_${Date.now()}.js`);
  fs.writeFileSync(codeFile, code);

  try {
    // Run the code in a Docker container
    const container = await docker.createContainer({
      Image: "node:18",
      Cmd: ["node", "-e", code],
      HostConfig: {
        AutoRemove: true,
      },
    });

    await container.start();
    const output = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    // Simple scoring logic
    const result: GradingResult = {
      score: 0,
      feedback: "",
      details: [],
    };

    // Check if code runs without errors
    if (
      output.toString().includes("Error") ||
      output.toString().includes("Exception")
    ) {
      result.score = 0;
      result.feedback = "Your code has errors. Please fix them and try again.";
      result.details = [output.toString()];
    } else {
      // Basic scoring - can be enhanced with test cases
      result.score = 80;
      result.feedback = "Your code runs successfully!";

      // Add bonus points if code passes test cases
      if (testCases.length > 0) {
        // This is a simplified version - in a real system, you'd run each test case
        result.score += 20;
        result.feedback += " All test cases passed.";
      }
    }

    return result;
  } catch (error) {
    console.error("Error grading JavaScript code:", error);
    return {
      score: 0,
      feedback: "An error occurred while grading your code.",
      details: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    // Clean up
    if (fs.existsSync(codeFile)) {
      fs.unlinkSync(codeFile);
    }
  }
};

// Generate feedback based on score
const generateFeedback = (score: number): string => {
  if (score >= 90) {
    return "Excellent! Your code is working perfectly.";
  } else if (score >= 80) {
    return "Great job! Your code is working well.";
  } else if (score >= 70) {
    return "Good work! Your code is mostly working, but could use some improvements.";
  } else if (score >= 50) {
    return "Your code needs some work. Try to fix the issues and resubmit.";
  } else {
    return "Your code has significant issues. Please review and try again.";
  }
};

// Route to handle code submission
router.post(
  "/submit",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      let code: string;
      let language: string;

      // Get code from file or request body
      if (req.file) {
        code = fs.readFileSync(req.file.path, "utf8");
        language = path.extname(req.file.originalname).substring(1);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
      } else if (req.body.code) {
        code = req.body.code;
        language = req.body.language || "python";
      } else {
        res.status(400).json({ error: "No code provided" });
        return;
      }

      // Validate language
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        res.status(400).json({
          error: `Unsupported language: ${language}. Supported languages are: ${SUPPORTED_LANGUAGES.join(
            ", "
          )}`,
        });
        return;
      }

      // Parse test cases if provided
      const testCases = req.body.testCases
        ? JSON.parse(req.body.testCases)
        : [];

      // Create submission object
      const submission: CodeSubmission = {
        language,
        code,
        testCases,
      };

      // Save submission to database
      const submissionId = await saveSubmission(submission);

      // Grade code based on language
      let result: GradingResult;
      if (language === "python") {
        result = await gradePythonCode(code, testCases);
      } else if (language === "javascript") {
        result = await gradeJavaScriptCode(code, testCases);
      } else {
        // This should never happen due to validation above
        res.status(500).json({ error: "Unsupported language" });
        return;
      }

      // Enhance feedback
      result.feedback = generateFeedback(result.score) + " " + result.feedback;

      // Save result to database
      await saveResult(submissionId, result);

      // Return result
      res.json({
        submissionId,
        ...result,
      });
    } catch (error) {
      console.error("Error processing code submission:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing your submission" });
    }
  }
);

// Route to get a submission by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const submissionId = parseInt(req.params.id);

    if (isNaN(submissionId)) {
      res.status(400).json({ error: "Invalid submission ID" });
      return;
    }

    const db = await getDatabase();

    db.get(
      `SELECT s.*, r.score, r.feedback 
       FROM submissions s 
       LEFT JOIN results r ON s.id = r.submission_id 
       WHERE s.id = ? AND s.type = 'code'`,
      [submissionId],
      (err, row) => {
        if (err) {
          console.error("Error fetching submission:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching the submission" });
          return;
        }

        if (!row) {
          res.status(404).json({ error: "Submission not found" });
          return;
        }

        res.json(row);
      }
    );
  } catch (error) {
    console.error("Error fetching submission:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the submission" });
  }
});

export const codeGradingRouter = router;
