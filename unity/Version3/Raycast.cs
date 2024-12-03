using UnityEngine;

public class EyeRaycast : MonoBehaviour
{
    public float raycastDistance = 100f; // Maximale Entfernung des Raycasts
    public string eyeName; // Name des Auges (z. B. "LeftEye" oder "RightEye")

    public DMEyeTracking dataManager; // Referenz auf den zentralen DataManager
    private GameObject previousCard; // Lokale Referenz für die vorherige getroffene Karte

    void Update()
    {
        Vector3 start = transform.position;
        Vector3 direction = transform.forward;

        // Raycast ausführen
        if (Physics.Raycast(start, direction, out RaycastHit hit, raycastDistance))
        {
            GameObject hitObject = hit.collider.gameObject;

            if (previousCard != hitObject)
            {
                // Informiere den DataManager über das neue Objekt, auf das dieses Auge schaut
                Debug.Log($"{eyeName} schaut auf {hitObject.name} mit Tag {hitObject.tag}");
                dataManager.EyeLookingAt(eyeName, hitObject.name, hitObject.tag, Time.time);

                // Update der vorherigen Karte
                previousCard = hitObject;
            }
        }
        else
        {
            // Kein Treffer: Informiere den DataManager, dass dieses Auge auf kein Objekt schaut
            if (previousCard != null)
            {
                Debug.Log($"{eyeName} schaut auf kein Objekt");
                dataManager.EyeLookingAt(eyeName, null, null, Time.time);
                previousCard = null;
            }
        }
    }

    private void OnDestroy()
    {
        // Stelle sicher, dass beim Zerstören des Objekts das aktuelle Tracking gestoppt wird
        if (previousCard != null)
        {
            dataManager.EyeLookingAt(eyeName, null, null, Time.time);
            previousCard = null;
        }
    }
}
