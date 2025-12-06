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

Be thorough, accurate, and provide actionable insights.`;

export class ArchitectureAgent {
  async run(input: ArchitectureAgentInput): Promise<Architecture> {
    return retry(async () => {
      try {
        const userPrompt = this.buildUserPrompt(input);

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

Generate a complete JSON response following the ArchitectureSchema.`;
  }
}

export const architectureAgent = new ArchitectureAgent();
