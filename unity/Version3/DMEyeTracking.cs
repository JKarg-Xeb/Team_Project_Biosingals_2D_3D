using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json; // Stelle sicher, dass Newtonsoft.Json importiert ist

public class DMEyeTracking : MonoBehaviour
{
    // Informationen darüber, welches Auge auf welches Objekt schaut
    private Dictionary<string, string> eyeLookingAt = new Dictionary<string, string>()
    {
        { "LeftEye", null },
        { "RightEye", null }
    };

    // Verfolgung der aktuellen gemeinsamen Objektbetrachtung
    private string currentCommonObject = null;
    private float commonObjectStartTime = 0f;

    private Dictionary<string, CardData> cardData = new Dictionary<string, CardData>();

    // Server-URL (ersetze dies durch die Adresse deines Python-Servers)
    [SerializeField] private string serverURL = "http://localhost:8080/eye-data";

    // Flags zur Steuerung des Sendens
    private bool dataChanged = false; // Flag, um Änderungen zu verfolgen
    private bool isSending = false; // Flag, um parallele Sendevorgänge zu verhindern

    // Optional: Minimale Zeit zwischen den Sendungen, um Überlastung zu vermeiden
    [SerializeField] private float minSendInterval = 1f; // Sekunden
    private float lastSendTime = 0f;

    void Start()
    {
        // Optional: Du kannst hier andere Initialisierungen vornehmen
    }

    /// <summary>
    /// Wird aufgerufen, wenn ein Auge auf ein Objekt schaut oder auf kein Objekt schaut.
    /// </summary>
    /// <param name="eyeName">Name des Auges (z.B. "LeftEye", "RightEye")</param>
    /// <param name="cardName">Name des Objekts, auf das geschaut wird. Null, wenn kein Objekt betrachtet wird.</param>
    /// <param name="cardTag">Tag des Objekts. Null, wenn kein Objekt betrachtet wird.</param>
    /// <param name="timestamp">Zeitpunkt des Ereignisses.</param>
    public void EyeLookingAt(string eyeName, string cardName, string cardTag, float timestamp)
    {
        if (!eyeLookingAt.ContainsKey(eyeName))
        {
            Debug.LogWarning($"Unbekanntes Auge: {eyeName}");
            return;
        }

        // Update, welches Objekt dieses Auge betrachtet
        eyeLookingAt[eyeName] = cardName;

        // Prüfen, ob beide Augen auf dasselbe Objekt schauen
        string leftEyeObject = eyeLookingAt["LeftEye"];
        string rightEyeObject = eyeLookingAt["RightEye"];

        if (!string.IsNullOrEmpty(leftEyeObject) && leftEyeObject == rightEyeObject)
        {
            // Beide Augen schauen auf dasselbe Objekt
            if (currentCommonObject != leftEyeObject)
            {
                // Neues gemeinsames Objekt wird betrachtet
                currentCommonObject = leftEyeObject;
                commonObjectStartTime = timestamp;

                RegisterHit(currentCommonObject, cardTag, timestamp);
            }
            // Andernfalls: bereits auf dasselbe Objekt schauen, keine Aktion notwendig
        }
        else
        {
            // Die Augen schauen nicht auf dasselbe Objekt
            if (currentCommonObject != null)
            {
                // Stoppe die Verweildauer des vorherigen gemeinsamen Objekts
                float duration = timestamp - commonObjectStartTime;
                if (cardData.ContainsKey(currentCommonObject))
                {
                    cardData[currentCommonObject].totalTime += duration;
                    Debug.Log($"Stopped looking at {currentCommonObject}. Duration: {duration:F2} seconds.");

                    // Setze das Änderungsflag
                    dataChanged = true;
                }

                currentCommonObject = null;
            }
        }
    }

    /// <summary>
    /// Registriert einen neuen Hit für ein Objekt.
    /// </summary>
    /// <param name="cardName">Name des Objekts</param>
    /// <param name="cardTag">Tag des Objekts</param>
    /// <param name="timestamp">Zeitpunkt des Treffers</param>
    private void RegisterHit(string cardName, string cardTag, float timestamp)
    {
        // Prüfen, ob diese Karte bereits registriert wurde
        if (!cardData.ContainsKey(cardName))
        {
            cardData[cardName] = new CardData
            {
                tag = cardTag,
                hitCount = 0,
                totalTime = 0f,
                hitTimestamps = new List<float>()
            };
        }

        // Treffer registrieren
        cardData[cardName].hitCount++;
        cardData[cardName].hitTimestamps.Add(timestamp);
        Debug.Log($"New hit registered: {cardName}");

        // Setze das Änderungsflag
        dataChanged = true;
    }

    void Update()
    {
        if (dataChanged && !isSending && Time.time - lastSendTime >= minSendInterval)
        {
            StartCoroutine(SendData());
        }
    }

    void OnGUI()
    {
        // Debugging: Anzeige der Daten im Spiel-Fenster
        GUILayout.BeginScrollView(new Vector2(0, 0), GUILayout.Width(400), GUILayout.Height(600));
        GUILayout.Label("DataManager:");
        foreach (var entry in cardData)
        {
            GUILayout.Label($"Object: {entry.Key} | Tag: {entry.Value.tag} | Hits: {entry.Value.hitCount} | Total Time: {entry.Value.totalTime:F2} seconds");
        }
        GUILayout.EndScrollView();

        // Entferne den manuellen Sendebutton oder kommentiere ihn aus
        /*
        if (!dataSent && GUILayout.Button("Daten senden"))
        {
            StartCoroutine(SendData());
        }
        */
    }

    /// <summary>
    /// Sendet die gesammelten Daten an den Server, wenn Änderungen vorliegen.
    /// </summary>
    private IEnumerator SendData()
    {
        isSending = true;
        int retryCount = 0;
        int maxRetries = 3;
        float retryDelay = 2f;

        // Kopiere die aktuellen Daten
        Dictionary<string, CardData> dataToSend = CloneCardData();

        while (retryCount < maxRetries)
        {
            var data = new
            {
                timestamp = System.DateTime.UtcNow.ToString("o"),
                cardData = dataToSend
            };

            string jsonData = JsonConvert.SerializeObject(data);
            Debug.Log($"Gesendete Daten: {jsonData}");

            UnityWebRequest request = new UnityWebRequest(serverURL, "POST");
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            Debug.Log("Sende Anfrage an den Server...");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Fehler beim Senden der Daten: {request.error}");
                retryCount++;
                Debug.Log($"Wiederholungsversuch {retryCount} nach {retryDelay} Sekunden...");
                yield return new WaitForSeconds(retryDelay);
            }
            else
            {
                Debug.Log("Daten erfolgreich an den Server gesendet.");
                lastSendTime = Time.time;
                dataChanged = false;
                break;
            }
        }

        if (retryCount >= maxRetries)
        {
            Debug.LogError("Maximale Anzahl an Wiederholungsversuchen erreicht. Daten konnten nicht gesendet werden.");
            // Optional: Implementiere eine lokale Speicherung der Daten
            SaveDataLocally(dataToSend);
        }

        isSending = false;
    }

    /// <summary>
    /// Erstellt eine tiefe Kopie der cardData.
    /// </summary>
    /// <returns>Kopie von cardData</returns>
    private Dictionary<string, CardData> CloneCardData()
    {
        var clone = new Dictionary<string, CardData>();
        foreach (var entry in cardData)
        {
            clone[entry.Key] = new CardData
            {
                tag = entry.Value.tag,
                hitCount = entry.Value.hitCount,
                totalTime = entry.Value.totalTime,
                hitTimestamps = new List<float>(entry.Value.hitTimestamps)
            };
        }
        return clone;
    }

    /// <summary>
    /// Speichert die Daten lokal, falls das Senden fehlschlägt.
    /// </summary>
    /// <param name="data">Daten, die gespeichert werden sollen</param>
    private void SaveDataLocally(Dictionary<string, CardData> data)
    {
        string path = Application.persistentDataPath + "/unsentEyeData.json";
        string json = JsonConvert.SerializeObject(data, Formatting.Indented);
        System.IO.File.WriteAllText(path, json);
        Debug.Log($"Daten lokal gespeichert unter: {path}");
    }

    // Datenstruktur zur Speicherung der Trefferdaten
    [System.Serializable]
    private class CardData
    {
        public string tag; // Tag des Objekts
        public int hitCount = 0; // Anzahl der Treffer
        public float totalTime = 0f; // Gesamte Verweilzeit
        public List<float> hitTimestamps = new List<float>(); // Zeitpunkte der Treffer
    }
}
