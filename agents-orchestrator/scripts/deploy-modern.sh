#!/bin/bash

# Deploy Modern Microservice
# This script builds and runs a generated microservice in Docker

set -e

# Check if migration ID is provided
if [ -z "$1" ]; then
    echo "❌ Error: Migration ID is required"
    echo "Usage: $0 <migration-id>"
    exit 1
fi

MIGRATION_ID="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MODERN_DIR="$PROJECT_ROOT/output/$MIGRATION_ID"
CONTAINER_NAME="phoenix-modern-$MIGRATION_ID"
IMAGE_NAME="phoenix-modern:$MIGRATION_ID"
PORT=8080

echo "🚀 Starting Modern Microservice Deployment..."
echo "📁 Migration ID: $MIGRATION_ID"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if migration directory exists
if [ ! -d "$MODERN_DIR" ]; then
    echo "❌ Error: Migration directory not found: $MODERN_DIR"
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$MODERN_DIR/Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found in: $MODERN_DIR"
    exit 1
fi

# Navigate to modern service directory
cd "$MODERN_DIR"

# Fix common Go code issues (AI-generated code may have import/reference problems)
if [ -f "$SCRIPT_DIR/fix-go-code.sh" ]; then
    echo "🔧 Fixing generated code..."
    echo "Debug: Checking directory $MODERN_DIR"
    ls -la "$MODERN_DIR"
    bash "$SCRIPT_DIR/fix-go-code.sh" "$MODERN_DIR" || echo "⚠️  Code fixing skipped"
fi

# Generate go.sum if it doesn't exist (for Go projects)
if [ -f "go.mod" ] && [ ! -f "go.sum" ]; then
    echo "📦 Generating go.sum..."
    go mod tidy > /dev/null 2>&1 || true
fi

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
    -p "$PORT:8080" \
    -e DATABASE_URL="$DATABASE_URL" \
    -e PORT=8080 \
    "$IMAGE_NAME")

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start container"
    exit 1
fi

# Wait a moment for container to start
sleep 2

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ Modern microservice deployed successfully!"
    echo "📦 Container ID: $CONTAINER_ID"
    echo "🌐 Access at: http://localhost:$PORT"
    echo "$CONTAINER_ID"
else
    echo "❌ Error: Container failed to start"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
