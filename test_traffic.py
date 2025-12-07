import requests
import sys
import json
import time
from datetime import datetime
import random

# Configure line buffering for real-time logging
sys.stdout.reconfigure(line_buffering=True)

def generate_traffic():
    # Gateway base URL
    BASE_URL = "http://localhost:8082/php/users"
    
    # Tracking variables for summary
    total_requests = 5
    successful_requests = 0
    total_latency = 0

    # Generate traffic
    for request_num in range(1, total_requests + 1):
        try:
            # Prepare request with shadowing mode
            query_params = {"mode": "shadowing"}
            
            # Start timing
            start_time = time.time()
            
            # Send GET request
            response = requests.get(BASE_URL, params=query_params)
            
            # Calculate latency
            latency = int((time.time() - start_time) * 1000)
            total_latency += latency

            # Log request details
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{current_time}] 🚀 REQUEST #{request_num}: GET {response.url}")
            print(f"[{current_time}] 📤 Payload/Params: {query_params}")
            print(f"[{current_time}] 📥 RESPONSE: {response.status_code} | Time: {latency}ms")
            
            # Log response body snippet (first 200 characters)
            response_snippet = response.text[:200] + "..." if len(response.text) > 200 else response.text
            print(f"[{current_time}] 📊 Response Body: {response_snippet}")

            # Track successful requests
            if response.status_code == 200:
                successful_requests += 1

            # Wait 1 second between requests
            time.sleep(1)

        except requests.RequestException as e:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{current_time}] ❌ REQUEST #{request_num} FAILED: {str(e)}")

    # Print summary
    success_rate = (successful_requests / total_requests) * 100
    avg_latency = total_latency / total_requests if total_requests > 0 else 0
    
    print("\n🏁 TRAFFIC GENERATION SUMMARY 🏁")
    print(f"Total Requests: {total_requests}")
    print(f"Successful Requests: {successful_requests}")
    print(f"Success Rate: {success_rate:.2f}%")
    print(f"Average Latency: {avg_latency:.2f}ms")

if __name__ == "__main__":
    generate_traffic()
