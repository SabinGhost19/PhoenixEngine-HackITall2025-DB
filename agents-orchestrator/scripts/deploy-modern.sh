#!/bin/bash

# Deploy Modern Microservice
# This script builds and runs a generated microservice in Docker

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

# Check if migration ID is provided
if [ -z "$1" ]; then
    log_error "Migration ID is required"
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

log_info "🚀 Starting Modern Microservice Deployment..."
log_info "📁 Migration ID: $MIGRATION_ID"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if migration directory exists
if [ ! -d "$MODERN_DIR" ]; then
    log_error "Migration directory not found: $MODERN_DIR"
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$MODERN_DIR/Dockerfile" ]; then
    log_error "Dockerfile not found in: $MODERN_DIR"
    exit 1
fi

# Navigate to modern service directory
cd "$MODERN_DIR"

# Fix common Go code issues (AI-generated code may have import/reference problems)
if [ -f "$SCRIPT_DIR/fix-go-code.sh" ]; then
    log_info "🔧 Fixing generated code..."
    log_info "Debug: Checking directory $MODERN_DIR"
    ls -la "$MODERN_DIR"
    bash "$SCRIPT_DIR/fix-go-code.sh" "$MODERN_DIR" || log_warning "Code fixing skipped"
fi

# Generate go.sum if it doesn't exist (for Go projects)
if [ -f "go.mod" ] && [ ! -f "go.sum" ]; then
    log_info "📦 Generating go.sum..."
    go mod tidy > /dev/null 2>&1 || true
fi

# Stop and remove existing container if it exists
log_info "🧹 Cleaning up existing containers..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Also check for containers using the port
EXISTING_CONTAINER=$(docker ps --filter "publish=$PORT" --format "{{.Names}}" 2>/dev/null || true)
if [ -n "$EXISTING_CONTAINER" ]; then
    log_warning "Stopping container using port $PORT: $EXISTING_CONTAINER"
    docker stop "$EXISTING_CONTAINER" 2>/dev/null || true
    docker rm "$EXISTING_CONTAINER" 2>/dev/null || true
fi

# Generate .env file for the application
log_info "📝 Generating .env file..."
cat > .env <<EOF
DATABASE_URL=postgresql://phoenix:password@db:5432/phoenix_db?sslmode=disable
DB_HOST=db
DB_PORT=5432
DB_USER=phoenix
DB_PASSWORD=password
DB_NAME=phoenix_db
DB_SSLMODE=disable
PORT=8080
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
EOF

# Build Docker image
log_info "🔨 Building Docker image: $IMAGE_NAME"
log_info "📄 Dockerfile content:"
cat Dockerfile
echo "-------------------"

# Run build directly to see output
# Run build directly to see output
if docker build -t "$IMAGE_NAME" .; then
    log_success "Docker image built successfully"
else
    log_error "Failed to build generated code. Initiating FALLBACK PROTOCOL..."
    
    FALLBACK_DIR="$PROJECT_ROOT/fallback-service"
    if [ -d "$FALLBACK_DIR" ]; then
        log_info "⚠️  Switching to Fallback Service..."
        log_info "📂 Fallback Source: $FALLBACK_DIR"
        
        # Copy fallback files to current directory (overwriting generated ones)
        cp "$FALLBACK_DIR/main.go" .
        cp "$FALLBACK_DIR/Dockerfile" .
        
        # Copy go.mod/sum if they exist, ensuring dependencies are correct
        if [ -f "$FALLBACK_DIR/go.mod" ]; then
            cp "$FALLBACK_DIR/go.mod" .
            cp "$FALLBACK_DIR/go.sum" . 2>/dev/null || true
        fi

        log_info "🔨 Re-building Docker image with Fallback Code..."
        if docker build -t "$IMAGE_NAME" .; then
             log_success "✅ Fallback build successful."
        else
             log_error "Critical: Fallback build also failed."
             exit 1
        fi
    else
        log_error "Fallback directory not found at $FALLBACK_DIR"
        exit 1
    fi
fi

# 4. Run Modern App
NETWORK_NAME="phoenix-network"

# Ensure network exists (it should have been created by legacy deploy, but just in case)
if [ -z "$(docker network ls | grep $NETWORK_NAME)" ]; then
    log_info "🌐 Creating docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# Connect to 'db' hostname in the same network
DATABASE_URL="postgresql://phoenix:password@db:5432/phoenix_db?sslmode=disable"

log_info "🏃 Running container: $CONTAINER_NAME on port $PORT"
CONTAINER_ID=$(docker run -d \
    --name "$CONTAINER_NAME" \
    --network $NETWORK_NAME \
    --network-alias phoenix-modern \
    -p "$PORT:8080" \
    -e DATABASE_URL="$DATABASE_URL" \
    -e DB_HOST="db" \
    -e DB_PORT="5432" \
    -e DB_USER="phoenix" \
    -e DB_PASSWORD="password" \
    -e DB_NAME="phoenix_db" \
    -e DB_SSLMODE="disable" \
    -e PORT=8080 \
    -e KAFKA_BOOTSTRAP_SERVERS="kafka:29092" \
    "$IMAGE_NAME")


if [ $? -ne 0 ]; then
    log_error "Failed to start container"
    exit 1
fi

# Wait a moment for container to start
sleep 2

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_success "Modern microservice deployed successfully!"
    log_info "📦 Container ID: $CONTAINER_ID"
    log_info "🌐 Access at: http://localhost:$PORT"
    
    # Health check
    log_info "🏥 Performing health check..."
    sleep 5
    if curl -s "http://localhost:$PORT" > /dev/null; then
        log_success "Health check passed!"
    else
        log_warning "Health check failed. Container might still be starting or there is an issue."
        docker logs "$CONTAINER_NAME" | tail -n 20
    fi

    # Restart Gateway to ensure it picks up the new container IP
    log_info "🔄 Restarting Gateway to refresh DNS..."
    docker restart phoenix-gateway > /dev/null
    log_success "Gateway restarted"

    echo "$CONTAINER_ID"
else
    log_error "Container failed to start"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
