import os
import time
import redis
import requests
import json

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
GATEWAY_URL = os.getenv("GATEWAY_URL")

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def monitor_score():
    score = r.get("consistency_score")
    if score:
        return float(score)
    return 0.0

def send_code_to_llm(error_details, legacy_code):
    print(f"Sending to LLM: {error_details}")
    # Mock response
    return "updated_code_string"

def redeploy_modern_service(new_code, service_name):
    print(f"Redeploying {service_name}...")
    # Mock Docker SDK usage
    time.sleep(2)
    print(f"{service_name} redeployed successfully.")

def update_gateway_weight(service_type, weight):
    try:
        resp = requests.post(f"{GATEWAY_URL}/admin/set-weight", json={
            "service": service_type,
            "weight": weight
        })
        print(f"Updated weight for {service_type}: {resp.status_code}")
    except Exception as e:
        print(f"Failed to update weight: {e}")

def control_loop():
    print("Orchestrator Control Loop Started...")
    while True:
        score = monitor_score()
        # print(f"Current Consistency Score: {score}%")
        
        # Check Migration Status for Python
        if r.get("migration_active_python") == "true":
            current_weight = float(r.get("weight_python") or 0)
            
            if score >= 99.0:
                if current_weight < 1.0:
                    new_weight = min(current_weight + 0.05, 1.0) # +5% every 2 seconds
                    update_gateway_weight("python", new_weight)
                    r.set("weight_python", new_weight)
                    print(f"Migrating Python... Weight: {new_weight:.2f}")
            else:
                # If score drops, rollback?
                # print("Score unstable. Holding migration.")
                pass
        
        # Check Migration Status for PHP
        if r.get("migration_active_php") == "true":
            current_weight = float(r.get("weight_php") or 0)
            if score >= 99.0:
                if current_weight < 1.0:
                    new_weight = min(current_weight + 0.05, 1.0)
                    update_gateway_weight("php", new_weight)
                    r.set("weight_php", new_weight)
                    print(f"Migrating PHP... Weight: {new_weight:.2f}")

        time.sleep(2)

if __name__ == "__main__":
    control_loop()
