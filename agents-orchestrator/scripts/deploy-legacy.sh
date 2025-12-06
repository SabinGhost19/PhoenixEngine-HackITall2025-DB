#!/bin/bash

# Deploy Legacy PHP Monolith
# This script builds and runs the legacy PHP application in Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LEGACY_DIR="$PROJECT_ROOT/example-monolith"
CONTAINER_NAME="phoenix-legacy"
IMAGE_NAME="phoenix-legacy:latest"
PORT=8081

echo "🚀 Starting Legacy Monolith Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to legacy directory
cd "$LEGACY_DIR"

# Stop and remove existing container if it exists
echo "🧹 Cleaning up existing containers..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Also check for containers using the port
EXISTING_CONTAINER=$(docker ps --filter "publish=$PORT" --format "{{.Names}}" 2>/dev/null || true)
if [ -n "$EXISTING_CONTAINER" ]; then
    echo "🛑 Stopping container using port $PORT: $EXISTING_CONTAINER"
    docker stop "$EXISTING_CONTAINER" 2>/dev/null || true
    docker rm "$EXISTING_CONTAINER" 2>/dev/null || true
fi

# Build Docker image
echo "🔨 Building Docker image: $IMAGE_NAME"

# Capture build output
BUILD_OUTPUT=$(docker build -t "$IMAGE_NAME" . 2>&1)
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "❌ Error: Failed to build Docker image"
    echo "Build output:"
    echo "$BUILD_OUTPUT" | tail -30
    exit 1
fi

# Get DATABASE_URL from environment or use default
DATABASE_URL="${DATABASE_URL:-postgresql://phoenix:password@host.docker.internal:5432/phoenix_db}"

# Ensure sslmode=disable is present for local development
if [[ "$DATABASE_URL" != *"sslmode=disable"* ]]; then
    if [[ "$DATABASE_URL" == *"?"* ]]; then
        DATABASE_URL="${DATABASE_URL}&sslmode=disable"
    else
        DATABASE_URL="${DATABASE_URL}?sslmode=disable"
    fi
fi

# Run container
echo "🏃 Running container: $CONTAINER_NAME on port $PORT"
CONTAINER_ID=$(docker run -d \
    --name "$CONTAINER_NAME" \
    --add-host=host.docker.internal:host-gateway \
    -p "$PORT:8081" \
    -e DATABASE_URL="$DATABASE_URL" \
    "$IMAGE_NAME")

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start container"
    exit 1
fi

# Wait a moment for container to start
sleep 2

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ Legacy monolith deployed successfully!"
    echo "📦 Container ID: $CONTAINER_ID"
    echo "🌐 Access at: http://localhost:$PORT"
    echo "$CONTAINER_ID"
else
    echo "❌ Error: Container failed to start"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
