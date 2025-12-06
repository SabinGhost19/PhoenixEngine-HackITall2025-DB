#!/bin/bash

# Deploy Legacy PHP Monolith
# This script builds and runs the legacy PHP application in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function for logging
log_info() {
    echo -e "${BLUE}[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LEGACY_DIR="$PROJECT_ROOT/example-monolith"
CONTAINER_NAME="phoenix-legacy"
IMAGE_NAME="phoenix-legacy:latest"
PORT=8081
NETWORK_NAME="phoenix-network"
DB_CONTAINER_NAME="phoenix-session-db"
MONOLITH_DIR="$LEGACY_DIR"

log_info "🚀 Starting Legacy Monolith Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# 1. Create Network if not exists
if [ -z "$(docker network ls | grep $NETWORK_NAME)" ]; then
    log_info "🌐 Creating docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
else
    log_info "🌐 Network $NETWORK_NAME already exists"
fi

# 2. Handle Database Container
log_info "🗄️  Checking Database..."
if [ -f "$MONOLITH_DIR/schema.sql" ]; then
    log_info "📜 Found schema.sql, initializing dedicated database..."
    
    # Stop existing DB
    if [ "$(docker ps -aq -f name=$DB_CONTAINER_NAME)" ]; then
        log_info "🧹 Removing old database container..."
        docker rm -f $DB_CONTAINER_NAME > /dev/null
    fi

    # Run new DB
    docker run -d \
        --name $DB_CONTAINER_NAME \
        --network $NETWORK_NAME \
        --network-alias db \
        -e POSTGRES_USER=phoenix \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_DB=phoenix_db \
        -v "$MONOLITH_DIR/schema.sql":/docker-entrypoint-initdb.d/init.sql \
        postgres:15-alpine > /dev/null

    log_info "⏳ Waiting for Database to initialize (10s)..."
    sleep 10
else
    log_warning "schema.sql not found. Assuming external DB or no DB needed."
fi

# 3. Build Legacy App
log_info "🔨 Building Docker image: $IMAGE_NAME"
if docker build -t "$IMAGE_NAME" "$MONOLITH_DIR"; then
    log_success "Docker image built successfully"
else
    log_error "Failed to build Docker image"
    exit 1
fi

# 4. Clean up existing app container
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    log_info "🧹 Removing existing app container..."
    docker rm -f $CONTAINER_NAME > /dev/null
fi

# 5. Run Legacy App
# Note: We connect to 'db' hostname because we are in the same network
DATABASE_URL="postgresql://phoenix:password@db:5432/phoenix_db?sslmode=disable"

log_info "🏃 Running container: $CONTAINER_NAME on port $PORT"
CONTAINER_ID=$(docker run -d \
    --name "$CONTAINER_NAME" \
    --network $NETWORK_NAME \
    -p "$PORT:8081" \
    -e DATABASE_URL="$DATABASE_URL" \
    "$IMAGE_NAME")

if [ $? -eq 0 ]; then
    log_success "Legacy monolith deployed successfully!"
    log_info "📦 Container ID: $CONTAINER_ID"
    log_info "🌐 Access at: http://localhost:$PORT"
    
    # Health check
    log_info "🏥 Performing health check..."
    sleep 5
    if curl -s "http://localhost:$PORT" > /dev/null; then
        log_success "Health check passed!"
    else
        log_warning "Health check failed. Container might still be starting or there is an issue."
    fi
    
    echo "$CONTAINER_ID" # Return ID for the API
else
    log_error "Container failed to start"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
