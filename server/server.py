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
initialize_csv(eyetracking_csv, ['timestamp', 'posX', 'posY', 'posZ', 'pitch', 'yaw', 'roll', 'gazeX', 'gazeY', 'gazeZ'])

# API-Endpunkte
@app.route("/api/graph-data", methods=['GET'])
def graph_data():
    data = {
        'labels': ['Jack', 'Moritz', 'Marlene'],
        'values': [5, 6, 7] 
    }
    return jsonify(data)

@app.route('/send_vr_data_rotation', methods=['POST'])
def receive_vr_data_rotation():
    data = request.get_json()
    logging.debug(f"Empfangene JSON-Daten (Rotation): {data}")

    if not data:
        logging.error("Keine JSON-Daten empfangen")
        return jsonify({"error": "Keine JSON-Daten empfangen"}), 400

    try:
        posX = data['posX']
        posY = data['posY']
        posZ = data['posZ']
        rotX = data['rotX']
        rotY = data['rotY']
        rotZ = data['rotZ']
        rotW = data['rotW']

        logging.info("\n--- Empfangene VR-Rotationsdaten ---")
        logging.info(f"Positions: x={posX}, y={posY}, z={posZ}")
        logging.info(f"Rotations: x={rotX}, y={rotY}, z={rotZ}, w={rotW}")
        logging.info("---------------------------\n")

        # Umwandlung in Euler-Winkel
        quaternion = [rotX, rotY, rotZ, rotW]
        rotation = R.from_quat(quaternion)
        euler_angles = rotation.as_euler('xyz', degrees=True)

        # Daten per WebSocket an alle verbundenen Clients senden
        updated_data = {
            'posX': posX,
            'posY': posY,
            'posZ': posZ,
            'pitch': euler_angles[0],
            'yaw': euler_angles[1],
            'roll': euler_angles[2]
        }
        socketio.emit('update_graph_rotation', updated_data)  # Separater Event

        # Daten in CSV speichern
        timestamp = datetime.utcnow().isoformat()
        row = [timestamp, posX, posY, posZ, euler_angles[0], euler_angles[1], euler_angles[2]]
        with open(rotation_csv, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(row)
        logging.info(f"Rotationsdaten gespeichert: {row}")

    except KeyError as e:
        logging.error(f"Fehlendes Feld: {e.args[0]}")
        return jsonify({"error": f"Fehlendes Feld: {e.args[0]}"}), 400
    except Exception as e:
        logging.error(f"Fehler beim Verarbeiten der Rotationsdaten: {str(e)}")
        return jsonify({"error": "Fehler beim Verarbeiten der Daten"}), 500

    return jsonify({"message": "VR-Rotationsdaten empfangen"}), 200


@app.route('/send_vr_data_eyetracking', methods=['POST'])
def receive_vr_data_eyetracking():
    data = request.get_json()
    logging.debug(f"Empfangene JSON-Daten (Eye-Tracking): {data}")

    if not data:
        logging.error("Keine JSON-Daten empfangen")
        return jsonify({"error": "Keine JSON-Daten empfangen"}), 400

    try:
        posX = data['posX']
        posY = data['posY']
        posZ = data['posZ']
        rotX = data['rotX']
        rotY = data['rotY']
        rotZ = data['rotZ']
        rotW = data['rotW']
        gazeX = data.get('gazeX', 0.0)  # Optional, falls Eye-Tracking Daten vorhanden sind
        gazeY = data.get('gazeY', 0.0)
        gazeZ = data.get('gazeZ', 0.0)

        logging.info("\n--- Empfangene VR-Eye-Tracking-Daten ---")
        logging.info(f"Positions: x={posX}, y={posY}, z={posZ}")
        logging.info(f"Rotations: x={rotX}, y={rotY}, z={rotZ}, w={rotW}")
        logging.info(f"Eye Gaze: x={gazeX}, y={gazeY}, z={gazeZ}")
        logging.info("---------------------------\n")

        # Umwandlung in Euler-Winkel
        quaternion = [rotX, rotY, rotZ, rotW]
        rotation = R.from_quat(quaternion)
        euler_angles = rotation.as_euler('xyz', degrees=True)

        # Daten per WebSocket an alle verbundenen Clients senden
        updated_data = {
            'posX': posX,
            'posY': posY,
            'posZ': posZ,
            'pitch': euler_angles[0],
            'yaw': euler_angles[1],
            'roll': euler_angles[2],
            'gazeX': gazeX,
            'gazeY': gazeY,
            'gazeZ': gazeZ
        }
        socketio.emit('update_graph_eyetracking', updated_data)  # Separater Event

        # Daten in CSV speichern
        timestamp = datetime.utcnow().isoformat()
        row = [timestamp, posX, posY, posZ, euler_angles[0], euler_angles[1], euler_angles[2], gazeX, gazeY, gazeZ]
        with open(eyetracking_csv, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(row)
        logging.info(f"Eye-Tracking-Daten gespeichert: {row}")

    except KeyError as e:
        logging.error(f"Fehlendes Feld: {e.args[0]}")
        return jsonify({"error": f"Fehlendes Feld: {e.args[0]}"}), 400
    except Exception as e:
        logging.error(f"Fehler beim Verarbeiten der Eye-Tracking-Daten: {str(e)}")
        return jsonify({"error": "Fehler beim Verarbeiten der Daten"}), 500

    return jsonify({"message": "VR-Eye-Tracking-Daten empfangen"}), 200


if __name__ == "__main__": 
    socketio.run(app, debug=True, port=8080)
