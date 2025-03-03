const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const {
  sumOfArray,
  reverseString,
  isPalindrome,
  findMax,
  capitalizeWords,
  countVowels,
  purgeDuplicates,
} = require("./core/functions");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..")));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// API endpoints for each function
app.post("/api/sumArray", (req, res) => {
  try {
    const result = sumOfArray(req.body.array);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/reverseString", (req, res) => {
  try {
    const result = reverseString(req.body.string);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/isPalindrome", (req, res) => {
  try {
    const result = isPalindrome(req.body.string);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/findMax", (req, res) => {
  try {
    const result = findMax(req.body.array);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/capitalizeWords", (req, res) => {
  try {
    const result = capitalizeWords(req.body.string);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/countVowels", (req, res) => {
  try {
    const result = countVowels(req.body.string);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/purgeDuplicates", (req, res) => {
  try {
    const result = purgeDuplicates(req.body.array);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
