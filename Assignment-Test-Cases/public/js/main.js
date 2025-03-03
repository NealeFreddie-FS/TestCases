async function makeRequest(endpoint, data) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    throw new Error("Network error");
  }
}

function showResult(id, result) {
  const errorElement = document.getElementById(`${id}Error`);
  const resultElement = document.getElementById(`${id}Result`);

  errorElement.style.display = "none";
  resultElement.style.display = "block";
  resultElement.textContent = `> Output: ${JSON.stringify(result)}`;
}

function showError(id, error) {
  const errorElement = document.getElementById(`${id}Error`);
  const resultElement = document.getElementById(`${id}Result`);

  errorElement.style.display = "block";
  resultElement.style.display = "none";
  errorElement.textContent = `> Error: ${error}`;
}

async function testSumArray() {
  try {
    const input = document.getElementById("sumArrayInput").value;
    const array = input.split(",").map((num) => parseFloat(num.trim()));
    const { result, error } = await makeRequest("sumArray", { array });

    if (error) {
      showError("sumArray", error);
    } else {
      showResult("sumArray", result);
    }
  } catch (error) {
    showError("sumArray", error.message);
  }
}

async function testReverseString() {
  try {
    const input = document.getElementById("reverseStringInput").value;
    const { result, error } = await makeRequest("reverseString", {
      string: input,
    });

    if (error) {
      showError("reverseString", error);
    } else {
      showResult("reverseString", result);
    }
  } catch (error) {
    showError("reverseString", error.message);
  }
}

async function testIsPalindrome() {
  try {
    const input = document.getElementById("palindromeInput").value;
    const { result, error } = await makeRequest("isPalindrome", {
      string: input,
    });

    if (error) {
      showError("palindrome", error);
    } else {
      showResult("palindrome", result);
    }
  } catch (error) {
    showError("palindrome", error.message);
  }
}

async function testFindMax() {
  try {
    const input = document.getElementById("findMaxInput").value;
    const array = input.split(",").map((num) => parseFloat(num.trim()));
    const { result, error } = await makeRequest("findMax", { array });

    if (error) {
      showError("findMax", error);
    } else {
      showResult("findMax", result);
    }
  } catch (error) {
    showError("findMax", error.message);
  }
}

async function testCapitalizeWords() {
  try {
    const input = document.getElementById("capitalizeWordsInput").value;
    const { result, error } = await makeRequest("capitalizeWords", {
      string: input,
    });

    if (error) {
      showError("capitalizeWords", error);
    } else {
      showResult("capitalizeWords", result);
    }
  } catch (error) {
    showError("capitalizeWords", error.message);
  }
}

async function testCountVowels() {
  try {
    const input = document.getElementById("countVowelsInput").value;
    const { result, error } = await makeRequest("countVowels", {
      string: input,
    });

    if (error) {
      showError("countVowels", error);
    } else {
      showResult("countVowels", result);
    }
  } catch (error) {
    showError("countVowels", error.message);
  }
}

async function testPurgeDuplicates() {
  try {
    const input = document.getElementById("purgeDuplicatesInput").value;
    const array = input.split(",").map((item) => {
      const trimmed = item.trim();
      // Try to parse as number if possible
      const num = parseFloat(trimmed);
      return isNaN(num) ? trimmed : num;
    });
    const { result, error } = await makeRequest("purgeDuplicates", { array });

    if (error) {
      showError("purgeDuplicates", error);
    } else {
      showResult("purgeDuplicates", result);
    }
  } catch (error) {
    showError("purgeDuplicates", error.message);
  }
}
