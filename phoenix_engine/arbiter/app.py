import os
import json
import psycopg2
import redis
import time
from kafka import KafkaConsumer
from psycopg2.extras import RealDictCursor
import threading

DATABASE_URL = os.getenv("DATABASE_URL")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

# Redis Connection
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def get_db_connection():
    while True:
        try:
            return psycopg2.connect(DATABASE_URL)
        except psycopg2.OperationalError:
            print("Database not ready, retrying in 2s...")
            time.sleep(2)

def reconcile_state(transaction_id, account_number):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get Legacy Balance
        cursor.execute("SELECT balance FROM accounts WHERE account_number = %s AND is_shadow = FALSE", (account_number,))
        legacy_acc = cursor.fetchone()
        
        # Get Modern Balance
        cursor.execute("SELECT balance FROM accounts WHERE account_number = %s AND is_shadow = TRUE", (account_number,))
        modern_acc = cursor.fetchone()
        
        if legacy_acc and modern_acc:
            legacy_bal = float(legacy_acc['balance'])
            modern_bal = float(modern_acc['balance'])
            
            delta = abs(legacy_bal - modern_bal)
            
            print(f"Reconciling Tx {transaction_id}: Legacy={legacy_bal}, Modern={modern_bal}, Delta={delta}")
            
            status = "MATCH"
            if delta > 0.0001:
                status = "MISMATCH"
                # Log error to Redis
                error_data = {
                    "transaction_id": transaction_id,
                    "account_number": account_number,
                    "delta": delta,
                    "legacy_balance": legacy_bal,
                    "modern_balance": modern_bal,
                    "timestamp": time.time()
                }
                r.lpush("errors", json.dumps(error_data))
            
            # Update Consistency Score
            r.incr("total_transactions")
            if status == "MATCH":
                r.incr("matched_transactions")
            
            # Calculate Score
            total = int(r.get("total_transactions") or 1)
            matched = int(r.get("matched_transactions") or 0)
            
            if total > 0:
                score = (matched / total) * 100.0
            else:
                score = 100.0
                
            r.set("consistency_score", score)
            
            print(f"Consistency Score: {score:.2f}%")
            
    except Exception as e:
        print(f"Error reconciling: {e}")
    finally:
        cursor.close()
        conn.close()

def consume_db_updates():
    consumer = None
    while consumer is None:
        try:
            consumer = KafkaConsumer(
                'db-state-updates',
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id='arbiter-group'
            )
        except Exception as e:
            print(f"Kafka not ready ({e}), retrying in 2s...")
            time.sleep(2)
    
    print("Arbiter listening on db-state-updates...")
    for message in consumer:
        data = message.value
        reconcile_state(data.get('transaction_id'), data.get('account_number'))

if __name__ == "__main__":
    # Wait for Redis
    while True:
        try:
            r.ping()
            break
        except redis.ConnectionError:
            print("Redis not ready, retrying in 2s...")
            time.sleep(2)
            
    consume_db_updates()
