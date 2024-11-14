using UnityEngine;
using System.Collections;
using UnityEngine.Networking;
using UnityEngine.XR;

public class HD_Position_Rotation : MonoBehaviour
{
    [Header("Server Einstellungen")]
    [Tooltip("Die URL des Servers, an den die VR-Daten gesendet werden sollen.")]
    public string serverUrl = "http://127.0.0.1:8080/send_vr_data_OpenX";

    [Header("Sendeintervall")]
    [Tooltip("Intervall in Sekunden, in dem die VR-Daten gesendet werden sollen.")]
    public float sendInterval = 1f; // Sendeintervall in Sekunden

    private InputDevice headDevice;

    void Start()
    {
        // Initialisiere das Head-Device
        headDevice = InputDevices.GetDeviceAtXRNode(XRNode.Head);

        // Überprüfen, ob das VR-Headset gefunden wird
        if (!headDevice.isValid)
        {
            Debug.LogError("VR-Headset nicht gefunden. Bitte überprüfen Sie die Verbindung.");
            return;
        }

        // Starte den Coroutine-Loop zum Senden der VR-Daten
        StartCoroutine(SendVRDataToServer());
    }

    IEnumerator SendVRDataToServer()
    {
        while (true)
        {
            yield return new WaitForSeconds(sendInterval);

            // Initialisieren der Variablen
            Vector3 position = Vector3.zero;
            Quaternion rotation = Quaternion.identity;

            // Erfasse die Kopfposition und -rotation
            bool headDataValid = headDevice.TryGetFeatureValue(CommonUsages.devicePosition, out position) &&
                                 headDevice.TryGetFeatureValue(CommonUsages.deviceRotation, out rotation);

            if (headDataValid)
            {
                // VR-Daten in JSON-Format umwandeln
                VRData vrData = new VRData
                {
                    posX = position.x,
                    posY = position.y,
                    posZ = position.z,
                    rotX = rotation.x,
                    rotY = rotation.y,
                    rotZ = rotation.z,
                    rotW = rotation.w
                };

                string jsonData = JsonUtility.ToJson(vrData);

                // Sende die Daten an den Server
                UnityWebRequest request = new UnityWebRequest(serverUrl, "POST");
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                // Optional: Timeout setzen (in Sekunden)
                request.timeout = 10;

                // Sende die Anfrage und warte auf die Antwort
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError("Fehler beim Senden der VR-Daten: " + request.error);
                }
                else
                {
                    Debug.Log("VR-Daten erfolgreich gesendet: " + jsonData);
                    // Optional: Serverantwort anzeigen
                    Debug.Log("Serverantwort: " + request.downloadHandler.text);
                }
            }
            else
            {
                Debug.LogError("Konnte VR-Headset-Daten nicht abrufen. Bitte überprüfen Sie die Verbindung.");
            }
        }
    }

    // Datenklasse zur Strukturierung der VR-Daten (Position und Rotation)
    [System.Serializable]
    public class VRData
    {
        // Kopfposition
        public float posX, posY, posZ;

        // Kopfrotation
        public float rotX, rotY, rotZ, rotW;
    }
}
