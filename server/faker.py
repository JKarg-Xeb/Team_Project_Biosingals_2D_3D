import json
import math
import random
import time
from pylsl import StreamOutlet, StreamInfo
import threading
import queue

# Gemeinsame Warteschlange für LSL-Daten (optional, falls benötigt)
data_queue = queue.Queue()

def create_fake_stream():
    """
    Erstelle einen LSL-Stream mit drei Kanälen: Index, EDA und ECG.
    """
    # StreamInfo für Index, EDA und ECG
    info = StreamInfo('FakeBio', 'Bio', 3, 1000, 'float32', 'fake_bio_stream')

    # StreamOutlets für Index, EDA und ECG
    outlet = StreamOutlet(info)
    
    print("Fake Bio Stream erstellt und bereit zum Senden.")
    return outlet

def generate_fake_data(outlet):
    """
    Generiere und sende Fake-Daten kontinuierlich über den LSL-Stream.
    """
    sample_index = 0  # Initialisiere den Sample-Index
    start_time = time.time()
    
    while True:

        current_time = time.time() - start_time
        # Simuliere eine langsame sinusförmige EDA mit Rauschen
        eda_base = 2.5 + 2.5 * math.sin(2 * math.pi * 0.1 * current_time)  # 0.1 Hz Sinus
        eda_noise = random.uniform(-0.1, 0.1)  # Rauschen hinzufügen
        eda_value = round(eda_base + eda_noise, 3)  # Beispiel EDA-Wert in µS

        # Simuliere eine schnellere sinusförmige ECG mit Rauschen
        ecg_base = 1.0 * math.sin(2 * math.pi * 1.0 * current_time)  # 1.0 Hz Sinus
        ecg_noise = random.uniform(-0.05, 0.05)  # Rauschen hinzufügen
        ecg_value = round(ecg_base + ecg_noise, 3)  # Beispiel ECG-Wert in mV
        
        # Erhöhe den Sample-Index
        sample_index += 1
        
        timestamp = time.time()
        
        # Sende die Fake-Daten über LSL (Index, EDA, ECG)
        outlet.push_sample([sample_index, eda_value, ecg_value], timestamp)
        
        # Optional: Füge die Daten in eine Warteschlange ein, falls benötigt
        fake_data = {
            "timestamp": timestamp,
            "values": {
                "Index": sample_index,
                "EDA": eda_value,
                "ECG": ecg_value
            }
        }
        data_queue.put(json.dumps(fake_data))
        
        print(f"Fake Data gesendet: {fake_data}")  # Debugging-Ausgabe
        
        # Simuliere Echtzeit-Übertragung (50 Hz -> 0.02 Sekunden)
        time.sleep(0.02)  # 50 Samples pro Sekunde (1 / 50 Hz = 0.02 Sekunden)

def start_fake_data_stream():
    """
    Starte die Fake-Daten-Übertragung in einem separaten Thread.
    """
    outlet = create_fake_stream()
    fake_data_thread = threading.Thread(target=generate_fake_data, args=(outlet,), daemon=True)
    fake_data_thread.start()
    print("Fake-Daten-Thread gestartet.")

if __name__ == "__main__":
    start_fake_data_stream()
    # Halte das Hauptprogramm am Laufen
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Fake-Daten-Generator gestoppt.")