import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import io from 'socket.io-client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import 'chart.js/auto';
import Image from 'next/image';

// ChartJS initialisieren
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// WebSocket-URL
const SOCKET_URL = 'http://localhost:8080';

interface VRData {
    posX: number;
    posY: number;
    posZ: number;
    pitch: number;
    yaw: number;
    roll: number;
}

function WebSocketComponent() {
    const [vrData, setVrData] = useState<VRData[]>([]); // State für alle VR-Daten
    const [labels, setLabels] = useState<string[]>([]); // Labels für den Graphen
    const [showFullGraph, setShowFullGraph] = useState<boolean>(false); // Zustand für Graph-Ansicht

    useEffect(() => {
        const socket = io(SOCKET_URL);

        // WebSocket-Event für empfangene Daten
        socket.on('update_graph', (data: VRData) => {
            setVrData((prevData) => [...prevData, data]); // Alle Daten beibehalten
            setLabels((prevLabels) => [...prevLabels, new Date().toLocaleTimeString()]);
        });

        // Verbindung schließen, wenn die Komponente unmountet wird
        return () => {
            socket.disconnect();
        };
    }, []);

    // Funktion zum Herunterladen der Daten als CSV
    const downloadCSV = () => {
        const headers = ['Timestamp', 'Position X', 'Position Y', 'Position Z', 'Rotation X', 'Rotation Y', 'Rotation Z', 'Rotation W'];
        const rows = vrData.map((data, index) => [
            labels[index],
            data.posX,
            data.posY,
            data.posZ,
            data.pitch,
            data.yaw,
            data.roll
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers, ...rows].map(e => e.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'vr_data.csv');
        document.body.appendChild(link); // Für Firefox

        link.click();
        document.body.removeChild(link); // Entfernen nach dem Download
    };

    // Funktion zum Umschalten der Graph-Ansicht
    const toggleGraphView = () => {
        setShowFullGraph((prev) => !prev);
    };

    // Bestimmen, welche Daten angezeigt werden sollen
    const displayedData = showFullGraph
        ? vrData
        : vrData.slice(-20); // Letzten 20 Punkte für Live-Ansicht

    const displayedLabels = showFullGraph
        ? labels
        : labels.slice(-20);

    // Chart.js-Datenkonfiguration-Position
    const chartData_position = {
        labels: displayedLabels,
        datasets: [
            {
                label: 'Position X',
                data: displayedData.map((data) => data.posX),
                borderColor: 'rgb(255, 99, 132)',
                fill: false,
            },
            {
                label: 'Position Y',
                data: displayedData.map((data) => data.posY),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Position Z',
                data: displayedData.map((data) => data.posZ),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
        ],
    };

    // Chart.js-Datenkonfiguration für Rotation (Pitch, Yaw, Roll)
    const chartData_rotation = {
        labels: displayedLabels,
        datasets: [
            {
                label: 'Pitch (X)',
                data: displayedData.map((data) => data.pitch),
                borderColor: 'rgb(255, 159, 64)', // Angepasste Farbe
                fill: false,
            },
            {
                label: 'Yaw (Y)',
                data: displayedData.map((data) => data.yaw),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Roll (Z)',
                data: displayedData.map((data) => data.roll),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
        ],
    };

    const options_position = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            
        },
        scales: {
            x: { title: { display: true, text: 'Zeit' } },
            y: { title: { display: true, text: 'Position' } },
        },
    };

    const options_rotation = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            
        },
        scales: {
            x: { title: { display: true, text: 'Zeit' } },
            y: { title: { display: true, text: 'Grad' } },
        },
    };

    return (
        <div className='basis-4/12'>
            <div className=''>
                <h1 >Data-Position</h1>
                <h2>{showFullGraph ? 'Total VR Data History' : 'Live VR Data'}</h2>
                <Line data={chartData_position} options={options_position} />
                <div className="mt-4 flex space-x-2 justify-center items-center gap-10">
                    <button
                        onClick={toggleGraphView}
                        className="px-4 py-2 border-2 border-spacing-5 border-blue-100 hover:bg-blue-500 text-white rounded"
                    >
                    
                        {showFullGraph ? 'Live Graph' : 'Ganzen Graph'}
                    </button>
                    <Image onClick={downloadCSV} src="/svg/download_button.svg" alt="" width={25} height={25} className='mr-3 cursor-pointer transform transition-transform duration-200 hover:scale-125'/>
                </div>
            </div>
            <div></div>
            <h1 className='justify-center mt-5'>Data-Rotation</h1>
            <h2>{showFullGraph ? 'Total VR Data History' : 'Live VR Data'}</h2>
            <Line data={chartData_rotation} options={options_rotation} />
            <div className="mt-4 flex space-x-2 justify-center items-center gap-10">
                <button
                    onClick={toggleGraphView}
                    className="px-4 py-2 border-2 border-spacing-5 border-blue-100 hover:bg-blue-500 text-white rounded"
                >
                
                    {showFullGraph ? 'Live Graph' : 'Ganzen Graph'}
                </button>
                <Image onClick={downloadCSV} src="/svg/download_button.svg" alt="" width={25} height={25} className='mr-3 cursor-pointer transform transition-transform duration-200 hover:scale-125'/>
            </div>
        </div>
    );
};

export default WebSocketComponent;
