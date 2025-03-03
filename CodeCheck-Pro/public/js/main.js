document.addEventListener("DOMContentLoaded", function () {
  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");

      // Hide result container when switching tabs
      document.getElementById("result").classList.add("hidden");

      // Hide terminal if it exists
      const terminalContainer = document.getElementById("terminal-container");
      if (terminalContainer) {
        terminalContainer.classList.add("hidden");
      }
    });
  });

  // Code submission form
  const codeForm = document.getElementById("code-form");
  if (codeForm) {
    codeForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const language = document.getElementById("language").value;
      const code = document.getElementById("code").value;

      if (!code.trim()) {
        alert("Please enter some code to grade.");
        return;
      }

      // Simulate API call with mock data
      simulateCodeGrading(language, code);
    });
  }

  // Quiz submission form
  const quizForm = document.getElementById("quiz-form");
  if (quizForm) {
    quizForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const q1Answer = document.getElementById("q1").value;
      const q2Answer = document.getElementById("q2").value;

      if (!q1Answer.trim() || !q2Answer.trim()) {
        alert("Please answer all questions.");
        return;
      }

      // Simulate API call with mock data
      simulateQuizGrading({
        q1: q1Answer,
        q2: q2Answer,
      });
    });
  }

  // Reset demo button
  const resetButton = document.getElementById("reset-demo");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      // Reset forms
      if (codeForm) codeForm.reset();
      if (quizForm) quizForm.reset();

      // Hide result container
      document.getElementById("result").classList.add("hidden");

      // Hide terminal if it exists
      const terminalContainer = document.getElementById("terminal-container");
      if (terminalContainer) {
        terminalContainer.classList.add("hidden");
      }
    });
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      if (!name.trim() || !email.trim() || !message.trim()) {
        alert("Please fill out all fields.");
        return;
      }

      // Simulate form submission
      alert("Thank you for your message! We will get back to you soon.");
      contactForm.reset();
    });
  }

  // Initialize terminal container if it doesn't exist
  if (!document.getElementById("terminal-container")) {
    createTerminalContainer();
  }
});

// Create terminal container
function createTerminalContainer() {
  const demoContainer = document.querySelector(".demo-container");
  if (!demoContainer) return;

  const terminalContainer = document.createElement("div");
  terminalContainer.id = "terminal-container";
  terminalContainer.classList.add("terminal-container", "hidden");

  terminalContainer.innerHTML = `
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="close"></span>
          <span class="minimize"></span>
          <span class="maximize"></span>
        </div>
        <div class="terminal-title">CodeCheck Pro - Code Execution</div>
      </div>
      <div class="terminal-content">
        <div class="terminal-output" id="terminal-output">
          <div class="prompt">$ <span id="command-text">python code_sample.py</span></div>
          <div id="execution-output">
            <!-- Execution output will be displayed here -->
            Running code...<span class="cursor"></span>
          </div>
        </div>
      </div>
    </div>
  `;

  demoContainer.appendChild(terminalContainer);
}

// Simulate code execution in terminal
function simulateTerminalExecution(code, language) {
  const terminalContainer = document.getElementById("terminal-container");
  if (!terminalContainer) return;

  // Show terminal
  terminalContainer.classList.remove("hidden");

  const outputElement = document.getElementById("execution-output");
  const terminalTitle = document.querySelector(".terminal-title");
  const commandText = document.getElementById("command-text");

  // Update terminal title and command based on language
  terminalTitle.textContent = `CodeCheck Pro - ${
    language.charAt(0).toUpperCase() + language.slice(1)
  } Execution`;
  commandText.textContent =
    language === "python" ? "python code_sample.py" : "node code_sample.js";

  // Show loading state
  outputElement.innerHTML = `Running ${language} code...<span class="cursor"></span>`;

  // Simulate execution delay
  setTimeout(() => {
    let output = "";
    let hasError = false;

    if (language === "python") {
      if (code.includes("print(") && !code.includes("syntax error")) {
        const match = code.match(/print\(['"](.*)['"]\)/);
        output = match ? match[1] : "Execution successful!";
      } else {
        output = "Error: Invalid syntax";
        hasError = true;
      }
    } else if (language === "javascript") {
      if (code.includes("console.log(") && !code.includes("syntax error")) {
        const match = code.match(/console\.log\(['"](.*)['"]\)/);
        output = match ? match[1] : "Execution successful!";
      } else {
        output = "Error: Invalid syntax";
        hasError = true;
      }
    }

    // Display execution results
    outputElement.innerHTML = `
      <div class="${hasError ? "fail" : ""}">${output}</div>
      <div class="test-suite">
        <div class="test-name">Running test suite...</div>
        <div class="test-result pass">✓ Test 1: Basic functionality</div>
        <div class="test-result ${hasError ? "fail" : "pass"}">${
      hasError ? "✗" : "✓"
    } Test 2: Output formatting</div>
        <div class="test-result ${code.length > 50 ? "pass" : "fail"}">${
      code.length > 50 ? "✓" : "✗"
    } Test 3: Code complexity</div>
        <div class="test-result pass">✓ Test 4: Performance check</div>
      </div>
      <div class="prompt">$ <span class="cursor"></span></div>
    `;
  }, 1500);
}

// Simulate code grading API call
function simulateCodeGrading(language, code) {
  // Show loading state
  const resultContainer = document.getElementById("result");
  resultContainer.classList.remove("hidden");

  const scoreElement = document.querySelector(".score-value");
  const feedbackElement = document.querySelector(".feedback p");

  scoreElement.textContent = "Grading...";
  feedbackElement.textContent = "Please wait while we grade your code...";

  // Simulate terminal execution
  simulateTerminalExecution(code, language);

  // Simulate API delay
  setTimeout(() => {
    let score, feedback;

    // Simple mock grading logic
    if (language === "python") {
      if (code.includes("print(") && !code.includes("syntax error")) {
        score = 85;
        feedback =
          "Great job! Your code runs successfully. Your solution is efficient and follows good practices.";
      } else {
        score = 60;
        feedback =
          "Your code needs some work. Make sure you're using the print function correctly.";
      }
    } else if (language === "javascript") {
      if (code.includes("console.log(") && !code.includes("syntax error")) {
        score = 90;
        feedback =
          "Excellent! Your code is working perfectly. Your solution is elegant and efficient.";
      } else {
        score = 65;
        feedback =
          "Your code needs improvement. Check that you're using console.log correctly.";
      }
    }

    // Update UI with results
    scoreElement.textContent = `${score}%`;
    feedbackElement.textContent = feedback;
  }, 3000);
}

// Simulate quiz grading API call
function simulateQuizGrading(answers) {
  // Show loading state
  const resultContainer = document.getElementById("result");
  resultContainer.classList.remove("hidden");

  const scoreElement = document.querySelector(".score-value");
  const feedbackElement = document.querySelector(".feedback p");

  scoreElement.textContent = "Grading...";
  feedbackElement.textContent = "Please wait while we grade your quiz...";

  // Simulate API delay
  setTimeout(() => {
    // Mock answer key
    const answerKey = {
      q1: "Paris",
      q2: "42",
    };

    // Grade answers
    let correctCount = 0;
    const totalQuestions = Object.keys(answerKey).length;

    if (answers.q1.toLowerCase() === answerKey.q1.toLowerCase()) {
      correctCount++;
    }

    if (answers.q2 === answerKey.q2) {
      correctCount++;
    }

    // Calculate score
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Generate feedback
    let feedback;
    if (score === 100) {
      feedback = "Excellent! You have a great understanding of the material.";
    } else if (score >= 50) {
      feedback =
        "Good work! You understand some of the material, but there's room for improvement.";
    } else {
      feedback =
        "You need to review the material more thoroughly. Don't give up!";
    }

    // Update UI with results
    scoreElement.textContent = `${score}%`;
    feedbackElement.textContent = feedback;
  }, 1500);
}
