import React, { useState, useEffect } from "react";
import {
  TimeManager,
  TimeState,
  Hour,
  Day,
  Week,
  Month,
  Year,
  Century,
  timeEnvironments,
} from "../managers/TimeManager";

interface AdminTimeControlsProps {
  timeManager: TimeManager;
}

export default function AdminTimeControls({
  timeManager,
}: AdminTimeControlsProps) {
  // State for current time components
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [customTime, setCustomTime] = useState({
    hour: Hour.MIDNIGHT,
    day: Day.VOIDUS,
    week: Week.ZEPHYRWIND,
    month: Month.AMBERFALL,
    year: Year.GRIFFIN,
    century: Century.SHADOW,
  });
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showEnvironmentPreview, setShowEnvironmentPreview] = useState(false);
  const [previewHour, setPreviewHour] = useState<Hour>(Hour.MIDNIGHT);
  const [isSyncingToGame, setIsSyncingToGame] = useState(true);

  // Initialize and sync with timeManager
  useEffect(() => {
    if (!timeManager) return;

    // Initial state
    setTimeState(timeManager.getTimeState());
    setTimeSpeed(1); // Default speed

    // Update time state when the time changes in the game
    const handleTimeChange = (newTimeState: TimeState) => {
      if (isSyncingToGame) {
        setTimeState(newTimeState);
        setCustomTime({
          hour: newTimeState.hour,
          day: newTimeState.day,
          week: newTimeState.week,
          month: newTimeState.month,
          year: newTimeState.year,
          century: newTimeState.century,
        });
      }
    };

    timeManager.onTimeChange(handleTimeChange);

    // Cleanup
    return () => {
      // This should remove our callback, but there might be a better pattern
      // in your actual implementation
      timeManager.removeTimeCallback(handleTimeChange);
    };
  }, [timeManager, isSyncingToGame]);

  // Handle speed change
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setTimeSpeed(newSpeed);
    timeManager.setTimeSpeed(newSpeed);
  };

  // Update a specific time component
  const handleTimeComponentChange = (
    component: keyof typeof customTime,
    value: any
  ) => {
    // If syncing to game, stop syncing first
    if (isSyncingToGame) {
      setIsSyncingToGame(false);
    }

    setCustomTime((prev) => ({
      ...prev,
      [component]: value,
    }));
  };

  // Apply custom time settings to the game
  const applyCustomTime = () => {
    // Calculate the total minutes representing the custom time
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 4;
    const DAYS_PER_WEEK = 4;
    const WEEKS_PER_MONTH = 4;
    const MONTHS_PER_YEAR = 4;
    const YEARS_PER_CENTURY = 4;

    // Get indices for each time component
    const hourIndex = Object.values(Hour).indexOf(customTime.hour);
    const dayIndex = Object.values(Day).indexOf(customTime.day);
    const weekIndex = Object.values(Week).indexOf(customTime.week);
    const monthIndex = Object.values(Month).indexOf(customTime.month);
    const yearIndex = Object.values(Year).indexOf(customTime.year);
    const centuryIndex = Object.values(Century).indexOf(customTime.century);

    // Calculate total minutes
    const totalMinutes =
      hourIndex * MINUTES_PER_HOUR +
      dayIndex * HOURS_PER_DAY * MINUTES_PER_HOUR +
      weekIndex * DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR +
      monthIndex *
        WEEKS_PER_MONTH *
        DAYS_PER_WEEK *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR +
      yearIndex *
        MONTHS_PER_YEAR *
        WEEKS_PER_MONTH *
        DAYS_PER_WEEK *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR +
      centuryIndex *
        YEARS_PER_CENTURY *
        MONTHS_PER_YEAR *
        WEEKS_PER_MONTH *
        DAYS_PER_WEEK *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR;

    // Set the game time to this time
    // Assuming timeManager has a method to set time directly
    // If not, you'd need to calculate the difference and advance by that amount
    const currentTime = timeManager.getTimeState().totalGameMinutes;
    const timeDiff = totalMinutes - currentTime;
    timeManager.advanceTime(timeDiff);

    // Restore syncing with game
    setIsSyncingToGame(true);
  };

  // Toggle pause state
  const togglePause = () => {
    if (isPaused) {
      timeManager.setTimeSpeed(timeSpeed);
    } else {
      timeManager.setTimeSpeed(0);
    }
    setIsPaused(!isPaused);
  };

  // Jump to prophetic time
  const jumpToPropheticTime = () => {
    setCustomTime({
      hour: Hour.MIDNIGHT,
      day: Day.VOIDUS,
      week: Week.ZEPHYRWIND,
      month: Month.AMBERFALL,
      year: Year.GRIFFIN,
      century: Century.SHADOW,
    });

    // Apply immediately
    setTimeout(applyCustomTime, 0);
  };

  // Check if current time is the prophetic time
  const isPropheticTime = () => {
    return (
      timeState?.hour === Hour.MIDNIGHT &&
      timeState?.day === Day.VOIDUS &&
      timeState?.week === Week.ZEPHYRWIND &&
      timeState?.month === Month.AMBERFALL &&
      timeState?.year === Year.GRIFFIN &&
      timeState?.century === Century.SHADOW
    );
  };

  // Render environment preview
  const renderEnvironmentPreview = () => {
    const environment = timeEnvironments[previewHour];
    if (!environment) return null;

    // Create color from hex
    const skyColorHex = environment.skyColor.toString(16).padStart(6, "0");

    return (
      <div className="mt-4 bg-gray-900 p-4 rounded-md border border-gray-700">
        <h4 className="text-amber-300 mb-2">
          Environment Preview: {previewHour}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div
              className="w-full h-24 rounded-md mb-2"
              style={{ backgroundColor: `#${skyColorHex}` }}
            />
            <p className="text-xs text-gray-400">Sky Color: #{skyColorHex}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Light Intensity:</span>
              <span className="text-white text-sm">
                {environment.lightIntensity}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-amber-500 h-2.5 rounded-full"
                style={{ width: `${environment.lightIntensity * 100}%` }}
              />
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-gray-400 text-sm">Fog Density:</span>
              <span className="text-white text-sm">
                {environment.fogDensity}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${environment.fogDensity * 100}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {environment.ambientSounds.map((sound) => (
                <span
                  key={sound}
                  className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                >
                  {sound}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!timeManager || !timeState) {
    return (
      <div className="text-center text-amber-200">Loading time controls...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current time display */}
      <div
        className={`p-4 rounded-md border ${
          isPropheticTime()
            ? "bg-purple-900/40 border-purple-500/70"
            : "bg-gray-800/40 border-indigo-700/30"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3
            className={`font-medium ${
              isPropheticTime() ? "text-purple-300" : "text-amber-300"
            }`}
          >
            Current Game Time
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPaused ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-xs text-gray-400">
              {isPaused ? "Paused" : "Running"}
            </span>
          </div>
        </div>

        <div className="text-lg text-white font-medium mb-2">
          {timeManager.getFormattedTime()}
        </div>

        <div className="text-xs text-gray-400">
          Total Game Minutes: {timeState.totalGameMinutes.toLocaleString()}
        </div>
      </div>

      {/* Time speed controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/40 rounded-md border border-indigo-700/30">
          <h3 className="text-amber-300 mb-3">Time Flow Control</h3>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePause}
              className={`flex-1 py-2 px-4 rounded-md ${
                isPaused
                  ? "bg-green-700 hover:bg-green-600 text-white"
                  : "bg-red-700 hover:bg-red-600 text-white"
              }`}
            >
              {isPaused ? "Resume Time" : "Pause Time"}
            </button>

            <button
              onClick={() => {
                setTimeSpeed(1);
                timeManager.setTimeSpeed(1);
              }}
              className="flex-1 py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              Normal Speed
            </button>
          </div>

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <label className="text-sm text-amber-200">
                Time Speed (minutes per second):
              </label>
              <span className="text-white text-sm">{timeSpeed}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={timeSpeed}
              onChange={handleSpeedChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                setTimeSpeed(0.5);
                timeManager.setTimeSpeed(0.5);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              0.5x
            </button>
            <button
              onClick={() => {
                setTimeSpeed(2);
                timeManager.setTimeSpeed(2);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              2x
            </button>
            <button
              onClick={() => {
                setTimeSpeed(5);
                timeManager.setTimeSpeed(5);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              5x
            </button>
            <button
              onClick={() => {
                setTimeSpeed(10);
                timeManager.setTimeSpeed(10);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              10x
            </button>
            <button
              onClick={() => {
                setTimeSpeed(25);
                timeManager.setTimeSpeed(25);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              25x
            </button>
            <button
              onClick={() => {
                setTimeSpeed(50);
                timeManager.setTimeSpeed(50);
              }}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              50x
            </button>
          </div>
        </div>

        {/* Quick jumps */}
        <div className="p-4 bg-gray-800/40 rounded-md border border-indigo-700/30">
          <h3 className="text-amber-300 mb-3">Quick Time Advances</h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => timeManager.advanceTime(60)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Hour
            </button>
            <button
              onClick={() => timeManager.advanceTime(240)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Day
            </button>
            <button
              onClick={() => timeManager.advanceTime(960)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Week
            </button>
            <button
              onClick={() => timeManager.advanceTime(3840)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Month
            </button>
            <button
              onClick={() => timeManager.advanceTime(15360)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Year
            </button>
            <button
              onClick={() => timeManager.advanceTime(61440)}
              className="py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md"
            >
              +1 Century
            </button>
          </div>

          <button
            onClick={jumpToPropheticTime}
            className={`w-full py-2 font-medium text-center rounded-md text-white ${
              isPropheticTime()
                ? "bg-purple-700 animate-pulse"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            }`}
          >
            {isPropheticTime()
              ? "✨ At Prophetic Time ✨"
              : "🔮 Jump to Prophetic Time 🔮"}
          </button>
        </div>
      </div>

      {/* Custom time settings */}
      <div className="p-4 bg-gray-800/40 rounded-md border border-indigo-700/30">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-300">Custom Time Settings</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {isSyncingToGame ? "Syncing with game" : "Manual mode"}
            </span>
            <button
              onClick={() => setIsSyncingToGame(!isSyncingToGame)}
              className={`px-2 py-1 rounded text-xs ${
                isSyncingToGame
                  ? "bg-green-700 text-green-200"
                  : "bg-yellow-700 text-yellow-200"
              }`}
            >
              {isSyncingToGame ? "Unlink" : "Re-sync"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Hour */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Hour</label>
            <select
              value={customTime.hour}
              onChange={(e) =>
                handleTimeComponentChange("hour", e.target.value)
              }
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Hour).map((hourValue) => (
                <option key={hourValue} value={hourValue}>
                  {hourValue}
                </option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Day</label>
            <select
              value={customTime.day}
              onChange={(e) => handleTimeComponentChange("day", e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Day).map((dayValue) => (
                <option key={dayValue} value={dayValue}>
                  {dayValue}
                </option>
              ))}
            </select>
          </div>

          {/* Week */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Week</label>
            <select
              value={customTime.week}
              onChange={(e) =>
                handleTimeComponentChange("week", e.target.value)
              }
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Week).map((weekValue) => (
                <option key={weekValue} value={weekValue}>
                  {weekValue}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Month</label>
            <select
              value={customTime.month}
              onChange={(e) =>
                handleTimeComponentChange("month", e.target.value)
              }
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Month).map((monthValue) => (
                <option key={monthValue} value={monthValue}>
                  {monthValue}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Year</label>
            <select
              value={customTime.year}
              onChange={(e) =>
                handleTimeComponentChange("year", e.target.value)
              }
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Year).map((yearValue) => (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              ))}
            </select>
          </div>

          {/* Century */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">Century</label>
            <select
              value={customTime.century}
              onChange={(e) =>
                handleTimeComponentChange("century", e.target.value)
              }
              className="w-full bg-gray-700 text-white rounded-md p-2"
            >
              {Object.values(Century).map((centuryValue) => (
                <option key={centuryValue} value={centuryValue}>
                  {centuryValue}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={applyCustomTime}
          className="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-4 rounded-md w-full"
        >
          Apply Custom Time
        </button>
      </div>

      {/* Environment preview */}
      <div className="p-4 bg-gray-800/40 rounded-md border border-indigo-700/30">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-300">Environment Preview</h3>
          <button
            onClick={() => setShowEnvironmentPreview(!showEnvironmentPreview)}
            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white py-1 px-3 rounded-md"
          >
            {showEnvironmentPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-amber-200 mb-1">
            Select Hour to Preview
          </label>
          <select
            value={previewHour}
            onChange={(e) => setPreviewHour(e.target.value as Hour)}
            className="w-full bg-gray-700 text-white rounded-md p-2"
          >
            {Object.values(Hour).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        {showEnvironmentPreview && renderEnvironmentPreview()}
      </div>
    </div>
  );
}
