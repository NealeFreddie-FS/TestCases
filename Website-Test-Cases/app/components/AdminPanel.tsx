"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import AdminTimeControls to avoid SSR issues with window object
const AdminTimeControls = dynamic(() => import("./game/ui/AdminTimeControls"), {
  ssr: false,
});

// Define test case types
type TestCase = {
  id: string;
  name: string;
  description: string;
  component: string;
  status: "passed" | "failed" | "pending";
  order: number;
};

// Group test cases by component/category
type TestGroups = {
  [key: string]: TestCase[];
};

// Mock data - in a real app, this would come from your testing framework or API
const mockTestCases: TestCase[] = [
  // Fantasy Form tests
  {
    id: "form-1",
    name: "FantasyForm Rendering",
    description: "Renders first step of the form initially",
    component: "Fantasy Form",
    status: "passed",
    order: 1,
  },
  {
    id: "form-2",
    name: "FantasyForm Validation",
    description: "Shows validation errors when required fields are not filled",
    component: "Fantasy Form",
    status: "passed",
    order: 2,
  },
  {
    id: "form-3",
    name: "FantasyForm Navigation",
    description: "Proceeds to next step when valid inputs are provided",
    component: "Fantasy Form",
    status: "passed",
    order: 3,
  },
  {
    id: "form-4",
    name: "Magic Items Checkboxes",
    description: "Handles checkbox changes for magic items",
    component: "Fantasy Form",
    status: "passed",
    order: 4,
  },
  {
    id: "form-5",
    name: "Form Submission",
    description: "Submits the form successfully and shows loading state",
    component: "Fantasy Form",
    status: "passed",
    order: 5,
  },

  // Navigation tests
  {
    id: "nav-1",
    name: "Navigation Links",
    description: "Renders all navigation links correctly",
    component: "Navigation",
    status: "passed",
    order: 1,
  },
  {
    id: "nav-2",
    name: "Active Link Highlighting",
    description: "Highlights the current page link",
    component: "Navigation",
    status: "passed",
    order: 2,
  },
  {
    id: "nav-3",
    name: "Mobile Navigation",
    description: "Shows mobile menu when the burger icon is clicked",
    component: "Navigation",
    status: "pending",
    order: 3,
  },

  // FeedbackEntries tests
  {
    id: "feedback-1",
    name: "Loading State",
    description: "Renders loading state initially",
    component: "Feedback Entries",
    status: "passed",
    order: 1,
  },
  {
    id: "feedback-2",
    name: "Entries Display",
    description: "Displays feedback entries after loading",
    component: "Feedback Entries",
    status: "passed",
    order: 2,
  },
  {
    id: "feedback-3",
    name: "Type Badges",
    description: "Displays feedback type badges correctly",
    component: "Feedback Entries",
    status: "passed",
    order: 3,
  },
  {
    id: "feedback-4",
    name: "Ratings Display",
    description: "Displays ratings correctly with progress bars",
    component: "Feedback Entries",
    status: "passed",
    order: 4,
  },
  {
    id: "feedback-5",
    name: "Timestamps Format",
    description: "Displays timestamps in the correct format (as 'ago')",
    component: "Feedback Entries",
    status: "failed",
    order: 5,
  },

  // TestResults tests
  {
    id: "results-1",
    name: "Loading State",
    description: "Renders loading state initially",
    component: "Test Results",
    status: "passed",
    order: 1,
  },
  {
    id: "results-2",
    name: "Results Display",
    description: "Displays test results after loading",
    component: "Test Results",
    status: "passed",
    order: 2,
  },
  {
    id: "results-3",
    name: "Error Handling",
    description: "Handles and displays error state properly",
    component: "Test Results",
    status: "passed",
    order: 3,
  },
  {
    id: "results-4",
    name: "Status Badges",
    description: "Renders passed/failed test status badges correctly",
    component: "Test Results",
    status: "passed",
    order: 4,
  },

  // Layout tests
  {
    id: "layout-1",
    name: "Navigation Rendering",
    description: "Renders the navigation component",
    component: "Root Layout",
    status: "passed",
    order: 1,
  },
  {
    id: "layout-2",
    name: "Footer Text",
    description: "Contains footer with fantasy theme text",
    component: "Root Layout",
    status: "passed",
    order: 2,
  },
  {
    id: "layout-3",
    name: "Font Classes",
    description: "Applies the correct font classes to the container",
    component: "Root Layout",
    status: "passed",
    order: 3,
  },

  // Home page tests
  {
    id: "home-1",
    name: "Hero Section",
    description: "Renders hero section with title and call-to-action",
    component: "Home Page",
    status: "passed",
    order: 1,
  },
  {
    id: "home-2",
    name: "Feature Cards",
    description: "Renders feature cards section",
    component: "Home Page",
    status: "passed",
    order: 2,
  },
  {
    id: "home-3",
    name: "Call-to-Action",
    description: "Renders call-to-action section",
    component: "Home Page",
    status: "passed",
    order: 3,
  },
  {
    id: "home-4",
    name: "Route Links",
    description: "Links point to correct routes",
    component: "Home Page",
    status: "passed",
    order: 4,
  },

  // Form Page tests
  {
    id: "formpage-1",
    name: "Page Title",
    description: "Renders the page title and description",
    component: "Form Page",
    status: "passed",
    order: 1,
  },
  {
    id: "formpage-2",
    name: "FantasyForm Component",
    description: "Renders the FantasyForm component",
    component: "Form Page",
    status: "passed",
    order: 2,
  },
  {
    id: "formpage-3",
    name: "Theme Styling",
    description: "Has proper fantasy theme styling",
    component: "Form Page",
    status: "passed",
    order: 3,
  },

  // Admin Page tests
  {
    id: "adminpage-1",
    name: "Page Title",
    description: "Renders the page title and description",
    component: "Admin Page",
    status: "passed",
    order: 1,
  },
  {
    id: "adminpage-2",
    name: "Stats Overview",
    description: "Renders the stats overview section",
    component: "Admin Page",
    status: "passed",
    order: 2,
  },
  {
    id: "adminpage-3",
    name: "Submissions Table",
    description: "Renders the submissions table",
    component: "Admin Page",
    status: "passed",
    order: 3,
  },
  {
    id: "adminpage-4",
    name: "View Scroll Action",
    description: "Clicking on View Scroll shows submission details",
    component: "Admin Page",
    status: "failed",
    order: 4,
  },
];

export default function AdminPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>(mockTestCases);
  const [groupedTests, setGroupedTests] = useState<TestGroups>({});
  const [activeTab, setActiveTab] = useState<string>("tests");
  const [gameEngineAvailable, setGameEngineAvailable] =
    useState<boolean>(false);

  // Group test cases by component and sort by order
  useEffect(() => {
    const grouped: TestGroups = {};

    testCases.forEach((test) => {
      if (!grouped[test.component]) {
        grouped[test.component] = [];
      }
      grouped[test.component].push(test);
    });

    // Sort each group by order
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.order - b.order);
    });

    setGroupedTests(grouped);
  }, [testCases]);

  // Set up key event listener for toggling panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "p") {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Check if game engine is available
    const checkGameEngine = () => {
      // Look for gameEngineRef in window scope
      // In a real implementation, you might use React context or a different approach
      const gameEngineAvailable =
        (window as any).gameEngine ||
        document.querySelector('[data-game-engine="true"]') !== null;

      setGameEngineAvailable(gameEngineAvailable);
    };

    // Check initially
    checkGameEngine();

    // Check periodically
    const interval = setInterval(checkGameEngine, 2000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  // If panel is hidden, return null
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto p-4">
      <div className="max-w-6xl mx-auto bg-gray-900 border border-amber-500 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-amber-400">
            Secret Scroll of Test Cases
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-amber-200">Press P to toggle</span>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded-md"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-amber-800 mb-6">
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-4 py-2 ${
              activeTab === "tests"
                ? "text-amber-300 border-b-2 border-amber-500"
                : "text-amber-500 hover:text-amber-400"
            }`}
          >
            Test Results
          </button>
          <button
            onClick={() => setActiveTab("gameTime")}
            className={`px-4 py-2 ${
              activeTab === "gameTime"
                ? "text-amber-300 border-b-2 border-amber-500"
                : "text-amber-500 hover:text-amber-400"
            }`}
          >
            Game Time
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "tests" && (
          <div className="space-y-8">
            {/* Original test case content goes here */}
            {Object.keys(groupedTests).map((componentName) => (
              <div
                key={componentName}
                className="border-b border-amber-900/30 pb-4 mb-4 last:border-0"
              >
                <h3 className="font-serif text-lg font-medium text-amber-400 mb-3">
                  {componentName}
                </h3>
                <div className="space-y-2">
                  {groupedTests[componentName].map((test) => (
                    <div
                      key={test.id}
                      className="flex items-start p-3 bg-gray-800/50 rounded-md"
                    >
                      <div
                        className={`w-3 h-3 mt-1 rounded-full mr-3 ${
                          test.status === "passed"
                            ? "bg-green-500"
                            : test.status === "failed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-amber-300">
                            {test.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              test.status === "passed"
                                ? "bg-green-900/50 text-green-300"
                                : test.status === "failed"
                                ? "bg-red-900/50 text-red-300"
                                : "bg-yellow-900/50 text-yellow-300"
                            }`}
                          >
                            {test.status.charAt(0).toUpperCase() +
                              test.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {test.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "gameTime" && (
          <div className="space-y-4">
            {gameEngineAvailable ? (
              <div className="p-4 bg-gray-800/50 rounded-md">
                <h3 className="font-serif text-lg font-medium text-amber-400 mb-3">
                  Game Time Controls
                </h3>
                <div
                  id="time-controls-container"
                  className="bg-gray-800 p-4 rounded-md"
                >
                  {(window as any).gameTimeManager ? (
                    <AdminTimeControls
                      timeManager={(window as any).gameTimeManager}
                    />
                  ) : (
                    <div className="text-center text-amber-200">
                      <p>
                        Time controls will appear here when the game is running.
                      </p>
                      <p className="text-sm text-amber-500 mt-2">
                        Note: These controls require an active game instance
                        with TimeManager.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-800/50 rounded-md text-center">
                <h3 className="font-serif text-lg font-medium text-amber-400 mb-3">
                  Game Time Controls
                </h3>
                <p className="text-amber-200 mb-4">
                  No active game detected. Start the game to access time
                  controls.
                </p>
                <div className="animate-pulse text-5xl mb-6">🎮</div>
                <div className="flex flex-col space-y-3">
                  <button
                    className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      setIsVisible(false);
                      // Redirect to the game page in the same window
                      window.location.href = "/game";
                    }}
                  >
                    Launch Game
                  </button>
                  <button
                    className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      // Open game in a new tab
                      window.open("/game", "_blank");
                    }}
                  >
                    Open Game in New Tab
                  </button>
                </div>
                <p className="text-amber-500/70 text-xs mt-4">
                  Once the game is running, return to this panel to access time
                  controls
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-amber-700 flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span className="text-green-300 text-sm">
                Passed: {testCases.filter((t) => t.status === "passed").length}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <span className="text-red-300 text-sm">
                Failed: {testCases.filter((t) => t.status === "failed").length}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              <span className="text-yellow-300 text-sm">
                Pending:{" "}
                {testCases.filter((t) => t.status === "pending").length}
              </span>
            </div>
          </div>
          <div className="text-amber-200 text-sm">
            Total Test Cases: {testCases.length}
          </div>
        </div>
      </div>
    </div>
  );
}
