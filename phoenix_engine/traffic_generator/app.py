import time
import requests
import random
import os
import sys

# Flush stdout to ensure logs appear immediately in Docker
sys.stdout.reconfigure(line_buffering=True)

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://gateway:8082")

def generate_traffic():
    print(f"Starting Traffic Generator targeting: {GATEWAY_URL}")
    while True:
        # 1. Python Service Traffic (VIP vs Standard)
        try:
            acc_type = random.choice(["VIP", "STANDARD"])
            acc_num = "ACC-1002" if acc_type == "VIP" else "ACC-1001"
            
            url = f"{GATEWAY_URL}/python/transfer"
            resp = requests.post(
                url,
                json={"account_number": acc_num, "amount": random.uniform(10, 500)},
                timeout=1
            )
            print(f"[{resp.status_code}] POST {url}")
        except Exception as e:
            print(f"[ERROR] POST {url}: {e}")

        # 2. PHP Service Traffic
        try:
            url = f"{GATEWAY_URL}/php/transfer"
            resp = requests.post(
                url,
                json={"account_number": "ACC-1001", "amount": random.uniform(10.1234, 100.5678)},
                timeout=1
            )
            print(f"[{resp.status_code}] POST {url}")
        except Exception as e:
            print(f"[ERROR] POST {url}: {e}")

        time.sleep(1) # Slow down slightly to make logs readable

if __name__ == "__main__":
    time.sleep(5) # Wait for services to come up
    generate_traffic()

