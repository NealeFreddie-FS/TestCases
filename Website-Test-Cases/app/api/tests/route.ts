import { NextResponse } from "next/server";

// Define the TestResult type
export type TestResult = {
  id: string;
  component: string;
  name: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  error?: string;
  timestamp: string;
};

// Mock test results data
const mockTestResults: TestResult[] = [
  {
    id: "test-1",
    component: "FantasyForm",
    name: "renders the form with all fields",
    status: "passed",
    duration: 42,
    timestamp: "2023-05-20T14:32:11Z",
  },
  {
    id: "test-2",
    component: "FantasyForm",
    name: "validates required fields",
    status: "passed",
    duration: 78,
    timestamp: "2023-05-20T14:32:12Z",
  },
  {
    id: "test-3",
    component: "FantasyForm",
    name: "handles form submission",
    status: "failed",
    duration: 103,
    error:
      "Expected function to be called with arguments { realm: 'Midgard' } but was called with { realm: 'midgard' }",
    timestamp: "2023-05-20T14:32:13Z",
  },
  {
    id: "test-4",
    component: "Navigation",
    name: "renders navigation links",
    status: "passed",
    duration: 35,
    timestamp: "2023-05-20T14:32:14Z",
  },
  {
    id: "test-5",
    component: "Navigation",
    name: "highlights active link",
    status: "passed",
    duration: 51,
    timestamp: "2023-05-20T14:32:15Z",
  },
  {
    id: "test-6",
    component: "AdminPanel",
    name: "toggles visibility with 'p' key",
    status: "passed",
    duration: 68,
    timestamp: "2023-05-20T14:32:16Z",
  },
  {
    id: "test-7",
    component: "AdminPanel",
    name: "displays status counts correctly",
    status: "passed",
    duration: 72,
    timestamp: "2023-05-20T14:32:17Z",
  },
  {
    id: "test-8",
    component: "FeedbackEntries",
    name: "displays loading state",
    status: "passed",
    duration: 45,
    timestamp: "2023-05-20T14:32:18Z",
  },
  {
    id: "test-9",
    component: "FeedbackEntries",
    name: "expands entry on click",
    status: "pending",
    duration: 0,
    timestamp: "2023-05-20T14:32:19Z",
  },
  {
    id: "test-10",
    component: "TestResults",
    name: "filters results by status",
    status: "pending",
    duration: 0,
    timestamp: "2023-05-20T14:32:20Z",
  },
];

export async function GET() {
  // Simulate a delay to show loading state in the UI
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return the mock data
  return NextResponse.json(mockTestResults);
}
