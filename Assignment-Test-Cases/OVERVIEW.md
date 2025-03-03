# Function Testing Interface

## Overview

This project implements a modern, terminal-style web interface for testing and validating various JavaScript utility functions. It's designed as an interactive learning tool that demonstrates function behavior, input validation, and error handling in a user-friendly environment.

## Core Features

### 1. Interactive Web Interface

- Terminal-like design with Mac OS-style window controls
- Real-time function testing and result display
- Error handling with clear visual feedback
- Modern, responsive layout
- Keyboard-friendly input fields

### 2. Core Functions

#### `sumOfArray(arr)`

Calculates the sum of all numbers in an array.

- Input: Array of numbers
- Output: Sum of all elements
- Validation:
  - Ensures input is an array
  - Validates all elements are numbers
  - Handles empty arrays, returning 0
  - Supports both integers and decimals
  - Handles positive and negative numbers

#### `reverseString(str)`

Reverses the characters in a string.

- Input: String
- Output: Reversed string
- Features:
  - Preserves special characters
  - Maintains character case
  - Handles spaces and punctuation
  - Supports empty strings
  - Works with alphanumeric input

#### `isPalindrome(str)`

Checks if a string reads the same forwards and backwards.

- Input: String
- Output: Boolean
- Features:
  - Case-insensitive comparison
  - Ignores spaces and punctuation
  - Supports alphanumeric characters
  - Handles special characters
  - Works with numbers as strings

#### `findMax(arr)`

Finds the largest number in an array.

- Input: Array of numbers
- Output: Largest number
- Features:
  - Handles positive and negative numbers
  - Supports decimal numbers
  - Works with single-element arrays
  - Validates array input
  - Ensures numeric elements

#### `capitalizeWords(str)`

Capitalizes the first letter of each word in a string.

- Input: String
- Output: String with capitalized words
- Features:
  - Preserves existing capitalization
  - Maintains multiple spaces
  - Handles special characters
  - Supports single-letter words
  - Works with numbers in strings

#### `countVowels(str)`

Counts the number of vowels in a string.

- Input: String
- Output: Number of vowels
- Features:
  - Case-insensitive counting
  - Handles special characters
  - Supports empty strings
  - Works with mixed case
  - Ignores non-alphabetic characters

#### `purgeDuplicates(arr)`

Removes duplicate values from an array.

- Input: Array of any type
- Output: Array with unique values
- Features:
  - Supports mixed data types
  - Preserves order of first occurrence
  - Handles complex objects
  - Works with nested arrays
  - Maintains reference equality

## Technical Implementation

### Architecture

```
project/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── core/
│   │   │   ├── __tests__/
│   │   │   │   └── functions.test.js
│   │   │   └── functions.js
│   │   ├── main.js
│   │   └── server.js
│   └── index.html
├── package.json
└── OVERVIEW.md
```

### Technologies Used

- **Frontend:**

  - HTML5
  - CSS3 (with modern flexbox layout)
  - Vanilla JavaScript (ES6+)
  - Fetch API for AJAX requests

- **Backend:**

  - Node.js
  - Express.js
  - Body Parser middleware

- **Testing:**
  - Jest testing framework
  - Comprehensive test suites
  - Edge case coverage

### Testing Coverage

Each function includes 5 comprehensive test cases covering:

- Standard usage
- Edge cases
- Error conditions
- Special inputs
- Type validation

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open browser and navigate to:
   ```
   http://localhost:3000
   ```

### Running Tests

Execute the test suite:

```bash
npm test
```

## Best Practices Implemented

### Code Quality

- Consistent error handling
- Input validation
- Type checking
- Clear function documentation
- Meaningful variable names
- DRY (Don't Repeat Yourself) principles

### Testing

- Isolated test cases
- Comprehensive coverage
- Clear test descriptions
- Edge case handling
- Error condition testing

### User Interface

- Responsive design
- Clear feedback
- Error messages
- Loading states
- Intuitive layout

## Future Enhancements

1. Additional utility functions
2. Command history in terminal
3. Function autocomplete
4. Save/load test cases
5. Export test results
6. Custom theme support
7. Keyboard shortcuts
8. Batch testing capability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
