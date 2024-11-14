using UnityEngine;
using System.Collections;
using UnityEngine.Networking;

public class VRDataSender : MonoBehaviour
{
    [Header("Server Einstellungen")]
    [Tooltip("Die URL des Servers, an den die VR-Daten gesendet werden sollen.")]
    public string serverUrl = "http://127.0.0.1:8080/send_vr_data";

    [Header("Sendeintervall")]
    [Tooltip("Intervall in Sekunden, in dem die VR-Daten gesendet werden.")]
    public float sendInterval = 1f; // Sendeintervall in Sekunden

    void Start()
    {
        StartCoroutine(SendVRDataToServer());
    }

    IEnumerator SendVRDataToServer()
    {
        while (true)
        {
            yield return new WaitForSeconds(sendInterval);

            // Erfasse VR-Daten, z.B. Position und Rotation des Headsets
            Vector3 position = Camera.main.transform.position;
            Quaternion rotation = Camera.main.transform.rotation;

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
    }

    // Datenklasse zur Strukturierung der VR-Daten
    [System.Serializable]
    public class VRData
    {
        public float posX, posY, posZ;
        public float rotX, rotY, rotZ, rotW;
    }
}
