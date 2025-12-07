# Architecture Overview

The project implements an autonomous legacy-to-cloud migration pipeline using the **Strangler Fig Pattern**, **Traffic Shadowing**, and **AI Agents**.

## High-Level Architecture

The system consists of two main subsystems:
1.  **Agents Orchestrator (Next.js)**: The control plane that manages the lifecycle of the migration.
2.  **Phoenix Engine (Go/Python/Docker)**: The runtime environment for traffic management, execution, and verification.

### 1. Agents Orchestrator
This is the "brain" of the operation. It is a Next.js application containing several specialized AI agents:

*   **Aggregator Agent**: The main conductor. It coordinates the workflow:
    1.  **Architecture Agent**: Analyzes the legacy monolith to identify endpoints and logical boundaries.
    2.  **Endpoint Analysis Agent**: Deeply analyzes a specific endpoint (code, DB queries, dependencies).
    3.  **Microservice Generator Agent**: Generates a modern microservice (e.g., in Go) equivalent to the legacy endpoint.
    4.  **Code Repair Agent**: Fixes any syntax or logic errors in the generated code.
    5.  **Verifier Agent**: Statically analyzes the generated code for best practices and correctness.
    6.  **Traffic Generation Agent**: Generates synthetic traffic patterns to test the new service.

### 2. Phoenix Engine
This is the "muscle" that executes the migration and manages traffic.

*   **Gateway (Go)**: A high-performance API gateway that sits in front of both the Legacy Monolith and the Modern Microservices.
    *   **Traffic Routing**: Routes traffic based on `mode` (legacy, modern, shadowing).
    *   **Shadowing**: Duplicates requests to both services in background.
    *   **Canary Deployment**: Gradually shifts traffic (0% -> 100%) based on weights.
    *   **Kafka Producer**: Publishes request/response data to a Kafka topic (`shadow-requests`).

*   **Arbiter (Python)**: An intelligent decision-making service.
    *   **Kafka Consumer**: Listens to `shadow-requests` and `db-state-updates`.
    *   **Reconciliation**: Compares responses and database states between Legacy and Modern services.
    *   **Consistency Scoring**: Calculates a score (0-100%) representing how well the Modern service matches the Legacy service.
    *   **Decision Maker**: (To Be Implemented) Decides when to increase traffic weight to the Modern service based on the consistency score.

*   **Infrastructure**:
    *   **Kafka**: Message bus for asynchronous communication.
    *   **Redis**: State store for the Arbiter (scores, errors).
    *   **PostgreSQL**: Database for services (Legacy and Modern).

## Data Flow

1.  **Migration Phase**:
    *   User selects an endpoint in Orchestrator.
    *   Agents generate and verify code.
    *   New Microservice is deployed (containerized) alongside the Monolith.

2.  **Verification Phase (Shadowing)**:
    *   Gateway receives traffic.
    *   Routes to Legacy (Primary).
    *   Asynchronously routes to Modern (Shadow).
    *   Both responses are sent to Kafka.
    *   Arbiter compares results and updates Consistency Score.

3.  **Cutover Phase (Canary)**:
    *   Arbiter (or User) increases Modern weight (e.g., 10%).
    *   Gateway routes 10% of traffic to Modern as Primary.
    *   If Score remains high, weight increases (20%, 30%... 100%).
    *   Once 100%, migration is marked complete.
