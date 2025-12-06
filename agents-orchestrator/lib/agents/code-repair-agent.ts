import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { MicroserviceSchema, type Microservice } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

interface CodeRepairInput {
    microservice: Microservice;
    language: 'go' | 'python' | 'node-ts';
}

const systemPrompt = `You are an expert code reviewer and fixer.
Your role is to analyze generated microservice code and fix any errors, ensuring it is production-ready and compilable.

CRITICAL FOR GO:
- You MUST ensure all internal imports use the full module path defined in go.mod.
- NEVER use relative imports (e.g., "./handlers") in Go.
- If go.mod defines "module my-service", imports must be "my-service/handlers", NOT "./handlers".
- Ensure all used packages are imported.
- Ensure all imported packages are used.

CRITICAL FOR ALL LANGUAGES:
- Fix syntax errors.
- Ensure all referenced functions and types exist.
- Ensure directory structure is correct.

You must return the COMPLETE fixed microservice object, including all files.`;

export class CodeRepairAgent {
    async run(input: CodeRepairInput): Promise<Microservice> {
        return retry(async () => {
            try {
                const userPrompt = this.buildUserPrompt(input);

                const result = await generateObject({
                    model: anthropic(MODEL),
                    schema: MicroserviceSchema,
                    schemaName: 'MicroserviceRepair',
                    schemaDescription: 'Fixed microservice code',
                    system: systemPrompt,
                    prompt: userPrompt,
                    temperature: 0.1, // Low temperature for precise fixes
                });

                return result.object;
            } catch (error) {
                console.error('CodeRepairAgent error:', error);
                throw new Error(`Code repair failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, 2, 2000);
    }

    private buildUserPrompt(input: CodeRepairInput): string {
        const { microservice, language } = input;

        let specificInstructions = '';
        if (language === 'go') {
            const goModFile = microservice.files.find(f => f.path.endsWith('go.mod'));
            const moduleName = goModFile ? this.extractModuleName(goModFile.content) : 'unknown-module';

            specificInstructions = `
**Go Specific Checks:**
1. Check 'go.mod' to find the module name. Found module name: "${moduleName}"
2. Review 'main.go' and all other files.
3. REPLACE any relative imports (like "./handlers", "./models") with full module paths (e.g., "${moduleName}/handlers", "${moduleName}/models").
4. Ensure 'handlers.ProcessTransactionHandler' (or similar) is correctly exported (capitalized) in the handlers package and correctly called in main.go.
5. Ensure 'go.sum' is generated or instructions to generate it are clear (though you act on source files).
`;
        }

        return `Review and fix the following ${language} microservice.

${specificInstructions}

**Current Microservice Files:**
${JSON.stringify(microservice.files, null, 2)}

**Service Name:** ${microservice.serviceName}
**Port:** ${microservice.port}

Return the fixed Microservice object with ALL files (even if unchanged).`;
    }

    private extractModuleName(goModContent: string): string {
        const match = goModContent.match(/^module\s+([^\s]+)/m);
        return match ? match[1] : 'unknown-module';
    }
}

export const codeRepairAgent = new CodeRepairAgent();
