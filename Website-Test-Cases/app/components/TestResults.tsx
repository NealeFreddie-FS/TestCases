"use client";

import { useState, useEffect } from "react";

// Define the test result type
type TestResult = {
  id: string;
  component: string;
  name: string;
  status: "passed" | "failed" | "pending";
  duration: number; // in milliseconds
  error?: string;
  timestamp: string;
};

export default function TestResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "passed" | "failed" | "pending"
  >("all");

  useEffect(() => {
    // Fetch test results
    const fetchResults = async () => {
      try {
        setLoading(true);

        // In a real app, this would be an API call to get test results
        // For now, we'll simulate a delay and return mock data
        const response = await fetch("/api/tests");

        if (!response.ok) {
          throw new Error("Failed to fetch test results");
        }

        const data = await response.json();
        setResults(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch test results", err);
        setError("Failed to summon the test results scroll");
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Format duration to be more readable
  const formatDuration = (ms: number): string => {
    if (ms === 0) return "pending";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format timestamp to be more readable
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Group results by component
  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.component]) {
      groups[result.component] = [];
    }
    groups[result.component].push(result);
    return groups;
  }, {} as Record<string, TestResult[]>);

  // Filter results based on selected status
  const filteredResults =
    statusFilter === "all"
      ? results
      : results.filter((result) => result.status === statusFilter);

  // Calculate summary counts
  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const pendingCount = results.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-amber-400/20 rounded-full mb-4"></div>
          <div className="text-amber-300">Conjuring test results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-4">
          <div className="px-4 py-3 bg-slate-800/60 border border-amber-900/30 rounded-lg flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <div>
              <div className="text-sm text-green-300">Passed</div>
              <div className="text-xl font-medium text-green-200">
                {passedCount}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-800/60 border border-amber-900/30 rounded-lg flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <div>
              <div className="text-sm text-red-300">Failed</div>
              <div className="text-xl font-medium text-red-200">
                {failedCount}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-800/60 border border-amber-900/30 rounded-lg flex items-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
            <div>
              <div className="text-sm text-amber-300">Pending</div>
              <div className="text-xl font-medium text-amber-200">
                {pendingCount}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-800/60 border border-amber-900/30 rounded-lg flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <div>
              <div className="text-sm text-blue-300">Total</div>
              <div className="text-xl font-medium text-blue-200">
                {results.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-1 flex">
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "all"
                ? "bg-amber-500 text-white"
                : "text-amber-300 hover:text-amber-200"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "passed"
                ? "bg-green-600 text-white"
                : "text-green-300 hover:text-green-200"
            }`}
            onClick={() => setStatusFilter("passed")}
          >
            Passed
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "failed"
                ? "bg-red-600 text-white"
                : "text-red-300 hover:text-red-200"
            }`}
            onClick={() => setStatusFilter("failed")}
          >
            Failed
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "text-amber-300 hover:text-amber-200"
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Results List */}
      {statusFilter === "all" ? (
        // Grouped by component when showing all
        <div className="space-y-6">
          {Object.keys(groupedResults).map((component) => (
            <div
              key={component}
              className="bg-slate-800/60 border border-amber-900/30 rounded-lg overflow-hidden"
            >
              <div className="bg-slate-700/60 px-4 py-3 font-medium text-amber-300">
                {component}{" "}
                <span className="text-amber-200/70 text-sm">
                  ({groupedResults[component].length} tests)
                </span>
              </div>
              <div className="divide-y divide-amber-900/10">
                {groupedResults[component].map((result) => (
                  <div
                    key={result.id}
                    className={`px-4 py-3 flex items-center justify-between ${
                      result.status === "failed" ? "bg-red-900/10" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          result.status === "passed"
                            ? "bg-green-500"
                            : result.status === "failed"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      ></div>
                      <div>
                        <div className="text-amber-100">{result.name}</div>
                        {result.error && (
                          <div className="mt-2 text-sm text-red-300 bg-red-900/20 p-2 rounded">
                            <span className="font-medium">Error:</span>{" "}
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-amber-200/70 text-sm">
                        {formatTime(result.timestamp)}
                      </div>
                      <div
                        className={`text-sm ${
                          result.status === "passed"
                            ? "text-green-300"
                            : result.status === "failed"
                            ? "text-red-300"
                            : "text-amber-300"
                        }`}
                      >
                        {formatDuration(result.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list when filtered
        <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg overflow-hidden">
          <div className="divide-y divide-amber-900/10">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-12 text-center text-amber-200">
                No test results match the selected filter
              </div>
            ) : (
              filteredResults.map((result) => (
                <div
                  key={result.id}
                  className={`px-4 py-3 flex items-center justify-between ${
                    result.status === "failed" ? "bg-red-900/10" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        result.status === "passed"
                          ? "bg-green-500"
                          : result.status === "failed"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    ></div>
                    <div>
                      <div className="text-amber-200/70 text-xs mb-1">
                        {result.component}
                      </div>
                      <div className="text-amber-100">{result.name}</div>
                      {result.error && (
                        <div className="mt-2 text-sm text-red-300 bg-red-900/20 p-2 rounded">
                          <span className="font-medium">Error:</span>{" "}
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-amber-200/70 text-sm">
                      {formatTime(result.timestamp)}
                    </div>
                    <div
                      className={`text-sm ${
                        result.status === "passed"
                          ? "text-green-300"
                          : result.status === "failed"
                          ? "text-red-300"
                          : "text-amber-300"
                      }`}
                    >
                      {formatDuration(result.duration)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
