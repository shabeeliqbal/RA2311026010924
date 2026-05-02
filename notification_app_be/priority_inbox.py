import requests
from typing import List, Dict
import json

PRIORITY_WEIGHTS = {
    'placement': 3,
    'result': 2,
    'event': 1
}

def authenticate() -> str:
    auth_url = "http://20.207.122.201/evaluation-service/auth"
    payload = {
        "email": "si7302@srmist.edu.in",
        "name": "shabeel iqbal t h",
        "rollNo": "RA2311026010924",
        "accesscode": "QkbpxH",
        "clientId": "56385759-3914-4f62-9845-abb78e4d938e",
        "clientSecret": "AEdfKEdbwvWzySMU"
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(auth_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("token") or data.get("accessToken") or data.get("authorization")
    except requests.RequestException as e:
        print(f"Error authenticating: {e}")
        try:
            print("Auth response:", response.text)
        except:
            pass
        return None

def get_notifications(api_url: str, token: str) -> List[Dict]:
    headers = {}
    if token:
        headers["Authorization"] = token
        
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching notifications: {e}")
        try:
            print("Response text:", response.text)
        except:
            pass
        return []

def get_priority_inbox(notifications: List[Dict], top_n: int = 5) -> List[Dict]:
    def sort_key(notification):
        n_type = notification.get('type', '').lower()
        return PRIORITY_WEIGHTS.get(n_type, 0)
        
    sorted_notifications = sorted(notifications, key=sort_key, reverse=True)
    return sorted_notifications[:top_n]

def main():
    print("--- Starting Priority Inbox Application ---")
    print("Authenticating...")
    token = authenticate()
    
    if not token:
        print("Failed to get authorization token. Check credentials.")
        return
    else:
        print("Authentication successful.")
    
    API_URL = "http://20.207.122.201/evaluation-service/notifications"
    print("Fetching notifications...")
    notifications = get_notifications(API_URL, token)
    
    if notifications:
        top_notifications = get_priority_inbox(notifications, top_n=5)
        
        print("\n--- JSON Output ---")
        print(json.dumps(top_notifications, indent=2))
        
        print("\n--- Text Output ---")
        for i, n in enumerate(top_notifications, 1):
            n_type = n.get('type', 'Unknown').upper()
            n_msg = n.get('massage', 'No Message')
            n_time = n.get('timestamp', '')
            print(f"{i}. [{n_type}] {n_msg} - {n_time}")
    else:
        print("No notifications retrieved or the inbox is empty.")

if __name__ == "__main__":
    main()
