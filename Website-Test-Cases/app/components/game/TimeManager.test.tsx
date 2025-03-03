import {
  TimeManager,
  Hour,
  Day,
  Week,
  Month,
  Year,
  Century,
  TimeState,
} from "../../app/components/game/managers/TimeManager";

// Mock the GameEngine
const mockGameEngine = {
  world: {
    update: jest.fn(),
    applyTimeEffects: jest.fn(),
  },
  callbacks: {
    onGameStateChange: jest.fn(),
  },
};

describe("TimeManager", () => {
  let timeManager: TimeManager;

  beforeEach(() => {
    jest.clearAllMocks();
    timeManager = new TimeManager(mockGameEngine as any);
  });

  test("should initialize with default values", () => {
    const timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.DAWN);
    expect(timeState.day).toBe(Day.LUNARIS);
    expect(timeState.week).toBe(Week.EMBERWEAVE);
    expect(timeState.month).toBe(Month.FROSTWHISPER);
    expect(timeState.year).toBe(Year.DRAGON);
    expect(timeState.century).toBe(Century.PROPHECY);
    expect(timeState.totalGameMinutes).toBe(0);
  });

  test("should advance time correctly", () => {
    // Advance 60 minutes (1 hour)
    timeManager.advanceTime(60);
    let timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.ZENITH);
    expect(timeState.day).toBe(Day.LUNARIS);
  });

  test("should format time string correctly", () => {
    const formattedTime = timeManager.getFormattedTime();
    expect(formattedTime).toBe(
      `${Hour.DAWN} of ${Day.LUNARIS}, ${Week.EMBERWEAVE} Week, ${Month.FROSTWHISPER} ${Year.DRAGON} Year, ${Century.PROPHECY} Century`
    );
  });
});
