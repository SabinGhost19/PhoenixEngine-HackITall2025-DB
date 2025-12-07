import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aggregatorAgent } from '@/lib/agents/aggregator-agent';
import { migrationResults, saveMigrationToDisk } from '@/lib/utils/storage';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for full workflow

// Global job store (survives HMR in dev mode)
declare global {
  var migrationJobs: Map<string, {
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: string;
    result?: any;
    error?: string;
    startedAt: number;
  }>;
}

// Initialize global job store
if (!global.migrationJobs) {
  global.migrationJobs = new Map();
}

const jobs = global.migrationJobs;

const RequestSchema = z.object({
  uploadId: z.string(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
  selectedEndpointId: z.string(),
  targetLanguage: z.enum(['go', 'python', 'node-ts']),
  serviceName: z.string(),
});

// Generate a simple job ID
function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// GET - Check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    // Return all active jobs for debugging
    const activeJobs = Array.from(jobs.entries()).map(([id, job]) => ({
      id,
      status: job.status,
      progress: job.progress,
      elapsed: Math.round((Date.now() - job.startedAt) / 1000)
    }));
    return NextResponse.json({ jobs: activeJobs });
  }

  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({
      success: false,
      error: 'Job not found',
      jobId
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    jobId,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
    elapsedSeconds: Math.round((Date.now() - job.startedAt) / 1000)
  });
}

// POST - Start new job (returns immediately)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // Create job
    const jobId = generateJobId();
    jobs.set(jobId, {
      status: 'pending',
      progress: 'Job queued...',
      startedAt: Date.now()
    });

    console.log(`📋 Job ${jobId} created`);

    // Return immediately with job ID
    // The work will be done when the frontend polls for status
    const response = NextResponse.json({
      success: true,
      jobId,
      message: 'Job created. Poll GET /api/aggregator?jobId=... for status'
    });

    // Start the work in the background
    processJob(jobId, validated);

    return response;

  } catch (error) {
    console.error('❌ Failed to create job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      },
      { status: 500 }
    );
  }
}

// Process job in background
async function processJob(jobId: string, validated: z.infer<typeof RequestSchema>) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'running';
    job.progress = 'Starting migration workflow...';
    console.log(`🚀 Job ${jobId} starting...`);

    // Combine all code for context
    const monolithCode = validated.files
      .map(f => `// File: ${f.path}\n${f.content}`)
      .join('\n\n');

    job.progress = 'Running AI agents for code analysis...';

    const result = await aggregatorAgent.run({
      monolithCode,
      fileStructure: validated.files,
      selectedEndpointId: validated.selectedEndpointId,
      targetLanguage: validated.targetLanguage,
      serviceName: validated.serviceName,
    });

    job.progress = 'Saving results to disk...';

    // Store result for download
    const migrationId = result.downloadUrl.split('/').pop()!;
    migrationResults.set(migrationId, result);

    // Save to disk
    const outputPath = saveMigrationToDisk(migrationId, result);

    // Mark job as completed
    job.status = 'completed';
    job.progress = 'Migration complete!';
    job.result = {
      ...result,
      outputPath,
    };

    console.log(`✅ Job ${jobId} completed successfully!`);

    // Clean up old jobs after 30 minutes
    setTimeout(() => {
      jobs.delete(jobId);
      console.log(`🗑️ Job ${jobId} cleaned up`);
    }, 30 * 60 * 1000);

  } catch (error) {
    const job = jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Migration workflow failed';
      job.progress = 'Failed';
      console.error(`❌ Job ${jobId} failed:`, error);
    }
  }
}
