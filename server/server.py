from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from scipy.spatial.transform import Rotation as R
import csv
import os
from datetime import datetime
import logging

# Flask-App initialisieren
app = Flask(__name__)
CORS(app)  # Ermöglicht CORS für alle Routen und Ursprünge

# SocketIO initialisieren
socketio = SocketIO(app, cors_allowed_origins="*")  # Ermöglicht WebSocket-Verbindungen von allen Ursprüngen

# Logging konfigurieren
logging.basicConfig(level=logging.DEBUG)

# Dateipfade für die CSV-Dateien
rotation_csv = 'rotation_data.csv'
eyetracking_csv = 'eyetracking_data.csv'

# Funktion zum Initialisieren der CSV-Dateien mit Headern, falls sie noch nicht existieren
def initialize_csv(file_path, headers):
    if not os.path.exists(file_path):
        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(headers)
        logging.info(f"CSV-Datei erstellt: {file_path}")

# Initialisiere die CSV-Dateien
initialize_csv(rotation_csv, ['timestamp', 'posX', 'posY', 'posZ', 'pitch', 'yaw', 'roll'])
initialize_csv(eyetracking_csv, [
    'timestamp', 
    'posX', 'posY', 'posZ', 
    'pitch', 'yaw', 'roll', 
    'leftGazeDirX', 'leftGazeDirY', 'leftGazeDirZ', 
    'leftGazeOriginX', 'leftGazeOriginY', 'leftGazeOriginZ', 
    'rightGazeDirX', 'rightGazeDirY', 'rightGazeDirZ', 
    'rightGazeOriginX', 'rightGazeOriginY', 'rightGazeOriginZ'
])

# API-Endpunkte
@app.route('/face-data', methods=['POST'])
def receive_face_data():
    try:
        data = request.get_json()
        if not data:
            app.logger.error("Keine Daten empfangen oder ungültiges JSON.")
            return jsonify({"error": "Keine Daten empfangen"}), 400

        app.logger.debug(f"Face Daten empfangen: {data}")

        # Verarbeite die Daten (z.B. speichere sie, analysiere sie, etc.)
        # Hier kannst du die Daten nach Bedarf weiterverarbeiten

        return jsonify({"status": "Face Daten empfangen"}), 200
    except Exception as e:
        app.logger.exception("Fehler beim Verarbeiten der Anfrage:")
        return jsonify({"error": "Interner Serverfehler"}), 500

@app.route('/eye-data', methods=['POST'])
def receive_eye_data():
    try:
        data = request.get_json()
        if not data:
            app.logger.error("Keine Daten empfangen oder ungültiges JSON.")
            return jsonify({"error": "Keine Daten empfangen"}), 400

        app.logger.debug(f"Eye Daten empfangen: {data}")

        # Verarbeite die Daten (z.B. speichere sie, analysiere sie, etc.)
        # Hier kannst du die Daten nach Bedarf weiterverarbeiten

        return jsonify({"status": "Eye Daten empfangen"}), 200
    except Exception as e:
        app.logger.exception("Fehler beim Verarbeiten der Anfrage:")
        return jsonify({"error": "Interner Serverfehler"}), 500

if __name__ == "__main__": 
    socketio.run(app, debug=True, port=8080)
