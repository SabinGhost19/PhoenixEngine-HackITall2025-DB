#!/bin/bash

# Post-process generated Go code to fix common issues
# This script fixes import and handler reference issues

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <migration-directory>"
    exit 1
fi

MIGRATION_DIR="$1"

# Find main.go
MAIN_GO=$(find "$MIGRATION_DIR" -name "main.go" | head -n 1)

if [ -z "$MAIN_GO" ]; then
    echo "Error: main.go not found in $MIGRATION_DIR"
    exit 1
fi

echo "Found main.go at: $MAIN_GO"

echo "🔧 Post-processing Go code..."

# Check if handlers directory exists
if [ -d "$MIGRATION_DIR/handlers" ]; then
    # Find handler files
    HANDLER_FILES=$(find "$MIGRATION_DIR/handlers" -name "*.go" -type f)
    
    if [ -n "$HANDLER_FILES" ]; then
        echo "📦 Found handler files, checking imports..."
        
        # Get module name from go.mod
        MODULE_NAME=$(grep "^module " "$MIGRATION_DIR/go.mod" | awk '{print $2}')
        
        if [ -z "$MODULE_NAME" ]; then
            echo "⚠️  Could not determine module name from go.mod"
            MODULE_NAME="app"
        fi
        
        HANDLER_IMPORT="$MODULE_NAME/handlers"
        
        # Remove any old relative imports
        sed -i '/"\.\/handlers"/d' "$MAIN_GO"
        
        # Check if main.go imports the handlers package
        if ! grep -q "\"$HANDLER_IMPORT\"" "$MAIN_GO"; then
            echo "⚠️  Adding handlers import to main.go ($HANDLER_IMPORT)"
            
            # Add import after the last import
            sed -i "/^import (/,/)/{
                /^)/{
                    i\\	\"$HANDLER_IMPORT\"
                }
            }" "$MAIN_GO"
        fi
        
        # Fix handler function references
        # Look for common patterns like processTransactionHandler
        if grep -q "processTransactionHandler" "$MAIN_GO"; then
            echo "🔧 Fixing handler function reference..."
            
            # Check if there's a ProcessTransactionHandler in handlers
            if grep -q "func ProcessTransactionHandler" "$MIGRATION_DIR/handlers/"*.go 2>/dev/null; then
                # Replace lowercase with proper reference
                sed -i 's/processTransactionHandler/handlers.ProcessTransactionHandler(db)/g' "$MAIN_GO"
            fi
        fi
    fi
fi

# Remove unused imports
echo "🧹 Cleaning up unused imports..."
cd "$MIGRATION_DIR"

# Find all Go files in the migration directory
GO_FILES=$(find . -name "*.go" -type f)

for file in $GO_FILES; do
    echo "Processing $file for unused imports..."
    # Smart cleanup for common unused imports
    # Check if sqlx is used (ignoring comments)
    if ! grep -v "^\s*//" "$file" | grep -q "sqlx\."; then
        echo "🧹 Removing unused sqlx import from $file"
        sed -i '/"github.com\/jmoiron\/sqlx"/d' "$file"
    fi

    # Check if fmt is used (ignoring comments)
    if ! grep -v "^\s*//" "$file" | grep -q "fmt\."; then
        echo "🧹 Removing unused fmt import from $file"
        sed -i '/"fmt"/d' "$file"
    fi

    # Run goimports if installed, otherwise gofmt
    if command -v goimports &> /dev/null; then
        goimports -w "$file" 2>/dev/null || true
    elif command -v gofmt &> /dev/null; then
        gofmt -w "$file" 2>/dev/null || true
    fi
done

# Fix Dockerfile if main.go is in cmd/
if [[ "$MAIN_GO" == *"/cmd/main.go" ]]; then
    echo "🐳 Patching Dockerfile for cmd/ structure..."
    if [ -f "$MIGRATION_DIR/Dockerfile" ]; then
        # Replace entire go build line to be safe regardless of binary name
        sed -i 's|RUN .*go build.*|RUN CGO_ENABLED=0 GOOS=linux go build -o users-service ./cmd/main.go|g' "$MIGRATION_DIR/Dockerfile"
        
        # Ensure CMD is correct
        sed -i 's|CMD .*|CMD ["./users-service"]|g' "$MIGRATION_DIR/Dockerfile"
    fi
fi

echo "✅ Post-processing complete"
