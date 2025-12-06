import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { VerificationResultSchema, type VerificationResult, type Microservice } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

interface VerifierAgentInput {
  microservice: Microservice;
}

const systemPrompt = `You are an expert code reviewer and security analyst specialized in microservices.

Your role:
- Verify code quality and correctness
- Check for security vulnerabilities
- Validate best practices adherence
- Suggest optimizations
- Ensure production-readiness
- Verify Docker configuration
- Check error handling and logging

Be thorough, constructive, and provide actionable feedback.`;

export class VerifierAgent {
  async run(input: VerifierAgentInput): Promise<VerificationResult> {
    return retry(async () => {
      try {
        const userPrompt = this.buildUserPrompt(input);

        const result = await generateObject({
          model: anthropic(MODEL),
          schema: VerificationResultSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.2,
        });

        return result.object;
      } catch (error) {
        console.error('VerifierAgent error:', error);
        throw new Error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 3, 1000);
  }

  private buildUserPrompt(input: VerifierAgentInput): string {
    const { microservice } = input;

    const filesContent = microservice.files
      .map(f => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\`\n`)
      .join('\n');

    return `Verify this generated microservice for quality, security, and production-readiness.

**Service Details:**
- Name: ${microservice.serviceName}
- Language: ${microservice.language}
- Port: ${microservice.port}
- Description: ${microservice.description}

**Files:**
${filesContent}

**Dockerfile:**
\`\`\`dockerfile
${microservice.dockerfile}
\`\`\`

**Dependencies:**
${microservice.dependencies.join(', ')}

**Your Task:**

Perform comprehensive verification:

1. **Code Quality Issues**:
   - Syntax errors
   - Logic errors
   - Missing error handling
   - Missing validation
   - Code smells
   - Severity: error/warning/info

2. **Security Checks**:
   - SQL injection vulnerabilities
   - Input validation gaps
   - Authentication/authorization issues
   - Environment variable exposure
   - Dependency vulnerabilities
   - Pass/fail with details

3. **Optimizations**:
   - Performance improvements
   - Code simplifications
   - Better patterns
   - Impact assessment (low/medium/high)
   - Mark as applied: false (just suggestions)

4. **Production Readiness**:
   - Logging adequacy
   - Error handling completeness
   - Configuration management
   - Health check endpoints
   - Graceful shutdown
   - Docker best practices

5. **Overall Score**: 0-100 based on:
   - Correctness: 40%
   - Security: 30%
   - Best practices: 20%
   - Documentation: 10%

6. **Final Recommendations**: Top 3-5 action items

**IMPORTANT:**
- Be realistic and constructive
- If code is good, say so (score 80+)
- Only report actual issues, not hypotheticals
- Prioritize critical security issues

Return complete JSON following VerificationResultSchema.`;
  }
}

export const verifierAgent = new VerifierAgent();
