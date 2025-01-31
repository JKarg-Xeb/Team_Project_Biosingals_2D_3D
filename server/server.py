import threading
from flask import Flask, Response, jsonify, request
from flask_socketio import SocketIO
import queue
import json
import logging
from datetime import datetime, timezone
from datenakquisition import start_acquisition  # Die Funktion, die LSL-Daten akquiriert
from flask_cors import CORS  # Falls das Frontend auf einem anderen Port läuft
from csv_handler import csv_handler


# Flask-App initialisieren
app = Flask(__name__)
CORS(app)  # Ermöglicht CORS für alle Routen und Ursprünge

# SocketIO initialisieren
socketio = SocketIO(app, cors_allowed_origins="*")  # Ermöglicht WebSocket-Verbindungen von allen Ursprüngen

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

# Gemeinsame Warteschlange für LSL-Daten
data_queue = queue.Queue()

# Event zum Stoppen der Datenakquisition
acquisition_stop_event = threading.Event()

# Variable zum Überprüfen, ob die Akquisition läuft
acquisition_thread = None

# Globale Liste zur Speicherung der 2D-Spiel-Daten
twoDgame_data_storage = []
twoDgame_data_lock = threading.Lock()  # Sicherstellen von Thread-Sicherheit für Spiel-Daten

# Globale Variable zur Speicherung des vorherigen finalKontostand
previous_final_kontostand = 0
previous_final_kontostand_lock = threading.Lock()  # Separater Lock für den vorherigen Kontostand

# Liste der Queues für alle verbundenen SSE-Clients
clients = []
clients_lock = threading.Lock()


@app.route("/start_acquisition", methods=["GET"])
def start_acquisition_route():
    """
    Startet die LSL-Datenakquisition über die Funktion im LSL-Skript.
    """
    global acquisition_thread, acquisition_stop_event
    if acquisition_thread and acquisition_thread.is_alive():
        return jsonify({"message": "Datenakquisition läuft bereits"}), 400
    else:
        # Setze das Stop-Event zurück
        acquisition_stop_event.clear()
        # Starte den LSL-Datenakquisitions-Thread und übergebe die gemeinsame data_queue und das Stop-Event
        acquisition_thread = threading.Thread(target=start_acquisition, args=(data_queue, acquisition_stop_event), daemon=True)
        acquisition_thread.start()
        app.logger.info("Datenakquisition gestartet.")
        
        # Starten der CSV-Sitzung
        csv_handler.start_session()
        
        return jsonify({"message": "Datenakquisition gestartet"}), 200



@app.route("/stop_acquisition", methods=["GET"])
def stop_acquisition_route():
    """
    Stoppt die LSL-Datenakquisition.
    """
    global acquisition_thread, acquisition_stop_event
    if acquisition_thread and acquisition_thread.is_alive():
        # Setze das Stop-Event
        acquisition_stop_event.set()
        acquisition_thread.join()
        app.logger.info("Datenakquisition gestoppt.")
        
        # Stoppen der CSV-Sitzung und Speichern der Daten
        csv_handler.stop_session()
        
        return jsonify({"message": "Datenakquisition gestoppt"}), 200
    else:
        return jsonify({"message": "Datenakquisition läuft nicht"}), 400



@app.route("/get_lsl_data", methods=["GET"])
def get_data():
    """
    Gibt alle verfügbaren LSL-Daten zurück und leert die Warteschlange.
    """
    data_list = []
    while not data_queue.empty():
        try:
            data = data_queue.get_nowait()
            data_dict = json.loads(data)
            data_list.append(data_dict)
            
            # Hinzufügen der Daten zur CSV-Sitzung
            csv_handler.add_data(data_dict)
            
        except queue.Empty:
            break  # Warteschlange ist leer

    if data_list:
        app.logger.info(f"Server gibt {len(data_list)} Datenpunkte zurück.")
        return jsonify({"data": data_list}), 200
    else:
        app.logger.info("Keine Daten in der Warteschlange.")
        return jsonify({"message": "No data available"}), 404




@app.route('/sse_game_data', methods=['GET'])
def sse_game_data():
    def event_stream():
        q = queue.Queue()
        with clients_lock:
            clients.append(q)
            logging.info(f"Neuer Client verbunden. Insgesamt {len(clients)} Clients.")
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            # Entferne die Queue, wenn der Client die Verbindung schließt
            with clients_lock:
                clients.remove(q)
                logging.info(f"Client getrennt. Insgesamt {len(clients)} Clients.")

    return Response(event_stream(), content_type='text/event-stream')


@app.route("/get_all_csv_data", methods=["GET"])
def get_all_csv_data():
    """
    Gibt alle CSV-Daten zurück, einschließlich aller gespeicherten Dateien und der aktuellen Sitzung.
    """
    all_data = csv_handler.get_all_data()
    return jsonify(all_data), 200


@app.route('/2D_Game_Ping', methods=['POST'])
def receive_game_data_2D():
    global previous_final_kontostand
    try:
        data = request.get_json()

        if data is None:
            app.logger.error("Keine JSON-Daten empfangen.")
            return jsonify({'error': 'Keine JSON-Daten empfangen'}), 400

        formatted_data = json.dumps(data, indent=4)
        app.logger.info(f"Empfangene Daten: {formatted_data}")

        klick_zeiten = data.get('klickZeiten', [])
        final_kontostand = data.get('finalKontostand', 0)
        card_index = data.get('cardIndex', None)
        current_reward = data.get('currentReward', 0)
        timestamp = data.get('timestamp', None)

        with previous_final_kontostand_lock:
            # 'currentReward' repräsentiert nun die Änderung im Kontostand
            hinzugekommen = current_reward
            previous_final_kontostand += hinzugekommen  # Update previous_final_kontostand basierend auf currentReward

        timestamp = datetime.now(timezone.utc).isoformat()

        # Erstelle ein neues Datenelement ohne 'hinzugekommen'
        new_data = {
            'timestamp': timestamp,
            'klickZeiten': klick_zeiten,
            'finalKontostand': final_kontostand,
            'currentReward': current_reward,
            'cardIndex': card_index,
            'timestamp': timestamp
        }

        # Speichern der Daten in der Liste
        with twoDgame_data_lock:
            twoDgame_data_storage.append(new_data)

        # Sende die neuen Daten an alle verbundenen SSE-Clients
        with clients_lock:
            for client in clients:
                client.put(new_data)
            app.logger.info(f"Neue Daten an {len(clients)} Clients gesendet.")

        app.logger.info(f"Current Reward: {current_reward}")

        # Hinzufügen der Daten zur CSV-Sitzung
        csv_handler.add_data(new_data, game_type='2D')

        return jsonify({'message': 'Daten erfolgreich empfangen'}), 200

    except Exception as e:
        app.logger.exception("Fehler beim Verarbeiten der Anfrage:")
        return jsonify({'error': 'Serverfehler'}), 500


@app.route('/3D_Game_Ping', methods=['POST'])
def receive_game_data_3D():
    global previous_final_kontostand
    try:
        data = request.get_json()

        if data is None:
            app.logger.error("Keine JSON-Daten empfangen.")
            return jsonify({'error': 'Keine JSON-Daten empfangen'}), 400

        formatted_data = json.dumps(data, indent=4)
        app.logger.info(f"Empfangene Daten: {formatted_data}")

        klick_zeiten = data.get('klickZeiten', [])
        final_kontostand = data.get('finalKontostand', 0)
        card_index = data.get('cardIndex', None)
        current_reward = data.get('currentReward', 0)
        timestamp = data.get('timestamp', None)

        with previous_final_kontostand_lock:
            # 'currentReward' repräsentiert nun die Änderung im Kontostand
            hinzugekommen = current_reward
            previous_final_kontostand += hinzugekommen  # Update previous_final_kontostand basierend auf currentReward

        timestamp = datetime.now(timezone.utc).isoformat()

        # Erstelle ein neues Datenelement ohne 'hinzugekommen'
        new_data = {
            'timestamp': timestamp,
            'klickZeiten': klick_zeiten,
            'finalKontostand': final_kontostand,
            'currentReward': current_reward,
            'cardIndex': card_index,
            'timestamp': timestamp
        }

        # Speichern der Daten in der Liste
        with twoDgame_data_lock:
            twoDgame_data_storage.append(new_data)

        # Sende die neuen Daten an alle verbundenen SSE-Clients
        with clients_lock:
            for client in clients:
                client.put(new_data)
            app.logger.info(f"Neue Daten an {len(clients)} Clients gesendet.")

        app.logger.info(f"Current Reward: {current_reward}")

        # Hinzufügen der Daten zur CSV-Sitzung
        csv_handler.add_data(new_data, game_type='3D')

        return jsonify({'message': 'Daten erfolgreich empfangen'}), 200

    except Exception as e:
        app.logger.exception("Fehler beim Verarbeiten der Anfrage:")
        return jsonify({'error': 'Serverfehler'}), 500


def run_server():
    """Startet den Flask-Server."""
    socketio.run(app, host="0.0.0.0", debug=True, use_reloader=False, port=8080)


if __name__ == "__main__":
    # Starte den Flask-Server
    run_server() 