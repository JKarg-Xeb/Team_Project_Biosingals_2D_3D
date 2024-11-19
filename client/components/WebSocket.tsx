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

// Dateninterfaces
interface VRRotationData {
    posX: number;
    posY: number;
    posZ: number;
    pitch: number;
    yaw: number;
    roll: number;
}

interface VREyeTrackingData extends VRRotationData {
    leftGazeDirX: number;
    leftGazeDirY: number;
    leftGazeDirZ: number;
    leftGazeOriginX: number;
    leftGazeOriginY: number;
    leftGazeOriginZ: number;
    rightGazeDirX: number;
    rightGazeDirY: number;
    rightGazeDirZ: number;
    rightGazeOriginX: number;
    rightGazeOriginY: number;
    rightGazeOriginZ: number;
    timestamp: string;
}

function WebSocketComponent() {
    const [rotationData, setRotationData] = useState<VRRotationData[]>([]); // State für Rotationsdaten
    const [eyeTrackingData, setEyeTrackingData] = useState<VREyeTrackingData[]>([]); // State für Eye-Tracking-Daten
    const [rotationLabels, setRotationLabels] = useState<string[]>([]); // Labels für Rotationsdiagramm
    const [eyeTrackingLabels, setEyeTrackingLabels] = useState<string[]>([]); // Labels für Eye-Tracking-Diagramm
    const [showFullGraph, setShowFullGraph] = useState<boolean>(false); // Zustand für Graph-Ansicht

    useEffect(() => {
        const socket = io(SOCKET_URL);

        // WebSocket-Event für Rotationsdaten
        socket.on('update_graph_rotation', (data: VRRotationData) => {
            setRotationData((prevData) => [...prevData, data]);
            setRotationLabels((prevLabels) => [...prevLabels, new Date().toLocaleTimeString()]);
        });

        // WebSocket-Event für Eye-Tracking-Daten
        socket.on('update_graph_eyetracking', (data: VREyeTrackingData) => {
            setEyeTrackingData((prevData) => [...prevData, data]);
            setEyeTrackingLabels((prevLabels) => [...prevLabels, new Date().toLocaleTimeString()]);
        });

        // Verbindung schließen, wenn die Komponente unmountet wird
        return () => {
            socket.disconnect();
        };
    }, []);

    // Funktion zum Herunterladen der Rotationsdaten als CSV
    const downloadRotationCSV = () => {
        const headers = ['Timestamp', 'Position X', 'Position Y', 'Position Z', 'Pitch', 'Yaw', 'Roll'];
        const rows = rotationData.map((data, index) => [
            rotationLabels[index],
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
        link.setAttribute('download', 'rotation_data.csv');
        document.body.appendChild(link); // Für Firefox

        link.click();
        document.body.removeChild(link); // Entfernen nach dem Download
    };

    // Funktion zum Herunterladen der Eye-Tracking-Daten als CSV
    const downloadEyeTrackingCSV = () => {
        const headers = [
            'Timestamp', 
            'Position X', 'Position Y', 'Position Z', 
            'Pitch', 'Yaw', 'Roll', 
            'Left Gaze Dir X', 'Left Gaze Dir Y', 'Left Gaze Dir Z', 
            'Left Gaze Origin X', 'Left Gaze Origin Y', 'Left Gaze Origin Z', 
            'Right Gaze Dir X', 'Right Gaze Dir Y', 'Right Gaze Dir Z', 
            'Right Gaze Origin X', 'Right Gaze Origin Y', 'Right Gaze Origin Z'
        ];
        const rows = eyeTrackingData.map((data, index) => [
            eyeTrackingLabels[index],
            data.posX,
            data.posY,
            data.posZ,
            data.pitch,
            data.yaw,
            data.roll,
            data.leftGazeDirX,
            data.leftGazeDirY,
            data.leftGazeDirZ,
            data.leftGazeOriginX,
            data.leftGazeOriginY,
            data.leftGazeOriginZ,
            data.rightGazeDirX,
            data.rightGazeDirY,
            data.rightGazeDirZ,
            data.rightGazeOriginX,
            data.rightGazeOriginY,
            data.rightGazeOriginZ
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers, ...rows].map(e => e.join(',')).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'eyetracking_data.csv');
        document.body.appendChild(link); // Für Firefox

        link.click();
        document.body.removeChild(link); // Entfernen nach dem Download
    };

    // Funktion zum Umschalten der Graph-Ansicht
    const toggleGraphView = () => {
        setShowFullGraph((prev) => !prev);
    };

    // Bestimmen, welche Daten angezeigt werden sollen
    const displayedRotationData = showFullGraph
        ? rotationData
        : rotationData.slice(-20); // Letzten 20 Punkte für Live-Ansicht

    const displayedRotationLabels = showFullGraph
        ? rotationLabels
        : rotationLabels.slice(-20);

    const displayedEyeTrackingData = showFullGraph
        ? eyeTrackingData
        : eyeTrackingData.slice(-20); // Letzten 20 Punkte für Live-Ansicht

    const displayedEyeTrackingLabels = showFullGraph
        ? eyeTrackingLabels
        : eyeTrackingLabels.slice(-20);

    // Chart.js-Datenkonfiguration für Position
    const chartData_position = {
        labels: displayedRotationLabels,
        datasets: [
            {
                label: 'Position X',
                data: displayedRotationData.map((data) => data.posX),
                borderColor: 'rgb(255, 99, 132)',
                fill: false,
            },
            {
                label: 'Position Y',
                data: displayedRotationData.map((data) => data.posY),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Position Z',
                data: displayedRotationData.map((data) => data.posZ),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
        ],
    };

    // Chart.js-Datenkonfiguration für Rotation
    const chartData_rotation = {
        labels: displayedRotationLabels,
        datasets: [
            {
                label: 'Pitch (X)',
                data: displayedRotationData.map((data) => data.pitch),
                borderColor: 'rgb(255, 159, 64)', // Angepasste Farbe
                fill: false,
            },
            {
                label: 'Yaw (Y)',
                data: displayedRotationData.map((data) => data.yaw),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Roll (Z)',
                data: displayedRotationData.map((data) => data.roll),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
        ],
    };

    // Chart.js-Datenkonfiguration für Eye-Tracking
    const chartData_eyetracking = {
        labels: displayedEyeTrackingLabels,
        datasets: [
            {
                label: 'Left Gaze Dir X',
                data: displayedEyeTrackingData.map((data) => data.leftGazeDirX),
                borderColor: 'rgb(255, 99, 132)',
                fill: false,
            },
            {
                label: 'Left Gaze Dir Y',
                data: displayedEyeTrackingData.map((data) => data.leftGazeDirY),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Left Gaze Dir Z',
                data: displayedEyeTrackingData.map((data) => data.leftGazeDirZ),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
            {
                label: 'Right Gaze Dir X',
                data: displayedEyeTrackingData.map((data) => data.rightGazeDirX),
                borderColor: 'rgb(255, 206, 86)',
                fill: false,
            },
            {
                label: 'Right Gaze Dir Y',
                data: displayedEyeTrackingData.map((data) => data.rightGazeDirY),
                borderColor: 'rgb(153, 102, 255)',
                fill: false,
            },
            {
                label: 'Right Gaze Dir Z',
                data: displayedEyeTrackingData.map((data) => data.rightGazeDirZ),
                borderColor: 'rgb(255, 159, 64)',
                fill: false,
            },
            // Optional: Gaze Origins können ebenfalls dargestellt werden
            {
                label: 'Left Gaze Origin X',
                data: displayedEyeTrackingData.map((data) => data.leftGazeOriginX),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
            {
                label: 'Left Gaze Origin Y',
                data: displayedEyeTrackingData.map((data) => data.leftGazeOriginY),
                borderColor: 'rgb(153, 102, 255)',
                fill: false,
            },
            {
                label: 'Left Gaze Origin Z',
                data: displayedEyeTrackingData.map((data) => data.leftGazeOriginZ),
                borderColor: 'rgb(255, 206, 86)',
                fill: false,
            },
            {
                label: 'Right Gaze Origin X',
                data: displayedEyeTrackingData.map((data) => data.rightGazeOriginX),
                borderColor: 'rgb(255, 99, 132)',
                fill: false,
            },
            {
                label: 'Right Gaze Origin Y',
                data: displayedEyeTrackingData.map((data) => data.rightGazeOriginY),
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
            },
            {
                label: 'Right Gaze Origin Z',
                data: displayedEyeTrackingData.map((data) => data.rightGazeOriginZ),
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            },
        ],
    };

    // Chart.js-Optionen
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

    const options_eyetracking = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
        },
        scales: {
            x: { title: { display: true, text: 'Zeit' } },
            y: { title: { display: true, text: 'Gaze / Origin' } },
        },
    };

    return (
        <div className='basis-11/12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Rotationsdaten */}
            <div className=''>
                <h1>Data-Position</h1>
                <h2>{showFullGraph ? 'Total VR Data History' : 'Live VR Data'}</h2>
                <Line data={chartData_position} options={options_position} />
                <div className="mt-4 flex space-x-2 justify-center items-center gap-10">
                    <button
                        onClick={toggleGraphView}
                        className="px-4 py-2 border-2 border-spacing-5 border-blue-100 hover:bg-blue-500 text-white rounded"
                    >
                        {showFullGraph ? 'Live Graph' : 'Ganzen Graph'}
                    </button>
                    <Image onClick={downloadRotationCSV} src="/svg/download_button.svg" alt="Download Rotation CSV" width={25} height={25} className='mr-3 cursor-pointer transform transition-transform duration-200 hover:scale-125'/>
                </div>
            </div>

            {/* Rotationsdiagramm */}
            <div>
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
                    <Image onClick={downloadRotationCSV} src="/svg/download_button.svg" alt="Download Rotation CSV" width={25} height={25} className='mr-3 cursor-pointer transform transition-transform duration-200 hover:scale-125'/>
                </div>
            </div>
 

            {/* Eye-Tracking-Daten */}
            <div>
                <h1 className='justify-center mt-5'>Data-EyeTracking</h1>
                <h2>{showFullGraph ? 'Total VR Data History' : 'Live VR Data'}</h2>
                <Line data={chartData_eyetracking} options={options_eyetracking} />
                <div className="mt-4 flex space-x-2 justify-center items-center gap-10">
                    <button
                        onClick={toggleGraphView}
                        className="px-4 py-2 border-2 border-spacing-5 border-blue-100 hover:bg-blue-500 text-white rounded"
                    >
                        {showFullGraph ? 'Live Graph' : 'Ganzen Graph'}
                    </button>
                    <Image onClick={downloadEyeTrackingCSV} src="/svg/download_button.svg" alt="Download Eye-Tracking CSV" width={25} height={25} className='mr-3 cursor-pointer transform transition-transform duration-200 hover:scale-125'/>
                </div>
            </div>
            
        </div>
    );
};

export default WebSocketComponent;
