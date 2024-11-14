using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class VRDataSender : MonoBehaviour
{
    // Server URLs
    private string rotationUrl = "http://localhost:8080/send_vr_data_rotation";
    private string eyeTrackingUrl = "http://localhost:8080/send_vr_data_eyetracking";

    // Intervall in Sekunden, in dem die Daten gesendet werden
    public float sendInterval = 0.8f; 

    void Start()
    {
        // Starte die Coroutine, die die Daten in Intervallen sendet
        StartCoroutine(SendVRDataPeriodically());
    }

    IEnumerator SendVRDataPeriodically()
    {
        while (true)
        {
            // Erfassung der Rotationsdaten (Quaternion)
            Quaternion rotation = GetHeadRotation();
            Vector3 position = GetHeadPosition();

            yield return StartCoroutine(SendRotationData(position, rotation));

            // Erfassung der Eye-Tracking Daten (hier als Beispiel: Blickrichtung)
            Vector3 eyeGaze = GetEyeGazeDirection();
            yield return StartCoroutine(SendEyeTrackingData(position, rotation, eyeGaze));

            // Warte das definierte Intervall
            yield return new WaitForSeconds(sendInterval);
        }
    }

    // Methode zur Erfassung der Kopfrotation
    Quaternion GetHeadRotation()
    {
        // Verwende die Hauptkamera-Rotation (für Mock-Daten ohne Headset)
        return Camera.main.transform.rotation;
    }

    // Methode zur Erfassung der Kopfposition
    Vector3 GetHeadPosition()
    {
        // Verwende die Hauptkamera-Position
        return Camera.main.transform.position;
    }

    // Methode zur Erfassung der Eye Gaze Richtung
    Vector3 GetEyeGazeDirection()
    {
        // Mock-Daten: Hier könntest du echte Eye-Tracking-Daten von der Oculus SDK abrufen
        // Wenn du keine Eye-Tracking-Hardware hast, generiere die Forward-Richtung der Kamera
        return Camera.main.transform.forward;
    }

    // Coroutine zum Senden der Rotationsdaten
    IEnumerator SendRotationData(Vector3 position, Quaternion rotation)
    {
        VRRotationData data = new VRRotationData
        {
            posX = position.x,
            posY = position.y,
            posZ = position.z,
            rotX = rotation.x,
            rotY = rotation.y,
            rotZ = rotation.z,
            rotW = rotation.w
        };

        string json = JsonUtility.ToJson(data);
        Debug.Log($"Sending Rotation Data: {json}"); // Debug-Ausgabe hinzufügen
        UnityWebRequest request = new UnityWebRequest(rotationUrl, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Fehler beim Senden der Rotationsdaten: " + request.error);
        }
        else
        {
            Debug.Log("Rotationsdaten erfolgreich gesendet.");
        }
    }

    // Coroutine zum Senden der Eye-Tracking Daten
    IEnumerator SendEyeTrackingData(Vector3 position, Quaternion rotation, Vector3 eyeGaze)
    {
        VREyeTrackingData data = new VREyeTrackingData
        {
            posX = position.x,
            posY = position.y,
            posZ = position.z,
            rotX = rotation.x,
            rotY = rotation.y,
            rotZ = rotation.z,
            rotW = rotation.w,
            gazeX = eyeGaze.x,
            gazeY = eyeGaze.y,
            gazeZ = eyeGaze.z
        };

        string json = JsonUtility.ToJson(data);
        Debug.Log($"Sending Eye-Tracking Data: {json}"); // Debug-Ausgabe hinzufügen
        UnityWebRequest request = new UnityWebRequest(eyeTrackingUrl, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Fehler beim Senden der Eye-Tracking Daten: " + request.error);
        }
        else
        {
            Debug.Log("Eye-Tracking Daten erfolgreich gesendet.");
        }
    }
}

// Klassen zur Strukturierung der Daten
[System.Serializable]
public class VRRotationData
{
    public float posX;
    public float posY;
    public float posZ;
    public float rotX;
    public float rotY;
    public float rotZ;
    public float rotW;
}

[System.Serializable]
public class VREyeTrackingData
{
    public float posX;
    public float posY;
    public float posZ;
    public float rotX;
    public float rotY;
    public float rotZ;
    public float rotW;
    public float gazeX;
    public float gazeY;
    public float gazeZ;
}
