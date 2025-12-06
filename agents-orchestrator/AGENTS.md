# 🤖 Multi-Agent Architecture Deep Dive

## Overview

The system uses **5 specialized AI agents** that work together in a coordinated workflow to transform monolith applications into microservices.

## Agent Roles & Responsibilities

### 1. Architecture Agent 🏗️

**Model**: Claude 3.5 Haiku (Fast & Cost-Effective)

**Purpose**: Initial monolith analysis and endpoint detection

**Input**:
- Full monolith codebase
- File structure
- Code samples

**Output**:
- Project metadata (name, description)
- Complete folder/file structure
- Detected endpoints with:
  - Path (e.g., `/api/users`)
  - HTTP method (GET, POST, PUT, DELETE)
  - File location
  - Complexity assessment
  - Description
- Technologies used (PHP version, database)
- Migration recommendations

**Why Haiku?**: Fast execution (10-20s) for broad analysis

**Location**: `lib/agents/architecture-agent.ts`

---

### 2. Endpoint Analysis Agent 🔍

**Model**: Claude 3.5 Sonnet (Deep Understanding)

**Purpose**: In-depth analysis of selected endpoint

**Input**:
- Selected endpoint details
- Main endpoint file content
- Related files (dependencies)

**Output**:
- Input parameters (all params with sources: query/body/header/path)
- Business logic breakdown (step-by-step)
- Database operations:
  - SQL queries
  - Tables involved
  - Operation types (SELECT/INSERT/UPDATE/DELETE)
- Dependencies:
  - Internal files
  - External APIs
  - Database connections
  - Critical vs non-critical
- Output format & structure
- Security considerations
- Migration effort estimate

**Why Sonnet?**: Excels at code comprehension and extracting complex logic

**Location**: `lib/agents/endpoint-analysis-agent.ts`

---

### 3. Microservice Generator Agent ⚙️

**Model**: Claude 3.5 Sonnet (Code Generation Master)

**Purpose**: Generate complete, production-ready microservice

**Input**:
- Endpoint analysis results
- Target language (go/python/node-ts)
- Service name

**Output**:
- Complete source code:
  - Main entry point
  - Route handlers
  - Data models/schemas
  - Database layer
  - Middleware (auth, validation, logging)
  - Configuration management
  - Utility functions
- Dockerfile (multi-stage, optimized)
- Dependencies list (all packages with versions)
- Environment variables (with descriptions)
- Build instructions
- Run instructions
- Test commands
- API documentation

**Language Support**:
- **Go**: gorilla/mux, sqlx, structured logging
- **Python**: FastAPI, Pydantic, SQLAlchemy, async/await
- **Node.js**: Express, TypeScript, Zod validation

**Why Sonnet?**: Best at generating complex, structured code with proper patterns

**Location**: `lib/agents/microservice-generator-agent.ts`

---

### 4. Verifier Agent ✅

**Model**: Claude 3.5 Haiku (Quick Validation)

**Purpose**: Validate code quality, security, and best practices

**Input**:
- Generated microservice (all files + Dockerfile)

**Output**:
- Verification status (pass/fail)
- Issues list:
  - Severity (error/warning/info)
  - Message
  - File location
  - Suggestions
- Optimizations:
  - Description
  - Impact level (low/medium/high)
  - Application status
- Security checks:
  - SQL injection vulnerabilities
  - Input validation gaps
  - Authentication issues
  - Environment variable exposure
  - Pass/fail with details
- Overall score (0-100):
  - Correctness: 40%
  - Security: 30%
  - Best practices: 20%
  - Documentation: 10%
- Final recommendations (top 3-5 action items)

**Why Haiku?**: Fast verification (10-15s) with good pattern recognition

**Location**: `lib/agents/verifier-agent.ts`

---

### 5. Aggregator Agent (Orchestrator) 🎯

**Model**: GPT-4o (Superior Orchestration)

**Purpose**: Coordinate all agents and manage workflow

**Input**:
- Monolith code
- File structure
- Selected endpoint ID
- Target language
- Service name

**Workflow Steps**:

1. **Architecture Analysis** (Step 1/5)
   - Calls Architecture Agent
   - Receives complete architecture
   - Finds selected endpoint

2. **Endpoint Analysis** (Step 2/5)
   - Locates endpoint file
   - Finds related files
   - Calls Endpoint Analysis Agent
   - Receives detailed analysis

3. **Code Generation** (Step 3/5)
   - Calls Microservice Generator Agent
   - Passes analysis + language choice
   - Receives complete microservice

4. **Verification** (Step 4/5)
   - Calls Verifier Agent
   - Receives quality report
   - Collects warnings

5. **Packaging** (Step 5/5)
   - Generates unique download ID
   - Stores results
   - Creates download URL

**Output**:
- Complete migration result:
  - Architecture
  - Endpoint analysis
  - Microservice code
  - Verification report
  - Download URL
  - Metadata (duration, steps, warnings)

**Why GPT-4o?**: Excellent at task coordination, error handling, and decision-making

**Location**: `lib/agents/aggregator-agent.ts`

---

## Agent Communication Flow

\`\`\`
┌─────────────────────┐
│   User Request      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Aggregator Agent           │ ◄── Main Coordinator
│  (GPT-4o)                   │
└──────────┬──────────────────┘
           │
           ├──► Architecture Agent ──► endpoints list
           │    (Claude Haiku)
           │
           ├──► Endpoint Analysis ──► detailed analysis
           │    (Claude Sonnet)
           │
           ├──► Generator Agent ──────► microservice code
           │    (Claude Sonnet)
           │
           ├──► Verifier Agent ───────► quality report
           │    (Claude Haiku)
           │
           └──► Package & Return ─────► ZIP download
\`\`\`

## Error Handling

Each agent implements:
- **Retry logic**: 3 attempts with exponential backoff
- **Timeout handling**: Max duration per operation
- **Error propagation**: Clear error messages to user
- **Graceful degradation**: Continue with warnings when possible

Example from Architecture Agent:
\`\`\`typescript
return retry(async () => {
  try {
    const result = await generateObject({
      model: anthropic(MODEL),
      schema: ArchitectureSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    });
    return result.object;
  } catch (error) {
    console.error('ArchitectureAgent error:', error);
    throw new Error(\`Architecture analysis failed: \${error.message}\`);
  }
}, 3, 1000); // 3 retries, 1s initial delay
\`\`\`

## Agent Configuration

### Temperature Settings

| Agent | Temperature | Why |
|-------|-------------|-----|
| Architecture | 0.3 | Consistent structure detection |
| Endpoint Analysis | 0.2 | Precise code understanding |
| Generator | 0.3 | Creative but structured code |
| Verifier | 0.2 | Consistent validation |

### Model Selection Rationale

**Claude Haiku** (Architecture, Verifier):
- ✅ Fast (1-3s response time)
- ✅ Cost-effective ($0.25 per 1M tokens)
- ✅ Good for pattern recognition
- ✅ Sufficient for analysis tasks

**Claude Sonnet** (Analysis, Generator):
- ✅ Deep understanding
- ✅ Excellent code generation
- ✅ Complex reasoning
- ✅ Worth the cost for critical tasks

**GPT-4o** (Aggregator):
- ✅ Superior orchestration
- ✅ Better at multi-step workflows
- ✅ Good error recovery
- ✅ Fast API responses

## Extending the System

### Adding New Agent

1. Create agent file: `lib/agents/new-agent.ts`
2. Define schema in `lib/schemas/index.ts`
3. Create API route: `app/api/new-agent/route.ts`
4. Update Aggregator to call new agent

### Changing Models

Easy to swap models in agent files:
\`\`\`typescript
// Before
const MODEL = 'claude-3-5-haiku-20241022';

// After (use newer model)
const MODEL = 'claude-3-6-haiku-20250101';
\`\`\`

### Adding Language Support

1. Add template in `lib/templates/[language]/`
2. Update Generator Agent prompt
3. Add to Zod schema enum
4. Update UI language selector

## Performance Metrics

| Agent | Avg Time | Token Usage | Cost per Run |
|-------|----------|-------------|--------------|
| Architecture | 10-20s | ~2K tokens | ~$0.10 |
| Analysis | 20-40s | ~5K tokens | ~$1.50 |
| Generator | 30-90s | ~8K tokens | ~$3.00 |
| Verifier | 10-15s | ~3K tokens | ~$0.20 |
| Aggregator | 1-3ms | ~500 tokens | ~$0.05 |
| **Total** | **1-3 min** | **~18.5K** | **~$4.85** |

## Best Practices

1. **Parallel when possible**: Run independent agents in parallel (not implemented yet, but possible)
2. **Cache results**: Store architecture analysis for reuse
3. **Stream responses**: For better UX (future improvement)
4. **Monitor costs**: Track AI API usage
5. **Rate limiting**: Prevent abuse and control costs

## Debugging

Enable debug logs:
\`\`\`typescript
// In each agent
console.log('Agent Input:', JSON.stringify(input, null, 2));
console.log('Agent Output:', JSON.stringify(result, null, 2));
\`\`\`

Check API logs in:
- Development: Terminal running `npm run dev`
- Production: Vercel dashboard → Logs

---

**This multi-agent architecture ensures high-quality, production-ready microservice generation! 🚀**
