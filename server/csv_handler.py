# csv_handler.py

import os
import pandas as pd
from datetime import datetime, timezone
import threading
import glob
import json
import logging

# Konfiguriere das Logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class CSVHandler:
    def __init__(self, directory="Data"):
        self.directory = directory
        self.current_session_data = []
        self.session_lock = threading.Lock()
        self.session_active = False
        self.session_start_time = None
        self.game_type = None

        # Stelle sicher, dass das Datenverzeichnis existiert
        if not os.path.exists(self.directory):
            os.makedirs(self.directory)

    def start_session(self):
        with self.session_lock:
            if self.session_active:
                logging.info("Eine Sitzung läuft bereits.")
                return
            self.session_start_time = datetime.now(timezone.utc)
            self.current_session_data = []
            self.session_active = True
            logging.info(f"Sitzung gestartet um {self.session_start_time.isoformat()}")

    def add_data(self, data, game_type=None):
        with self.session_lock:
            if self.session_active:
                if game_type is not None:
                    if self.game_type is None:
                        self.game_type = game_type
                    elif self.game_type != game_type:
                        logging.error(f"Spieltyp-Konflikt: Vorhanden {self.game_type}, Neu {game_type}. Daten nicht hinzugefügt.")
                        return
                else:
                    # Inferiere Spieltyp für Rückwärtskompatibilität
                    if self.game_type is None:
                        if 'cardIndex' in data or 'currentReward' in data:
                            self.game_type = '2D'
               
                # Hinzufügen des Server-seitigen Timestamps
                received_timestamp = datetime.now(timezone.utc).isoformat()

                # Bestimme die Quelle der Daten anhand der Schlüssel
                if 'cardIndex' in data or 'currentReward' in data:
                    # 2D-Game Daten
                    entry = {
                        'received_timestamp': received_timestamp,
                        'cardIndex': data.get('cardIndex', ''),
                        'currentReward': data.get('currentReward', ''),
                        'finalKontostand': data.get('finalKontostand', ''),
                        'klickZeiten': ';'.join(map(str, data.get('klickZeiten', []))) if isinstance(data.get('klickZeiten', []), list) else data.get('klickZeiten', ''),
                        'timestamp': data.get('timestamp', ''),
                        '': '',  # Leere Spalte zur Trennung
                        'values': ''
                    }
                elif 'values' in data:
                    # LSL Daten
                    entry = {
                        'received_timestamp': received_timestamp,
                        'cardIndex': '',
                        'currentReward': '',
                        'finalKontostand': '',
                        'klickZeiten': '',
                        'timestamp': '',
                        '': '',  # Leere Spalte zur Trennung
                        'values': ';'.join(map(str, data.get('values', []))) if isinstance(data.get('values', []), list) else json.dumps(data.get('values', {}))
                    }
                else:
                    logging.warning("Unbekannte Datenquelle. Daten werden nicht gespeichert.")
                    return

                # Füge die Daten in der Reihenfolge ihres Eintreffens hinzu
                self.current_session_data.append(entry)
                logging.debug(f"Daten hinzugefügt: {entry}")
            else:
                logging.warning("Keine aktive Sitzung. Daten werden nicht gespeichert.")

    def stop_session(self):
        with self.session_lock:
            if not self.session_active:
                logging.info("Keine aktive Sitzung zum Stoppen.")
                return
            session_end_time = datetime.now(timezone.utc)
            filename = self.session_start_time.strftime("%Y%m%d_%H%M%S")
            if self.game_type:
                filename += f"_{self.game_type}"
            filename += ".csv"
            filepath = os.path.join(self.directory, filename)

            if not self.current_session_data:
                logging.info("Keine Daten gesammelt. Keine Datei wird erstellt.")
                self.session_active = False
                return

            try:
                # Erstelle einen DataFrame aus den gesammelten Daten
                df_final = pd.DataFrame(self.current_session_data)

                # Definiere die gewünschte Spaltenreihenfolge
                columns_order = [
                    'received_timestamp',  # Neue Spalte für den Server-seitigen Timestamp
                    'cardIndex', 
                    'currentReward', 
                    'finalKontostand', 
                    'klickZeiten', 
                    'timestamp', 
                    '',  # Leere Spalte
                    'values'
                ]

                # Reorganisiere die Spalten
                df_final = df_final.reindex(columns=columns_order)

                # Speichere den DataFrame als CSV
                df_final.to_csv(filepath, index=False, encoding='utf-8')
                logging.info(f"Daten erfolgreich in {filepath} gespeichert.")

            except Exception as e:
                logging.error(f"Fehler beim Schreiben der CSV-Datei: {e}")

            # Sitzung zurücksetzen
            self.current_session_data = []
            self.session_active = False
            self.session_start_time = None
            logging.info(f"Sitzung beendet um {session_end_time.isoformat()}")

    def get_all_data(self):
            """
            Ruft alle CSV-Daten ab, einschließlich aller gespeicherten Dateien und der aktuellen Sitzung.
            Gibt eine Liste von Dictionaries zurück, wobei jedes Dictionary den Dateinamen und die Daten enthält.
            """
            with self.session_lock:
                data_list = []

                # 1. Abrufen aller gespeicherten CSV-Dateien
                csv_files = sorted(glob.glob(os.path.join(self.directory, "*.csv")))

                for csv_file in csv_files:
                    try:
                        df = pd.read_csv(csv_file)
                        data_list.append({
                            'filename': os.path.basename(csv_file),
                            'data': df.fillna('').to_dict(orient='records')  # Leere Felder als leere Strings
                        })
                    except Exception as e:
                        print(f"Fehler beim Lesen der Datei {csv_file}: {e}")

                # 2. Hinzufügen der aktuellen Sitzung (falls aktiv)
                if self.session_active:
                    if self.current_session_data:
                        try:
                            # Erstelle einen DataFrame aus den aktuellen Sitzung-Daten
                            df_current = pd.DataFrame(self.current_session_data)

                            # Definiere die gewünschte Spaltenreihenfolge
                            columns_order = [
                                'received_timestamp',  # Neue Spalte für den Server-seitigen Timestamp
                                'cardIndex', 
                                'currentReward', 
                                'finalKontostand', 
                                'klickZeiten', 
                                'timestamp', 
                                '',  # Leere Spalte
                                'values'
                            ]

                            # Reorganisiere die Spalten
                            df_current = df_current.reindex(columns=columns_order)

                            # Konvertiere den DataFrame in ein Dictionary
                            current_data = df_current.fillna('').to_dict(orient='records')

                            data_list.append({
                                'filename': 'current_session',
                                'data': current_data
                            })

                        except Exception as e:
                            print(f"Fehler beim Erstellen der aktuellen Sitzung-Daten: {e}")

                return data_list

# Singleton-Instanz des CSVHandlers
csv_handler = CSVHandler()