// src/components/StartOverlay.tsx

"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { useRouter } from 'next/navigation'; // Import useRouter

const StartOverlay: React.FC = () => {
  const { startGame } = useData();
  const router = useRouter(); // Initialize the router

  const handleAnalyze = () => {
    router.push('/analysis'); // Navigate to the analysis page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-4 text-black">Welcome to the Game Dashboard</h2>
        <button
          onClick={startGame}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-4"
        >
          Start Game
        </button>
        {/* Optional: Uncomment the button below if you want to include the Analyze feature */}
        {/* <button
          onClick={handleAnalyze}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Analyze
        </button> */}
      </div>
    </div>
  );
};

export default StartOverlay;
