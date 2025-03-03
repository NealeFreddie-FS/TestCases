import {
  isCharacterCreationCompleted,
  completeCharacterCreation,
  resetCharacterCreation,
  getCharacterInfo,
  updateCharacterInfo,
  initializeGameState,
  CharacterInfo,
} from "./game-utils";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock window location
const mockWindowLocation = () => {
  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      pathname: "/",
      reload: jest.fn(),
    },
    writable: true,
  });
};

describe("Game Utils", () => {
  beforeEach(() => {
    // Clear localStorage and mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();

    // Reset window.__characterCreationCompleted
    if (typeof window !== "undefined") {
      (window as any).__characterCreationCompleted = undefined;
    }

    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    // Setup window location mock
    mockWindowLocation();
  });

  describe("isCharacterCreationCompleted", () => {
    test("returns false when character creation is not completed", () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(isCharacterCreationCompleted()).toBe(false);
    });

    test("returns true when character creation is completed", () => {
      localStorageMock.getItem.mockReturnValueOnce("true");
      expect(isCharacterCreationCompleted()).toBe(true);
    });
  });

  describe("completeCharacterCreation", () => {
    test("marks character creation as completed and saves character info", () => {
      const characterInfo: CharacterInfo = {
        name: "Test Character",
        class: "warrior",
        level: 1,
      };

      completeCharacterCreation(characterInfo);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "characterCreationCompleted",
        "true"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "characterInfo",
        JSON.stringify(characterInfo)
      );
      expect((window as any).__characterCreationCompleted).toBe(true);
    });
  });

  describe("resetCharacterCreation", () => {
    test("resets character creation state", () => {
      // Setup completed state
      (window as any).__characterCreationCompleted = true;

      resetCharacterCreation();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "characterCreationCompleted"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("characterInfo");
      expect((window as any).__characterCreationCompleted).toBe(false);
    });
  });

  describe("getCharacterInfo", () => {
    test("returns null when no character info exists", () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getCharacterInfo()).toBeNull();
    });

    test("returns character info when it exists", () => {
      const characterInfo: CharacterInfo = {
        name: "Test Character",
        class: "warrior",
        level: 1,
      };

      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify(characterInfo)
      );
      expect(getCharacterInfo()).toEqual(characterInfo);
    });

    test("returns null and logs error when JSON parsing fails", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      localStorageMock.getItem.mockReturnValueOnce("invalid-json");
      expect(getCharacterInfo()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("updateCharacterInfo", () => {
    test("updates character info in localStorage", () => {
      const characterInfo: CharacterInfo = {
        name: "Test Character",
        class: "warrior",
        level: 2,
      };

      updateCharacterInfo(characterInfo);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "characterInfo",
        JSON.stringify(characterInfo)
      );
    });
  });

  describe("initializeGameState", () => {
    test("initializes game state from localStorage", () => {
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation();

      // Mock isCharacterCreationCompleted to return true
      localStorageMock.getItem.mockReturnValueOnce("true");

      initializeGameState();

      expect((window as any).__characterCreationCompleted).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
