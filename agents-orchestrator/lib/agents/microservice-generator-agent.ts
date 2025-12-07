import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { MicroserviceSchema, type Microservice, type EndpointAnalysis } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

type Language = 'go' | 'python' | 'node-ts';

interface MicroserviceGeneratorInput {
  endpointAnalysis: EndpointAnalysis;
  language: Language;
  serviceName: string;
}

const systemPrompt = `You are an expert microservice architect and full-stack developer.

Your role:
- Generate complete, production-ready microservice code
- Support multiple languages: Go, Python (FastAPI), Node.js (TypeScript + Express)
- Create ALL necessary files (handlers, models, config, tests)
- Generate complete Dockerfile optimized for production
- Provide clear build and deployment instructions
- Follow best practices and modern patterns
- Include proper error handling and validation
- Generate API documentation

CRITICAL CONSTRAINTS:
1. **SIMPLICITY & PERFECTION**: The code must be simple, readable, but absolutely PERFECT and working. No over-engineering.
2. **NO HEALTH ENDPOINT**: Do NOT generate a /health or /healthz endpoint. The user explicitly requested this.
3. **NO COMPLEX LOGGING**: Do NOT use complex logging libraries (like zap, logrus, winston). Use standard library logging (e.g., 'log' in Go, 'logging' in Python, 'console' in Node).
4. **SCHEMA COMPLIANCE**: You MUST populate ALL fields in the JSON schema, including 'dockerfile', 'dependencies', 'environmentVariables', 'buildInstructions', 'runInstructions', and 'apiDocumentation'. Do not leave them undefined.

CRITICAL JSON RULES:
- Do NOT use escaped quotes in field names
- Do NOT mix XML-like tags with JSON
- Ensure all required fields are present
- All arrays must be properly formatted JSON arrays
- All enums must use exact values from the schema

Produce COMPLETE, WORKING code - not placeholders or TODOs.`;

export class MicroserviceGeneratorAgent {
  async run(input: MicroserviceGeneratorInput): Promise<Microservice> {
    return retry(async () => {
      try {
        const userPrompt = this.buildUserPrompt(input);

        const result = await generateObject({
          model: anthropic(MODEL),
          schema: MicroserviceSchema,
          schemaName: 'MicroserviceGeneration',
          schemaDescription: 'Complete microservice code generation including all source files, Dockerfile, dependencies, and documentation',
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.1, // Very low temperature for strict adherence
        });

        return result.object;
      } catch (error) {
        console.error('MicroserviceGeneratorAgent error:', error);
        throw new Error(`Microservice generation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 3, 2000);
  }

  private buildUserPrompt(input: MicroserviceGeneratorInput): string {
    const { endpointAnalysis, language, serviceName } = input;

    const languageGuides = {
      go: `
**Go Implementation Requirements:**
- Use Go 1.21+
- Use gorilla/mux or chi for routing
- Use sqlx for database (if needed)
- **LOGGING**: Use standard 'log' package ONLY. No zap/zerolog.
- **MANDATORY**: Implement a 'LoggingMiddleware' that logs "Started {Method} {Path}" and "Completed {Method} {Path} in {Duration}" for EVERY request.
- Include proper error handling
- Files: main.go, handlers/, models/, config/, Dockerfile
- **CRITICAL**: Use full module path for imports (e.g. "service-name/handlers"), NEVER relative imports (e.g. "./handlers")
- Ensure all exported functions/types in subpackages are Capitalized
`,
      python: `
**Python Implementation Requirements:**
- Use Python 3.11+
- Use FastAPI framework
- Use Pydantic for validation
- Use SQLAlchemy for database (if needed)
- **LOGGING**: Use standard 'logging' module ONLY.
- **MANDATORY**: Add a middleware to log requests: print(f"Started {method} {path}") and print(f"Completed {method} {path} in {duration}").
- **CRITICAL**: Ensure 'sys.stdout.reconfigure(line_buffering=True)' is called at startup.
- Include proper async/await patterns
- Files: main.py, routers/, models/, schemas/, config.py, requirements.txt, Dockerfile
`,
      'node-ts': `
**Node.js + TypeScript Requirements:**
- Use Node.js 20+ with TypeScript 5+
- Use Express.js
- Use Zod for validation
- Use Prisma or TypeORM for database (if needed)
- **LOGGING**: Use standard 'console.log/error' ONLY.
- **MANDATORY**: Use a logging middleware (like morgan or custom) to log every request.
- Proper async/await and error handling
- Files: src/index.ts, src/routes/, src/models/, src/middleware/, package.json, tsconfig.json, Dockerfile
`,
    };

    return `Generate a complete, production-ready microservice for this endpoint.

**Service Name:** ${serviceName}

**Target Language:** ${language}

${languageGuides[language]}

**Endpoint Analysis:**
- Path: ${endpointAnalysis.endpointPath}
- Method: ${endpointAnalysis.method}
- Business Logic: ${endpointAnalysis.businessLogic.summary}

**Input Parameters:**
${JSON.stringify(endpointAnalysis.inputParameters, null, 2)}

**Database Operations:**
${JSON.stringify(endpointAnalysis.databaseOperations, null, 2)}

**Dependencies:**
${JSON.stringify(endpointAnalysis.dependencies, null, 2)}

**Output Format:**
${JSON.stringify(endpointAnalysis.outputFormat, null, 2)}

**Your Task:**

Generate a COMPLETE microservice with:

1. **All Source Files**:
   - Main entry point
   - Route handlers
   - Data models/schemas
   - Database layer (if needed)
   - Middleware (auth, validation, logging, error handling)
   - Configuration management
   - Utility functions

2. **Dockerfile**:
   - Multi-stage build
   - Optimized for production
   - Minimal image size
   - Security best practices

3. **Dependencies List**:
   - All required packages/modules
   - Version pinning

4. **Environment Variables**:
   - All required env vars with descriptions
   - Example values

5. **Build & Run Instructions**:
   - Step-by-step build commands
   - How to run locally
   - How to run with Docker

6. **API Documentation**:
   - Endpoint description
   - Request/response examples
   - Error codes

**IMPORTANT CONSTRAINTS REITERATED:**
- **NO /health endpoint**.
- **NO complex logging** (use standard lib).
- **PERFECT, WORKING CODE**.
- **FILL ALL JSON FIELDS** (dockerfile, dependencies, etc.).

Return complete JSON following MicroserviceSchema with ALL files populated.`;
  }
}

export const microserviceGeneratorAgent = new MicroserviceGeneratorAgent();
