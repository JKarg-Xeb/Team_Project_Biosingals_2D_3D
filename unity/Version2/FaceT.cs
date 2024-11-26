using UnityEngine;

public class FaceTrackingLogger : MonoBehaviour
{
    private OVRFaceExpressions faceExpressions;
    private bool isValidLogged = false;
    private int blinkCount = 0;
    private bool isBlinking = false;
    private const float blinkThreshold = 0.3f;

    private GUIStyle guiStyle = new GUIStyle();

    // Parameter
    private float eyeMovement = 0f;
    private float browActivity = 0f;
    private float lidTension = 0f;
    private float lipPress = 0f;

    // Verkrampftheit und Konzentration
    private float tensionValue = 0f;
    private float concentrationValue = 0f;

    void Start()
    {
        faceExpressions = GetComponent<OVRFaceExpressions>();
        if (faceExpressions == null)
        {
            Debug.LogError("OVRFaceExpressions-Komponente nicht gefunden! Stelle sicher, dass sie am selben GameObject hängt.");
            return;
        }

        Debug.Log("OVRFaceExpressions-Komponente erfolgreich gefunden.");

        guiStyle.fontSize = 18;
        guiStyle.normal.textColor = Color.white;
    }

    void Update()
    {
        if (faceExpressions == null)
        {
            return;
        }

        if (!faceExpressions.FaceTrackingEnabled || !faceExpressions.ValidExpressions)
        {
            if (!isValidLogged)
            {
                Debug.LogWarning("Face Tracking ist nicht verfügbar oder das Headset wurde abgesetzt.");
                isValidLogged = true;
            }
            return;
        }

        isValidLogged = false;

        // Blinzel-Logik
        float eyeBlinkLeft = faceExpressions[OVRFaceExpressions.FaceExpression.EyesClosedL];
        float eyeBlinkRight = faceExpressions[OVRFaceExpressions.FaceExpression.EyesClosedR];

        if ((eyeBlinkLeft < blinkThreshold || eyeBlinkRight < blinkThreshold) && !isBlinking)
        {
            blinkCount++;
            isBlinking = true;
            Debug.Log($"Blinzeln erkannt! Gesamtzahl der Blinzeln: {blinkCount}");
        }
        else if (eyeBlinkLeft >= blinkThreshold && eyeBlinkRight >= blinkThreshold)
        {
            isBlinking = false;
        }

        // Parameter aktualisieren
        eyeMovement = (faceExpressions[OVRFaceExpressions.FaceExpression.EyesLookUpL] +
                       faceExpressions[OVRFaceExpressions.FaceExpression.EyesLookUpR] +
                       faceExpressions[OVRFaceExpressions.FaceExpression.EyesLookDownL] +
                       faceExpressions[OVRFaceExpressions.FaceExpression.EyesLookDownR]) / 4f;

        browActivity = (faceExpressions[OVRFaceExpressions.FaceExpression.InnerBrowRaiserL] +
                        faceExpressions[OVRFaceExpressions.FaceExpression.InnerBrowRaiserR]) / 2f;

        lidTension = (faceExpressions[OVRFaceExpressions.FaceExpression.LidTightenerL] +
                      faceExpressions[OVRFaceExpressions.FaceExpression.LidTightenerR]) / 2f;

        lipPress = (faceExpressions[OVRFaceExpressions.FaceExpression.LipTightenerL] +
                    faceExpressions[OVRFaceExpressions.FaceExpression.LipTightenerR]) / 2f;

        // Konzentration berechnen
        concentrationValue = Mathf.Clamp01(1f - (0.4f * eyeMovement + 0.3f * browActivity + 0.3f * lidTension));

        // Verkrampftheit berechnen
        float browLowerer = (faceExpressions[OVRFaceExpressions.FaceExpression.BrowLowererL] +
                             faceExpressions[OVRFaceExpressions.FaceExpression.BrowLowererR]) / 2f;
        tensionValue = Mathf.Clamp01(0.6f * browLowerer + 0.3f * lidTension + 0.1f * lipPress);
    }

    void OnGUI()
    {
        float xOffset = Screen.width - 300;

        GUI.Label(new Rect(xOffset, 10, 300, 30), "Gesichtsausdruckswerte:", guiStyle);

        int yOffset = 50;

        // Konzentration anzeigen
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Konzentration: {concentrationValue:F2}", guiStyle);
        yOffset += 30;

        // Verkrampftheit anzeigen
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Verkrampftheit: {tensionValue:F2}", guiStyle);
        yOffset += 30;

        // Einzelne Parameter anzeigen
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Augenbewegung: {eyeMovement:F2}", guiStyle);
        yOffset += 30;
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Augenbrauenaktivität: {browActivity:F2}", guiStyle);
        yOffset += 30;
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Lidspannung: {lidTension:F2}", guiStyle);
        yOffset += 30;
        GUI.Label(new Rect(xOffset, yOffset, 300, 30), $"Lippenpresse: {lipPress:F2}", guiStyle);
        yOffset += 30;

        // Blinzelzähler anzeigen
        GUI.Label(new Rect(xOffset, yOffset + 20, 300, 30), $"Blinzelanzahl: {blinkCount}", guiStyle);
    }
}
