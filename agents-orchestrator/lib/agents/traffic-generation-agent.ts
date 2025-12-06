import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { TrafficGenerationSchema, type TrafficGenerationResult, type EndpointAnalysis } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

interface TrafficGenerationInput {
    endpointAnalysis: EndpointAnalysis;
    serviceUrl: string;
}

const systemPrompt = `You are an expert QA Automation Engineer specialized in creating robust traffic generation and load testing scripts.

Your role:
- Analyze the provided API endpoint details.
- Generate a Python script using the 'requests' library to generate traffic.
- The script MUST:
    - Target the specific endpoints identified.
    - Send EXACTLY 10 requests total for the endpoint.
    - Use correct HTTP methods, headers, and payloads based on the analysis.
    - Handle dynamic parameters (e.g., random IDs, valid data types) to make each request slightly different if possible.
    - Log every request and response to STDOUT in a detailed, readable format with timestamps.
    - Handle errors gracefully without crashing.
    - Flush stdout after every print to ensure real-time logging (sys.stdout.reconfigure(line_buffering=True)).

CRITICAL: You MUST respond with valid JSON that exactly matches the provided schema.`;

export class TrafficGenerationAgent {
    async run(input: TrafficGenerationInput): Promise<TrafficGenerationResult> {
        return retry(async () => {
            try {
                const userPrompt = this.buildUserPrompt(input);

                const result = await generateObject({
                    model: anthropic(MODEL),
                    schema: TrafficGenerationSchema,
                    schemaName: 'TrafficGenerationResult',
                    schemaDescription: 'A Python script for generating traffic to the specified endpoints',
                    system: systemPrompt,
                    prompt: userPrompt,
                    temperature: 0.2,
                });

                return result.object;
            } catch (error) {
                console.error('TrafficGenerationAgent error:', error);
                throw new Error(`Traffic generation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, 3, 2000);
    }

    private buildUserPrompt(input: TrafficGenerationInput): string {
        const { endpointAnalysis, serviceUrl } = input;

        return `Generate a traffic generation script for the following endpoint.

**Target Service URL**: ${serviceUrl}

**Endpoint Analysis**:
${JSON.stringify(endpointAnalysis, null, 2)}

**Requirements**:
1. The script must be written in Python.
2. It should use the 'requests' library.
3. It must send EXACTLY 10 requests to the endpoint: ${endpointAnalysis.endpointPath}.
4. It must construct valid payloads based on the 'inputParameters' in the analysis. Vary the data slightly for each request (e.g. different IDs or names).
5. If the endpoint requires specific headers, include them.
6. **LOGGING REQUIREMENTS**:
   - Initialize with: \`sys.stdout.reconfigure(line_buffering=True)\`
   - For EACH request, print a log entry in this EXACT format:
     \`[YYYY-MM-DD HH:MM:SS] REQUEST: {method} {url} | Payload: {json_payload}\`
     \`[YYYY-MM-DD HH:MM:SS] RESPONSE: {status_code} | Time: {latency}ms | Body: {response_snippet}\`
   - Add a small delay (e.g., 0.5s) between requests to make the logs readable in real-time.

**Output**:
Provide the complete Python code in the 'scriptContent' field.`;
    }
}

export const trafficGenerationAgent = new TrafficGenerationAgent();
