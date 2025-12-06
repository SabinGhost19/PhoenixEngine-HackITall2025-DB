import fs from 'fs';
import path from 'path';

// Store migration results globally
export const migrationResults = new Map<string, any>();

// Save migration to disk
export function saveMigrationToDisk(migrationId: string, result: any) {
  const outputDir = path.join(process.cwd(), 'output', migrationId);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { microservice } = result;

  // Save all files
  microservice.files.forEach((file: any) => {
    const filePath = path.join(outputDir, file.path);
    const fileDir = path.dirname(filePath);
    
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, file.content, 'utf-8');
  });

  // Save Dockerfile
  fs.writeFileSync(path.join(outputDir, 'Dockerfile'), microservice.dockerfile, 'utf-8');

  // Save README
  const readme = `# ${microservice.serviceName}

${microservice.description}

## Language: ${microservice.language}
## Port: ${microservice.port}

## Dependencies
${microservice.dependencies.map((d: string) => `- ${d}`).join('\n')}

## Environment Variables
${microservice.environmentVariables.map((e: any) => `- ${e.key}: ${e.description}`).join('\n')}

## Build Instructions
${microservice.buildInstructions.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')}

## Run Instructions
${microservice.runInstructions.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')}

## Verification Results
- Score: ${result.verification.score}/100
- Status: ${result.verification.passed ? '✅ PASSED' : '❌ FAILED'}

### Issues Found:
${result.verification.issues?.length > 0 ? result.verification.issues.map((issue: any) => `- [${issue.severity}] ${issue.message} (${issue.file}:${issue.line})`).join('\n') : 'No issues found'}

### Recommendations:
${result.verification.recommendations?.length > 0 ? result.verification.recommendations.map((rec: string) => `- ${rec}`).join('\n') : 'No recommendations'}
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf-8');

  console.log(`✅ Migration saved to: ${outputDir}`);
  return outputDir;
}
