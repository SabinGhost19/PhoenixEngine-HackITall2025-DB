from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from kafka import KafkaProducer
import json
import uuid

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS")

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

class TransferRequest(BaseModel):
    account_number: str
    amount: float
    transaction_id: str = None # Passed from Gateway

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@app.post("/api/transfer-funds")
def transfer_funds(request: TransferRequest):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Generate transaction ID if not provided (though Gateway should provide it)
    tx_id = request.transaction_id or str(uuid.uuid4())

    try:
        # Get account (Shadow)
        cursor.execute("SELECT * FROM accounts WHERE account_number = %s AND is_shadow = TRUE", (request.account_number,))
        account = cursor.fetchone()

        if not account:
            raise HTTPException(status_code=404, detail="Account not found (Shadow)")

        # Correct Logic: VIP commission is 0.5%
        commission_rate = 0.005 if account['client_type'] == 'VIP' else 0.01
        commission = request.amount * commission_rate
        total_deduction = request.amount + commission

        if account['balance'] < total_deduction:
            raise HTTPException(status_code=400, detail="Insufficient funds")

        new_balance = float(account['balance']) - total_deduction

        # Update DB
        cursor.execute("UPDATE accounts SET balance = %s WHERE id = %s", (new_balance, account['id']))
        conn.commit()

        # Notify Arbiter
        producer.send('db-state-updates', {
            'transaction_id': tx_id,
            'system': 'modern_python',
            'account_number': request.account_number,
            'status': 'completed'
        })
        producer.flush()

        return {"status": "success", "new_balance": new_balance, "commission_charged": commission, "system": "modern_python"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
