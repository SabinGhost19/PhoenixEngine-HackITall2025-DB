import streamlit as st
import redis
import time
import requests
import pandas as pd
import os

# Configuration
st.set_page_config(page_title="Phoenix Engine Command Center", layout="wide", page_icon="🔥")

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
ORCHESTRATOR_URL = "http://orchestrator:5000" # We might not need this if we talk via Redis

# Connect to Redis
@st.cache_resource
def get_redis_client():
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

r = get_redis_client()

# Header
st.title("🔥 Phoenix Engine: The Quantum Strangler")
st.markdown("### Autonomous Legacy-to-Cloud Transformation System")

# Sidebar - Controls
# Sidebar - Controls
st.sidebar.header("Mission Control")
target_system = st.sidebar.selectbox("Select Target System", ["Python Service (VIP Logic)", "PHP Service (Rounding Logic)"])
system_key = "python" if "Python" in target_system else "php"

st.sidebar.markdown("---")
st.sidebar.header("Log Viewer")
container_name = st.sidebar.selectbox("Select Container", ["phoenix_engine-legacy_python-1", "phoenix_engine-modern_python-1", "phoenix_engine-gateway-1", "phoenix_engine-arbiter-1"])

if st.sidebar.button("🚀 INITIATE MIGRATION SEQUENCE", type="primary"):
    r.set(f"migration_active_{system_key}", "true")
    st.sidebar.success(f"Migration Sequence Initiated for {system_key.upper()}!")

if st.sidebar.button("🛑 EMERGENCY ROLLBACK", type="secondary"):
    r.set(f"migration_active_{system_key}", "false")
    r.set(f"weight_{system_key}", 0)
    # Reset Gateway immediately (optional, but Orchestrator handles it)
    st.sidebar.warning("Rollback Triggered! Cutting traffic to Modern system.")

# Main Dashboard
col1, col2, col3 = st.columns(3)

# Auto-refresh loop placeholder
placeholder = st.empty()

while True:
    with placeholder.container():
        # Fetch Data
        score = float(r.get("consistency_score") or 0)
        weight = float(r.get(f"weight_{system_key}") or 0)
        total_tx = int(r.get("total_transactions") or 0)
        
        # Metrics
        col1.metric("Consistency Score (AI)", f"{score:.2f}%", delta=f"{score-100:.2f}%" if score < 100 else "Stable")
        col2.metric("Modern Traffic Allocation", f"{weight*100:.1f}%", delta=f"Target: 100%")
        col3.metric("Total Transactions Processed", f"{total_tx}")

        # Visuals
        st.markdown("---")
        
        # Traffic Distribution Chart
        st.subheader("Real-time Traffic Distribution")
        chart_data = pd.DataFrame({
            "Legacy (Monolith)": [1.0 - weight],
            "Modern (K8s)": [weight]
        })
        st.bar_chart(chart_data, color=["#FF4B4B", "#00CC96"])

        # Status Log
        st.subheader("System Logs")
        
        tab1, tab2 = st.tabs(["Anomaly Detection", "Live Container Logs"])
        
        with tab1:
            errors = r.lrange("errors", 0, 4)
            if errors:
                for err in errors:
                    st.error(f"Anomaly Detected: {err}")
            else:
                st.info("System Nominal. No anomalies detected in the last window.")

        with tab2:
            st.markdown(f"Fetching last 20 lines from **{container_name}**...")
            try:
                import docker
                client = docker.from_env()
                
                try:
                    container = client.containers.get(container_name)
                    logs = container.logs(tail=20).decode("utf-8")
                    st.code(logs, language="bash")
                except Exception as e:
                    st.error(f"Could not fetch logs for {container_name}: {e}")
                    
            except Exception as e:
                st.warning(f"Docker socket not accessible: {e}. Make sure you mounted /var/run/docker.sock")

        # Migration Status
        st.markdown("---")
        if r.get(f"migration_active_{system_key}") == "true":
            st.write(f"### 🔄 Migration in Progress: {system_key.upper()}")
            my_bar = st.progress(weight)
        else:
            st.write("### ⏸️ System Standing By")

    time.sleep(2)
