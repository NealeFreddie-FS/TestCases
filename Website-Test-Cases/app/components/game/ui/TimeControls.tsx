import React, { useState } from "react";
import {
  TimeManager,
  Hour,
  Day,
  Week,
  Month,
  Year,
  Century,
} from "../managers/TimeManager";

interface TimeControlsProps {
  timeManager: TimeManager;
}

/**
 * Developer UI component for controlling the time system
 * Only visible in development mode
 */
export default function TimeControls({ timeManager }: TimeControlsProps) {
  const [showControls, setShowControls] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [advanceAmount, setAdvanceAmount] = useState(60);

  const toggleControls = () => setShowControls(!showControls);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setTimeSpeed(newSpeed);
    timeManager.setTimeSpeed(newSpeed);
  };

  const handleAdvanceTime = () => {
    timeManager.advanceTime(advanceAmount);
  };

  const handleAdvanceAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdvanceAmount(parseInt(e.target.value));
  };

  // Jump to prophetic time
  const jumpToPropheticTime = () => {
    // Calculate total minutes to reach hour 4, day 4, week 4, month 4, year 4, century 4
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 4;
    const DAYS_PER_WEEK = 4;
    const WEEKS_PER_MONTH = 4;
    const MONTHS_PER_YEAR = 4;
    const YEARS_PER_CENTURY = 4;

    // Calculate minutes for each component (using 3 for zero-indexed values)
    const hourMinutes = 3 * MINUTES_PER_HOUR;
    const dayMinutes = 3 * HOURS_PER_DAY * MINUTES_PER_HOUR;
    const weekMinutes = 3 * DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR;
    const monthMinutes =
      3 * WEEKS_PER_MONTH * DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR;
    const yearMinutes =
      3 *
      MONTHS_PER_YEAR *
      WEEKS_PER_MONTH *
      DAYS_PER_WEEK *
      HOURS_PER_DAY *
      MINUTES_PER_HOUR;
    const centuryMinutes =
      3 *
      YEARS_PER_CENTURY *
      MONTHS_PER_YEAR *
      WEEKS_PER_MONTH *
      DAYS_PER_WEEK *
      HOURS_PER_DAY *
      MINUTES_PER_HOUR;

    // Calculate total minutes to reach the prophetic time
    const totalMinutes =
      hourMinutes +
      dayMinutes +
      weekMinutes +
      monthMinutes +
      yearMinutes +
      centuryMinutes;

    // Get current minutes and calculate the difference
    const currentMinutes = timeManager.getTimeState().totalGameMinutes;
    const minutesDifference = totalMinutes - currentMinutes;

    // Advance time to reach the prophecy
    if (minutesDifference > 0) {
      timeManager.advanceTime(minutesDifference);
    } else {
      // If we're past the prophetic time, calculate the next cycle
      const cycleLength =
        YEARS_PER_CENTURY *
        MONTHS_PER_YEAR *
        WEEKS_PER_MONTH *
        DAYS_PER_WEEK *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR;
      const minutesToNextCycle =
        cycleLength - (currentMinutes % cycleLength) + totalMinutes;
      timeManager.advanceTime(minutesToNextCycle);
    }
  };

  // Check if we're at the prophetic time
  const isPropheticTime = () => {
    const time = timeManager.getTimeState();
    return (
      time.hour === Hour.MIDNIGHT &&
      time.day === Day.VOIDUS &&
      time.week === Week.ZEPHYRWIND &&
      time.month === Month.AMBERFALL &&
      time.year === Year.GRIFFIN &&
      time.century === Century.SHADOW
    );
  };

  const currentTime = timeManager.getFormattedTime();
  const atPropheticTime = isPropheticTime();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleControls}
        className={`text-white rounded-md p-2 shadow-lg ${
          atPropheticTime
            ? "bg-purple-700 hover:bg-purple-600 animate-pulse"
            : "bg-indigo-700 hover:bg-indigo-600"
        }`}
      >
        {showControls
          ? "Hide Time Controls"
          : atPropheticTime
          ? "⚠️ Prophetic Time Controls ⚠️"
          : "Time Controls"}
      </button>

      {showControls && (
        <div
          className={`border rounded-md p-3 mt-2 w-80 shadow-xl ${
            atPropheticTime
              ? "bg-purple-900/90 border-purple-500/70 shadow-purple-700/30"
              : "bg-gray-900/90 border-indigo-700/50"
          }`}
        >
          <h3
            className={`font-medium mb-2 ${
              atPropheticTime ? "text-purple-300" : "text-indigo-300"
            }`}
          >
            {atPropheticTime
              ? "🔮 Prophetic Time Control Panel 🔮"
              : "Time Control Panel"}
          </h3>

          <div
            className={`text-white text-sm mb-4 p-2 rounded ${
              atPropheticTime
                ? "bg-purple-800/70 border border-purple-500/50"
                : "bg-indigo-900/50"
            }`}
          >
            {currentTime}
          </div>

          <div className="mb-4">
            <label
              className={`text-sm block mb-1 ${
                atPropheticTime ? "text-purple-300" : "text-indigo-300"
              }`}
            >
              Time Speed (minutes per second)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="100"
                step="0.1"
                value={timeSpeed}
                onChange={handleSpeedChange}
                className="w-full"
              />
              <span className="text-white text-sm w-10">{timeSpeed}</span>
            </div>
          </div>

          <div className="mb-4">
            <label
              className={`text-sm block mb-1 ${
                atPropheticTime ? "text-purple-300" : "text-indigo-300"
              }`}
            >
              Advance Time (minutes)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={advanceAmount}
                onChange={handleAdvanceAmountChange}
                className="bg-gray-800 text-white px-2 py-1 rounded w-full"
              />
              <button
                onClick={handleAdvanceTime}
                className={`text-white rounded px-2 py-1 ${
                  atPropheticTime
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                Advance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => timeManager.advanceTime(60)}
              className={`text-white rounded px-2 py-1 text-sm ${
                atPropheticTime
                  ? "bg-purple-800 hover:bg-purple-700"
                  : "bg-indigo-800 hover:bg-indigo-700"
              }`}
            >
              +1 Hour
            </button>
            <button
              onClick={() => timeManager.advanceTime(240)}
              className={`text-white rounded px-2 py-1 text-sm ${
                atPropheticTime
                  ? "bg-purple-800 hover:bg-purple-700"
                  : "bg-indigo-800 hover:bg-indigo-700"
              }`}
            >
              +1 Day
            </button>
            <button
              onClick={() => timeManager.advanceTime(960)}
              className={`text-white rounded px-2 py-1 text-sm ${
                atPropheticTime
                  ? "bg-purple-800 hover:bg-purple-700"
                  : "bg-indigo-800 hover:bg-indigo-700"
              }`}
            >
              +1 Week
            </button>
            <button
              onClick={() => timeManager.advanceTime(3840)}
              className={`text-white rounded px-2 py-1 text-sm ${
                atPropheticTime
                  ? "bg-purple-800 hover:bg-purple-700"
                  : "bg-indigo-800 hover:bg-indigo-700"
              }`}
            >
              +1 Month
            </button>
          </div>

          <button
            onClick={jumpToPropheticTime}
            className={`w-full py-2 mb-4 font-medium shadow-lg text-center rounded-md text-white ${
              atPropheticTime
                ? "bg-gradient-to-r from-purple-700 to-indigo-700 animate-pulse"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            }`}
          >
            {atPropheticTime
              ? "✨ At Prophetic Time ✨"
              : "🔮 Jump to Prophetic Time 🔮"}
          </button>

          <div className="text-xs text-gray-400 mt-4">
            Developer controls - not visible in production
          </div>
        </div>
      )}
    </div>
  );
}
