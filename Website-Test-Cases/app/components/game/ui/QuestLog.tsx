import React, { useState } from "react";
import PaperUIFrame from "./PaperUIFrame";
import PaperUIButton from "./PaperUIButton";

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "failed";
  reward: {
    gold: number;
    items?: string[];
    experience?: number;
  };
  objectives: {
    id: string;
    description: string;
    completed: boolean;
  }[];
}

interface QuestLogProps {
  quests: Quest[];
  onQuestTrack: (quest: Quest) => void;
  onQuestAbandon: (quest: Quest) => void;
  onClose: () => void;
  className?: string;
}

export default function QuestLog({
  quests,
  onQuestTrack,
  onQuestAbandon,
  onClose,
  className = "",
}: QuestLogProps) {
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    quests.find((q) => q.status === "active")?.id || quests[0]?.id || null
  );
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Get the selected quest
  const selectedQuest = quests.find((q) => q.id === selectedQuestId);

  // Filter quests based on selected filter
  const filteredQuests = quests.filter((quest) => {
    if (filter === "all") return true;
    if (filter === "active") return quest.status === "active";
    if (filter === "completed") return quest.status === "completed";
    return true;
  });

  return (
    <div
      className="w-[800px] max-w-[95vw] h-[600px] max-h-[95vh] bg-cover bg-no-repeat relative p-6"
      style={{
        backgroundImage:
          "url('/assets/Free Paper UI System/1 Sprites/Paper UI Pack/Paper UI/Folding & Cutout/1 Paper/1.png')",
        backgroundSize: "100% 100%",
      }}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-paper-brown hover:text-amber-800 transition-colors"
        onClick={onClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <h2 className="font-medieval text-2xl text-center mb-4 text-paper-brown">
        Quest Log
      </h2>

      {/* Quest filters */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            filter === "all"
              ? "bg-amber-800 text-amber-100"
              : "bg-amber-100 text-amber-800"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            filter === "active"
              ? "bg-amber-800 text-amber-100"
              : "bg-amber-100 text-amber-800"
          }`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            filter === "completed"
              ? "bg-amber-800 text-amber-100"
              : "bg-amber-100 text-amber-800"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {/* Content area - Split view with quest list and quest details */}
      <div className="flex h-[450px] gap-4">
        {/* Quest list */}
        <div className="w-1/3 overflow-y-auto pr-2">
          {filteredQuests.length === 0 ? (
            <div className="text-center text-paper-brown p-4">
              No quests to display
            </div>
          ) : (
            filteredQuests.map((quest) => (
              <div
                key={quest.id}
                className={`mb-2 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedQuestId === quest.id
                    ? "bg-amber-800/20 border-l-4 border-amber-800"
                    : "hover:bg-amber-100/30"
                }`}
                onClick={() => setSelectedQuestId(quest.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      quest.status === "completed"
                        ? "bg-green-600"
                        : quest.status === "failed"
                        ? "bg-red-600"
                        : "bg-amber-600"
                    }`}
                  />
                  <span className="text-paper-brown font-medium">
                    {quest.title}
                  </span>
                </div>
                <div className="text-xs text-paper-brown/70 mt-1 line-clamp-2">
                  {quest.description}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quest details */}
        <div className="w-2/3 bg-amber-50/20 rounded-lg p-4 overflow-y-auto">
          {selectedQuest ? (
            <>
              <h3 className="text-xl font-bold text-paper-brown mb-2">
                {selectedQuest.title}
              </h3>

              <div className="text-paper-brown/80 mb-4">
                {selectedQuest.description}
              </div>

              {/* Objectives */}
              <div className="mb-4">
                <h4 className="font-bold text-paper-brown mb-2">Objectives:</h4>
                <ul className="space-y-2">
                  {selectedQuest.objectives.map((objective) => (
                    <li key={objective.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={objective.completed}
                        readOnly
                        className="mt-1 mr-2"
                      />
                      <span
                        className={`text-paper-brown ${
                          objective.completed ? "line-through opacity-70" : ""
                        }`}
                      >
                        {objective.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards */}
              <div className="mb-6">
                <h4 className="font-bold text-paper-brown mb-2">Rewards:</h4>
                <div className="flex items-center space-x-4">
                  {selectedQuest.reward.gold > 0 && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-amber-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-paper-brown">
                        {selectedQuest.reward.gold} coins
                      </span>
                    </div>
                  )}

                  {selectedQuest.reward.experience && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <span className="text-paper-brown">
                        {selectedQuest.reward.experience} XP
                      </span>
                    </div>
                  )}
                </div>

                {selectedQuest.reward.items &&
                  selectedQuest.reward.items.length > 0 && (
                    <div className="mt-2">
                      <span className="text-paper-brown">
                        Items: {selectedQuest.reward.items.join(", ")}
                      </span>
                    </div>
                  )}
              </div>

              {/* Quest action buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                {selectedQuest.status === "active" ? (
                  <>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      onClick={() => onQuestAbandon(selectedQuest)}
                    >
                      Abandon
                    </button>
                    <button
                      className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-sm"
                      onClick={() => onQuestTrack(selectedQuest)}
                    >
                      Track
                    </button>
                  </>
                ) : selectedQuest.status === "completed" ? (
                  <div className="text-green-600 font-medium">Completed</div>
                ) : (
                  <div className="text-red-600 font-medium">Failed</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-paper-brown p-4">
              Select a quest to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
