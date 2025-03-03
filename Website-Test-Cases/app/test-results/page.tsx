import React from "react";
import TestResults from "../components/TestResults";

export default function TestResultsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-amber-300 mb-6">Test Results</h1>
      <TestResults />
    </div>
  );
}
