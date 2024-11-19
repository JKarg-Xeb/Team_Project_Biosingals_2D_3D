using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using Oculus;
using Oculus.Platform;
using Oculus.Platform.Models;
using UnityEngine.XR;

public class VRDataSender : MonoBehaviour
{
    // Server URLs
    private string rotationUrl = "http://localhost:8080/send_vr_data_rotation";
    private string eyeTrackingUrl = "http://localhost:8080/send_vr_data_eyetracking";

    // Intervall in Sekunden, in dem die Daten gesendet werden
    public float sendInterval = 0.8f;

    void Start()
    {
        // Initialisiere die Oculus-Plattform
        if (!Core.IsInitialized())
        {
            Core.Initialize();
        }

        // Überprüfe, ob Eye Tracking verfügbar ist
        if (!OVRPlugin.eyeTrackingSupported)
        {
            Debug.LogError("Eye Tracking ist auf diesem Gerät nicht verfügbar.");
            return;
        }

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

            // Erfassung der Eye-Tracking Daten
            EyeTrackingData eyeData = GetEyeTrackingData();
            if (eyeData != null)
            {
                yield return StartCoroutine(SendEyeTrackingData(position, rotation, eyeData));
            }
            else
            {
                Debug.LogWarning("Keine Eye-Tracking-Daten verfügbar.");
            }

            // Warte das definierte Intervall
            yield return new WaitForSeconds(sendInterval);
        }
    }

    // Methode zur Erfassung der Kopfrotation
    Quaternion GetHeadRotation()
    {
        // Verwende die Hauptkamera-Rotation
        return Camera.main.transform.rotation;
    }

    // Methode zur Erfassung der Kopfposition
    Vector3 GetHeadPosition()
    {
        // Verwende die Hauptkamera-Position
        return Camera.main.transform.position;
    }

    // Methode zur Erfassung der Eye-Tracking Daten
    EyeTrackingData GetEyeTrackingData()
    {
        // Überprüfe den Eye-Tracking-Status
        var eyeTrackingState = OVRPlugin.GetEyeTrackingState(0);
        if (!eyeTrackingState.IsEnabled || eyeTrackingState.Status != OVRPlugin.EyeTrackingStatus.Supported)
        {
            Debug.LogWarning("Eye Tracking ist nicht aktiviert oder nicht unterstützt.");
            return null;
        }

        // Erhalte die aktuellen Eye-Tracking-Daten
        OVRPlugin.EyeGaze gazeData = OVRPlugin.GetEyeGaze();

        // Struktur der Eye-Tracking-Daten
        EyeTrackingData data = new EyeTrackingData
        {
            LeftEyeGazeDirection = new Vector3(gazeData.LeftEye.GazeDirection.x, gazeData.LeftEye.GazeDirection.y, gazeData.LeftEye.GazeDirection.z),
            LeftEyeGazeOrigin = new Vector3(gazeData.LeftEye.GazeOrigin.x, gazeData.LeftEye.GazeOrigin.y, gazeData.LeftEye.GazeOrigin.z),
            RightEyeGazeDirection = new Vector3(gazeData.RightEye.GazeDirection.x, gazeData.RightEye.GazeDirection.y, gazeData.RightEye.GazeDirection.z),
            RightEyeGazeOrigin = new Vector3(gazeData.RightEye.GazeOrigin.x, gazeData.RightEye.GazeOrigin.y, gazeData.RightEye.GazeOrigin.z),
            Timestamp = Time.time
        };

        return data;
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
        byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
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
    IEnumerator SendEyeTrackingData(Vector3 position, Quaternion rotation, EyeTrackingData eyeData)
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
            leftGazeDirX = eyeData.LeftEyeGazeDirection.x,
            leftGazeDirY = eyeData.LeftEyeGazeDirection.y,
            leftGazeDirZ = eyeData.LeftEyeGazeDirection.z,
            leftGazeOriginX = eyeData.LeftEyeGazeOrigin.x,
            leftGazeOriginY = eyeData.LeftEyeGazeOrigin.y,
            leftGazeOriginZ = eyeData.LeftEyeGazeOrigin.z,
            rightGazeDirX = eyeData.RightEyeGazeDirection.x,
            rightGazeDirY = eyeData.RightEyeGazeDirection.y,
            rightGazeDirZ = eyeData.RightEyeGazeDirection.z,
            rightGazeOriginX = eyeData.RightEyeGazeOrigin.x,
            rightGazeOriginY = eyeData.RightEyeGazeOrigin.y,
            rightGazeOriginZ = eyeData.RightEyeGazeOrigin.z,
            timestamp = eyeData.Timestamp
        };

        string json = JsonUtility.ToJson(data);
        Debug.Log($"Sending Eye-Tracking Data: {json}"); // Debug-Ausgabe hinzufügen
        UnityWebRequest request = new UnityWebRequest(eyeTrackingUrl, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
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

    // Linkes Auge
    public float leftGazeDirX;
    public float leftGazeDirY;
    public float leftGazeDirZ;
    public float leftGazeOriginX;
    public float leftGazeOriginY;
    public float leftGazeOriginZ;

    // Rechtes Auge
    public float rightGazeDirX;
    public float rightGazeDirY;
    public float rightGazeDirZ;
    public float rightGazeOriginX;
    public float rightGazeOriginY;
    public float rightGazeOriginZ;

    public float timestamp;
}

// Zusätzliche Klasse zur Strukturierung der Eye-Tracking-Daten
[System.Serializable]
public class EyeTrackingData
{
    public Vector3 LeftEyeGazeDirection;
    public Vector3 LeftEyeGazeOrigin;
    public Vector3 RightEyeGazeDirection;
    public Vector3 RightEyeGazeOrigin;
    public float Timestamp;
}
