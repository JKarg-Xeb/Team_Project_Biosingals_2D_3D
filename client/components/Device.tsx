"use client";

import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData,
} from "chart.js";

import { useData } from "@/context/DataContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
  // ChartDataLabels,
  // zoomPlugin
);

const Device: React.FC = () => {
  const { lslData } = useData();

  // Control which chart is displayed: "combined", "eda", "ecg" or "both"
  const [viewMode, setViewMode] = useState<string>("combined");

  // State for the modal (indicates whether and which chart is displayed in enlarged view)
  const [expandedChart, setExpandedChart] = useState<null | string>(null);

  // Function to open the modal (with the current viewMode)
  const openModal = () => {
    setExpandedChart(viewMode);
  };

  // Function to close the modal
  const closeModal = () => {
    setExpandedChart(null);
  };

  // Create labels based on the timestamps
  const labels = lslData.map((item) =>
    new Date(item.timestamp * 1000).toLocaleTimeString()
  );

  // Chart data for EDA
  const chartDataEDA: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "EDA",
        data: lslData.map((item) => item.values.EDA),
        borderColor: "rgb(75, 192, 192)",
        yAxisID: "y1",
        fill: false,
      },
    ],
  };

  // Chart data for ECG
  const chartDataECG: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "ECG",
        data: lslData.map((item) => item.values.ECG),
        borderColor: "rgb(255, 99, 132)",
        yAxisID: "y2",
        fill: false,
      },
    ],
  };

  // Combined chart (EDA + ECG)
  const combinedChartData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "EDA",
        data: lslData.map((item) => item.values.EDA),
        borderColor: "rgb(75, 192, 192)",
        yAxisID: "y1",
        fill: false,
      },
      {
        label: "ECG",
        data: lslData.map((item) => item.values.ECG),
        borderColor: "rgb(255, 99, 132)",
        yAxisID: "y2",
        fill: false,
      },
    ],
  };

  // Options for chart with two Y-axes
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Important for fitting the container
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "EDA and ECG Chart",
      },
      // If you want to use DataLabels or Zoom, enable them accordingly:
      datalabels: { display: false },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
      },
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        ticks: {
          color: "rgb(75, 192, 192)",
        },
        title: {
          display: true,
          text: "EDA",
        },
      },
      y2: {
        type: "linear",
        position: "right",
        ticks: {
          color: "rgb(255, 99, 132)",
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "ECG",
        },
      },
    },
  };

  // Individual options for EDA or ECG chart
  const edaChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "EDA Chart" },
      datalabels: { display: false },
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        ticks: {
          color: "rgb(75, 192, 192)",
        },
        title: {
          display: true,
          text: "EDA",
        },
      },
    },
  };

  const ecgChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "ECG Chart" },
      datalabels: { display: false },
    },
    scales: {
      y2: {
        type: "linear",
        position: "right",
        ticks: {
          color: "rgb(255, 99, 132)",
        },
        title: {
          display: true,
          text: "ECG",
        },
      },
    },
  };

  // Renders one or more charts depending on the ViewMode
  const renderChart = (mode: string) => {
    if (mode === "combined") {
      return (
        <div className="h-64 mb-6" key="Combined">
          <Line data={combinedChartData} options={chartOptions} />
        </div>
      );
    } else if (mode === "eda") {
      return (
        <div className="h-64 mb-6" key="EDA">
          <Line data={chartDataEDA} options={edaChartOptions} />
        </div>
      );
    } else if (mode === "ecg") {
      return (
        <div className="h-64 mb-6" key="ECG">
          <Line data={chartDataECG} options={ecgChartOptions} />
        </div>
      );
    } else if (mode === "both") {
      return (
        <>
          <div className="h-64 mb-6" key="EDA">
            <Line data={chartDataEDA} options={edaChartOptions} />
          </div>
          <div className="h-64 mb-6" key="ECG">
            <Line data={chartDataECG} options={ecgChartOptions} />
          </div>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="flex flex-col p-6 bg-gray-100 rounded-lg shadow-md w-full max-w-full">

      {/* Visualization options */}
      <div className="visualization-options mb-4 flex flex-wrap items-center space-x-4">
        <label htmlFor="viewMode" className="text-lg font-medium text-black">
          View:
        </label>
        <select
          id="viewMode"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-black"
        >
          <option value="combined">Combined Chart</option>
          <option value="eda">EDA Chart</option>
          <option value="ecg">ECG Chart</option>
          <option value="both">Both Charts Separately</option>
        </select>

        <button
          onClick={openModal}
          className="btn btn-secondary bg-white text-black border border-gray-300 rounded-md px-4 py-2"
        >
          Enlarge
        </button>
      </div>

      {/* Chart(s) in normal size */}
      <div className="w-full flex flex-col">
        {renderChart(viewMode)}
      </div>

      {/* Modal: Displayed when expandedChart != null */}
      {expandedChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          {/* Modal content itself: Click should not directly close */}
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
            <div className="h-[500px] overflow-auto">
              {/* Here we render the same chart again, but larger */}
              {renderChart(expandedChart)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Device;
