# CodeCheck Pro

CodeCheck Pro is a lightweight, easy-to-use automated grading system for code assignments and quizzes. This prototype demonstrates the core functionality using free-tier tools and open-source frameworks.

## Features

- **Code Grading**: Automatically grade Python and JavaScript code submissions with Docker-based sandboxing for security.
- **Quiz Grading**: Grade quizzes using regex pattern matching with support for CSV upload of answer keys.
- **Smart Feedback**: Provide detailed, rule-based feedback to help students understand their mistakes and improve.
- **Secure Execution**: Run student code in isolated Docker containers to prevent security issues and system damage.

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Database**: SQLite (file-based)
- **Code Execution**: Docker Community Edition
- **Frontend**: HTML/CSS/JavaScript
- **Testing**: Jest with ts-jest for TypeScript

## 5-Minute Setup Guide

### Prerequisites

- Node.js (v14 or higher)
- Docker Desktop (Community Edition)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/codecheck-pro.git
   cd codecheck-pro
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the TypeScript code:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Docker Setup

Make sure Docker Desktop is running and pull the required images:

```bash
docker pull python:3.9-slim
docker pull node:18
```

## Project Structure

```
codecheck-pro/
├── src/                  # Source code
│   ├── app.ts            # Main application file
│   ├── database/         # Database setup and utilities
│   └── grading/          # Grading logic for code and quizzes
├── public/               # Static files
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── images/           # Images and icons
├── dist/                 # Compiled JavaScript (generated)
├── data/                 # SQLite database files (generated)
├── temp/                 # Temporary files for code execution
├── uploads/              # Uploaded files (CSV, code files)
└── tests/                # Test files
```

## API Endpoints

### Code Grading

- `POST /api/grade/code/submit`: Submit code for grading

  - Body: `{ "code": "print('Hello, World!')", "language": "python" }`
  - Response: `{ "submissionId": 1, "score": 85, "feedback": "Great job!" }`

- `GET /api/grade/code/:id`: Get a code submission by ID
  - Response: `{ "id": 1, "type": "code", "language": "python", "content": "...", "score": 85, "feedback": "..." }`

### Quiz Grading

- `POST /api/grade/quiz/submit`: Submit quiz answers for grading

  - Body: `{ "answers": { "q1": "Paris", "q2": "42" }, "answerKey": { "q1": "Paris", "q2": "42" } }`
  - Response: `{ "submissionId": 1, "score": 100, "feedback": "Excellent!" }`

- `POST /api/grade/quiz/upload-key`: Upload a CSV answer key

  - Form data: `file` (CSV file)
  - Response: `{ "answerKey": { "q1": "Paris", "q2": "42" } }`

- `GET /api/grade/quiz/:id`: Get a quiz submission by ID
  - Response: `{ "id": 1, "type": "quiz", "content": { "answers": {...}, "answerKey": {...} }, "score": 100, "feedback": "..." }`

## Running Tests

```bash
npm test
```

## License

MIT

## Contact

For questions or feedback, please contact info@codecheckpro.com
