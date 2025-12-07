# Implementation Plan

This plan outlines the steps to complete the autonomous migration pipeline.

## Phase 1: Pipeline Integration (Orchestrator)
**Goal**: Extend the `AggregatorAgent` to handle deployment and traffic generation.

1.  **Implement Deployment Step**:
    *   Add a `DeploymentAgent` or utility.
    *   Functionality: Write the generated microservice code to a specific directory, create a `Dockerfile`, and run `docker-compose up -d <service>`.
    *   Update `AggregatorAgent` to call this after Verification.

2.  **Integrate Traffic Generation**:
    *   Update `AggregatorAgent` to call `TrafficGenerationAgent` after Deployment.
    *   The agent should generate a script (e.g., k6 or simple HTTP client) and *execute* it against the Gateway.

## Phase 2: The Arbiter Control Loop (Phoenix Engine)
**Goal**: Make the Arbiter actively manage the migration.

1.  **Gateway Control API**:
    *   Add an API endpoint to the Gateway (e.g., `POST /admin/routes/{route_id}/weight`) to allow dynamic weight updates.
    *   Store weights in Redis or memory (backed by config).

2.  **Arbiter Decision Logic**:
    *   Update `arbiter/app.py` to include a "Decision Engine".
    *   Logic:
        ```python
        if consistency_score > 99% and samples > 100:
            current_weight += 0.10
            call_gateway_update_weight(current_weight)
        elif consistency_score < 95%:
            current_weight = 0.0
            call_gateway_update_weight(current_weight)
            alert_user("Rollback triggered")
        ```

3.  **Frontend Updates**:
    *   Update the Orchestrator UI to show the real-time status: "Migration in Progress: 30% Traffic Shifted".
    *   Listen to Arbiter events (via WebSocket or polling).

## Phase 3: Generic Gateway
**Goal**: Support any endpoint, not just `transfer-funds`.

1.  **Dynamic Routing**:
    *   Refactor Gateway to load routes from a configuration file (JSON/YAML) or Redis.
    *   Route definition: `{ path: "/api/users", method: "POST", legacy_url: "...", modern_url: "..." }`.

2.  **Generic Handler**:
    *   Replace `HandleTransfer` with a generic `ProxyHandler` that forwards *any* request body/headers.

## Phase 4: Final Polish
1.  **End-to-End Testing**: Run the full loop for a new endpoint.
2.  **Documentation**: Update main READMEs.
3.  **UI Refinement**: Ensure the "Migration Complete" message appears as requested.
