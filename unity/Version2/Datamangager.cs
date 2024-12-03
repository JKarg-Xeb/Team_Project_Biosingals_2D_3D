using System.Collections.Generic;
using UnityEngine;

public class DataManager : MonoBehaviour
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
        string leftEyeObject = eyeLookingAt.ContainsKey("LeftEye") ? eyeLookingAt["LeftEye"] : null;
        string rightEyeObject = eyeLookingAt.ContainsKey("RightEye") ? eyeLookingAt["RightEye"] : null;

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
    }

    // Datenstruktur zur Speicherung der Trefferdaten
    private class CardData
    {
        public string tag; // Tag des Objekts
        public int hitCount = 0; // Anzahl der Treffer
        public float totalTime = 0f; // Gesamte Verweilzeit
        public List<float> hitTimestamps = new List<float>(); // Zeitpunkte der Treffer
    }
}
