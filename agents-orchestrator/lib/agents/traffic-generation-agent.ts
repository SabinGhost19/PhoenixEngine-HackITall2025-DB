import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { TrafficGenerationSchema, type TrafficGenerationResult, type EndpointAnalysis } from '../schemas';
import { retry } from '../utils/helpers';

const MODEL = 'claude-3-5-haiku-20241022';

interface TrafficGenerationInput {
    endpointAnalysis: EndpointAnalysis;
    gatewayUrl: string;          // Gateway URL (e.g., http://localhost:8082)
    serviceType: 'php' | 'python';  // Which service path to use
    mode?: 'shadowing' | 'legacy' | 'modern';
}

const systemPrompt = `You are an expert QA Automation Engineer specialized in creating robust traffic generation scripts for API Gateway testing.

Your role:
- Generate a Python script using the 'requests' library to generate traffic through an API Gateway.
- The Gateway operates in SHADOWING mode: it forwards requests to both Legacy and Modern services and compares responses.
- The script MUST:
    - Send requests to the GATEWAY (not directly to microservices).
    - Use the correct Gateway endpoint format.
    - Include 'mode' field set to 'shadowing' in every request payload.
    - Send exactly 20 requests to properly test the canary deployment.
    - Vary request payloads slightly to simulate realistic traffic.
    - Log every request and response with timestamps.
    - Handle errors gracefully.
    - Use line buffering for real-time logging.

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
                    schemaDescription: 'A Python script for generating traffic through the Gateway',
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
        const { endpointAnalysis, gatewayUrl, serviceType, mode = 'shadowing' } = input;

        // Construct the Gateway endpoint URL
        const gatewayEndpoint = `${gatewayUrl}/${serviceType}/transfer`;

        return `Generate a traffic generation script for the Phoenix Engine Gateway.

**Architecture Overview**:
The Gateway sits in front of Legacy and Modern services. When receiving requests with mode='shadowing', 
it forwards to BOTH services and compares responses for the Arbiter to analyze.

**Gateway Configuration**:
- Gateway URL: ${gatewayUrl}
- Service Type: ${serviceType} 
- Full Endpoint: ${gatewayEndpoint}
- Mode: ${mode} (include this in EVERY request payload)

**Original Endpoint Analysis** (use this to understand the business logic):
${JSON.stringify(endpointAnalysis, null, 2)}

**Requirements**:
1. The script MUST use Python with the 'requests' library.
2. Target URL: \`${gatewayEndpoint}\` (POST requests only)
3. Send EXACTLY 20 requests to generate enough samples for the Arbiter.
4. EVERY request payload MUST include: \`"mode": "${mode}"\`
5. Based on the endpoint analysis, construct valid payloads. For transfer-funds type endpoints, use:
   - account_number: random valid account numbers (e.g., "ACC001" to "ACC010")
   - amount: positive decimal values (e.g., 10.00 to 100.00)
   - transaction_id: dynamically generate UUIDs if needed
6. Vary the payload data for each request to simulate realistic traffic.
7. Add "Content-Type: application/json" header.

**LOGGING REQUIREMENTS** (CRITICAL for UI display):
- Initialize with: \`sys.stdout.reconfigure(line_buffering=True)\`
- For EACH request, print logs in this EXACT format:
  \`[YYYY-MM-DD HH:MM:SS] 🚀 REQUEST #N: POST ${gatewayEndpoint}\`
  \`[YYYY-MM-DD HH:MM:SS] 📤 Payload: {json_payload}\`
  \`[YYYY-MM-DD HH:MM:SS] 📥 RESPONSE: {status_code} | Time: {latency}ms\`
  \`[YYYY-MM-DD HH:MM:SS] 📊 Response Body: {response_snippet}\`
- Add a 1 second delay between requests for readable real-time logs.
- At the end, print a summary: total requests, success rate, average latency.

**Example Request Payload**:
\`\`\`json
{
    "mode": "shadowing",
    "account_number": "ACC001",
    "amount": 50.00
}
\`\`\`

**Output**:
Generate the complete Python script in the 'scriptContent' field.`;
    }
}

export const trafficGenerationAgent = new TrafficGenerationAgent();

