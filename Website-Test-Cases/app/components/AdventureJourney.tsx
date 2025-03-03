"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Prophecy,
  StoryEvent,
  PlayerJourney,
  generateProphecyForCharacter,
  generateEvents,
  CharacterInfo,
} from "./ProphecyEngine";

// Define props for the component
type AdventureJourneyProps = {
  character: CharacterInfo;
  onComplete: (journey: PlayerJourney) => void;
};

export default function AdventureJourney({
  character,
  onComplete,
}: AdventureJourneyProps) {
  // Set up state for tracking the player's journey
  const [currentEvent, setCurrentEvent] = useState<StoryEvent | null>(null);
  const [availableEvents, setAvailableEvents] = useState<StoryEvent[]>([]);
  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [playerJourney, setPlayerJourney] = useState<PlayerJourney>({
    choices: [],
    visitedEvents: [],
    fulfilledProphecies: [],
    traits: [],
  });
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [showProphecies, setShowProphecies] = useState(false);

  // Initialize the adventure with prophecies and first event
  useEffect(() => {
    // Generate prophecies based on character
    const generatedProphecies = generateProphecyForCharacter(character);
    setProphecies(generatedProphecies);

    // Generate initial events
    const initialEvents = generateEvents(character, playerJourney);
    setAvailableEvents(initialEvents);

    // Set the first event (crossroads is always the first)
    const firstEvent = initialEvents.find((event) => event.id === "crossroads");
    if (firstEvent) {
      setCurrentEvent(firstEvent);
    }
  }, [character]);

  // Handle choosing an option
  const handleChoiceSelect = (choiceId: string) => {
    if (!currentEvent) return;

    setSelectedChoice(choiceId);

    // Find the choice that was selected
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    // Set outcome text
    setOutcome(choice.outcome);
    setShowOutcome(true);

    // Update player journey
    const updatedJourney = { ...playerJourney };
    updatedJourney.choices.push(choiceId);

    if (!updatedJourney.visitedEvents.includes(currentEvent.id)) {
      updatedJourney.visitedEvents.push(currentEvent.id);
    }

    // Apply effects from the choice
    if (
      choice.effect.addTrait &&
      !updatedJourney.traits.includes(choice.effect.addTrait)
    ) {
      updatedJourney.traits.push(choice.effect.addTrait);
    }

    // Check if any prophecy was fulfilled by this choice
    const newFulfilledProphecies: string[] = [];

    prophecies.forEach((prophecy) => {
      if (prophecy.fulfilled) return;

      // Check if all requirements for the prophecy have been met
      const choicesRequired = prophecy.requirements.choices.every(
        (c) => updatedJourney.choices.includes(c) || choiceId === c
      );

      const eventsRequired = prophecy.requirements.events.every(
        (e) =>
          updatedJourney.visitedEvents.includes(e) || currentEvent?.id === e
      );

      let traitsRequired = true;
      if (prophecy.requirements.characterTraits) {
        // Check character traits
        for (const [key, value] of Object.entries(
          prophecy.requirements.characterTraits
        )) {
          if (
            key === "characterClass" ||
            key === "alignment" ||
            key === "realm"
          ) {
            if (character[key] !== value) {
              traitsRequired = false;
              break;
            }
          }
        }
      }

      if (choicesRequired && eventsRequired && traitsRequired) {
        newFulfilledProphecies.push(prophecy.id);
      }
    });

    if (newFulfilledProphecies.length > 0) {
      updatedJourney.fulfilledProphecies.push(...newFulfilledProphecies);

      // Update prophecies state
      const updatedProphecies = prophecies.map((prophecy) => {
        if (newFulfilledProphecies.includes(prophecy.id)) {
          return { ...prophecy, fulfilled: true };
        }
        return prophecy;
      });

      setProphecies(updatedProphecies);
    }

    setPlayerJourney(updatedJourney);

    // After 3 seconds, proceed to the next event or conclude the journey
    setTimeout(() => {
      setShowOutcome(false);
      processNextEvent(choice, updatedJourney);
    }, 3000);
  };

  // Process the next event based on the choice made
  const processNextEvent = (choice: any, updatedJourney: PlayerJourney) => {
    if (choice.effect.unlockEvent) {
      // Find the next event based on the choice
      const nextEvent = availableEvents.find(
        (e) => e.id === choice.effect.unlockEvent
      );

      if (nextEvent) {
        // Check if the event has conditions and if they're met
        if (nextEvent.condition) {
          if (nextEvent.condition(character, updatedJourney.choices)) {
            setCurrentEvent(nextEvent);
            return;
          }
        } else {
          setCurrentEvent(nextEvent);
          return;
        }
      }
    }

    // If we've visited 3 or more events, potentially end the journey
    if (updatedJourney.visitedEvents.length >= 3 && Math.random() > 0.7) {
      setJourneyComplete(true);
      onComplete(updatedJourney);
      return;
    }

    // Otherwise, choose a random available event
    const eligibleEvents = availableEvents.filter(
      (event) =>
        !updatedJourney.visitedEvents.includes(event.id) &&
        (!event.condition || event.condition(character, updatedJourney.choices))
    );

    if (eligibleEvents.length > 0) {
      const randomEvent =
        eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
      setCurrentEvent(randomEvent);
    } else {
      // No more eligible events, end the journey
      setJourneyComplete(true);
      onComplete(updatedJourney);
    }
  };

  // Toggle prophecy view
  const toggleProphecies = () => {
    setShowProphecies(!showProphecies);
  };

  // Generate a summary of the journey so far
  const generateJourneySummary = () => {
    if (playerJourney.visitedEvents.length === 0)
      return "Your journey has just begun...";

    const visitedEventNames = playerJourney.visitedEvents.map((id) => {
      const event = availableEvents.find((e) => e.id === id);
      return event ? event.title : id;
    });

    const fulfilledProphecyNames = playerJourney.fulfilledProphecies.map(
      (id) => {
        const prophecy = prophecies.find((p) => p.id === id);
        return prophecy ? prophecy.title : id;
      }
    );

    const traits = playerJourney.traits.join(", ");

    return `
      Your journey as ${
        character.adventurerName
      } has taken you through ${visitedEventNames.join(", ")}.
      ${
        fulfilledProphecyNames.length > 0
          ? `You have fulfilled the prophecies of ${fulfilledProphecyNames.join(
              ", "
            )}.`
          : "No prophecies have been fulfilled yet."
      }
      ${traits ? `You have gained these traits: ${traits}.` : ""}
    `;
  };

  // Render the journey completion view
  if (journeyComplete) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg border border-amber-300/30 overflow-hidden p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-serif font-bold text-amber-300 mb-6">
            Your Epic Tale Concludes... For Now
          </h2>

          <div className="bg-slate-800/60 border border-amber-900/30 rounded-lg p-6 mb-6 text-amber-100">
            <p className="mb-4">{generateJourneySummary()}</p>

            {playerJourney.fulfilledProphecies.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-serif font-bold text-amber-300 mb-3">
                  Prophecies Fulfilled
                </h3>
                <div className="space-y-3">
                  {playerJourney.fulfilledProphecies.map((id) => {
                    const prophecy = prophecies.find((p) => p.id === id);
                    return prophecy ? (
                      <div key={id} className="bg-amber-900/20 rounded p-3">
                        <h4 className="font-bold text-amber-200">
                          {prophecy.title}
                        </h4>
                        <p className="italic text-amber-100/80 mb-2">
                          {prophecy.description}
                        </p>
                        <p className="text-green-300">{prophecy.outcome}</p>
                        <div className="mt-2 text-amber-200 font-bold">
                          {prophecy.rewardDescription}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {playerJourney.fulfilledProphecies.length < prophecies.length && (
              <div className="mt-6">
                <h3 className="text-lg font-serif font-bold text-amber-300 mb-3">
                  Unfulfilled Destinies
                </h3>
                <p className="text-amber-100/80">
                  The tapestry of fate still holds untold stories for you.
                  Perhaps on your next journey, you'll discover what could have
                  been...
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-md hover:bg-amber-400 transition-all duration-300 transform hover:-translate-y-1 font-medium"
          >
            Begin A New Adventure
          </button>
        </motion.div>
      </div>
    );
  }

  // Main adventure journey UI
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg border border-amber-300/30 overflow-hidden">
      {/* Prophecy tome button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleProphecies}
          className="px-4 py-2 bg-amber-700/50 hover:bg-amber-600/50 text-amber-200 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>Prophecy Tome</span>
        </button>
      </div>

      {/* Prophecy view */}
      <AnimatePresence>
        {showProphecies && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-slate-900/95 z-50 overflow-auto p-6"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-amber-300">
                  Prophecies of the Realms
                </h2>
                <button
                  onClick={toggleProphecies}
                  className="p-2 text-amber-200 hover:text-amber-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {prophecies.map((prophecy) => (
                  <div
                    key={prophecy.id}
                    className={`p-4 rounded-lg border ${
                      prophecy.fulfilled
                        ? "bg-green-900/20 border-green-800/50 text-green-200"
                        : "bg-amber-900/20 border-amber-800/50 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-serif font-bold">
                        {prophecy.title}
                      </h3>
                      {prophecy.fulfilled && (
                        <span className="ml-auto px-2 py-1 bg-green-800/50 text-green-200 text-xs rounded-full">
                          Fulfilled
                        </span>
                      )}
                    </div>
                    <p className="italic mb-3">{prophecy.description}</p>
                    {prophecy.fulfilled && (
                      <div className="mt-3">
                        <p>{prophecy.outcome}</p>
                        <p className="mt-2 font-bold">
                          {prophecy.rewardDescription}
                        </p>
                        {prophecy.consequence && (
                          <p className="mt-2 text-red-300 italic">
                            {prophecy.consequence}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleProphecies}
                  className="px-6 py-2 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600 transition-colors"
                >
                  Return to Your Journey
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current event */}
      {currentEvent && (
        <div
          className="min-h-[500px] p-6 flex flex-col justify-between"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url(${currentEvent.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-4">
              {currentEvent.title}
            </h2>

            <div className="prose prose-amber prose-invert max-w-none">
              <p className="text-amber-100">{currentEvent.description}</p>
            </div>
          </div>

          {/* Outcome display */}
          <AnimatePresence>
            {showOutcome && outcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="my-6 p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg"
              >
                <p className="text-amber-100 italic">{outcome}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choices */}
          <div
            className={`space-y-3 mt-6 ${
              showOutcome ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {currentEvent.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.id)}
                disabled={showOutcome || selectedChoice !== null}
                className={`w-full p-4 text-left rounded-lg transition-all ${
                  selectedChoice === choice.id
                    ? "bg-amber-600 text-white"
                    : "bg-slate-800/90 hover:bg-slate-700/90 text-amber-200 hover:text-amber-100"
                }`}
              >
                {choice.text}
              </button>
            ))}
          </div>

          {/* Journey progress */}
          <div className="mt-8 text-xs text-amber-100/50">
            <span>Paths taken: {playerJourney.visitedEvents.length}</span>
            <span className="mx-2">•</span>
            <span>
              Prophecies fulfilled: {playerJourney.fulfilledProphecies.length}/
              {prophecies.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
