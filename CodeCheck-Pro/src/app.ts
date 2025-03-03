import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { setupDatabase } from "./database/setup";
import { codeGradingRouter } from "./grading/code-grading";
import { quizGradingRouter } from "./grading/quiz-grading";

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Setup database
setupDatabase().catch((err) => {
  console.error("Failed to setup database:", err);
  process.exit(1);
});

// Routes
app.use("/api/grade/code", codeGradingRouter);
app.use("/api/grade/quiz", quizGradingRouter);

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
