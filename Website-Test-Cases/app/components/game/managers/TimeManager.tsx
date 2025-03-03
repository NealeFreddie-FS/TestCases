import { GameEngine } from "../GameEngine";

// Fantasy time enums
export enum Hour {
  DAWN = "Mysthaven Dawn", // Morning
  ZENITH = "Solarglow Zenith", // Afternoon
  DUSK = "Shadowfall Dusk", // Evening
  MIDNIGHT = "Voidwhisper Midnight", // Night
}

export enum Day {
  LUNARIS = "Lunaris", // Moon day
  SOLARUS = "Solarus", // Sun day
  STELLARIS = "Stellaris", // Star day
  VOIDUS = "Voidus", // Void day
}

export enum Week {
  EMBERWEAVE = "Emberweave", // Week of fire
  AQUAFLOW = "Aquaflow", // Week of water
  TERRAGRIP = "Terragrip", // Week of earth
  ZEPHYRWIND = "Zephyrwind", // Week of air
}

export enum Month {
  FROSTWHISPER = "Frostwhisper", // Winter month
  BLOOMSURGE = "Bloomsurge", // Spring month
  SOLARBURST = "Solarburst", // Summer month
  AMBERFALL = "Amberfall", // Autumn month
}

export enum Year {
  DRAGON = "Dragon", // Year of Dragons
  PHOENIX = "Phoenix", // Year of Rebirth
  HYDRA = "Hydra", // Year of Many Paths
  GRIFFIN = "Griffin", // Year of Vigilance
}

export enum Century {
  PROPHECY = "Prophecy", // Century of Divination
  CONQUEST = "Conquest", // Century of Expansion
  WONDER = "Wonder", // Century of Discovery
  SHADOW = "Shadow", // Century of Darkness
}

// Visual environment settings for different times of day
export const timeEnvironments = {
  [Hour.DAWN]: {
    skyColor: 0xffe8c4, // Warm sunrise
    lightIntensity: 0.7,
    fogDensity: 0.3,
    ambientSounds: ["birds", "gentleWind"],
  },
  [Hour.ZENITH]: {
    skyColor: 0x87ceeb, // Bright day
    lightIntensity: 1.0,
    fogDensity: 0.1,
    ambientSounds: ["birds", "villageNoises"],
  },
  [Hour.DUSK]: {
    skyColor: 0xff7f50, // Sunset orange
    lightIntensity: 0.6,
    fogDensity: 0.4,
    ambientSounds: ["crickets", "owls"],
  },
  [Hour.MIDNIGHT]: {
    skyColor: 0x0a1a3f, // Deep night
    lightIntensity: 0.3,
    fogDensity: 0.7,
    ambientSounds: ["wolves", "wind"],
  },
};

// Special events that can occur on specific time combinations
export interface TimeEvent {
  id: string;
  name: string;
  description: string;
  condition: (time: TimeState) => boolean;
  effects: (engine: GameEngine) => void;
}

export interface TimeState {
  hour: Hour;
  day: Day;
  week: Week;
  month: Month;
  year: Year;
  century: Century;
  totalGameMinutes: number;
}

export class TimeManager {
  private engine: GameEngine;
  private timeState: TimeState;
  private realTimeToGameTimeRatio: number; // How many game minutes pass per real second
  private events: TimeEvent[] = [];
  private timeCallbacks: ((time: TimeState) => void)[] = [];
  private lastUpdateTime: number = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;

    // Initialize at specific prophecy time: MIDNIGHT of VOIDUS, ZEPHYRWIND Week, AMBERFALL Month, GRIFFIN Year, SHADOW Century
    // Previously: Initialize at dawn of the first day
    this.timeState = {
      hour: Hour.MIDNIGHT, // 4th hour
      day: Day.VOIDUS, // 4th day
      week: Week.ZEPHYRWIND, // 4th week
      month: Month.AMBERFALL, // 4th month
      year: Year.GRIFFIN, // 4th year
      century: Century.SHADOW, // 4th century
      totalGameMinutes: 0, // Will be calculated below
    };

    // Calculate the total minutes this time represents
    // Constants for time calculations
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 4;
    const DAYS_PER_WEEK = 4;
    const WEEKS_PER_MONTH = 4;
    const MONTHS_PER_YEAR = 4;
    const YEARS_PER_CENTURY = 4;

    // For the 4th hour (MIDNIGHT) of 4th day (VOIDUS) of 4th week (ZEPHYRWIND) of 4th month (AMBERFALL) of 4th year (GRIFFIN) of 4th century (SHADOW)
    // Hours: 4-1 (zero-indexed)
    // Days: 4-1
    // Weeks: 4-1
    // Months: 4-1
    // Years: 4-1
    // Centuries: 4-1

    const totalHours =
      3 +
      3 * HOURS_PER_DAY +
      3 * HOURS_PER_DAY * DAYS_PER_WEEK +
      3 * HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_MONTH +
      3 * HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_MONTH * MONTHS_PER_YEAR +
      3 *
        HOURS_PER_DAY *
        DAYS_PER_WEEK *
        WEEKS_PER_MONTH *
        MONTHS_PER_YEAR *
        YEARS_PER_CENTURY;

    this.timeState.totalGameMinutes = totalHours * MINUTES_PER_HOUR;

    console.log(`Starting at prophetic time: ${this.getFormattedTime()}`);
    console.log(`Total game minutes: ${this.timeState.totalGameMinutes}`);

    // By default, 1 real second = 1 game minute
    this.realTimeToGameTimeRatio = 1;

    // Register default events
    this.registerDefaultEvents();
  }

  public init(): void {
    // Add to game engine's update loop
    this.lastUpdateTime = Date.now();
    console.log("TimeManager initialized");
  }

  // Called every frame from the game engine
  public update(delta: number): void {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    // Update game time based on real time and ratio
    const gameMinutesElapsed = elapsedSeconds * this.realTimeToGameTimeRatio;
    this.advanceTime(gameMinutesElapsed);
  }

  // Advance time by specified game minutes
  public advanceTime(gameMinutes: number): void {
    this.timeState.totalGameMinutes += gameMinutes;

    // Calculate the new time state
    this.calculateTimeState();

    // Notify listeners of time change
    this.notifyTimeChange();

    // Check for events
    this.checkTimeEvents();
  }

  // Calculate the new time state based on total minutes
  private calculateTimeState(): void {
    // Constants for time calculations
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 4;
    const DAYS_PER_WEEK = 4;
    const WEEKS_PER_MONTH = 4;
    const MONTHS_PER_YEAR = 4;
    const YEARS_PER_CENTURY = 4;

    // Calculate each time unit
    const totalHours = Math.floor(
      this.timeState.totalGameMinutes / MINUTES_PER_HOUR
    );
    const totalDays = Math.floor(totalHours / HOURS_PER_DAY);
    const totalWeeks = Math.floor(totalDays / DAYS_PER_WEEK);
    const totalMonths = Math.floor(totalWeeks / WEEKS_PER_MONTH);
    const totalYears = Math.floor(totalMonths / MONTHS_PER_YEAR);
    const totalCenturies = Math.floor(totalYears / YEARS_PER_CENTURY);

    // Calculate current values with modulo
    const hourIndex = totalHours % HOURS_PER_DAY;
    const dayIndex = totalDays % DAYS_PER_WEEK;
    const weekIndex = totalWeeks % WEEKS_PER_MONTH;
    const monthIndex = totalMonths % MONTHS_PER_YEAR;
    const yearIndex = totalYears % YEARS_PER_CENTURY;
    const centuryIndex = totalCenturies % 4; // 4 centuries in the cycle

    // Update time state with new values
    this.timeState.hour = Object.values(Hour)[hourIndex];
    this.timeState.day = Object.values(Day)[dayIndex];
    this.timeState.week = Object.values(Week)[weekIndex];
    this.timeState.month = Object.values(Month)[monthIndex];
    this.timeState.year = Object.values(Year)[yearIndex];
    this.timeState.century = Object.values(Century)[centuryIndex];
  }

  // Get current time state
  public getTimeState(): TimeState {
    return { ...this.timeState };
  }

  // Get a formatted string of the current time
  public getFormattedTime(): string {
    return `${this.timeState.hour} of ${this.timeState.day}, ${this.timeState.week} Week, ${this.timeState.month} ${this.timeState.year} Year, ${this.timeState.century} Century`;
  }

  // Register a time event
  public registerEvent(event: TimeEvent): void {
    this.events.push(event);
  }

  // Register a callback for time changes
  public onTimeChange(callback: (time: TimeState) => void): void {
    this.timeCallbacks.push(callback);
  }

  // Remove a time change callback
  public removeTimeCallback(callback: (time: TimeState) => void): void {
    const index = this.timeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.timeCallbacks.splice(index, 1);
    }
  }

  // Set the game time speed (how many game minutes pass per real second)
  public setTimeSpeed(ratio: number): void {
    this.realTimeToGameTimeRatio = ratio;
  }

  // Apply environmental effects based on current time
  public applyEnvironmentalEffects(): void {
    const currentEnv = timeEnvironments[this.timeState.hour];

    // Update visual elements - this would be implemented in the renderer
    if (this.engine.world) {
      // Update sky color, lighting, etc.
      // This is a placeholder - actual implementation would depend on your rendering system
      console.log(
        `Applying environmental effects for ${this.timeState.hour}:`,
        currentEnv
      );
    }
  }

  // Notify all callbacks of time change
  private notifyTimeChange(): void {
    for (const callback of this.timeCallbacks) {
      callback(this.getTimeState());
    }

    // Apply environmental changes
    this.applyEnvironmentalEffects();
  }

  // Check for time-based events
  private checkTimeEvents(): void {
    for (const event of this.events) {
      if (event.condition(this.timeState)) {
        console.log(`Time event triggered: ${event.name}`);
        event.effects(this.engine);
      }
    }
  }

  // Register default special time events
  private registerDefaultEvents(): void {
    // Prophecy Awakening - occurs at the specific starting time
    this.registerEvent({
      id: "prophecy_awakening",
      name: "The Prophecy Awakens",
      description:
        "The stars align in the prophesied configuration, awakening ancient magic and setting fate in motion.",
      condition: (time) =>
        time.hour === Hour.MIDNIGHT &&
        time.day === Day.VOIDUS &&
        time.week === Week.ZEPHYRWIND &&
        time.month === Month.AMBERFALL &&
        time.year === Year.GRIFFIN &&
        time.century === Century.SHADOW,
      effects: (engine) => {
        // Implement special effects for the prophecy awakening
        console.log(
          "THE PROPHECY AWAKENS! Ancient powers stir across the realm..."
        );

        // Update game state with prophecy notification
        if (engine.callbacks && engine.callbacks.onGameStateChange) {
          engine.callbacks.onGameStateChange({
            currentTimeInfo: "⚠️ The Prophecy Awakens ⚠️",
          });

          // After 5 seconds, return to normal time display
          setTimeout(() => {
            engine.callbacks.onGameStateChange({
              currentTimeInfo: this.getFormattedTime(),
            });
          }, 5000);
        }
      },
    });

    // Full moon event (occurs during Midnight of Lunaris in Zephyrwind Week)
    this.registerEvent({
      id: "full_moon",
      name: "The Prophetic Full Moon",
      description:
        "When the moon is at its fullest, ancient magic flows freely in the world.",
      condition: (time) =>
        time.hour === Hour.MIDNIGHT &&
        time.day === Day.LUNARIS &&
        time.week === Week.ZEPHYRWIND,
      effects: (engine) => {
        // Implement special effects for the full moon
        // For example: spawn special enemies, enhance player's magic abilities, etc.
        console.log("Full moon event triggered!");
      },
    });

    // Solar eclipse (occurs during Zenith of Solarus in the Dragon Year)
    this.registerEvent({
      id: "solar_eclipse",
      name: "The Eclipse of Prophecy",
      description:
        "When sun and moon align, the prophecy inches closer to fulfillment.",
      condition: (time) =>
        time.hour === Hour.ZENITH &&
        time.day === Day.SOLARUS &&
        time.year === Year.DRAGON,
      effects: (engine) => {
        // Implement special effects for the solar eclipse
        console.log("Solar eclipse event triggered!");
      },
    });

    // The Convergence (rare celestial event that happens once per century)
    this.registerEvent({
      id: "convergence",
      name: "The Great Convergence",
      description:
        "All celestial bodies align, opening gateways between realms.",
      condition: (time) =>
        time.hour === Hour.MIDNIGHT &&
        time.day === Day.VOIDUS &&
        time.week === Week.EMBERWEAVE &&
        time.month === Month.FROSTWHISPER &&
        time.year === Year.PHOENIX,
      effects: (engine) => {
        // Implement once-per-century special event
        console.log("The Convergence has begun!");
      },
    });
  }

  // Get current environment settings
  public getCurrentEnvironment() {
    return timeEnvironments[this.timeState.hour];
  }

  // Cleanup resources
  public destroy(): void {
    this.timeCallbacks = [];
    this.events = [];
  }
}
