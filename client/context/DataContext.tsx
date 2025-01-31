// src/context/DataContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

// Typing for 2D Game Data
export interface GameData {
  klickZeiten: number[];
  finalKontostand: number;
  currentReward: number;
  cardIndex: number | null;
  timestamp: number;
}

// Typing for LSL Data
export interface DataPoint {
  timestamp: number;
  values: {
    EDA: number;
    ECG: number;
  };
}

// New Typing for CSV Data
export interface CsvData {
  filename: string;
  data: any[]; // You can provide a more precise typing here if known
}

// Define the structure of the context
interface DataContextType {
  gameData: GameData[];
  lslData: DataPoint[];
  startGame: () => void;
  stopGame: () => void;
  isGameStarted: boolean;
  allCsvData: CsvData[]; // New property added
  fetchAllCsvData: () => void; // New function added
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider Component
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [lslData, setLslData] = useState<DataPoint[]>([]);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isLSLRunning, setIsLSLRunning] = useState<boolean>(false);

  // New state variable for CSV data
  const [allCsvData, setAllCsvData] = useState<CsvData[]>([]);

  // Fetch game data via SSE
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/sse_game_data");

    eventSource.onmessage = (event) => {
      const newGameData: GameData = JSON.parse(event.data);
      setGameData((prevData) => [...prevData, newGameData]);
    };

    eventSource.onerror = (err) => {
      console.error("Error receiving SSE data:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Fetch LSL data (Polling every 1 second)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchLSLData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/get_lsl_data");
        if (response.status === 200 && response.data.data) {
          const newData: DataPoint[] = response.data.data;
          setLslData((prevData) => {
            const updatedData = [...prevData, ...newData];
            return updatedData.slice(-1000); // Limit to the last 1000 data points
          });
        }
      } catch (error) {
        console.error("Error fetching LSL data:", error);
      }
    };

    if (isLSLRunning) {
      fetchLSLData();
      interval = setInterval(fetchLSLData, 1000); // Fetch every 1 second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLSLRunning]);

  // New function to fetch all CSV data
  const fetchAllCsvData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get_all_csv_data");
      if (response.status === 200 && response.data) {
        setAllCsvData(response.data);
      }
    } catch (error) {
      console.error("Error fetching all CSV data:", error);
    }
  };

  // Functions to start and stop LSL acquisition
  const startLSLAcquisition = async () => {
    try {
      const response = await axios.get("http://localhost:8080/start_acquisition");
      if (response.status === 200) {
        setIsLSLRunning(true);
      }
    } catch (error) {
      console.error("Error starting data acquisition", error);
    }
  };

  const stopLSLAcquisition = async () => {
    try {
      const response = await axios.get("http://localhost:8080/stop_acquisition");
      if (response.status === 200) {
        setIsLSLRunning(false);
      }
    } catch (error) {
      console.error("Error stopping data acquisition", error);
    }
  };

  // Function to start the game and acquisition
  const startGame = () => {
    setIsGameStarted(true);
    startLSLAcquisition();
  };

  // Function to stop the game and acquisition
  const stopGame = () => {
    setIsGameStarted(false);
    stopLSLAcquisition();
  };

  return (
    <DataContext.Provider
      value={{
        gameData,
        lslData,
        startGame,
        stopGame,
        isGameStarted,
        allCsvData, // Provided new property
        fetchAllCsvData, // Provided new function
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom Hook to use the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
