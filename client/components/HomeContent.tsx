// src/components/HomeContent.tsx

"use client";

import React from "react";
import Device from "./Device"; // LSL Data
import GameDataComponent from "./GameData"; // 2D Game Data
import { useData } from "@/context/DataContext";

const HomeContent: React.FC = () => {
  const { isGameStarted, stopGame } = useData();

  return (
    <div className={`relative ${!isGameStarted ? "blur-sm" : ""}`}>
      <section className="flex flex-col space-y-6 p-6 w-full">
        {/* CombinedChart takes the full width */}

        {/* Existing dashboard layout with adjusted widths */}
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 w-full">
          {/* Device Dashboard takes 2/5 of the width */}
          <div className="device-dashboard w-full md:w-2/5 p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="device-header">
              <h2 className="text-3xl font-semibold text-blue-400">LSL Data Dashboard</h2>
            </div>
            <div className="device-content mt-6">
              <Device />
            </div>
          </div>

          {/* GameData Dashboard takes 3/5 of the width */}
          <div className="game-dashboard w-full md:w-3/5 p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="game-header">
              <h2 className="text-3xl font-semibold text-blue-400">Game Data Dashboard</h2>
            </div>
            <div className="game-content mt-6">
              <GameDataComponent />
            </div>
          </div>
        </div>

        {/* "Stop Game" Button at the bottom */}
        {isGameStarted && (
          <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            stopGame();
            window.location.reload(); // Füge das Reload hier hinzu
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Stop Game
        </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeContent;
