# Biosignal Decision-Making Research in 2D and VR Environments

Welcome to the **Biosignal Decision-Making Research** project! This repository contains the code and resources necessary to explore and analyze biosignal differences during decision-making processes in both 2D and Virtual Reality (VR) environments. The project integrates a local server for comprehensive data collection and storage, alongside a user-friendly web interface for game control, data recording, and real-time monitoring.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Setup Steps](#setup-steps)
  - [Requirements](#requirements)
- [Configuration](#configuration)
  - [Adjusting Data Acquisition Rate](#adjusting-data-acquisition-rate)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [Launching the Web Interface](#launching-the-web-interface)
- [API Endpoints](#api-endpoints)
- [Faker Module](#faker-module)
- [CSV Handling](#csv-handling)
  - [CSV File Structure](#csv-file-structure)
  - [Automatic CSV Type Assignment](#automatic-csv-type-assignment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)


## Project Overview

This project is designed to investigate how biosignals vary during decision-making tasks within 2D and VR environments. By capturing and analyzing biosignal data, researchers can gain insights into the physiological responses associated with different types of decision-making scenarios. The system comprises:

- **Local Server:** Acts as the central hub for data collection, storage, and communication between the game/application and the web interface.
- **Web Interface:** Provides a user-friendly platform to control the game, initiate data recording, and monitor incoming data in real-time.
- **Data Simulation:** Includes a faker module to simulate biosignal data, facilitating testing and development without the need for actual biosignal inputs.

## Features

- **Comprehensive Data Collection:** Captures various biosignals during decision-making tasks in both 2D and VR settings.
- **Data Management:** Organizes and stores data in CSV files, categorized by environment type and timestamp.
- **Real-Time Monitoring:** Displays live biosignal data streams to ensure data integrity and system performance.
- **User-Friendly Interface:** Simplifies the process of starting/stopping experiments and managing data recordings.
- **Data Simulation:** Enables developers to simulate biosignal data for testing purposes, ensuring smooth development workflows.
- **API Access:** Provides endpoints to retrieve all collected data, facilitating further analysis and integration.

## Technologies Used

- **Backend:**
  - **Python:** Utilized for server-side logic, data acquisition, and handling CSV operations.
  - **Flask & Flask-SocketIO:** Facilitates communication between the client (web interface) and server scripts.
- **Frontend:**
  - **JavaScript (Node.js):** Powers the web interface, enabling dynamic interactions and real-time updates.
- **Data Acquisition:**
  - **pylsl:** Python interface for the Lab Streaming Layer (LSL) used in biosignal data acquisition.
- **Data Format:**
  - **CSV (Comma-Separated Values):** Chosen for its simplicity and ease of use in data analysis.
- **Other Tools:**
  - **npm:** Manages frontend dependencies.
  - **pip:** Handles Python package installations.

## Directory Structure

Understanding the project’s directory layout is crucial for efficient navigation and management. Below is the detailed structure:

```
├── server
│   ├── server.py
│   ├── datenaquisition.py
│   ├── csv_handler.py
│   ├── faker.py
│   ├── requirements.txt
│   └── data
│       ├── YYYYMMDD_HHMMSS_2D.csv
│       └── YYYYMMDD_HHMMSS_3D.csv
├── client
│   ├── public
│   ├── src
│   ├── package.json
│   ├── package-lock.json
│   └── [Other Frontend Files]
├── README.md
└── LICENSE
```

- **server/**: Contains all backend-related scripts and data.
  - **server.py**: Manages server operations, including handling HTTP requests, WebSocket connections, and coordinating data acquisition.
  - **datenaquisition.py**: Responsible for capturing biosignal data from LSL streams and placing it into a shared queue for processing.
  - **csv_handler.py**: Handles the conversion of biosignal and game data into CSV format and manages file storage.
  - **faker.py**: Simulates biosignal data for testing and development purposes.
  - **data/**: Stores all CSV files, named using the creation date and environment type (e.g., `20250131_123045_2D.csv`).
- **client/**: Contains all frontend-related files.
  - **public/**: Static assets for the web interface.
  - **src/**: Source code for the frontend application.
  - **package.json & package-lock.json**: Manage frontend dependencies and scripts.
- **README.md**: Provides an overview and instructions for the project.
- **LICENSE**: Specifies the project’s licensing information.

## Installation

To set up this project locally, follow the steps below. Ensure that all prerequisites are met before proceeding.

### Prerequisites

Before installing, make sure you have the following software installed on your system:

- **Python 3.x**: [Download Python](https://www.python.org/downloads/)
- **Node.js and npm**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/downloads)

### Setup Steps

1. **Clone the Repository**

   Begin by cloning the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Set Up the Server**

   Navigate to the server directory and install the required Python packages:

   ```bash
   cd server
   pip install -r requirements.txt
   ```

   - **Note:** If you encounter permission issues, consider using a virtual environment or adding the `--user` flag.

3. **Set Up the Client**

   Move to the client directory and install the necessary frontend dependencies:

   ```bash
   cd ../client
   npm install
   ```

   - **Tip:** Ensure that `npm` completes the installation without errors. If issues arise, verify your Node.js and npm versions.

### Requirements

#### Server Requirements

The server relies on several Python packages to function correctly. Below is a list of required packages along with their purposes:

- **Flask**: Web framework for handling HTTP requests.
- **Flask-SocketIO**: Enables real-time communication between the server and clients via WebSockets.
- **flask_cors**: Allows Cross-Origin Resource Sharing (CORS), enabling the frontend to communicate with the server if they run on different ports.
- **pylsl**: Python interface for the Lab Streaming Layer (LSL), used for biosignal data acquisition.
- **pandas**: Data manipulation and analysis library, used for handling CSV operations.

**Example `requirements.txt`:**

```plaintext
Flask==2.0.3
Flask-SocketIO==5.2.0
flask_cors==3.0.10
pylsl==1.14.1
pandas==1.3.5
eventlet==0.33.0
```

- **Note:** Ensure that the versions are compatible with your system. Adjust the versions as necessary based on your environment and compatibility requirements.

#### Client Requirements

The client side is managed using Node.js and npm. The dependencies are specified in the `package.json` file within the `client` directory. Running `npm install` as described in the setup steps will automatically install all necessary frontend packages.

## Configuration

### Adjusting Data Acquisition Rate

The data acquisition rate determines how frequently biosignal data is captured. This is particularly important for signals like heart rate, where precise timing can influence the quality of your research.

- **File to Edit:** `server/datenaquisition.py`
- **Variable:** `desired_sampling_rate`

**Current Setting:**

```python
desired_sampling_rate = 100  # Desired sampling rate in Hz
```

**How to Adjust:**

1. Open `datenaquisition.py` in your preferred text editor.
2. Locate the `desired_sampling_rate` variable.
3. Modify its value to your desired sampling rate (e.g., 200 for 200 Hz).

   ```python
   desired_sampling_rate = 200  # Adjusted sampling rate
   ```

4. Save the file and restart the server to apply changes.

**Considerations:**

- **Higher Sampling Rates:** Capture more detailed data but may require more processing power and storage.
- **Lower Sampling Rates:** Reduce data granularity but can be sufficient for certain analyses.

## Usage

Once the installation and configuration are complete, you can start using the system to conduct your research.

### Starting the Server

1. **Navigate to the Server Directory:**

   ```bash
   cd server
   ```

2. **Start the Server:**

   ```bash
   python server.py
   ```

   - **Output:** The server will start and listen for incoming connections from the web interface and games. You should see logs indicating that the server is running.

### Launching the Web Interface

1. **Open a New Terminal Window:**

   It's recommended to keep the server running in its current terminal. Open a new terminal to start the client.

2. **Navigate to the Client Directory:**

   ```bash
   cd your-repo/client
   ```

3. **Start the Web Interface:**

   ```bash
   npm run dev
   ```

   - **Output:** The frontend application will compile and start a development server, typically accessible at `http://localhost:3000` or another specified port.

4. **Access the Web Interface:**

   Open your web browser and navigate to the URL provided in the terminal (e.g., `http://localhost:3000`). You should see the user interface where you can:

   - **Start/Stop the Game:** Control the initiation of decision-making tasks.
   - **Begin/End Data Recording:** Manage when biosignal data is being captured.
   - **Monitor Live Data:** View real-time biosignal data streams to ensure proper data transmission.

## API Endpoints

The server exposes API endpoints to facilitate data retrieval and management. Below are the primary endpoints available:

### GET `/all`

- **Description:** Retrieves a list of all stored CSV files from the server.
- **Endpoint:** `http://localhost:8080/all`
- **Response:**

  ```json
  {
    "files": [
      "20250131_123045_2D.csv",
      "20250131_123045_3D.csv",
      "20250201_093015_2D.csv",
      ...
    ]
  }
  ```

- **Usage:**

  You can use this endpoint to programmatically access all collected data files for further analysis or processing.

- **Example Request:**

  ```bash
  curl http://localhost:8080/all
  ```

- **Example Response:**

  ```json
  {
    "files": [
      "20250131_123045_2D.csv",
      "20250131_123045_3D.csv",
      "20250201_093015_2D.csv"
    ]
  }
  ```

### GET `/get_all_csv_data`

- **Description:** Retrieves all CSV data, including all stored files and the current session.
- **Endpoint:** `http://localhost:8080/get_all_csv_data`
- **Response:**

  ```json
  {
    "data": [
      {
        "filename": "20250131_123045_2D.csv",
        "data": [ ... ]
      },
      {
        "filename": "20250131_123045_3D.csv",
        "data": [ ... ]
      },
      {
        "filename": "current_session",
        "data": [ ... ]
      }
    ]
  }
  ```

- **Usage:**

  Retrieve all collected data, including ongoing session data, for comprehensive analysis.

### POST `/2D_Game_Ping`

- **Description:** Receives game data from the 2D environment.
- **Endpoint:** `http://localhost:8080/2D_Game_Ping`
- **Payload:**

  ```json
  {
    "klickZeiten": [ ... ],
    "finalKontostand": 1000,
    "cardIndex": 5,
    "currentReward": 50,
    "timestamp": "2025-01-31T12:30:45Z"
  }
  ```

- **Response:**

  ```json
  {
    "message": "Daten erfolgreich empfangen"
  }
  ```

### POST `/3D_Game_Ping`

- **Description:** Receives game data from the 3D environment.
- **Endpoint:** `http://localhost:8080/3D_Game_Ping`
- **Payload:**

  ```json
  {
    "klickZeiten": [ ... ],
    "finalKontostand": 1500,
    "cardIndex": 7,
    "currentReward": 75,
    "timestamp": "2025-01-31T12:31:00Z"
  }
  ```

- **Response:**

  ```json
  {
    "message": "Daten erfolgreich empfangen"
  }
  ```

### GET `/sse_game_data`

- **Description:** Establishes a Server-Sent Events (SSE) connection to stream game data in real-time.
- **Endpoint:** `http://localhost:8080/sse_game_data`
- **Usage:**

  Connect to this endpoint from the frontend to receive live updates of game data.

## Faker Module

To facilitate testing and development, especially in scenarios where actual biosignal data may not be readily available, the project includes a **faker module**. This module simulates biosignal data, ensuring that developers and researchers can continue their work without interruptions.

### Features of the Faker Module

- **Simulated Biosignals:** Generates synthetic data that mimics real biosignals, including heart rate (EDA) and ECG.
- **Configurable Parameters:** Allows customization of data generation parameters to simulate different scenarios and conditions.
- **Seamless Integration:** Can be easily toggled on or off within the server to switch between real and simulated data.

### Usage

1. **Enable the Faker Module:**

   The faker is integrated within the server and can be started by running the `faker.py` script independently if needed.

   ```bash
   cd server
   python faker.py
   ```

2. **Adjust Faker Settings:**

   Customize the faker's behavior by modifying parameters in `faker.py` as needed, such as the frequency and amplitude of simulated signals.

3. **Run the Server:**

   Start the server as usual. The faker will generate and send simulated biosignal data to the web interface, mimicking real-time data flow.

### Benefits

- **Development Flexibility:** Continue developing and testing the web interface and server functionalities without dependency on actual biosignal hardware.
- **Reliable Testing:** Ensure that the system can handle data streams effectively before deploying with real biosignal sources.
- **Scenario Simulation:** Create diverse testing scenarios by adjusting faker parameters to simulate different physiological states or conditions.

## CSV Handling

The system efficiently manages the storage and organization of collected data by converting biosignal and game data into well-structured CSV files.

### CSV File Structure

Each CSV file is named using the creation date and environment type (2D or 3D), following the format: `YYYYMMDD_HHMMSS_2D.csv` or `YYYYMMDD_HHMMSS_3D.csv`. For example:

- `20250131_123045_2D.csv`
- `20250131_123045_3D.csv`

**Column Order:**

```
received_timestamp,cardIndex,currentReward,finalKontostand,klickZeiten,timestamp,,values
```

- **received_timestamp:** Server-side timestamp when the data was received.
- **cardIndex:** Index of the selected card in the game (2D/3D).
- **currentReward:** Current reward value or change in the account balance.
- **finalKontostand:** Final account balance at the end of the game.
- **klickZeiten:** Times of clicks or interactions during the game.
- **timestamp:** Original timestamp from the game data.
- **:** Empty column for separation.
- **values:** Biosignal values (e.g., EDA, ECG).

### Automatic CSV Type Assignment

- **Game Data Present:** If game data (2D or 3D) is received, the CSV file is saved with the corresponding type (`2D` or `3D`).
- **No Game Data Received:** If no game data is received during the session, the CSV file defaults to `2D` type.

This ensures consistent categorization and ease of data analysis based on the environment type.

## Troubleshooting

While the system is designed for robustness, you may encounter issues during setup or operation. Below are common problems and their solutions:

### Application Hangs or Becomes Unresponsive

**Symptoms:**

- The server stops responding to requests.
- The web interface fails to load or update data.
- Data recording halts unexpectedly.

**Solutions:**

1. **Restart the Server:**

   Sometimes, the server may hang due to unforeseen errors. Restarting can resolve temporary issues.

   ```bash
   cd server
   python server.py
   ```

2. **Restart the Web Interface:**

   If the frontend becomes unresponsive, restarting the web interface can help.

   ```bash
   cd client
   npm run dev
   ```

3. **Check for Error Logs:**

   Inspect the terminal outputs for both the server and client to identify any error messages that can provide insights into the issue.

4. **Verify Network Connections:**

   Ensure that the server and client are correctly communicating over the expected ports and that no firewall settings are blocking the connections.

### Data Acquisition Issues

**Symptoms:**

- Incomplete or missing biosignal data in CSV files.
- Discrepancies between expected and recorded data rates.

**Solutions:**

1. **Adjust Sampling Rate:**

   The `desired_sampling_rate` in `datenaquisition.py` controls how frequently data is captured. Ensure it is set appropriately for your requirements.

   ```python
   desired_sampling_rate = 100  # Example: 100 Hz
   ```

2. **Check Hardware Connections:**

   If using real biosignal hardware, verify that all connections are secure and that the devices are functioning correctly.

3. **Review Data Acquisition Script:**

   Ensure that `datenaquisition.py` is correctly implemented and that there are no logical errors preventing data capture.

### CSV File Management

**Symptoms:**

- CSV files are not being created or updated.
- Incorrect naming conventions for CSV files.

**Solutions:**

1. **Verify Write Permissions:**

   Ensure that the server has the necessary permissions to write to the `server/data` directory.

   ```bash
   ls -ld server/data
   ```

2. **Check File Naming Logic:**

   Confirm that the CSV handler correctly names files based on the creation date and environment type.

   ```python
   filename = f"{current_date}_{environment}.csv"
   ```

3. **Inspect `csv_handler.py`:**

   Review the script to ensure it properly opens, writes, and closes CSV files without errors.

### Web Interface Issues

**Symptoms:**

- Unable to access the web interface via browser.
- Live data monitoring not displaying any data.

**Solutions:**

1. **Confirm Server is Running:**

   The web interface relies on the server to fetch and display data. Ensure that `server.py` is active.

2. **Check Frontend Dependencies:**

   Ensure all frontend dependencies are installed correctly. Re-run `npm install` if necessary.

3. **Inspect Browser Console:**

   Open the browser’s developer tools to check for any JavaScript errors or failed network requests that may hinder the interface’s functionality.

4. **Network Configuration:**

   Ensure that the web interface is pointing to the correct server address and port.

## Contributing

We welcome contributions to enhance the functionality and performance of this project. Whether you're reporting a bug, suggesting a feature, or submitting a pull request, your input is valuable.

### How to Contribute

1. **Fork the Repository:**

   Click the **Fork** button at the top-right corner of this repository to create a personal copy.

2. **Clone Your Fork:**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

3. **Create a New Branch:**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Your Changes:**

   Implement your feature or fix. Ensure that your code adheres to the project's coding standards.

5. **Commit Your Changes:**

   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   ```

6. **Push to Your Fork:**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request:**

   Navigate to your fork on GitHub and click **Compare & pull request**. Provide a clear description of your changes and submit the pull request.

### Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) when interacting with this project. Be respectful and considerate to maintain a welcoming environment for all contributors.

## License

You are free to use, modify, and distribute the code as per the terms outlined in the license.

**Key Points**

- **Permission:** Granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
- **Condition:** The license notice must be included in all copies or substantial portions of the software.
- **Limitation:** The software is provided "as is", without any warranty. The authors are not liable for any claims, damages, or other liabilities.


## Detailed Code Structure

To provide a deeper understanding of how the system operates, here's an overview of the key scripts and their functionalities based on the provided code snippets.

### `server.py`

This is the main server script that initializes the Flask application, sets up routes for data acquisition, and manages real-time data streaming via Server-Sent Events (SSE).

**Key Components:**

- **Flask & Flask-SocketIO:** Handles HTTP requests and WebSocket connections.
- **Routes:**
  - `/start_acquisition`: Starts biosignal data acquisition.
  - `/stop_acquisition`: Stops biosignal data acquisition.
  - `/get_lsl_data`: Retrieves available LSL data.
  - `/sse_game_data`: Streams game data to connected clients in real-time.
  - `/get_all_csv_data`: Retrieves all CSV data, including current sessions.
  - `/2D_Game_Ping` & `/3D_Game_Ping`: Receives game data from 2D and 3D environments, respectively.
- **Threading:** Manages concurrent data acquisition and handling.
- **Logging:** Provides detailed logs for monitoring server activities.
- **Concurrency Controls:** Uses threading locks to ensure thread-safe operations on shared resources like data queues and game data storage.

**Example Snippet:**

```python
@app.route("/start_acquisition", methods=["GET"])
def start_acquisition_route():
    # Starts the data acquisition thread and initializes CSV session
    ...
```

### `faker.py`

This script simulates biosignal data, generating synthetic EDA and ECG signals that mimic real physiological data. It's useful for testing the system without actual biosignal hardware.

**Key Components:**

- **pylsl:** Creates a fake LSL stream named `FakeBio` with three channels: Index, EDA, and ECG.
- **Data Generation:** Continuously generates sinusoidal signals with added noise to simulate real biosignals.
- **Threading:** Runs the data generation in a separate thread to mimic real-time data streaming.
- **Real-Time Simulation:** Sends data at a rate of 50 Hz to emulate real-time data acquisition.

**Example Snippet:**

```python
def generate_fake_data(outlet):
    while True:
        # Simulate EDA and ECG values with noise
        eda_value = round(eda_base + eda_noise, 3)
        ecg_value = round(ecg_base + ecg_noise, 3)
        outlet.push_sample([sample_index, eda_value, ecg_value], timestamp)
        time.sleep(0.02)  # 50 Hz
```

### `datenaquisition.py`

Handles the continuous acquisition of biosignal data from available LSL streams, applying downsampling as necessary.

**Key Components:**

- **LSL Streams:** Resolves and connects to available LSL streams for data acquisition.
- **Downsampling:** Reduces the sampling rate to the desired frequency to manage data volume.
- **Queue Management:** Places acquired data into a shared queue for processing by the server.
- **Error Handling:** Implements robust error handling to manage stream connection issues and data retrieval errors.

**Example Snippet:**

```python
def start_acquisition(data_queue, stop_event):
    # Resolves LSL streams and starts data acquisition
    while not streams and not stop_event.is_set():
        streams = resolve_streams()
        time.sleep(2)
    ...
```

### `csv_handler.py`

Manages the creation and manipulation of CSV files for storing biosignal and game data. It ensures data is correctly formatted and saved with appropriate filenames.

**Key Components:**

- **Session Management:** Starts and stops data recording sessions, managing the accumulation of data points.
- **Data Formatting:** Formats incoming data into CSV-compatible structures, ensuring consistency in column order.
- **File Naming:** Generates filenames based on the session's start time and environment type (`2D` or `3D`).
- **Data Retrieval:** Provides functions to retrieve all stored CSV data for analysis.
- **Thread Safety:** Uses threading locks to ensure safe concurrent access to session data.

**Example Snippet:**

```python
def start_session(self):
    with self.session_lock:
        if self.session_active:
            logging.info("A session is already running.")
            return
        self.session_start_time = datetime.now(timezone.utc)
        self.current_session_data = []
        self.session_active = True
        logging.info(f"Session started at {self.session_start_time.isoformat()}")
```

### `requirements.txt`

Lists all Python dependencies required for the server to function correctly. Ensure that the versions are compatible with your system and adjust them as necessary.

**Example `requirements.txt`:**

```plaintext
Flask==2.0.3
Flask-SocketIO==5.2.0
flask_cors==3.0.10
pylsl==1.14.1
pandas==1.3.5
eventlet==0.33.0
```

- **Note:** The `eventlet` package is often used with Flask-SocketIO for asynchronous operations. Ensure it's included if required by your setup.

## Additional Enhancements

Based on the provided code, here are some additional details and recommendations to further enhance the README:

### Thread Safety and Concurrency

The server employs threading and locking mechanisms to ensure thread safety when accessing shared resources like data queues and storage lists.

**Example:**

```python
twoDgame_data_lock = threading.Lock()
with twoDgame_data_lock:
    twoDgame_data_storage.append(new_data)
```

### Server-Sent Events (SSE) for Real-Time Data Streaming

The `/sse_game_data` endpoint utilizes SSE to stream game data to connected clients in real-time. This allows the frontend to receive updates without polling.

**Example:**

```python
@app.route('/sse_game_data', methods=['GET'])
def sse_game_data():
    def event_stream():
        q = queue.Queue()
        with clients_lock:
            clients.append(q)
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            with clients_lock:
                clients.remove(q)
    return Response(event_stream(), content_type='text/event-stream')
```

### Logging and Monitoring

Comprehensive logging is implemented across the server and CSV handler to facilitate debugging and monitoring of system activities.

**Example:**

```python
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
app.logger.info("Data acquisition started.")
```

### Handling Multiple Clients

The server manages multiple SSE clients by maintaining a list of queues (`clients`) and ensuring thread-safe access using locks.

**Example:**

```python
clients = []
clients_lock = threading.Lock()
with clients_lock:
    clients.append(q)
```

### Data Integrity and Session Management

The CSV handler ensures that data from different sources (biosignals and game data) are correctly categorized and stored, maintaining data integrity throughout sessions.

**Example:**

```python
if 'cardIndex' in data or 'currentReward' in data:
    # 2D-Game Data
    ...
elif 'values' in data:
    # LSL Data
    ...
else:
    logging.warning("Unknown data source. Data not saved.")
```

## Final Notes

This project provides a robust framework for collecting, managing, and analyzing biosignal data in the context of decision-making tasks within different environments. By integrating real-time data acquisition, comprehensive data management, and a user-friendly interface, it serves as a valuable tool for researchers and developers aiming to explore the physiological underpinnings of decision-making processes.

For further enhancements, consider implementing additional API endpoints, integrating more sophisticated data analysis tools, or expanding the web interface to include more interactive features.

---

*This README was generated and customized to provide comprehensive guidance and information about the project. For any updates or changes, please refer to the latest version in the repository.*
