import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { MigrationResultSchema, type MigrationResult, type Endpoint, type EndpointAnalysis, type Microservice } from '../schemas';
import { retry } from '../utils/helpers';
import { architectureAgent } from './architecture-agent';
import { endpointAnalysisAgent } from './endpoint-analysis-agent';
import { microserviceGeneratorAgent } from './microservice-generator-agent';
import { verifierAgent } from './verifier-agent';

const MODEL = 'gpt-4o';

type Language = 'go' | 'python' | 'node-ts';

interface AggregatorInput {
  monolithCode: string;
  fileStructure: { path: string; content: string }[];
  selectedEndpointId: string;
  targetLanguage: Language;
  serviceName: string;
}

const systemPrompt = `You are a master orchestrator for complex multi-agent workflows.

Your role:
- Coordinate multiple specialized AI agents
- Ensure data flows correctly between agents
- Handle errors gracefully
- Aggregate results into a cohesive output
- Provide progress updates
- Generate final migration package

You are the conductor of the migration orchestra.`;

export class AggregatorAgent {
  async run(input: AggregatorInput): Promise<MigrationResult> {
    const startTime = Date.now();
    const stepsCompleted: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('🚀 Starting migration workflow...');

      // Step 1: Architecture Analysis
      console.log('📊 Step 1/5: Analyzing monolith architecture...');
      const architecture = await architectureAgent.run({
        monolithCode: input.monolithCode,
        fileStructure: input.fileStructure,
      });
      stepsCompleted.push('architecture-analysis');
      console.log(`✓ Found ${architecture.endpoints.length} endpoints`);

      // Find selected endpoint
      const selectedEndpoint = architecture.endpoints.find(
        ep => ep.id === input.selectedEndpointId
      );

      if (!selectedEndpoint) {
        throw new Error(`Endpoint ${input.selectedEndpointId} not found`);
      }

      // Step 2: Endpoint Analysis
      console.log('🔍 Step 2/5: Analyzing selected endpoint...');
      const endpointFile = input.fileStructure.find(f => 
        f.path === selectedEndpoint.file || f.path.endsWith(selectedEndpoint.file)
      );

      if (!endpointFile) {
        throw new Error(`File ${selectedEndpoint.file} not found`);
      }

      const relatedFiles = this.findRelatedFiles(
        input.fileStructure,
        endpointFile.content
      );

      const endpointAnalysis = await endpointAnalysisAgent.run({
        endpoint: selectedEndpoint,
        fileContent: endpointFile.content,
        relatedFiles,
      });
      stepsCompleted.push('endpoint-analysis');
      console.log(`✓ Found ${endpointAnalysis.inputParameters.length} parameters, ${endpointAnalysis.databaseOperations.length} DB operations`);

      // Step 3: Microservice Generation
      console.log(`⚙️  Step 3/5: Generating ${input.targetLanguage} microservice...`);
      const microservice = await microserviceGeneratorAgent.run({
        endpointAnalysis,
        language: input.targetLanguage,
        serviceName: input.serviceName,
      });
      stepsCompleted.push('microservice-generation');
      console.log(`✓ Generated ${microservice.files.length} files`);

      // Step 4: Verification
      console.log('✅ Step 4/5: Verifying generated code...');
      const verification = await verifierAgent.run({
        microservice,
      });
      stepsCompleted.push('verification');
      console.log(`✓ Verification score: ${verification.score}/100`);

      if (verification.issues.length > 0) {
        const errorCount = verification.issues.filter(i => i.severity === 'error').length;
        const warningCount = verification.issues.filter(i => i.severity === 'warning').length;
        
        if (errorCount > 0) {
          warnings.push(`Found ${errorCount} errors in generated code`);
        }
        if (warningCount > 0) {
          warnings.push(`Found ${warningCount} warnings in generated code`);
        }
      }

      // Step 5: Package for download
      console.log('📦 Step 5/5: Packaging microservice...');
      const downloadId = `migration-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      stepsCompleted.push('packaging');

      const totalDuration = Date.now() - startTime;
      console.log(`✨ Migration completed in ${(totalDuration / 1000).toFixed(2)}s`);

      return {
        success: true,
        architecture,
        endpointAnalysis,
        microservice,
        verification,
        downloadUrl: `/api/download/${downloadId}`,
        timestamp: new Date().toISOString(),
        metadata: {
          totalDuration,
          stepsCompleted,
          warnings,
        },
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw new Error(
        `Migration workflow failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private findRelatedFiles(
    fileStructure: { path: string; content: string }[],
    mainContent: string
  ): { path: string; content: string }[] {
    // Simple heuristic: find files that are referenced in the main file
    const related: { path: string; content: string }[] = [];
    
    for (const file of fileStructure) {
      const fileName = file.path.split('/').pop() || '';
      
      // Check if file is referenced (include, require, etc.)
      if (
        mainContent.includes(fileName) ||
        mainContent.includes(file.path) ||
        related.length < 5 // Include at least a few files for context
      ) {
        related.push(file);
        
        if (related.length >= 10) break; // Limit to 10 related files
      }
    }
    
    return related;
  }
}

export const aggregatorAgent = new AggregatorAgent();
