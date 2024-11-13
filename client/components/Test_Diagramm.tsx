"use client"

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Test_Diagramm() {
  const [message, setMessage] = useState("Loading");
  const [persons, setPersons] = useState([]);
  const [graphData, setGraphData] = useState({ labels: [], values: [] });

  // Daten für die Nachricht und Personenliste abrufen
  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setPersons(data.persons);
      });
  }, []);

  // Daten für den Graphen abrufen
  useEffect(() => {
    fetch("http://localhost:8080/api/graph-data")
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data);
      });
  }, []);


  const data = {
    labels: graphData.labels,
    datasets: [
      {
        label: "Person Values",
        data: graphData.values,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options_graph = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: true,
        text: "Sample Bar Chart",
        color: "#ffffff",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
  };

  return (
    <div>
      <div>{message}</div>
      {persons.map((person, index) => (
        <div key={index}>{person}</div>
      ))}
      <Bar data={data} options={options_graph} />
    </div>
  );
}
