import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { ArchitectureSchema, type Architecture } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

interface ArchitectureAgentInput {
  monolithCode: string;
  fileStructure: { path: string; content: string }[];
}

const systemPrompt = `You are an expert software architect specialized in analyzing legacy monolithic applications.

Your role:
- Analyze the structure of PHP/HTML/JS monolithic applications
- Identify all folders, files, controllers, models, and views
- Detect all HTTP endpoints (routes) with their methods
- Assess complexity and dependencies
- Provide architectural insights and migration recommendations

CRITICAL: You MUST respond with valid JSON that exactly matches the provided schema.
- Do NOT use escaped quotes in field names
- Do NOT mix XML-like tags with JSON
- Ensure all required fields are present: projectName, description, structure, endpoints, technologies, databaseDetected, recommendations
- All arrays must be properly formatted JSON arrays
- All booleans must be true or false (not strings)

Be thorough, accurate, and provide actionable insights.`;

export class ArchitectureAgent {
  async run(input: ArchitectureAgentInput): Promise<Architecture> {
    return retry(async () => {
      try {
        const userPrompt = this.buildUserPrompt(input);

        const result = await generateObject({
          model: anthropic(MODEL),
          schema: ArchitectureSchema,
          schemaName: 'ArchitectureAnalysis',
          schemaDescription: 'Complete architectural analysis of a legacy monolithic application including structure, endpoints, technologies, and recommendations',
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.1, // Lower temperature for more deterministic output
        });

        return result.object;
      } catch (error) {
        console.error('ArchitectureAgent error:', error);
        throw new Error(`Architecture analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 3, 1000);
  }

  private buildUserPrompt(input: ArchitectureAgentInput): string {
    const fileList = input.fileStructure.map(f => f.path).join('\n');
    const codeSnippets = input.fileStructure
      .slice(0, 10) // Primele 10 fișiere pentru context
      .map(f => `File: ${f.path}\n\`\`\`\n${f.content.slice(0, 1000)}\n\`\`\``)
      .join('\n\n');

    return `Analyze this PHP monolithic application and provide a complete architectural overview.

**File Structure:**
${fileList}

**Code Samples:**
${codeSnippets}

**Your Task:**
1. Identify the project structure (folders, controllers, models, views)
2. Detect ALL HTTP endpoints with their:
   - Path (e.g., /api/users, /admin/products)
   - HTTP method (GET, POST, PUT, DELETE)
   - File location
   - Complexity assessment (low/medium/high)
   - Brief description
3. Identify technologies used (PHP version, frameworks, databases)
4. Provide migration recommendations

**IMPORTANT: Respond with valid JSON matching this exact structure:**
{
  "projectName": "Example Project Name",
  "description": "Brief description of the application",
  "structure": {
    "folders": ["folder1", "folder2"],
    "controllers": ["controller1.php", "controller2.php"],
    "models": ["model1.php"],
    "views": ["view1.php"]
  },
  "endpoints": [
    {
      "id": "endpoint_1",
      "path": "/api/example",
      "method": "POST",
      "file": "path/to/file.php",
      "description": "Description of what this endpoint does",
      "complexity": "high"
    }
  ],
  "technologies": ["PHP", "PostgreSQL", "PDO"],
  "databaseDetected": true,
  "recommendations": [
    "First recommendation",
    "Second recommendation"
  ]
}

Generate a complete JSON response following the ArchitectureSchema.`;
  }
}

export const architectureAgent = new ArchitectureAgent();
