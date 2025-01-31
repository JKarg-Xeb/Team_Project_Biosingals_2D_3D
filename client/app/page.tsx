// src/app/page.tsx

import React from "react";
import Dashboard from "@/components/Dashboard";
import { DataProvider } from "@/context/DataContext";

const Page: React.FC = () => {
  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
};

export default Page;