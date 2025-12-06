#!/bin/bash

# Verify Traffic to Services
# This script runs the traffic generator to send traffic to the deployed services

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
TRAFFIC_GEN_DIR="$PROJECT_ROOT/../phoenix_engine/traffic_generator"
NETWORK_NAME="phoenix-network"
IMAGE_NAME="phoenix-traffic-gen:latest"
CONTAINER_NAME="phoenix-traffic-gen"

# Default target is the Gateway
TARGET_URL="http://gateway:8082"

# Allow overriding target (e.g., to point directly to a microservice)
if [ -n "$1" ]; then
    TARGET_URL="$1"
    log_info "🎯 Custom target URL provided: $TARGET_URL"
fi

log_info "🚀 Starting Traffic Verification..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if traffic generator directory exists
if [ ! -d "$TRAFFIC_GEN_DIR" ]; then
    log_error "Traffic generator directory not found: $TRAFFIC_GEN_DIR"
    exit 1
fi

# Build Traffic Generator
log_info "🔨 Building Traffic Generator image..."
if docker build -t "$IMAGE_NAME" "$TRAFFIC_GEN_DIR"; then
    log_success "Traffic Generator image built successfully"
else
    log_error "Failed to build Traffic Generator image"
    exit 1
fi

# Stop existing traffic generator
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    log_info "🧹 Removing existing traffic generator..."
    docker rm -f $CONTAINER_NAME > /dev/null
fi

# Run Traffic Generator
log_info "🏃 Running Traffic Generator targeting: $TARGET_URL"
docker run -d \
    --name "$CONTAINER_NAME" \
    --network $NETWORK_NAME \
    -e GATEWAY_URL="$TARGET_URL" \
    "$IMAGE_NAME" > /dev/null

log_info "⏳ Generating traffic for 10 seconds..."
sleep 10

# Check logs to see if it's working
log_info "📋 Traffic Generator Logs:"
docker logs "$CONTAINER_NAME" | head -n 20

# Stop the generator
log_info "🛑 Stopping Traffic Generator..."
docker stop "$CONTAINER_NAME" > /dev/null

log_success "Traffic verification complete!"
