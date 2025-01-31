import json
from pylsl import StreamInlet, resolve_streams
import time

def start_acquisition(data_queue, stop_event):
    """
    Funktion zur kontinuierlichen Datenakquisition von den LSL-Streams mit Downsampling.
    """
    print("Datenakquisitions-Thread gestartet.")
    
    # Gewünschte Sampling-Rate in Hz
    desired_sampling_rate = 100  # gewünschte Abtastrate
    actual_sampling_rate = 1000  # tatsächliche Abtastrate (Beispiel)
    decimation_factor = int(actual_sampling_rate / desired_sampling_rate)
    if decimation_factor < 1:
        decimation_factor = 1

    sample_count = 0

    # Suche nach den Streams
    streams = []
    while not streams and not stop_event.is_set():
        streams = resolve_streams()  # Sucht nach verfügbaren Streams
        if not streams:
            print("Kein Stream gefunden, versuche es erneut...")
            time.sleep(2)  # 2 Sekunden warten, bevor erneut nach Streams gesucht wird

    if stop_event.is_set():
        print("Akquisition wurde vor Start gestoppt.")
        return

    print("Streams gefunden, starte die Akquisition...")

    # Setze Inlets für alle gefundenen Streams
    inlets = []
    for stream in streams:
        try:
            inlet = StreamInlet(stream)
            inlets.append(inlet)
            
            # Stream-Info ausgeben
            print(f"Verbunden mit dem LSL-Stream: {stream.name()} ({stream.type()})")
            print(f"  Stream-ID: {stream.id()}")
            print(f"  Anzahl der Kanäle: {stream.channel_count()}")
            print(f"  Kanalnamen: {stream.channel_names()}")
            print(f"  Abtastrate: {stream.nominal_srate()}")
            print(f"  Stream-Timestamp-Korrektur: {stream.time_correction()}")
            print(f"  Metadaten: {stream.info()}")

        except Exception as e:
            print(f"Fehler beim Verbinden mit dem Stream {stream.name()}: {e}")

    # Datenakquisition
    while not stop_event.is_set():
        for inlet in inlets:
            try:
                # Verwende pull_chunk, um mehrere Samples auf einmal abzurufen
                samples, timestamps = inlet.pull_chunk(timeout=0.0, max_samples=decimation_factor)
                
                if samples:
                    for sample, timestamp in zip(samples, timestamps):
                        if sample_count % decimation_factor == 0:
                            # Umwandlung der Daten in JSON
                            data = {
                                "timestamp": timestamp,
                                "values": {
                                    "EDA": sample[1],  # EDA
                                    "ECG": sample[2],  # ECG
                                }
                            }
                            # Die Daten in die gemeinsame Warteschlange packen (Server's data_queue)
                            data_queue.put(json.dumps(data))
                            print(f"Data queued: {data}")  # Debugging: Print
                        sample_count += 1

                        # Optional: Begrenze die Queue-Größe, um Speicherprobleme zu vermeiden
                        if data_queue.qsize() > 1000:
                            try:
                                data_queue.get_nowait()
                            except data_queue.Empty:
                                pass
                    
            except Exception as e:
                print(f"Fehler beim Abrufen von Daten: {e}")
        
        # Kurze Pause, um die CPU-Auslastung zu reduzieren
        time.sleep(0.001)
    
    print("Datenakquisitions-Thread beendet.")