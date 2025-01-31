"use client";

import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useData } from "@/context/DataContext";

// (Optional) If you want to enable Zoom/Panning, additionally import:
// import zoomPlugin from 'chartjs-plugin-zoom';
// ChartJS.register(zoomPlugin);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
  // zoomPlugin (if you want to enable zooming)
);

// Mapping from cardIndex to letters
const cardLetters: { [key: number]: string } = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
};

// Colors for the cards
const cardColors: { [key: number]: string } = {
  1: "rgba(255, 99, 132, 1)",    // Card 1: Red
  2: "rgba(54, 162, 235, 1)",    // Card 2: Blue
  3: "rgba(255, 206, 86, 1)",    // Card 3: Yellow
  4: "rgba(75, 192, 192, 1)",    // Card 4: Green
};

const GameDataComponent: React.FC = () => {
  const { gameData } = useData(); // Access gameData from context
  const [visualization, setVisualization] = useState<"line" | "bar">("line"); // Control visualization type

  // State for the modal (stores which chart is currently enlarged)
  const [expandedChart, setExpandedChart] = useState<null | "main" | "cards" | "time">(null);

  // Functions to control the modal
  const openModal = (chart: "main" | "cards" | "time") => setExpandedChart(chart);
  const closeModal = () => setExpandedChart(null);

  // Function to calculate plus and minus points for each card
  const getCardPoints = () => {
    const points: { [key: number]: { plus: number; minus: number } } = {
      1: { plus: 0, minus: 0 },
      2: { plus: 0, minus: 0 },
      3: { plus: 0, minus: 0 },
      4: { plus: 0, minus: 0 },
    };

    gameData.forEach((data) => {
      if (data.cardIndex !== null && data.cardIndex >= 1 && data.cardIndex <= 4) {
        if (data.currentReward > 0) {
          points[data.cardIndex].plus += data.currentReward;
        } else {
          points[data.cardIndex].minus += Math.abs(data.currentReward);
        }
      }
    });

    return points;
  };

  // Function to get an overview of the latest data
  const getLastDataOverview = () => {
    const lastData = gameData[gameData.length - 1];
    if (!lastData) return { plus: 0, minus: 0, finalBalance: 0 };
    const { currentReward, finalKontostand } = lastData;
    return {
      plus: currentReward > 0 ? currentReward : 0,
      minus: currentReward < 0 ? Math.abs(currentReward) : 0,
      finalBalance: finalKontostand,
    };
  };

  const cardPoints = getCardPoints();
  const { plus, minus, finalBalance } = getLastDataOverview();

  // Time differences between consecutive moves
  const timeDifferences: number[] = gameData.map((data, index) => {
    if (index === 0) return 0; // No previous time for the first move
    const currentTime = new Date(data.timestamp).getTime();
    const previousTime = new Date(gameData[index - 1].timestamp).getTime();
    return (currentTime - previousTime) / 1000; // Time difference in seconds
  });

  // Data points for time between moves
  const timeBetweenMovesData = gameData.map((data, index) => ({
    x: index + 1,
    y: timeDifferences[index],
    cardIndex: data.cardIndex,
  }));

  // New Line Chart (Time between moves)
  const moveTimeLineChartData: ChartData<"line"> = {
    labels: timeBetweenMovesData.map((data) => `Move ${data.x}`),
    datasets: [
      {
        label: "Time Between Moves (Seconds)",
        data: timeBetweenMovesData.map((data) => data.y),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
        pointBackgroundColor: timeBetweenMovesData.map((data) =>
          data.cardIndex ? cardColors[data.cardIndex] : "rgba(0,0,0,1)"
        ),
        pointBorderColor: timeBetweenMovesData.map((data) =>
          data.cardIndex ? cardColors[data.cardIndex] : "rgba(0,0,0,1)"
        ),
        pointStyle: timeBetweenMovesData.map(() => "circle"),
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const moveTimeLineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    // (Optional) Zoom/Pan configuration if you are using the plugin
    // plugins: {
    //   zoom: {
    //     pan: { enabled: true, mode: 'x' },
    //     zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
    //   },
    // },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Time Between Two Moves with Drawn Card",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const cardIndex = timeBetweenMovesData[index].cardIndex;
            return `Time: ${context.parsed.y.toFixed(2)}s, Card: ${
              cardIndex ? cardLetters[cardIndex] : "N/A"
            }`;
          },
        },
      },
      datalabels: {
        align: "top",
        anchor: "end",
        formatter: (value, context) => {
          const cardIndex = timeBetweenMovesData[context.dataIndex].cardIndex;
          return cardIndex ? cardLetters[cardIndex] : "";
        },
        color: "#000",
        font: {
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Move Number",
        },
      },
      y: {
        title: {
          display: true,
          text: "Time (Seconds)",
        },
        beginAtZero: true,
      },
    },
  };

  // Main Line Chart (Balance + Current Reward)
  const chartData = {
    labels: gameData.map((_, index) => `Move ${index + 1}`),
    datasets: [
      {
        label: "Balance",
        data: gameData.map((data) => data.finalKontostand),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Added Value",
        data: gameData.map((data) => data.currentReward),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    // (Optional) Zoom/Pan configuration
    // plugins: {
    //   zoom: {
    //     pan: { enabled: true, mode: 'x' },
    //     zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
    //   },
    // },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Click Times per Move with Drawn Card",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Move Number",
        },
      },
      y: {
        title: {
          display: true,
          text: "Click Time (Seconds)",
        },
        beginAtZero: true,
      },
    },
  };

  // Bar Chart (Plus and Minus Points)
  const cardPointsData = {
    labels: ["Card 1", "Card 2", "Card 3", "Card 4"],
    datasets: [
      {
        label: "Plus Points",
        data: [
          cardPoints[1].plus,
          cardPoints[2].plus,
          cardPoints[3].plus,
          cardPoints[4].plus,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
      {
        label: "Minus Points",
        data: [
          cardPoints[1].minus,
          cardPoints[2].minus,
          cardPoints[3].minus,
          cardPoints[4].minus,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    // (Optional) Zoom/Pan
    // plugins: {
    //   zoom: {
    //     pan: { enabled: true, mode: 'x' },
    //     zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
    //   },
    // },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Plus/Minus Points per Card",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Cards",
        },
      },
      y: {
        title: {
          display: true,
          text: "Points",
        },
        beginAtZero: true,
      },
    },
  };

  // Helper function for the main chart (Line/Bar toggle)
  const renderMainChart = () => {
    if (visualization === "line") {
      return <Line data={chartData} options={lineChartOptions} height={200} />;
    }
    return <Bar data={cardPointsData} options={barChartOptions} height={200} />;
  };

  // Card count
  const getCardCount = () => {
    const count = { card1: 0, card2: 0, card3: 0, card4: 0 };
    gameData.forEach((data) => {
      if (data.cardIndex === 1) count.card1++;
      if (data.cardIndex === 2) count.card2++;
      if (data.cardIndex === 3) count.card3++;
      if (data.cardIndex === 4) count.card4++;
    });
    return count;
  };

  const cardCount = getCardCount();

  return (
    <div className="p-4">
      {/* Overview */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Data Overview</h3>
        <p>Final Balance: <span className="font-bold">{finalBalance}</span></p>
        <p>Plus: <span className="font-bold">{plus}</span></p>
        <p>Minus: <span className="font-bold">{minus}</span></p>
      </div>

      {/* Card Points Overview */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Card Overview</h3>
        <p>Card 1 Plus: <span className="font-bold">{cardPoints[1].plus}</span></p>
        <p>Card 1 Minus: <span className="font-bold">{cardPoints[1].minus}</span></p>
        <p>Card 2 Plus: <span className="font-bold">{cardPoints[2].plus}</span></p>
        <p>Card 2 Minus: <span className="font-bold">{cardPoints[2].minus}</span></p>
        <p>Card 3 Plus: <span className="font-bold">{cardPoints[3].plus}</span></p>
        <p>Card 3 Minus: <span className="font-bold">{cardPoints[3].minus}</span></p>
        <p>Card 4 Plus: <span className="font-bold">{cardPoints[4].plus}</span></p>
        <p>Card 4 Minus: <span className="font-bold">{cardPoints[4].minus}</span></p>
      </div>

      {/* Card Count */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Card Count</h3>
        <p>Card 1: <span className="font-bold">{cardCount.card1}</span> drawn</p>
        <p>Card 2: <span className="font-bold">{cardCount.card2}</span> drawn</p>
        <p>Card 3: <span className="font-bold">{cardCount.card3}</span> drawn</p>
        <p>Card 4: <span className="font-bold">{cardCount.card4}</span> drawn</p>
      </div>

      {/* Main Chart with Buttons */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Main Chart</h3>
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
          <button
            onClick={() => openModal("main")}
            className="btn btn-secondary bg-gray-200 text-black"
          >
            Enlarge
          </button>
        </div>
        <div className="h-64">
          {renderMainChart()}
        </div>
      </div>

      {/* Card Points Bar Chart */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Card Points Chart</h3>
        <button
          onClick={() => openModal("cards")}
          className="btn btn-secondary mb-4 bg-gray-200 text-black"
        >
          Enlarge
        </button>
        <div className="h-64">
          <Bar data={cardPointsData} options={barChartOptions} />
        </div>
      </div>

      {/* Time Between Moves Line Chart */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white text-black">
        <h3 className="text-xl font-semibold mb-4">Time Between Moves</h3>
        <button
          onClick={() => openModal("time")}
          className="btn btn-secondary mb-4 bg-gray-200 text-black"
        >
          Enlarge
        </button>
        <div className="h-64">
          <Line data={moveTimeLineChartData} options={moveTimeLineChartOptions} />
        </div>
      </div>

      {/* Manual Legend for Time Between Moves */}
      <div className="mt-4 flex justify-center space-x-4 text-black">
        {Object.keys(cardLetters).map((key) => (
          <div key={key} className="flex items-center">
            <div
              className="w-4 h-4 mr-2"
              style={{
                backgroundColor: cardColors[Number(key)],
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "5px",
              }}
            ></div>
            <span>{cardLetters[Number(key)]} - Card {key}</span>
          </div>
        ))}
      </div>

      {/* Modal Overlay (when expandedChart != null) */}
      {expandedChart && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          onClick={closeModal}
        >
          {/* Modal Content -> Stops the click event on the modal itself */}
          <div
            className="relative w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white p-4 rounded shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={closeModal}
            >
              Close
            </button>

            <div className="h-96">
              {expandedChart === "main" && (
                <>
                  <h2 className="text-lg font-bold mb-4">Enlarged Main Chart</h2>
                  {renderMainChart()}
                </>
              )}
              {expandedChart === "cards" && (
                <>
                  <h2 className="text-lg font-bold mb-4">Enlarged Card Points Chart</h2>
                  <Bar
                    data={cardPointsData}
                    options={barChartOptions}
                    height={300}
                  />
                </>
              )}
              {expandedChart === "time" && (
                <>
                  <h2 className="text-lg font-bold mb-4">Enlarged Time Chart</h2>
                  <Line
                    data={moveTimeLineChartData}
                    options={moveTimeLineChartOptions}
                    height={300}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDataComponent;
