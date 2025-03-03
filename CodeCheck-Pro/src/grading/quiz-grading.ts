import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { getDatabase } from "../database/setup";

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../../uploads/") });

// Interface for quiz submission
interface QuizSubmission {
  answers: Record<string, string>;
  answerKey?: Record<string, string>;
}

// Interface for grading result
interface GradingResult {
  score: number;
  feedback: string;
  details?: Record<string, { correct: boolean; expected?: string }>;
}

// Interface for database row
interface SubmissionRow {
  id: number;
  type: string;
  language?: string;
  content: string;
  created_at: string;
  score?: number;
  feedback?: string;
}

// Save submission to database
const saveSubmission = async (submission: QuizSubmission): Promise<number> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO submissions (type, content) VALUES (?, ?)",
      ["quiz", JSON.stringify(submission)],
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

// Parse CSV answer key
const parseAnswerKey = (csvContent: string): Record<string, string> => {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const answerKey: Record<string, string> = {};

  for (const record of records) {
    if (record.question_id && record.answer) {
      answerKey[record.question_id] = record.answer;
    }
  }

  return answerKey;
};

// Grade quiz using regex matching
const gradeQuiz = (
  answers: Record<string, string>,
  answerKey: Record<string, string>
): GradingResult => {
  const result: GradingResult = {
    score: 0,
    feedback: "",
    details: {},
  };

  let correctCount = 0;
  const totalQuestions = Object.keys(answerKey).length;

  // Check each answer against the answer key using regex
  for (const questionId in answerKey) {
    if (answers[questionId]) {
      const expected = answerKey[questionId];
      const userAnswer = answers[questionId];

      // Create regex pattern from the expected answer
      let pattern: RegExp;

      // Check if the expected answer is already a regex pattern (starts and ends with /)
      if (
        expected.startsWith("^") &&
        (expected.endsWith("$") || expected.endsWith("$/i"))
      ) {
        // It's already a regex pattern
        pattern = new RegExp(expected, expected.endsWith("/i") ? "i" : "");
      } else {
        // Treat as exact match
        pattern = new RegExp(`^${expected}$`, "i");
      }

      const isCorrect = pattern.test(userAnswer);

      if (isCorrect) {
        correctCount++;
      }

      if (result.details) {
        result.details[questionId] = {
          correct: isCorrect,
          expected: expected,
        };
      }
    } else if (result.details) {
      // No answer provided
      result.details[questionId] = {
        correct: false,
        expected: answerKey[questionId],
      };
    }
  }

  // Calculate score as percentage
  result.score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // Generate feedback
  result.feedback = generateFeedback(result.score);

  return result;
};

// Generate feedback based on score
const generateFeedback = (score: number): string => {
  if (score >= 90) {
    return "Excellent! You have a great understanding of the material.";
  } else if (score >= 80) {
    return "Great job! You have a good grasp of the material.";
  } else if (score >= 70) {
    return "Good work! You understand most of the material, but there's room for improvement.";
  } else if (score >= 50) {
    return "You've got the basics, but need to study more to improve your understanding.";
  } else {
    return "You need to review the material more thoroughly. Don't give up!";
  }
};

// Route to handle quiz submission
router.post("/submit", express.json(), async (req: Request, res: Response) => {
  try {
    const { answers, answerKey } = req.body;

    if (
      !answers ||
      typeof answers !== "object" ||
      Object.keys(answers).length === 0
    ) {
      res.status(400).json({ error: "No answers provided or invalid format" });
      return;
    }

    if (
      !answerKey ||
      typeof answerKey !== "object" ||
      Object.keys(answerKey).length === 0
    ) {
      res
        .status(400)
        .json({ error: "No answer key provided or invalid format" });
      return;
    }

    // Create submission object
    const submission: QuizSubmission = {
      answers,
      answerKey,
    };

    // Save submission to database
    const submissionId = await saveSubmission(submission);

    // Grade quiz
    const result = gradeQuiz(answers, answerKey);

    // Save result to database
    await saveResult(submissionId, result);

    // Return result
    res.json({
      submissionId,
      ...result,
    });
  } catch (error) {
    console.error("Error processing quiz submission:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your submission" });
  }
});

// Route to handle CSV answer key upload
router.post(
  "/upload-key",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Check file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      if (fileExt !== ".csv") {
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Only CSV files are allowed" });
        return;
      }

      // Read and parse CSV file
      const csvContent = fs.readFileSync(req.file.path, "utf8");
      const answerKey = parseAnswerKey(csvContent);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Check if answer key is valid
      if (Object.keys(answerKey).length === 0) {
        res
          .status(400)
          .json({ error: "Invalid CSV format or no questions found" });
        return;
      }

      // Return the parsed answer key
      res.json({ answerKey });
    } catch (error) {
      console.error("Error processing answer key upload:", error);

      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res
        .status(500)
        .json({ error: "An error occurred while processing the answer key" });
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
       WHERE s.id = ? AND s.type = 'quiz'`,
      [submissionId],
      (err, row: SubmissionRow | undefined) => {
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

        // Parse the content JSON
        try {
          row.content = JSON.parse(row.content);
        } catch (e) {
          console.error("Error parsing submission content:", e);
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

export const quizGradingRouter = router;
