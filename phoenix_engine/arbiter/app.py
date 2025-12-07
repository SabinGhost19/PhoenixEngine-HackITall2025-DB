"""
Phoenix Engine - Arbiter Service
================================
This service monitors the consistency between legacy and modern services,
and automatically shifts traffic using canary deployment strategy.

Features:
- Kafka consumer for shadow-requests and db-state-updates
- Decision Engine with automatic weight shifting
- Flask HTTP server for status monitoring
- Redis-backed state management
"""

import os
import json
import time
import threading
import requests
import psycopg2
import redis
from kafka import KafkaConsumer
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify
from flask_cors import CORS

# ========== Configuration ==========
DATABASE_URL = os.getenv("DATABASE_URL")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://gateway:8082")

# Decision Engine Thresholds
THRESHOLD_PROMOTE = 0.99  # 99% consistency required to increase weight
THRESHOLD_ROLLBACK = 0.95  # Below 95% triggers rollback
MIN_SAMPLES = 10  # Minimum samples before making decisions
WEIGHT_INCREMENT = 0.10  # 10% increment per step
DECISION_INTERVAL = 10  # Seconds between decision checks

# ========== Redis Connection ==========
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

# ========== Flask App ==========
app = Flask(__name__)
CORS(app)


def get_db_connection():
    """Get database connection with retry logic"""
    while True:
        try:
            return psycopg2.connect(DATABASE_URL)
        except psycopg2.OperationalError:
            print("Database not ready, retrying in 2s...")
            time.sleep(2)


def get_current_state():
    """Get current arbiter state from Redis"""
    state = {
        "php_weight": float(r.get("php_weight") or 0.0),
        "python_weight": float(r.get("python_weight") or 0.0),
        "consistency_score": float(r.get("consistency_score") or 100.0),
        "total_transactions": int(r.get("total_transactions") or 0),
        "matched_transactions": int(r.get("matched_transactions") or 0),
        "migration_status": r.get("migration_status") or "pending",
        "last_decision": r.get("last_decision") or "none",
        "last_decision_time": r.get("last_decision_time") or "",
    }
    return state


def update_gateway_weight(service: str, weight: float) -> bool:
    """Send weight update request to Gateway"""
    try:
        url = f"{GATEWAY_URL}/admin/set-weight"
        payload = {"service": service, "weight": weight}
        response = requests.post(url, json=payload, timeout=5)
        
        if response.status_code == 200:
            print(f"✅ Gateway weight updated: {service} = {weight*100:.0f}%")
            return True
        else:
            print(f"❌ Failed to update Gateway: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Gateway communication error: {e}")
        return False


def reconcile_state(transaction_id: str, account_number: str, service_type: str = "php"):
    """Compare legacy and modern service states for a transaction"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get Legacy Balance
        cursor.execute(
            "SELECT balance FROM accounts WHERE account_number = %s AND is_shadow = FALSE",
            (account_number,)
        )
        legacy_acc = cursor.fetchone()
        
        # Get Modern Balance
        cursor.execute(
            "SELECT balance FROM accounts WHERE account_number = %s AND is_shadow = TRUE",
            (account_number,)
        )
        modern_acc = cursor.fetchone()
        
        if legacy_acc and modern_acc:
            legacy_bal = float(legacy_acc['balance'])
            modern_bal = float(modern_acc['balance'])
            
            delta = abs(legacy_bal - modern_bal)
            
            print(f"📊 Reconciling Tx {transaction_id}: Legacy={legacy_bal}, Modern={modern_bal}, Delta={delta}")
            
            is_match = delta < 0.0001
            
            if not is_match:
                # Log error to Redis
                error_data = {
                    "transaction_id": transaction_id,
                    "account_number": account_number,
                    "service_type": service_type,
                    "delta": delta,
                    "legacy_balance": legacy_bal,
                    "modern_balance": modern_bal,
                    "timestamp": time.time()
                }
                r.lpush("errors", json.dumps(error_data))
            
            # Update transaction counts
            r.incr("total_transactions")
            if is_match:
                r.incr("matched_transactions")
            
            # Calculate Consistency Score
            total = int(r.get("total_transactions") or 1)
            matched = int(r.get("matched_transactions") or 0)
            
            score = (matched / total) * 100.0 if total > 0 else 100.0
            r.set("consistency_score", score)
            
            status = "MATCH" if is_match else "MISMATCH"
            print(f"   Status: {status} | Consistency Score: {score:.2f}%")
            
    except Exception as e:
        print(f"❌ Error reconciling: {e}")
    finally:
        cursor.close()
        conn.close()


def decision_engine():
    """
    The core decision engine that automatically adjusts traffic weights
    based on consistency scores.
    
    Rules:
    - If score >= 99% AND samples >= MIN_SAMPLES: Increase weight by 10%
    - If score < 95%: Rollback to 0%
    - If weight reaches 100%: Mark migration as complete
    """
    print("🧠 Decision Engine started...")
    
    while True:
        try:
            time.sleep(DECISION_INTERVAL)
            
            # Get current state
            total = int(r.get("total_transactions") or 0)
            matched = int(r.get("matched_transactions") or 0)
            score = float(r.get("consistency_score") or 100.0)
            
            # For now, we focus on PHP service (can be extended to both)
            current_weight = float(r.get("php_weight") or 0.0)
            service = "php"
            
            print(f"\n🔍 Decision Check: Score={score:.2f}%, Samples={total}, Weight={current_weight*100:.0f}%")
            
            if total < MIN_SAMPLES:
                print(f"   ⏳ Waiting for more samples ({total}/{MIN_SAMPLES})")
                continue
            
            # Migration already complete
            if current_weight >= 1.0:
                if r.get("migration_status") != "complete":
                    r.set("migration_status", "complete")
                    r.set("last_decision", "migration_complete")
                    r.set("last_decision_time", time.strftime("%Y-%m-%d %H:%M:%S"))
                    print("🎉 MIGRATION COMPLETE! 100% traffic on modern service.")
                continue
            
            # Decision: Promote (increase weight)
            if score >= THRESHOLD_PROMOTE * 100:
                new_weight = min(current_weight + WEIGHT_INCREMENT, 1.0)
                
                print(f"   ✅ Score high ({score:.2f}% >= {THRESHOLD_PROMOTE*100}%), promoting...")
                print(f"   📈 Weight: {current_weight*100:.0f}% → {new_weight*100:.0f}%")
                
                if update_gateway_weight(service, new_weight):
                    r.set(f"{service}_weight", new_weight)
                    r.set("last_decision", f"promote_{int(new_weight*100)}")
                    r.set("last_decision_time", time.strftime("%Y-%m-%d %H:%M:%S"))
                    
                    if new_weight >= 1.0:
                        r.set("migration_status", "complete")
                        print("🎉 MIGRATION COMPLETE! 100% traffic on modern service.")
                    else:
                        r.set("migration_status", "in_progress")
                        
            # Decision: Rollback
            elif score < THRESHOLD_ROLLBACK * 100:
                print(f"   ⚠️ Score low ({score:.2f}% < {THRESHOLD_ROLLBACK*100}%), rolling back...")
                print(f"   📉 Weight: {current_weight*100:.0f}% → 0%")
                
                if update_gateway_weight(service, 0.0):
                    r.set(f"{service}_weight", 0.0)
                    r.set("last_decision", "rollback")
                    r.set("last_decision_time", time.strftime("%Y-%m-%d %H:%M:%S"))
                    r.set("migration_status", "rollback")
                    
                    # Log rollback event
                    rollback_event = {
                        "event": "rollback",
                        "service": service,
                        "score_at_rollback": score,
                        "timestamp": time.time()
                    }
                    r.lpush("rollback_events", json.dumps(rollback_event))
                    
            else:
                print(f"   ⏸️ Score in neutral zone ({THRESHOLD_ROLLBACK*100}% <= {score:.2f}% < {THRESHOLD_PROMOTE*100}%), holding...")
                
        except Exception as e:
            print(f"❌ Decision Engine error: {e}")


def consume_shadow_requests():
    """Consume shadow request comparison data from Kafka"""
    consumer = None
    while consumer is None:
        try:
            consumer = KafkaConsumer(
                'shadow-requests',
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id='arbiter-shadow-group',
                auto_offset_reset='latest'
            )
            print("📡 Listening on topic: shadow-requests")
        except Exception as e:
            print(f"Kafka not ready ({e}), retrying in 2s...")
            time.sleep(2)
    
    for message in consumer:
        try:
            data = message.value
            tx_id = data.get('transaction_id', 'unknown')
            service_type = data.get('service_type', 'php')
            legacy_status = data.get('legacy_status', 0)
            modern_status = data.get('modern_status', 0)
            
            # Compare HTTP responses
            is_match = legacy_status == modern_status and legacy_status != 0
            
            r.incr("total_transactions")
            if is_match:
                r.incr("matched_transactions")
            
            # Recalculate score
            total = int(r.get("total_transactions") or 1)
            matched = int(r.get("matched_transactions") or 0)
            score = (matched / total) * 100.0 if total > 0 else 100.0
            r.set("consistency_score", score)
            
            status = "MATCH" if is_match else "MISMATCH"
            print(f"📥 Shadow {tx_id}: Legacy={legacy_status}, Modern={modern_status} → {status} | Score: {score:.2f}%")
            
        except Exception as e:
            print(f"Error processing shadow request: {e}")


def consume_db_updates():
    """Consume database state updates from Kafka"""
    consumer = None
    while consumer is None:
        try:
            consumer = KafkaConsumer(
                'db-state-updates',
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id='arbiter-db-group',
                auto_offset_reset='latest'
            )
            print("📡 Listening on topic: db-state-updates")
        except Exception as e:
            print(f"Kafka not ready ({e}), retrying in 2s...")
            time.sleep(2)
    
    for message in consumer:
        data = message.value
        reconcile_state(
            data.get('transaction_id'),
            data.get('account_number'),
            data.get('service_type', 'php')
        )


# ========== Flask Routes ==========

@app.route('/status', methods=['GET'])
def get_status():
    """Return current Arbiter status for frontend monitoring"""
    state = get_current_state()
    return jsonify({
        "success": True,
        "data": state
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})


@app.route('/reset', methods=['POST'])
def reset_counters():
    """Reset all counters (for testing)"""
    r.set("total_transactions", 0)
    r.set("matched_transactions", 0)
    r.set("consistency_score", 100.0)
    r.set("php_weight", 0.0)
    r.set("python_weight", 0.0)
    r.set("migration_status", "pending")
    r.set("last_decision", "reset")
    r.set("last_decision_time", time.strftime("%Y-%m-%d %H:%M:%S"))
    
    # Also reset Gateway weights
    update_gateway_weight("php", 0.0)
    update_gateway_weight("python", 0.0)
    
    return jsonify({"success": True, "message": "Counters reset"})


# ========== Main ==========

def run_flask():
    """Run Flask server in a separate thread"""
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)


if __name__ == "__main__":
    print("=" * 60)
    print("🔥 Phoenix Engine - Arbiter Service")
    print("=" * 60)
    
    # Wait for Redis
    while True:
        try:
            r.ping()
            print("✅ Connected to Redis")
            break
        except redis.ConnectionError:
            print("Redis not ready, retrying in 2s...")
            time.sleep(2)
    
    # Initialize state
    r.setnx("php_weight", 0.0)
    r.setnx("python_weight", 0.0)
    r.setnx("total_transactions", 0)
    r.setnx("matched_transactions", 0)
    r.setnx("consistency_score", 100.0)
    r.setnx("migration_status", "pending")
    
    # Start Flask server in background
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    print("🌐 Flask API started on port 5000")
    
    # Start Decision Engine in background
    decision_thread = threading.Thread(target=decision_engine, daemon=True)
    decision_thread.start()
    
    # Start Kafka consumers
    shadow_thread = threading.Thread(target=consume_shadow_requests, daemon=True)
    shadow_thread.start()
    
    # Main thread consumes db-state-updates
    consume_db_updates()
