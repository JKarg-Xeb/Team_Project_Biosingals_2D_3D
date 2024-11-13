from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from scipy.spatial.transform import Rotation as R

# Flask-App initialisieren
app = Flask(__name__)
CORS(app)  # Ermöglicht CORS für alle Routen und Ursprünge

# SocketIO initialisieren
socketio = SocketIO(app, cors_allowed_origins="*")  # Ermöglicht WebSocket-Verbindungen von allen Ursprüngen

# API-Endpunkte
#Graphik
@app.route("/api/graph-data", methods=['GET'])
def graph_data():
    data = {
        'labels': ['Jack', 'Moritz', 'Marlene'],
        'values': [5, 6, 7] 
    }
    return jsonify(data)

@app.route('/send_vr_data', methods=['POST'])
def receive_vr_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Keine JSON-Daten empfangen"}), 400

    try:
        posX = data['posX']
        posY = data['posY']
        posZ = data['posZ']
        rotX = data['rotX']
        rotY = data['rotY']
        rotZ = data['rotZ']
        rotW = data['rotW']
    
        print("\n--- Empfangene VR-Daten ---")
        print(f"Position: x={posX}, y={posY}, z={posZ}")
        print(f"Rotation: x={rotX}, y={rotY}, z={rotZ}, w={rotW}")
        print("---------------------------\n")
    
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
        socketio.emit('update_graph', updated_data)

    except KeyError as e:
        return jsonify({"error": f"Fehlendes Feld: {e.args[0]}"}), 400
    return jsonify({"message": "VR-Daten empfangen"}), 200

if __name__ == "__main__": 
    socketio.run(app, debug=True, port=8080)
