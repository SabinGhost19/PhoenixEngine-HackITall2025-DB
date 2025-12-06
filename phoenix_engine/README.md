# Phoenix Engine: The Quantum Strangler Pattern

This project implements a distributed system for migrating legacy applications to modern microservices using the **Strangler Fig Pattern**, **Traffic Shadowing**, and **AI-driven Consensus**.

## Architecture

The system consists of 9 Dockerized services:

1.  **Legacy Python Backend** (Port 8080): Simulates a legacy system with flawed VIP commission logic.
2.  **Legacy PHP Full-Stack** (Port 8081): Simulates a legacy system with flawed rounding logic.
3.  **Modern Python Microservice** (Port 8083): Correct implementation of the Python logic.
4.  **Modern Go Microservice** (Port 8084): Correct implementation of the PHP logic.
5.  **Strangler Gateway** (Port 8082): The entry point. Routes traffic, handles shadowing, and manages canary weights.
6.  **Arbiter Agent**: Validates data consistency between Legacy and Modern systems by comparing DB states.
7.  **Orchestrator**: Manages the migration lifecycle (monitoring scores, triggering updates).
8.  **Dashboard** (Port 8501): Streamlit UI to visualize and control the migration.
9.  **Traffic Generator**: Simulates real-time user traffic.

## Prerequisites

- Docker
- Docker Compose

## How to Run

1.  **Start the System:**
    ```bash
    cd phoenix_engine
    docker-compose up --build
    ```

2.  **Access the Dashboard:**
    Open your browser and go to:
    **[http://localhost:8501](http://localhost:8501)**

3.  **Run the Demo:**
    *   **Phase 1 (Observation):** Watch the "Consistency Score" and "Traffic Distribution" on the dashboard. The Traffic Generator is already running.
    *   **Phase 2 (Migration):** Select "Python Service" in the sidebar and click **"INITIATE MIGRATION SEQUENCE"**.
    *   **Phase 3 (Transition):** Watch the "Modern Traffic Allocation" bar grow as the system automatically shifts traffic to the modern microservice (only if the Consistency Score is high).

## Manual Testing (Optional)

You can still use `curl` to test individual endpoints as described in the original documentation, but the Dashboard + Traffic Generator provides a fully automated visual experience.

## 🚀 Roadmap to Enterprise Grade

We are currently upgrading this prototype to a production-ready system.

### Phase 1: Hardening & Reliability (In Progress)
- [ ] **Unit & Integration Tests:** Adding `pytest` and `go test` suites.
- [ ] **Circuit Breaker:** Implementing resilience in the Gateway.
- [ ] **Robust Config:** Moving to strict environment variable management.

### Phase 2: True AI Integration
- [ ] **Real LLM:** Connecting Orchestrator to OpenAI/Anthropic for automated code patching.
- [ ] **Vector DB:** "Archaeologist" agent for semantic code search.

### Phase 3: Infrastructure Maturity
- [ ] **Database Isolation:** Implementing CDC (Debezium) for zero-trust data syncing.
- [ ] **Kubernetes:** Migrating from Docker Compose to K8s manifests.

### Phase 4: Observability
- [ ] **Distributed Tracing:** Jaeger integration for full request visibility.

