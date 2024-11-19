using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class TrackingSender : MonoBehaviour
{
    private OVREyeGaze leftEyeGaze;
    private OVREyeGaze rightEyeGaze;

    void Start()
    {
        // OVREyeGaze-Komponenten abrufen
        leftEyeGaze = GameObject.Find("LeftEyeAnchor").GetComponent<OVREyeGaze>();
        rightEyeGaze = GameObject.Find("RightEyeAnchor").GetComponent<OVREyeGaze>();
    }

    void Update()
    {
        if (leftEyeGaze != null && rightEyeGaze != null)
        {
            // Gaze Direction und Positionen abrufen
            Vector3 leftGazeDirection = leftEyeGaze.transform.forward;
            Vector3 rightGazeDirection = rightEyeGaze.transform.forward;

            Vector3 leftEyePosition = leftEyeGaze.transform.position;
            Vector3 rightEyePosition = rightEyeGaze.transform.position;

            // Controller-Daten abrufen
            Vector3 leftControllerPosition = OVRInput.GetLocalControllerPosition(OVRInput.Controller.LTouch);
            Quaternion leftControllerOrientation = OVRInput.GetLocalControllerRotation(OVRInput.Controller.LTouch);

            Vector3 rightControllerPosition = OVRInput.GetLocalControllerPosition(OVRInput.Controller.RTouch);
            Quaternion rightControllerOrientation = OVRInput.GetLocalControllerRotation(OVRInput.Controller.RTouch);

            // JSON-Datenstruktur erstellen
            TrackingData data = new TrackingData
            {
                leftEyePosition = leftEyePosition,
                leftGazeDirection = leftGazeDirection,
                rightEyePosition = rightEyePosition,
                rightGazeDirection = rightGazeDirection,
                leftControllerPosition = leftControllerPosition,
                leftControllerOrientation = leftControllerOrientation,
                rightControllerPosition = rightControllerPosition,
                rightControllerOrientation = rightControllerOrientation
            };

            string jsonData = JsonUtility.ToJson(data);

            // Ausgabe in die Unity-Konsole
            Debug.Log("Tracking Daten: " + jsonData);

            StartCoroutine(PostToServer(jsonData));
        }
        else
        {
            Debug.LogWarning("OVREyeGaze-Komponenten konnten nicht gefunden werden.");
        }
    }

    IEnumerator PostToServer(string jsonData)
    {
        UnityWebRequest request = new UnityWebRequest("http://localhost:8080", "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Daten erfolgreich gesendet: " + jsonData);
        }
        else
        {
            Debug.LogError("Fehler beim Senden der Daten: " + request.error);
        }
    }

    [System.Serializable]
    public class TrackingData
    {
        public Vector3 leftEyePosition;
        public Vector3 leftGazeDirection;
        public Vector3 rightEyePosition;
        public Vector3 rightGazeDirection;
        public Vector3 leftControllerPosition;
        public Quaternion leftControllerOrientation;
        public Vector3 rightControllerPosition;
        public Quaternion rightControllerOrientation;
    }
}
