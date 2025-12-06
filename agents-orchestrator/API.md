# API Documentation

## Upload Endpoint

**POST** `/api/upload`

Upload monolith files for analysis.

**Request Body:**
\`\`\`json
{
  "files": [
    {
      "path": "index.php",
      "content": "<?php ... ?>"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "uploadId": "upload-1234567890-abc",
  "fileCount": 15
}
\`\`\`

## Architecture Analysis

**POST** `/api/architecture`

Analyze monolith architecture and detect endpoints.

**Request Body:**
\`\`\`json
{
  "uploadId": "upload-1234567890-abc",
  "files": [...]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "projectName": "Legacy E-commerce",
    "description": "PHP-based e-commerce platform",
    "endpoints": [
      {
        "id": "ep-123",
        "path": "/api/users",
        "method": "GET",
        "file": "api/users.php",
        "description": "Retrieve user list",
        "complexity": "medium"
      }
    ],
    "technologies": ["PHP 7.4", "MySQL"],
    "databaseDetected": true
  }
}
\`\`\`

## Endpoint Analysis

**POST** `/api/endpoint-analysis`

Deep analysis of specific endpoint.

**Request Body:**
\`\`\`json
{
  "endpoint": {
    "id": "ep-123",
    "path": "/api/users",
    "method": "GET",
    "file": "api/users.php",
    "description": "Retrieve user list",
    "complexity": "medium"
  },
  "fileContent": "<?php ... ?>",
  "relatedFiles": [...]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "endpointId": "ep-123",
    "inputParameters": [...],
    "businessLogic": {
      "summary": "Fetches active users from database",
      "steps": [...]
    },
    "databaseOperations": [...],
    "dependencies": [...],
    "estimatedMigrationEffort": "medium"
  }
}
\`\`\`

## Microservice Generation

**POST** `/api/microservice-generator`

Generate microservice code in target language.

**Request Body:**
\`\`\`json
{
  "endpointAnalysis": {...},
  "language": "python",
  "serviceName": "user-service"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "serviceName": "user-service",
    "language": "python",
    "port": 8000,
    "files": [
      {
        "path": "main.py",
        "content": "from fastapi import FastAPI...",
        "description": "Main application entry point"
      }
    ],
    "dockerfile": "FROM python:3.11...",
    "dependencies": ["fastapi", "uvicorn"]
  }
}
\`\`\`

## Verification

**POST** `/api/verifier`

Verify and validate generated code.

**Request Body:**
\`\`\`json
{
  "microservice": {...}
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "passed": true,
    "score": 85,
    "issues": [
      {
        "severity": "warning",
        "message": "Consider adding rate limiting",
        "suggestion": "Use middleware for rate limiting"
      }
    ],
    "optimizations": [...],
    "securityChecks": [...],
    "finalRecommendations": [...]
  }
}
\`\`\`

## Full Workflow (Aggregator)

**POST** `/api/aggregator`

Run complete migration workflow.

**Request Body:**
\`\`\`json
{
  "uploadId": "upload-1234567890-abc",
  "files": [...],
  "selectedEndpointId": "ep-123",
  "targetLanguage": "go",
  "serviceName": "user-service"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "success": true,
    "architecture": {...},
    "endpointAnalysis": {...},
    "microservice": {...},
    "verification": {...},
    "downloadUrl": "/api/download/migration-xyz",
    "timestamp": "2025-12-06T...",
    "metadata": {
      "totalDuration": 95000,
      "stepsCompleted": ["architecture-analysis", "endpoint-analysis", ...],
      "warnings": []
    }
  }
}
\`\`\`

## Download

**GET** `/api/download/[id]`

Download generated microservice as ZIP.

**Response:**
- Content-Type: application/zip
- Contains all generated files, Dockerfile, and README
