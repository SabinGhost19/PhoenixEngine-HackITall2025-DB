import time
import requests
import random
import os

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://gateway:8082")

def generate_traffic():
    print("Starting Traffic Generator...")
    while True:
        # 1. Python Service Traffic (VIP vs Standard)
        try:
            acc_type = random.choice(["VIP", "STANDARD"])
            acc_num = "ACC-1002" if acc_type == "VIP" else "ACC-1001"
            
            requests.post(
                f"{GATEWAY_URL}/python/transfer",
                json={"account_number": acc_num, "amount": random.uniform(10, 500)},
                timeout=1
            )
        except Exception as e:
            pass # Ignore connection errors during startup

        # 2. PHP Service Traffic
        try:
            requests.post(
                f"{GATEWAY_URL}/php/transfer",
                json={"account_number": "ACC-1001", "amount": random.uniform(10.1234, 100.5678)},
                timeout=1
            )
        except Exception as e:
            pass

        time.sleep(0.1) # 10 req/s roughly

if __name__ == "__main__":
    time.sleep(5) # Wait for services to come up
    generate_traffic()
