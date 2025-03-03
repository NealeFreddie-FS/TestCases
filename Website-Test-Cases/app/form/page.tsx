import React from "react";
import { Metadata } from "next";
import FantasyForm from "../components/FantasyForm";

export const metadata: Metadata = {
  title: "The Realm Questionnaire | Fantasy Feedback",
  description: "Share your wisdom with the Council of Elders",
};

export default function FormPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-lg shadow-lg border-2 border-amber-300 mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-300 text-center mb-4">
          The Grand Questionnaire of the Realm
        </h1>
        <p className="text-lg text-amber-100 text-center mb-6">
          Brave traveler, the Council of Elders seeks your wisdom. Complete this
          sacred scroll to share your knowledge with the realm.
        </p>
        <div className="flex justify-center">
          <div className="w-24 h-1 bg-amber-400 rounded"></div>
        </div>
      </div>

      <FantasyForm />
    </div>
  );
}
