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

  test("should initialize with prophetic time values", () => {
    const timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.MIDNIGHT);
    expect(timeState.day).toBe(Day.VOIDUS);
    expect(timeState.week).toBe(Week.ZEPHYRWIND);
    expect(timeState.month).toBe(Month.AMBERFALL);
    expect(timeState.year).toBe(Year.GRIFFIN);
    expect(timeState.century).toBe(Century.SHADOW);
    expect(timeState.totalGameMinutes).toBeGreaterThan(0); // Should be calculated based on the time units
  });

  test("should advance time correctly", () => {
    // Advance 60 minutes (1 hour)
    timeManager.advanceTime(60);
    let timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.ZENITH);
    expect(timeState.day).toBe(Day.LUNARIS);

    // Advance 180 minutes (3 more hours)
    timeManager.advanceTime(180);
    timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.DAWN);
    expect(timeState.day).toBe(Day.SOLARUS);
  });

  test("should advance a full day", () => {
    // Advance 240 minutes (4 hours = 1 day)
    timeManager.advanceTime(240);
    const timeState = timeManager.getTimeState();
    expect(timeState.hour).toBe(Hour.DAWN);
    expect(timeState.day).toBe(Day.SOLARUS);
    expect(timeState.week).toBe(Week.EMBERWEAVE);
  });

  test("should advance a full week", () => {
    // Advance 960 minutes (16 hours = 4 days = 1 week)
    timeManager.advanceTime(960);
    const timeState = timeManager.getTimeState();
    expect(timeState.day).toBe(Day.LUNARIS);
    expect(timeState.week).toBe(Week.AQUAFLOW);
    expect(timeState.month).toBe(Month.FROSTWHISPER);
  });

  test("should advance a full month", () => {
    // Advance 3,840 minutes (64 hours = 16 days = 4 weeks = 1 month)
    timeManager.advanceTime(3840);
    const timeState = timeManager.getTimeState();
    expect(timeState.week).toBe(Week.EMBERWEAVE);
    expect(timeState.month).toBe(Month.BLOOMSURGE);
    expect(timeState.year).toBe(Year.DRAGON);
  });

  test("should advance a full year", () => {
    // Advance 15,360 minutes (256 hours = 64 days = 16 weeks = 4 months = 1 year)
    timeManager.advanceTime(15360);
    const timeState = timeManager.getTimeState();
    expect(timeState.month).toBe(Month.FROSTWHISPER);
    expect(timeState.year).toBe(Year.PHOENIX);
    expect(timeState.century).toBe(Century.PROPHECY);
  });

  test("should advance a full century", () => {
    // Advance 61,440 minutes (1024 hours = 256 days = 64 weeks = 16 months = 4 years = 1 century)
    timeManager.advanceTime(61440);
    const timeState = timeManager.getTimeState();
    expect(timeState.year).toBe(Year.DRAGON);
    expect(timeState.century).toBe(Century.CONQUEST);
  });

  test("should advance time correctly from prophetic time", () => {
    // Store initial time
    const initialTime = timeManager.getTimeState();

    // Advance 60 minutes (1 hour) from prophetic time (MIDNIGHT)
    timeManager.advanceTime(60);
    let timeState = timeManager.getTimeState();

    // Since we start at MIDNIGHT (last hour), advancing 1 hour should wrap to DAWN (first hour)
    // and increment the day
    expect(timeState.hour).toBe(Hour.DAWN);
    expect(timeState.day).not.toBe(initialTime.day); // Day should have changed
  });

  test("should trigger time change callbacks", () => {
    const mockCallback = jest.fn();
    timeManager.onTimeChange(mockCallback);

    timeManager.advanceTime(60);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        hour: Hour.ZENITH,
        day: Day.LUNARIS,
      })
    );
  });

  test("should remove time change callbacks", () => {
    const mockCallback = jest.fn();
    timeManager.onTimeChange(mockCallback);

    // Remove the callback
    timeManager.removeTimeCallback(mockCallback);

    // Advance time
    timeManager.advanceTime(60);

    // Callback should not be called
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test("should set time speed correctly", () => {
    // Mock Date.now
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);

    // Initialize lastUpdateTime
    timeManager.init();

    // Set time speed to 2 minutes per second
    timeManager.setTimeSpeed(2);

    // Mock Date.now returning 2 seconds later
    Date.now = jest.fn(() => 3000);

    // Update
    timeManager.update(1);

    // Should have advanced 4 minutes (2 seconds * 2 minutes per second)
    const timeState = timeManager.getTimeState();
    expect(timeState.totalGameMinutes).toBe(4);

    // Restore Date.now
    Date.now = originalDateNow;
  });

  test("should format time string correctly", () => {
    const formattedTime = timeManager.getFormattedTime();
    expect(formattedTime).toBe(
      `${Hour.DAWN} of ${Day.LUNARIS}, ${Week.EMBERWEAVE} Week, ${Month.FROSTWHISPER} ${Year.DRAGON} Year, ${Century.PROPHECY} Century`
    );
  });

  test("should format prophetic time string correctly", () => {
    const formattedTime = timeManager.getFormattedTime();
    expect(formattedTime).toBe(
      `${Hour.MIDNIGHT} of ${Day.VOIDUS}, ${Week.ZEPHYRWIND} Week, ${Month.AMBERFALL} ${Year.GRIFFIN} Year, ${Century.SHADOW} Century`
    );
  });

  test("should trigger events when conditions are met", () => {
    // Create a test event that triggers at exactly DAWN on LUNARIS day
    const mockEventEffects = jest.fn();
    const testEvent = {
      id: "test_event",
      name: "Test Event",
      description: "A test event",
      condition: (time: { hour: Hour; day: Day }) =>
        time.hour === Hour.DAWN && time.day === Day.LUNARIS,
      effects: mockEventEffects,
    };

    // Register the event
    timeManager.registerEvent(testEvent);

    // Initially, we're at DAWN on LUNARIS, so the event should trigger
    timeManager.advanceTime(0); // Just to trigger the checks
    expect(mockEventEffects).toHaveBeenCalledTimes(1);

    // Advance to ZENITH on LUNARIS
    timeManager.advanceTime(60);
    // Check again, condition no longer met
    timeManager.advanceTime(0);
    // Still called only once
    expect(mockEventEffects).toHaveBeenCalledTimes(1);

    // Advance 3 more hours to get to DAWN on SOLARUS
    timeManager.advanceTime(180);
    // Check again, condition still not met (different day)
    timeManager.advanceTime(0);
    expect(mockEventEffects).toHaveBeenCalledTimes(1);

    // Advance 3 more days (720 minutes) to get to DAWN on LUNARIS again
    timeManager.advanceTime(720);
    // Now the condition should be met again
    timeManager.advanceTime(0);
    expect(mockEventEffects).toHaveBeenCalledTimes(2);
  });

  test("should trigger prophecy awakening event at starting time", () => {
    // Mock callbacks
    const mockEventTrigger = jest.fn();

    // Create a test event that should trigger at the prophetic time
    timeManager.registerEvent({
      id: "test_prophecy",
      name: "Test Prophecy",
      description: "Test description",
      condition: (time) =>
        time.hour === Hour.MIDNIGHT &&
        time.day === Day.VOIDUS &&
        time.week === Week.ZEPHYRWIND &&
        time.month === Month.AMBERFALL &&
        time.year === Year.GRIFFIN &&
        time.century === Century.SHADOW,
      effects: mockEventTrigger,
    });

    // Force an event check (normally called during advanceTime)
    // We need to access the private method using any type
    (timeManager as any).checkTimeEvents();

    // The event should have been triggered
    expect(mockEventTrigger).toHaveBeenCalledTimes(1);
  });

  test("should properly clean up resources", () => {
    const mockCallback = jest.fn();
    timeManager.onTimeChange(mockCallback);

    // Register a mock event
    const mockEventEffects = jest.fn();
    timeManager.registerEvent({
      id: "test_event",
      name: "Test Event",
      description: "A test event",
      condition: () => true,
      effects: mockEventEffects,
    });

    // Destroy the time manager
    timeManager.destroy();

    // Advance time
    timeManager.advanceTime(60);

    // Callback and event should not be triggered
    expect(mockCallback).not.toHaveBeenCalled();
    expect(mockEventEffects).not.toHaveBeenCalled();
  });
});
