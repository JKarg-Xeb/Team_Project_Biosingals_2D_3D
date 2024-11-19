using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Sends eye-tracking data to a server every 0.5 seconds via POST.
/// </summary>
public class EyeTrackingLiveSender : MonoBehaviour
{
    private OVRPlugin.EyeGazesState _currentEyeGazesState;

    public OVREyeGaze.EyeId Eye; // Eye (Left or Right) to track
    public float ConfidenceThreshold = 0.5f;

    private const string serverUrl = "http://localhost:8080/eyetracking";

    private void Start()
    {
        // Start live data transmission
        StartCoroutine(SendEyeTrackingDataLive());
    }

    private IEnumerator SendEyeTrackingDataLive()
    {
        while (true)
        {
            // Wait for 0.5 seconds
            yield return new WaitForSeconds(0.5f);

            // Fetch eye-tracking data
            if (!OVRPlugin.GetEyeGazesState(OVRPlugin.Step.Render, -1, ref _currentEyeGazesState))
                continue;

            var eyeGaze = _currentEyeGazesState.EyeGazes[(int)Eye];

            if (!eyeGaze.IsValid || eyeGaze.Confidence < ConfidenceThreshold)
                continue;

            // Extract eye tracking data
            var position = eyeGaze.Pose.ToOVRPose().position;
            var rotation = eyeGaze.Pose.ToOVRPose().orientation.eulerAngles;
            var confidence = eyeGaze.Confidence;

            // Prepare data to send
            var eyeData = new
            {
                eye = Eye.ToString(),
                confidence = confidence,
                position = new { x = position.x, y = position.y, z = position.z },
                rotation = new { x = rotation.x, y = rotation.y, z = rotation.z }
            };

            // Convert to JSON
            string jsonData = JsonUtility.ToJson(eyeData);

            // Send data as POST
            yield return StartCoroutine(SendPostRequest(jsonData));
        }
    }

    private IEnumerator SendPostRequest(string jsonData)
    {
        using (UnityWebRequest request = new UnityWebRequest(serverUrl, UnityWebRequest.kHttpVerbPOST))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            // Send the request
            yield return request.SendWebRequest();

            // Log the result
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log($"POST successful: {request.downloadHandler.text}");
            }
            else
            {
                Debug.LogError($"POST failed: {request.error}");
            }
        }
    }
}
