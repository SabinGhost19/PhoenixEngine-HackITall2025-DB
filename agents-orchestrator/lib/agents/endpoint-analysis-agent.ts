import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { EndpointAnalysisSchema, type EndpointAnalysis, type Endpoint } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-haiku-4-5-20251001';

interface EndpointAnalysisAgentInput {
  endpoint: Endpoint;
  fileContent: string;
  relatedFiles: { path: string; content: string }[];
}

const systemPrompt = `You are an expert backend engineer specialized in deep code analysis for legacy applications.

Your role:
- Perform in-depth analysis of individual API endpoints
- Extract all input parameters (query, body, headers, path)
- Document business logic step-by-step
- Identify all database operations (queries, tables, operations)
- Map all dependencies (internal files, external APIs, databases)
- Assess security considerations
- Determine output format and structure
- Estimate migration effort

CRITICAL: You MUST respond with valid JSON that exactly matches the provided schema.
- Do NOT use escaped quotes in field names
- Do NOT mix XML-like tags with JSON
- Ensure all required fields are present
- All arrays must be properly formatted JSON arrays
- All booleans must be true or false (not strings)
- All enums must use exact values from the schema

Be extremely detailed and precise in your analysis.`;

export class EndpointAnalysisAgent {
  async run(input: EndpointAnalysisAgentInput): Promise<EndpointAnalysis> {
    return retry(async () => {
      try {
        const userPrompt = this.buildUserPrompt(input);

        const result = await generateObject({
          model: anthropic(MODEL),
          schema: EndpointAnalysisSchema,
          schemaName: 'EndpointAnalysis',
          schemaDescription: 'Comprehensive analysis of a single API endpoint including parameters, business logic, database operations, dependencies, and security considerations',
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.1, // Lower temperature for more deterministic output
        });

        return result.object;
      } catch (error) {
        console.error('EndpointAnalysisAgent error:', error);
        throw new Error(`Endpoint analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 3, 1500);
  }

  private buildUserPrompt(input: EndpointAnalysisAgentInput): string {
    const { endpoint, fileContent, relatedFiles } = input;

    const relatedFilesContext = relatedFiles
      .map(f => `File: ${f.path}\n\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\``)
      .join('\n\n');

    return `Perform a comprehensive analysis of this API endpoint.

**Endpoint Details:**
- Path: ${endpoint.path}
- Method: ${endpoint.method}
- File: ${endpoint.file}
- Description: ${endpoint.description}

**Main File Content:**
\`\`\`php
${fileContent}
\`\`\`

**Related Files:**
${relatedFilesContext}

**Your Task:**
Analyze this endpoint in detail and extract:

1. **Input Parameters**: ALL parameters the endpoint accepts
   - Name, type, required status
   - Source (query/body/header/path)
   - Description and validation rules

2. **Business Logic**: 
   - Step-by-step summary of what the code does
   - Complexity assessment

3. **Database Operations**: 
   - All SQL queries (SELECT, INSERT, UPDATE, DELETE)
   - Tables involved
   - Query descriptions

4. **Dependencies**:
   - Internal file dependencies
   - External API calls
   - Database connections
   - File system operations
   - Critical vs non-critical

5. **Output Format**:
   - Response type (JSON, HTML, redirect, file)
   - Structure and schema
   - Possible status codes

6. **Security Considerations**:
   - SQL injection risks
   - Authentication/authorization checks
   - Input validation gaps
   - Data exposure risks

7. **Migration Effort**: Estimate (low/medium/high/very-high)

Provide complete JSON output following EndpointAnalysisSchema.`;
  }
}

export const endpointAnalysisAgent = new EndpointAnalysisAgent();
