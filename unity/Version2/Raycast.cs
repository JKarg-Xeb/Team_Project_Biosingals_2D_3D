using System.Collections.Generic;
using UnityEngine;

public class CardRaycastMultipleTags : MonoBehaviour
{
    public float raycastDistance = 100f; // Maximale Entfernung des Raycasts
    public Color defaultColor = Color.green;
    public Color hitColor = Color.red;

    // Liste der erlaubten Tags
    public List<string> allowedTags = new List<string> { "Tag_A", "Tag_B", "Tag_C", "Tag_D" };

    private Dictionary<GameObject, HeatmapData> heatmapData; // Daten für Heatmap
    private GameObject currentCard; // Aktuell getroffene Karte
    private float timeOnCurrentCard; // Verweilzeit auf aktueller Karte
    private LineRenderer lineRenderer; // Visualisierung des Raycasts

    void Start()
    {
        // Initialisieren der Datenstruktur
        heatmapData = new Dictionary<GameObject, HeatmapData>();

        // LineRenderer hinzufügen und konfigurieren
        lineRenderer = gameObject.AddComponent<LineRenderer>();
        lineRenderer.startWidth = 0.05f;
        lineRenderer.endWidth = 0.05f;
        lineRenderer.positionCount = 2; // Start- und Endpunkt
        lineRenderer.material = new Material(Shader.Find("Sprites/Default"));
        lineRenderer.startColor = defaultColor;
        lineRenderer.endColor = defaultColor;
    }

    void Update()
    {
        Vector3 start = transform.position;
        Vector3 direction = transform.forward;

        // Raycast ausführen
        if (Physics.Raycast(start, direction, out RaycastHit hit, raycastDistance))
        {
            GameObject hitObject = hit.collider.gameObject;

            // Prüfen, ob das Objekt einen erlaubten Tag hat
            if (allowedTags.Contains(hitObject.tag))
            {
                // Falls das Objekt noch nicht in der Datenstruktur ist, hinzufügen und zählen
                if (!heatmapData.ContainsKey(hitObject))
                {
                    heatmapData[hitObject] = new HeatmapData
                    {
                        tag = hitObject.tag, // Speichere den Tag
                        hitCount = 1 // Erster Treffer
                    };
                }

                // Verweilzeit auf der aktuellen Karte erhöhen
                if (currentCard == hitObject)
                {
                    timeOnCurrentCard += Time.deltaTime;
                }
                else
                {
                    // Wechsel der Karte: Verweilzeit speichern und neue Karte starten
                    if (currentCard != null)
                    {
                        heatmapData[currentCard].totalTime += timeOnCurrentCard;
                    }

                    currentCard = hitObject;
                    timeOnCurrentCard = 0f; // Zeit zurücksetzen
                }

                // LineRenderer auf Trefferpunkt aktualisieren
                lineRenderer.SetPosition(0, start);
                lineRenderer.SetPosition(1, hit.point);
                lineRenderer.startColor = hitColor;
                lineRenderer.endColor = hitColor;
            }
        }
        else
        {
            // Kein Treffer: LineRenderer zurücksetzen
            lineRenderer.SetPosition(0, start);
            lineRenderer.SetPosition(1, start + direction * raycastDistance);
            lineRenderer.startColor = defaultColor;
            lineRenderer.endColor = defaultColor;

            // Verweilzeit speichern, wenn der Blick von der Karte weggeht
            if (currentCard != null)
            {
                heatmapData[currentCard].totalTime += timeOnCurrentCard;
                currentCard = null;
                timeOnCurrentCard = 0f;
            }
        }
    }

    void OnGUI()
    {
        // Debugging: Anzeige der Daten im Spiel-Fenster
        GUILayout.Label("Heatmap Data:");
        foreach (var entry in heatmapData)
        {
            GUILayout.Label($"Object: {entry.Key.name} | Tag: {entry.Value.tag} | Hits: {entry.Value.hitCount} | Total Time: {entry.Value.totalTime:F2} seconds");
        }
    }

    // Datenstruktur zur Speicherung der Trefferdaten
    private class HeatmapData
    {
        public string tag; // Tag des Objekts
        public int hitCount = 0; // Anzahl der Treffer
        public float totalTime = 0f; // Gesamte Verweilzeit
    }
}
