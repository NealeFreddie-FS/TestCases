const {
  sumOfArray,
  reverseString,
  isPalindrome,
  findMax,
  capitalizeWords,
  countVowels,
  purgeDuplicates,
} = require("../functions");

describe("sumOfArray", () => {
  test("1. should sum an array of positive integers", () => {
    expect(sumOfArray([1, 2, 3, 4, 5])).toBe(15);
  });

  test("2. should handle negative and decimal numbers", () => {
    expect(sumOfArray([-1.5, 2.25, -3.75, 4])).toBe(1);
  });

  test("3. should return 0 for empty array", () => {
    expect(sumOfArray([])).toBe(0);
  });

  test("4. should handle array with single number", () => {
    expect(sumOfArray([42])).toBe(42);
  });

  test("5. should throw error for non-number elements", () => {
    expect(() => sumOfArray([1, "two", 3])).toThrow(TypeError);
  });
});

describe("reverseString", () => {
  test("1. should reverse a simple word", () => {
    expect(reverseString("hello")).toBe("olleh");
  });

  test("2. should handle sentence with spaces", () => {
    expect(reverseString("hello world")).toBe("dlrow olleh");
  });

  test("3. should handle special characters and numbers", () => {
    expect(reverseString("Hello123!@#")).toBe("#@!321olleH");
  });

  test("4. should handle empty string", () => {
    expect(reverseString("")).toBe("");
  });

  test("5. should handle palindrome", () => {
    expect(reverseString("radar")).toBe("radar");
  });
});

describe("isPalindrome", () => {
  test("1. should identify simple palindrome", () => {
    expect(isPalindrome("radar")).toBe(true);
  });

  test("2. should handle sentence with spaces and punctuation", () => {
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
  });

  test("3. should handle mixed case", () => {
    expect(isPalindrome("RaCeCaR")).toBe(true);
  });

  test("4. should identify non-palindrome", () => {
    expect(isPalindrome("hello world")).toBe(false);
  });

  test("5. should handle numbers and special characters", () => {
    expect(isPalindrome("12321")).toBe(true);
  });
});

describe("findMax", () => {
  test("1. should find maximum in positive numbers", () => {
    expect(findMax([1, 3, 5, 2, 4])).toBe(5);
  });

  test("2. should handle negative numbers", () => {
    expect(findMax([-5, -2, -8, -1])).toBe(-1);
  });

  test("3. should handle mixed positive and negative numbers", () => {
    expect(findMax([-10, 5, 0, -3, 8])).toBe(8);
  });

  test("4. should handle decimal numbers", () => {
    expect(findMax([1.5, 2.7, 2.3, 1.9])).toBe(2.7);
  });

  test("5. should handle array with single number", () => {
    expect(findMax([42])).toBe(42);
  });
});

describe("capitalizeWords", () => {
  test("1. should capitalize each word in simple sentence", () => {
    expect(capitalizeWords("hello world")).toBe("Hello World");
  });

  test("2. should handle already capitalized words", () => {
    expect(capitalizeWords("Hello World")).toBe("Hello World");
  });

  test("3. should handle multiple spaces between words", () => {
    expect(capitalizeWords("hello   beautiful   world")).toBe(
      "Hello   Beautiful   World"
    );
  });

  test("4. should handle special characters and numbers", () => {
    expect(capitalizeWords("hello2 world! test")).toBe("Hello2 World! Test");
  });

  test("5. should handle single letter words", () => {
    expect(capitalizeWords("a b c test")).toBe("A B C Test");
  });
});

describe("countVowels", () => {
  test("1. should count vowels in simple word", () => {
    expect(countVowels("hello")).toBe(2);
  });

  test("2. should handle uppercase vowels", () => {
    expect(countVowels("hEllO wOrld")).toBe(3);
  });

  test("3. should handle string with no vowels", () => {
    expect(countVowels("rhythm")).toBe(0);
  });

  test("4. should handle string with all vowels", () => {
    expect(countVowels("AeIoU")).toBe(5);
  });

  test("5. should handle string with numbers and special characters", () => {
    expect(countVowels("h3ll0 w@rld!")).toBe(2);
  });
});

describe("purgeDuplicates", () => {
  test("1. should remove duplicate numbers", () => {
    expect(purgeDuplicates([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test("2. should handle mixed types", () => {
    expect(purgeDuplicates([1, "2", 1, "2", true, true])).toEqual([
      1,
      "2",
      true,
    ]);
  });

  test("3. should handle array with no duplicates", () => {
    expect(purgeDuplicates([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test("4. should handle array with all duplicates", () => {
    expect(purgeDuplicates([1, 1, 1, 1])).toEqual([1]);
  });

  test("5. should handle complex objects and arrays", () => {
    const obj = { a: 1 };
    const arr = [1];
    expect(purgeDuplicates([obj, arr, obj, arr, "test", "test"])).toEqual([
      obj,
      arr,
      "test",
    ]);
  });
});
