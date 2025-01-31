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
- [Configuration](#configuration)
  - [Adjusting Data Acquisition Rate](#adjusting-data-acquisition-rate)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [Launching the Web Interface](#launching-the-web-interface)
- [API Endpoints](#api-endpoints)
- [Faker Module](#faker-module)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

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
- **Frontend:**
  - **JavaScript (Node.js):** Powers the web interface, enabling dynamic interactions and real-time updates.
  - **Next.js**
- **Web Server:**
  - **Local Server:** Facilitates communication between the client (web interface) and server scripts.
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
│       ├── YYYY-MM-DD_2D.csv
│       └── YYYY-MM-DD_3D.csv
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
  - **server.py**: Manages the server operations, including handling requests from the web interface and games.
  - **datenaquisition.py**: Responsible for capturing biosignal data and storing it in memory.
  - **csv_handler.py**: Handles the conversion of biosignal data into CSV format and manages file storage.
  - **faker.py**: Simulates biosignal data for testing and development.
  - **data/**: Stores all CSV files, named using the creation date and environment type (e.g., `2025-01-31_2D.csv`).
- **client/**: Contains all frontend-related files.
  - **public/**: Static assets for the web interface.
  - **src/**: Source code for the frontend application.
  - **package.json & package-lock.json**: Manage frontend dependencies and scripts.
- **README.md**: Provides an overview and instructions for the project.
- **LICENSE**: Specifies the project’s licensing information.

## Installation

To set up this project locally, follow the steps below. Ensure that all prerequisites are met before proceeding.
After installation, ensure that every import is locally installed. (for example: flask, pylsl, pandas)

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

## Configuration

### Adjusting Data Acquisition Rate

The data acquisition rate determines how frequently biosignal data is captured. This is particularly important for signals like heart rate, where precise timing can influence the quality of your research.

- **File to Edit:** `server/datenaquisition.py`
- **Variable:** `desired_sampling_rate`

**Current Setting:**

```python
desired_sampling_rate = 100  # Current sampling rate set to 100 Hz
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
- **Endpoint:** `http://localhost:<server_port>/all`
- **Response:**

  ```json
  {
    "files": [
      "2025-01-31_2D.csv",
      "2025-01-31_3D.csv",
      "2025-02-01_2D.csv",
      ...
    ]
  }
  ```

- **Usage:**

  You can use this endpoint to programmatically access all collected data files for further analysis or processing.

- **Example Request:**

  ```bash
  curl http://localhost:8000/all
  ```

- **Example Response:**

  ```json
  {
    "files": [
      "2025-01-31_2D.csv",
      "2025-01-31_3D.csv",
      "2025-02-01_2D.csv"
    ]
  }
  ```

### Additional Endpoints

Depending on future developments, additional API endpoints may be introduced to support more functionalities such as individual file retrieval, data filtering, or user management.

## Faker Module

To facilitate testing and development, especially in scenarios where actual biosignal data may not be readily available, the project includes a **faker module**. This module simulates biosignal data, ensuring that developers and researchers can continue their work without interruptions.

### Features of the Faker Module

- **Simulated Biosignals:** Generates synthetic data that mimics real biosignals, including heart rate and other relevant metrics.
- **Configurable Parameters:** Allows customization of data generation parameters to simulate different scenarios and conditions.
- **Seamless Integration:** Can be easily toggled on or off within the server to switch between real and simulated data.

### Usage

1. **Enable the Faker Module:**

   In `server.py`, ensure that the faker is imported and initialized correctly. Typically, this involves setting a flag or invoking the faker during data acquisition.

2. **Adjust Faker Settings:**

   Customize the faker's behavior by modifying parameters in `faker.py` as needed.

3. **Run the Server:**

   Start the server as usual. The faker will generate and send simulated biosignal data to the web interface, mimicking real-time data flow.

### Benefits

- **Development Flexibility:** Continue developing and testing the web interface and server functionalities without dependency on actual biosignal hardware.
- **Reliable Testing:** Ensure that the system can handle data streams effectively before deploying with real biosignal sources.
- **Scenario Simulation:** Create diverse testing scenarios by adjusting faker parameters to simulate different physiological states or conditions.

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

   Ensure that the server has the necessary permissions to write to the `data` directory.

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

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute the code as per the terms outlined in the license.

**Key Points of the MIT License:**

- **Permission:** Granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
- **Condition:** The license notice must be included in all copies or substantial portions of the software.
- **Limitation:** The software is provided "as is", without any warranty. The authors are not liable for any claims, damages, or other liabilities.

For more details, refer to the [LICENSE](LICENSE) file in this repository.
