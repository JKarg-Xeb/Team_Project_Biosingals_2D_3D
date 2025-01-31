// src/components/Dashboard.tsx

"use client";

import React from "react";
import StartOverlay from "@/components/SartOverlay";
import HomeContent from "@/components/HomeContent";
import { useData } from "@/context/DataContext";

const Dashboard: React.FC = () => {
  const { isGameStarted } = useData();

  return (
    <>
      {!isGameStarted && <StartOverlay />}
      <HomeContent />
    </>
  );
};

export default Dashboard;