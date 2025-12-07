# Phoenix Engine - Infrastructure

This directory contains the core infrastructure services for the Phoenix Engine autonomous migration platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      phoenix-network (Docker)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Zookeeper   │  │    Kafka     │  │    Redis     │              │
│  │    :2181     │  │    :9092     │  │    :6379     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    Gateway (:8082)                        │      │
│  │  - Routes traffic to Legacy & Modern services             │      │
│  │  - Implements shadowing mode                              │      │
│  │  - Publishes comparisons to Kafka                         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                      │
│           ┌──────────────────┼──────────────────┐                  │
│           ▼                  ▼                  ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Legacy     │  │   Modern     │  │   Database   │              │
│  │(phoenix-legacy)│ │(phoenix-modern)│ │    (db)     │              │
│  │    :8081     │  │    :8080     │  │    :5432     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  (deployed by      (deployed by       (deployed by                  │
│   deploy-legacy.sh) deploy-modern.sh) deploy-legacy.sh)            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                   Arbiter (:5000)                         │      │
│  │  - Consumes Kafka messages                                │      │
│  │  - Calculates consistency scores                          │      │
│  │  - Makes traffic shift decisions (10% increments)         │      │
│  │  - Exposes status API for frontend                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Start Infrastructure

```bash
# Creates network and starts all infrastructure services
./start-infrastructure.sh
```

Or manually:

```bash
# Create network first (required)
docker network create phoenix-network

# Start services
docker-compose up -d
```

### 2. Start Frontend

```bash
cd ../agents-orchestrator
npm run dev
# Open http://localhost:3000
```

### 3. Deploy Services (via UI)

1. Upload legacy code
2. Scan architecture
3. Select endpoint to migrate
4. Generate microservice
5. Deploy (this runs deploy-legacy.sh and deploy-modern.sh)
6. Generate traffic
7. Watch automatic migration progress!

## Service Details

### Gateway (Go)

- **Port**: 8082
- **Endpoints**:
  - `POST /php/transfer` - Route to PHP services with shadowing
  - `POST /python/transfer` - Route to Python services
  - `GET /admin/status` - Get current weights
  - `POST /admin/set-weight` - Update service weight
  - `POST /admin/traffic-lock` - Lock/unlock traffic

### Arbiter (Python)

- **Port**: 5000
- **Endpoints**:
  - `GET /status` - Get current migration status
  - `POST /reset` - Reset all counters
  - `GET /health` - Health check

### Decision Thresholds

| Parameter | Value | Description |
|-----------|-------|-------------|
| THRESHOLD_PROMOTE | 99% | Minimum consistency to increase weight |
| THRESHOLD_ROLLBACK | 95% | Below this triggers rollback to 0% |
| MIN_SAMPLES | 10 | Minimum samples before decisions |
| WEIGHT_INCREMENT | 10% | Weight increase per step |
| DECISION_INTERVAL | 10s | Time between decision checks |

## Dynamic Services

The following services are NOT in docker-compose.yml - they are deployed dynamically:

| Service | Script | Container Name | Port |
|---------|--------|----------------|------|
| Database | deploy-legacy.sh | phoenix-session-db | 5432 |
| Legacy PHP | deploy-legacy.sh | phoenix-legacy | 8081 |
| Modern Go | deploy-modern.sh | phoenix-modern-{id} | 8080 |

All dynamic services connect to `phoenix-network` and use the network alias `phoenix-modern` for Gateway discovery.

## Stopping Services

```bash
# Stop infrastructure
docker-compose down

# Stop dynamic services
docker stop phoenix-legacy phoenix-session-db
docker rm phoenix-legacy phoenix-session-db

# Remove network
docker network rm phoenix-network
```

## Logs

```bash
# Gateway logs
docker logs -f phoenix-gateway

# Arbiter logs (watch decision engine)
docker logs -f phoenix-arbiter

# Kafka logs
docker logs -f phoenix-kafka
```

## Troubleshooting

### Network not found error
```bash
docker network create phoenix-network
```

### Gateway can't reach Legacy/Modern
Ensure containers have network alias:
```bash
docker inspect phoenix-modern-xxx | grep Aliases
# Should show: phoenix-modern
```

### Arbiter not receiving Kafka messages
Check Kafka is running:
```bash
docker exec -it phoenix-kafka kafka-topics --list --bootstrap-server localhost:29092
```
