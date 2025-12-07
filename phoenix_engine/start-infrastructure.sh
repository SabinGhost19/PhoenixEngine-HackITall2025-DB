#!/bin/bash

# Phoenix Engine - Infrastructure Startup Script
# This script initializes the network and starts all infrastructure services.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create network if it doesn't exist
NETWORK_NAME="phoenix-network"
if [ -z "$(docker network ls --filter name=^${NETWORK_NAME}$ --format '{{.Name}}')" ]; then
    log_info "🌐 Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
    log_success "Network created"
else
    log_info "🌐 Network $NETWORK_NAME already exists"
fi

# Start infrastructure services
log_info "🚀 Starting infrastructure services..."
docker compose up -d

log_info "⏳ Waiting for services to initialize..."
sleep 5

# Check service health
log_info "🏥 Checking service health..."

check_service() {
    local name=$1
    local container=$2
    if docker ps --filter "name=$container" --filter "status=running" --format '{{.Names}}' | grep -q "$container"; then
        log_success "$name: Running"
        return 0
    else
        log_error "$name: Not running"
        return 1
    fi
}

check_service "Zookeeper" "phoenix-zookeeper"
check_service "Kafka" "phoenix-kafka"
check_service "Redis" "phoenix-redis"
check_service "Gateway" "phoenix-gateway"
check_service "Arbiter" "phoenix-arbiter"

echo ""
log_success "🎉 Infrastructure is ready!"
echo ""
echo "Next steps:"
echo "  1. Start the agents-orchestrator: cd ../agents-orchestrator && npm run dev"
echo "  2. Open http://localhost:3000"
echo "  3. Upload legacy code and start migration"
echo ""
echo "Infrastructure endpoints:"
echo "  - Gateway:  http://localhost:8082"
echo "  - Arbiter:  http://localhost:5000"
echo "  - Kafka:    localhost:9092"
echo "  - Redis:    localhost:6379"
echo ""
