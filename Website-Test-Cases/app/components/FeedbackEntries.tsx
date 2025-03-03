"use client";

import { useState, useEffect } from "react";

// Define the feedback entry type
type FeedbackEntry = {
  id: string;
  adventurerName: string;
  characterClass: string;
  realm: string;
  questExperience: string;
  magicalItems: string[];
  rating: number;
  timestamp: string;
};

export default function FeedbackEntries() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch feedback entries
    const fetchEntries = async () => {
      try {
        setLoading(true);

        // In a real app, this would be an API call to get feedback entries
        const response = await fetch("/api/feedback");

        if (!response.ok) {
          throw new Error("Failed to fetch feedback entries");
        }

        const data = await response.json();
        setEntries(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch feedback entries", err);
        setError("Failed to summon the feedback scrolls");
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedEntryId === id) {
      setExpandedEntryId(null);
    } else {
      setExpandedEntryId(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-amber-400/20 rounded-full mb-4"></div>
          <div className="text-amber-300">Summoning ancient scrolls...</div>
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
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-slate-800/60 border border-amber-900/30 rounded-lg overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer hover:bg-slate-700/30"
            onClick={() => toggleExpand(entry.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-amber-200 font-medium">
                    {entry.adventurerName}
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      entry.characterClass === "warrior"
                        ? "bg-red-900/40 text-red-300"
                        : entry.characterClass === "mage"
                        ? "bg-blue-900/40 text-blue-300"
                        : entry.characterClass === "ranger"
                        ? "bg-green-900/40 text-green-300"
                        : "bg-purple-900/40 text-purple-300"
                    }`}
                  >
                    {entry.characterClass.charAt(0).toUpperCase() +
                      entry.characterClass.slice(1)}
                  </span>
                </div>
                <div className="text-amber-100/80 text-sm mb-1">
                  from {entry.realm}
                </div>
                <div className="text-amber-100/60 text-xs">
                  {formatDate(entry.timestamp)}
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex mr-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= entry.rating
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
                <svg
                  className={`w-5 h-5 text-amber-300 transform transition-transform ${
                    expandedEntryId === entry.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {expandedEntryId === entry.id && (
            <div className="px-4 pb-4 pt-1 border-t border-amber-900/20">
              <div className="text-sm text-amber-100 mb-3">
                <p className="italic">"{entry.questExperience}"</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-amber-300 mb-1">
                  Magical Items:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {entry.magicalItems.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-amber-900/30 text-amber-300 text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
