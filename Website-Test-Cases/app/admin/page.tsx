"use client";

import { useState } from "react";
import TestResults from "../components/TestResults";
import FeedbackEntries from "../components/FeedbackEntries";

// Define tab types
type TabType = "submissions" | "testResults" | "stats";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );

  const handleViewSubmission = (id: string) => {
    setSelectedSubmission(id);
  };

  // Mock stats data
  const stats = {
    totalSubmissions: 124,
    submissionsThisWeek: 23,
    averageRating: 4.7,
    testsPassed: 98,
    testsFailed: 2,
  };

  // Mock submissions data
  const submissions = [
    {
      id: "sub-1",
      name: "Aragorn",
      realm: "Gondor",
      submitted: "2023-05-15T10:23:45Z",
      rating: 5,
    },
    {
      id: "sub-2",
      name: "Gandalf",
      realm: "Valinor",
      submitted: "2023-05-14T08:42:12Z",
      rating: 4,
    },
    {
      id: "sub-3",
      name: "Legolas",
      realm: "Mirkwood",
      submitted: "2023-05-13T15:36:29Z",
      rating: 5,
    },
    {
      id: "sub-4",
      name: "Gimli",
      realm: "Erebor",
      submitted: "2023-05-12T11:18:05Z",
      rating: 3,
    },
    {
      id: "sub-5",
      name: "Frodo",
      realm: "The Shire",
      submitted: "2023-05-11T09:51:37Z",
      rating: 4,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-amber-300 mb-2">
          Admin Council Chamber
        </h1>
        <p className="text-amber-100">
          Monitor thy realm, observe test incantations, and review scrolls
          submitted by adventurers
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-amber-900/30">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "stats"
                ? "bg-amber-500 text-slate-900"
                : "text-amber-300 hover:text-amber-400"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            Stats Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "submissions"
                ? "bg-amber-500 text-slate-900"
                : "text-amber-300 hover:text-amber-400"
            }`}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "testResults"
                ? "bg-amber-500 text-slate-900"
                : "text-amber-300 hover:text-amber-400"
            }`}
            onClick={() => setActiveTab("testResults")}
          >
            Test Results
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/40 border border-amber-900/20 rounded-lg p-6">
        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              Kingdom Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-serif text-amber-300 mb-2">
                  Submissions
                </h3>
                <p className="text-4xl font-bold text-amber-400 mb-2">
                  {stats.totalSubmissions}
                </p>
                <p className="text-sm text-amber-200">
                  {stats.submissionsThisWeek} this week
                </p>
              </div>
              <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-serif text-amber-300 mb-2">
                  Average Rating
                </h3>
                <p className="text-4xl font-bold text-amber-400 mb-2">
                  {stats.averageRating}
                </p>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(stats.averageRating)
                          ? "text-amber-400"
                          : "text-gray-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-serif text-amber-300 mb-2">
                  Test Status
                </h3>
                <p className="text-4xl font-bold text-green-400 mb-2">
                  {stats.testsPassed}/{stats.testsPassed + stats.testsFailed}
                </p>
                <p className="text-sm text-green-300">
                  {(
                    (stats.testsPassed /
                      (stats.testsPassed + stats.testsFailed)) *
                    100
                  ).toFixed(1)}
                  % passing
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-serif text-amber-300 mb-4">
                Recent Feedback
              </h3>
              <FeedbackEntries />
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              {selectedSubmission ? "Submission Details" : "All Submissions"}
            </h2>

            {selectedSubmission ? (
              // Submission detail view
              <div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="mb-4 px-3 py-1 bg-slate-700 text-amber-300 rounded-md hover:bg-slate-600 flex items-center text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Submissions
                </button>

                {/* Find the selected submission */}
                {(() => {
                  const submission = submissions.find(
                    (s) => s.id === selectedSubmission
                  );
                  if (!submission)
                    return (
                      <p className="text-amber-200">Submission not found</p>
                    );

                  return (
                    <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-serif text-amber-300 mb-4">
                            Adventurer Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-amber-200/60 text-sm">Name</p>
                              <p className="text-amber-100 font-medium">
                                {submission.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-amber-200/60 text-sm">Realm</p>
                              <p className="text-amber-100 font-medium">
                                {submission.realm}
                              </p>
                            </div>
                            <div>
                              <p className="text-amber-200/60 text-sm">
                                Submitted
                              </p>
                              <p className="text-amber-100 font-medium">
                                {new Date(
                                  submission.submitted
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  submission.submitted
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-amber-200/60 text-sm">
                                Rating
                              </p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= submission.rating
                                        ? "text-amber-400"
                                        : "text-gray-500"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-serif text-amber-300 mb-4">
                            Submission Content
                          </h3>
                          <div className="p-4 bg-slate-900/60 border border-amber-900/30 rounded-lg">
                            <p className="text-amber-100 italic">
                              "The quest was most enjoyable, though I did face a
                              few challenges. The interface scrolls were easy to
                              decipher, and the magical items were quite useful
                              during my journey."
                            </p>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-amber-200 mb-2">
                              Selected Magical Items:
                            </h4>
                            <ul className="text-amber-100 space-y-1 list-disc pl-5">
                              <li>Interface Potion</li>
                              <li>Navigation Crystal</li>
                              <li>Responsive Scroll</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // Submissions list view
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-amber-900/30">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                        Adventurer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                        Realm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-amber-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-slate-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-amber-100">
                          {submission.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-amber-100">
                          {submission.realm}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-amber-100">
                          {new Date(submission.submitted).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= submission.rating
                                    ? "text-amber-400"
                                    : "text-gray-500"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewSubmission(submission.id)}
                            className="text-amber-400 hover:text-amber-300 text-sm"
                          >
                            View Scroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Test Results Tab */}
        {activeTab === "testResults" && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
              Test Results
            </h2>
            <TestResults />
          </div>
        )}
      </div>
    </div>
  );
}
