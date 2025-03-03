// Core functions for string and array manipulation

// Takes an array of numbers and returns the sum of all elements
function sumOfArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Input must be an array");
  }
  if (arr.length === 0) {
    return 0;
  }
  return arr.reduce((sum, num) => {
    if (typeof num !== "number") {
      throw new TypeError("Array must contain only numbers");
    }
    return sum + num;
  }, 0);
}

// Reverses the input string and returns the reversed result
function reverseString(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  return str.split("").reverse().join("");
}

// Checks if the input string is a palindrome
function isPalindrome(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleanStr === cleanStr.split("").reverse().join("");
}

// Takes an array of numbers and returns the largest number
function findMax(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Input must be an array");
  }
  if (arr.length === 0) {
    throw new Error("Array cannot be empty");
  }
  if (!arr.every((num) => typeof num === "number")) {
    throw new TypeError("Array must contain only numbers");
  }
  return Math.max(...arr);
}

// Capitalizes the first letter of each word in a string
function capitalizeWords(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  return str
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : ""
    )
    .join(" ");
}

// Counts the number of vowels in a string
function countVowels(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  // Replace common number substitutions and then count vowels
  const normalizedStr = str
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/1/g, "i");
  return (normalizedStr.match(/[aeiou]/g) || []).length;
}

// Removes duplicate values from an array
function purgeDuplicates(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Input must be an array");
  }
  return [...new Set(arr)];
}

module.exports = {
  sumOfArray,
  reverseString,
  isPalindrome,
  findMax,
  capitalizeWords,
  countVowels,
  purgeDuplicates,
};
