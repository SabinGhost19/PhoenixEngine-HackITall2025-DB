# Business Logic & Workflow

## The Core Objective
The goal is to automate the modernization of legacy software systems. Instead of a risky "Big Bang" rewrite, this system performs a safe, incremental migration endpoint-by-endpoint.

## The Workflow

### 1. Analysis & Selection
*   **Input**: The user provides the legacy codebase.
*   **Process**: The **Architecture Agent** scans the code to understand its structure. It identifies all API endpoints and groups them into logical "domains" (potential microservices).
*   **User Action**: The user selects *one* endpoint to migrate (e.g., `POST /transfer-funds`).

### 2. Generation & Deployment
*   **Analysis**: The **Endpoint Analysis Agent** extracts the specific logic, SQL queries, and dependencies for that endpoint.
*   **Generation**: The **Microservice Generator Agent** writes a new, clean microservice (e.g., in Go) that replicates this logic.
*   **Deployment**: The system deploys this new microservice in a Docker container, connected to the same (or replicated) database.

### 3. Traffic Generation & Verification
*   **Problem**: A new service needs traffic to be tested.
*   **Solution**: The **Traffic Generation Agent** analyzes the endpoint's schema and generates synthetic HTTP requests (valid and invalid) to exercise the logic.
*   **Execution**: These requests are sent to the **Gateway**.

### 4. The Arbiter & Canary Release (The "Phoenix" Loop)
This is the critical business logic for safe migration.

1.  **Shadow Mode (0% Traffic)**:
    *   The Gateway sends 100% of real/synthetic traffic to the **Legacy** service (Primary).
    *   It *shadows* (duplicates) the request to the **Modern** service (Secondary).
    *   The **Arbiter** compares the *Response* (status code, body) and *State Side Effects* (DB changes).
    *   If they match, the **Consistency Score** increases.

2.  **Arbitration**:
    *   The Arbiter monitors the Consistency Score over time.
    *   **Logic**: If `Score > Threshold` (e.g., 99%) for `Time > Duration` (e.g., 5 mins), the Arbiter decides to promote the Modern service.

3.  **Traffic Shifting (Canary)**:
    *   The Arbiter instructs the Gateway to change the weight.
    *   **Step 1**: 10% Modern / 90% Legacy.
    *   **Monitor**: Continue comparing. If errors spike, **Rollback** immediately to 0%.
    *   **Step 2**: 20% -> 30% -> ... -> 100%.

4.  **Completion**:
    *   When traffic is 100% Modern and stable, the endpoint is marked "Migrated".
    *   The user is notified: "Endpoint X is fully migrated."
    *   The process repeats for the next endpoint.

## Key Value Propositions
*   **Risk Reduction**: Shadowing ensures the new code works *before* it takes real traffic.
*   **Zero Downtime**: Canary deployment ensures smooth transition.
*   **Automation**: AI agents handle the tedious coding and analysis.
*   **Correctness**: The Arbiter ensures the new system behaves *exactly* like the old one (or better).
