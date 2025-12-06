import { z } from 'zod';

// Schema pentru rezultatul arhitecturii
export const EndpointSchema = z.object({
  id: z.string().describe('Unique identifier for the endpoint'),
  path: z.string().describe('The URL path of the endpoint (e.g., /api/users)'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP method'),
  file: z.string().describe('File path where this endpoint is defined'),
  lineNumber: z.number().optional().describe('Line number in the file where endpoint is defined'),
  description: z.string().describe('Brief description of what this endpoint does'),
  complexity: z.enum(['low', 'medium', 'high']).describe('Complexity assessment of the endpoint'),
});

export const ArchitectureSchema = z.object({
  projectName: z.string().describe('The name of the project or application'),
  description: z.string().describe('A brief description of what the application does'),
  structure: z.object({
    folders: z.array(z.string()).describe('List of main folders in the project'),
    controllers: z.array(z.string()).describe('List of controller files'),
    models: z.array(z.string()).describe('List of model files'),
    views: z.array(z.string()).describe('List of view/template files'),
  }).describe('The project structure breakdown'),
  endpoints: z.array(EndpointSchema).describe('List of all HTTP endpoints found in the application'),
  technologies: z.array(z.string()).describe('List of technologies used (e.g., PHP, PostgreSQL, PDO, Laravel)'),
  databaseDetected: z.boolean().describe('Whether database usage was detected in the code'),
  recommendations: z.array(z.string()).describe('List of recommendations for modernization and migration'),
});

// Schema pentru analiza endpoint-ului
export const DatabaseQuerySchema = z.object({
  query: z.string(),
  type: z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'OTHER']),
  tables: z.array(z.string()),
  description: z.string(),
});

export const DependencySchema = z.object({
  name: z.string(),
  type: z.enum(['internal', 'external', 'database', 'file', 'api']),
  description: z.string(),
  critical: z.boolean(),
});

export const EndpointAnalysisSchema = z.object({
  endpointId: z.string(),
  endpointPath: z.string(),
  method: z.string(),
  inputParameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    source: z.enum(['query', 'body', 'header', 'path']),
    description: z.string(),
    validation: z.string().optional(),
  })),
  businessLogic: z.object({
    summary: z.string(),
    steps: z.array(z.string()),
    complexity: z.enum(['low', 'medium', 'high']),
  }),
  databaseOperations: z.array(DatabaseQuerySchema),
  dependencies: z.array(DependencySchema),
  outputFormat: z.object({
    type: z.enum(['json', 'html', 'redirect', 'file', 'other']),
    structure: z.string(),
    statusCodes: z.array(z.number()),
  }),
  securityConsiderations: z.array(z.string()),
  estimatedMigrationEffort: z.enum(['low', 'medium', 'high', 'very-high']),
});

// Schema pentru generarea microserviciului
export const FileStructureSchema = z.object({
  path: z.string(),
  content: z.string(),
  description: z.string(),
});

export const MicroserviceSchema = z.object({
  serviceName: z.string(),
  language: z.enum(['go', 'python', 'node-ts']),
  port: z.number(),
  description: z.string(),
  files: z.array(FileStructureSchema),
  dockerfile: z.string(),
  dependencies: z.array(z.string()),
  environmentVariables: z.array(z.object({
    key: z.string(),
    value: z.string(),
    description: z.string(),
  })),
  buildInstructions: z.array(z.string()),
  runInstructions: z.array(z.string()),
  testCommand: z.string().optional(),
  apiDocumentation: z.string(),
});

// Schema pentru verificare
export const VerificationResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    file: z.string().optional(),
    suggestion: z.string().optional(),
  })),
  optimizations: z.array(z.object({
    description: z.string(),
    applied: z.boolean(),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  securityChecks: z.array(z.object({
    check: z.string(),
    passed: z.boolean(),
    details: z.string(),
  })),
  score: z.number().min(0).max(100),
  finalRecommendations: z.array(z.string()),
});

// Schema pentru agregator
export const MigrationResultSchema = z.object({
  success: z.boolean(),
  architecture: ArchitectureSchema,
  endpointAnalysis: EndpointAnalysisSchema,
  microservice: MicroserviceSchema,
  verification: VerificationResultSchema,
  downloadUrl: z.string(),
  timestamp: z.string(),
  metadata: z.object({
    totalDuration: z.number(),
    stepsCompleted: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
});

// Types
export type Endpoint = z.infer<typeof EndpointSchema>;
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type EndpointAnalysis = z.infer<typeof EndpointAnalysisSchema>;
export type Microservice = z.infer<typeof MicroserviceSchema>;
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
export type MigrationResult = z.infer<typeof MigrationResultSchema>;
export type DatabaseQuery = z.infer<typeof DatabaseQuerySchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type FileStructure = z.infer<typeof FileStructureSchema>;

// Schema pentru generarea de trafic
export const TrafficGenerationSchema = z.object({
  scriptContent: z.string().describe('The complete Python script code for traffic generation'),
  requirements: z.array(z.string()).describe('List of Python packages required (e.g., requests)'),
  instructions: z.string().describe('Instructions on how to run the script'),
  targetEndpoints: z.array(z.string()).describe('List of endpoints targeted by this script'),
});

export type TrafficGenerationResult = z.infer<typeof TrafficGenerationSchema>;
