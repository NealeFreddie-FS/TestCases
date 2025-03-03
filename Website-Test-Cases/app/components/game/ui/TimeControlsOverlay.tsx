import React, { useState } from "react";
import { TimeManager } from "../managers/TimeManager";
import AdminTimeControls from "./AdminTimeControls";

interface TimeControlsOverlayProps {
  timeManager: TimeManager;
}

/**
 * A floating button that opens a modal with advanced time controls
 * This is for development and testing purposes
 */
export default function TimeControlsOverlay({
  timeManager,
}: TimeControlsOverlayProps) {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="fixed z-50">
      {/* Floating button in the top-right corner */}
      <button
        onClick={toggleModal}
        className="fixed top-4 right-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg"
        title="Advanced Time Controls"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Modal with advanced time controls */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-indigo-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-indigo-700">
              <h2 className="text-xl font-medium text-indigo-300">
                Advanced Time Controls
              </h2>
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-white"
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
            </div>
            <div className="p-6">
              <AdminTimeControls timeManager={timeManager} />
            </div>
            <div className="border-t border-indigo-700 p-4 flex justify-end">
              <button
                onClick={toggleModal}
                className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
