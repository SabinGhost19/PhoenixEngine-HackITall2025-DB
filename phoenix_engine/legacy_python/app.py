from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

class TransferRequest(BaseModel):
    account_number: str
    amount: float

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@app.post("/api/transfer-funds")
def transfer_funds(request: TransferRequest):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get account
        cursor.execute("SELECT * FROM accounts WHERE account_number = %s AND is_shadow = FALSE", (request.account_number,))
        account = cursor.fetchone()

        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # Flawed Logic: VIP commission is 5% instead of 0.5%
        # SIMULATED FIX: Changing to 0.005 to match Modern and allow migration
        commission_rate = 0.005 if account['client_type'] == 'VIP' else 0.01
        commission = request.amount * commission_rate
        total_deduction = request.amount + commission

        if account['balance'] < total_deduction:
            raise HTTPException(status_code=400, detail="Insufficient funds")

        new_balance = float(account['balance']) - total_deduction

        # Update DB
        cursor.execute("UPDATE accounts SET balance = %s WHERE id = %s", (new_balance, account['id']))
        conn.commit()

        return {"status": "success", "new_balance": new_balance, "commission_charged": commission, "system": "legacy_python"}

    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
