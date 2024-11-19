using System.Collections; // Für IEnumerator
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Class to display eye-tracking data in the Unity Console.
/// </summary>
public class EyeTrackingConsoleOutput : MonoBehaviour
{
    private OVRPlugin.EyeGazesState _currentEyeGazesState;

    public OVREyeGaze.EyeId Eye; // Eye (Left or Right) to track
    public float ConfidenceThreshold = 0.5f;

    private void Update()
    {
        // Fetch eye-tracking data
        if (!OVRPlugin.GetEyeGazesState(OVRPlugin.Step.Render, -1, ref _currentEyeGazesState))
            return;

        var eyeGaze = _currentEyeGazesState.EyeGazes[(int)Eye];

        if (!eyeGaze.IsValid || eyeGaze.Confidence < ConfidenceThreshold)
            return;

        // Extract eye tracking data
        var position = eyeGaze.Pose.ToOVRPose().position;
        var rotation = eyeGaze.Pose.ToOVRPose().orientation.eulerAngles;
        var confidence = eyeGaze.Confidence;

        // Prepare data to display
        var eyeData = new
        {
            eye = Eye.ToString(),
            confidence = confidence,
            position = new { x = position.x, y = position.y, z = position.z },
            rotation = new { x = rotation.x, y = rotation.y, z = rotation.z }
        };

        // Convert to JSON
        string jsonData = JsonUtility.ToJson(eyeData);

        // Output to Unity console
        Debug.Log($"Eye Tracking Data: {jsonData}");
    }
}
