'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, CheckCircle, Code2, Sparkles, XCircle, Terminal, Cpu, Box, Layers, Hexagon, ChevronRight, RefreshCw, ArrowRight, Activity, Rocket, ShieldCheck } from 'lucide-react';
import RetroGenerationScene from '@/components/retro/RetroGenerationScene';
import RetroLoader from '@/components/retro/RetroLoader';
import RetroDockerContainer from '@/components/retro/RetroDockerContainer';

export default function SelectLanguagePage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [successData, setSuccessData] = useState<any>(null);

  const steps = [
    'INITIALIZING_MIGRATION_JOB...',
    'ANALYZING_MONOLITH_ARCHITECTURE...',
    'PROCESSING_SELECTED_ENDPOINT...',
    'GENERATING_MICROSERVICE_CODE...',
    'REPAIRING_AND_OPTIMIZING_CODE...',
    'VERIFYING_GENERATED_CODE...',
    'PACKAGING_MICROSERVICE...',
  ];

  // Add log entry effect
  useEffect(() => {
    if (progress) {
      setGenerationLog(prev => [...prev, `> ${progress} [${new Date().toLocaleTimeString()}]`]);
    }
  }, [progress]);

  const handleLanguageSelect = async (language: 'go' | 'python' | 'node-ts') => {
    sessionStorage.setItem('selectedLanguage', language);
    setIsGenerating(true);
    setProgress(steps[0]);
    setCurrentStep(0);
    setError(null);

    // Timer for elapsed time
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Get data from sessionStorage
      const uploadId = sessionStorage.getItem('uploadId');
      const filesStr = sessionStorage.getItem('files');
      const endpointAnalysisStr = sessionStorage.getItem('endpointAnalysis');
      const endpointStr = sessionStorage.getItem('selectedEndpoint');

      if (!uploadId || !filesStr || !endpointAnalysisStr || !endpointStr) {
        throw new Error('Missing required data. Please start from the upload page.');
      }

      const files = JSON.parse(filesStr);
      const endpoint = JSON.parse(endpointStr);
      const serviceName = endpoint.path
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

      console.log('🚀 Creating migration job...');

      // Step 1: Create the job (returns immediately)
      const createResponse = await fetch('/api/aggregator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          files,
          selectedEndpointId: endpointId,
          targetLanguage: language,
          serviceName,
        }),
      });

      const createData = await createResponse.json();

      if (!createData.success || !createData.jobId) {
        throw new Error(createData.error || 'Failed to create job');
      }

      const jobId = createData.jobId;
      console.log(`📋 Job created: ${jobId}`);

      setProgress(steps[1]);
      setCurrentStep(1);

      // Step 2: Poll for job completion
      let pollAttempts = 0;
      const maxAttempts = 120; // 2 minutes max polling at 1s intervals

      while (pollAttempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        try {
          const statusResponse = await fetch(`/api/aggregator?jobId=${jobId}`);
          const statusData = await statusResponse.json();

          if (!statusData.success && statusData.error === 'Job not found') {
            // Job might have been cleaned up, retry creating
            throw new Error('Job was lost. Please try again.');
          }

          // Update progress based on job status
          if (statusData.progress) {
            setProgress(statusData.progress.toUpperCase());

            // Map progress text to step number
            if (statusData.progress.includes('architecture')) setCurrentStep(1);
            else if (statusData.progress.includes('endpoint')) setCurrentStep(2);
            else if (statusData.progress.includes('Generating') || statusData.progress.includes('AI agents')) setCurrentStep(3);
            else if (statusData.progress.includes('Repair')) setCurrentStep(4);
            else if (statusData.progress.includes('Verif')) setCurrentStep(5);
            else if (statusData.progress.includes('Saving') || statusData.progress.includes('complete')) setCurrentStep(6);
          }

          // Check if completed
          if (statusData.status === 'completed' && statusData.result) {
            clearInterval(timerInterval);
            console.log('✅ Job completed!');

            // Save result to sessionStorage
            sessionStorage.setItem('migrationResult', JSON.stringify(statusData.result));
            setSuccessData(statusData.result);
            setIsGenerating(false);
            setIsComplete(true);
            return;
          }

          // Check if failed
          if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'Job failed');
          }

          pollAttempts++;
        } catch (pollError) {
          // Ignore poll errors and continue - network might be flaky
          console.log('Poll error (ignoring):', pollError);
          pollAttempts++;
        }
      }

      // Timeout
      throw new Error('Job timed out. Please check the output folder manually.');

    } catch (err) {
      clearInterval(timerInterval);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ Generation error:', errorMessage);
      setError(errorMessage);
      setIsGenerating(false);
    }
  };

  const handleLaunch = () => {
    router.push(`/result/${endpointId}`);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="box-retro p-8 max-w-md w-full border-red-500/50">
          <div className="flex items-center mb-6 text-red-500">
            <XCircle className="w-8 h-8 mr-3 animate-pulse" />
            <h2 className="text-xl font-bold tracking-widest">GENERATION_FAILED</h2>
          </div>
          <p className="text-amber-500/80 mb-8 font-mono border-l-2 border-red-500/50 pl-4 py-2 bg-red-900/10">
            {error}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 btn-retro text-sm py-2"
            >
              RETURN
            </button>
            <button
              onClick={() => {
                setError(null);
                setIsGenerating(false);
              }}
              className="flex-1 btn-retro text-sm py-2 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RETRY_OP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading/Generating state
  if (isGenerating) {
    return (
      <RetroGenerationScene
        currentStep={currentStep}
        steps={steps}
        log={generationLog}
        elapsedTime={elapsedTime}
      />
    );
  }

  // Success/Complete state
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-mono overflow-hidden relative">
        {/* Confetti / Particle Effect Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-green-500/20 animate-[moveVertical_3s_linear_infinite]"></div>
          <div className="absolute top-0 right-1/4 w-1 h-full bg-green-500/20 animate-[moveVertical_4s_linear_infinite]"></div>
          <div className="absolute top-1/4 left-0 w-full h-1 bg-green-500/20 animate-[moveHorizontal_5s_linear_infinite]"></div>
        </div>

        <div className="box-retro p-12 max-w-4xl w-full relative z-10 animate-in zoom-in duration-500 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]">

          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
              <ShieldCheck className="w-24 h-24 text-green-500 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
            </div>

            <h1 className="text-5xl font-bold text-green-500 mb-2 tracking-tighter animate-bounce">
              MISSION_ACCOMPLISHED
            </h1>
            <div className="text-green-400/70 text-lg tracking-[0.5em] font-bold">
              MIGRATION_SEQUENCE_COMPLETE
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Deployed Container */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute -inset-10 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
                <RetroDockerContainer className="scale-125" />
              </div>
              <div className="text-center">
                <div className="text-xs text-green-500/50 mb-1">ARTIFACT_STATUS</div>
                <div className="text-green-400 font-bold bg-green-900/20 px-4 py-1 rounded border border-green-500/30">
                  READY_FOR_DEPLOYMENT
                </div>
              </div>
            </div>

            {/* Right: Stats & Action */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-green-500/20 pb-2">
                  <span className="text-green-500/70">TOTAL_TIME</span>
                  <span className="text-xl font-bold text-green-400">{elapsedTime}s</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-500/20 pb-2">
                  <span className="text-green-500/70">MICROSERVICES</span>
                  <span className="text-xl font-bold text-green-400">1</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-500/20 pb-2">
                  <span className="text-green-500/70">OPTIMIZATION</span>
                  <span className="text-xl font-bold text-green-400">100%</span>
                </div>
              </div>

              <button
                onClick={handleLaunch}
                className="w-full btn-retro text-xl py-6 group relative overflow-hidden border-green-500 text-green-500 hover:bg-green-500/10"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  LAUNCH_SYSTEM_DASHBOARD
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Language selection
  return (
    <div className="min-h-screen py-12 px-4 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-amber-500/30 pb-4">
          <div>
            <div className="text-xs text-amber-500/50 mb-1">PHASE_03</div>
            <h1 className="text-3xl font-bold text-glow flex items-center gap-3">
              <Cpu className="w-8 h-8" />
              TARGET_SYSTEM_SELECTION
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* GO Language Card */}
          <div
            onClick={() => handleLanguageSelect('go')}
            className="box-retro p-8 group cursor-pointer hover:bg-amber-900/10 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="text-9xl font-black text-amber-500">GO</div>
            </div>

            <div className="h-48 flex items-center justify-center mb-6 perspective-1000">
              <div className="w-24 h-24 relative transform-style-3d group-hover:animate-[spin_4s_linear_infinite]">
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 translate-z-12 flex items-center justify-center text-4xl font-bold text-blue-500">GO</div>
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 -translate-z-12 rotate-y-180"></div>
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 translate-x-12 rotate-y-90"></div>
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 -translate-x-12 -rotate-y-90"></div>
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 -translate-y-12 rotate-x-90"></div>
                <div className="absolute inset-0 border-4 border-blue-500/80 bg-blue-500/20 translate-y-12 -rotate-x-90"></div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-blue-500 group-hover:text-glow">GO_LANG</h3>
            <p className="text-amber-500/60 text-sm mb-6">
              High-performance systems programming. Ideal for microservices requiring concurrency and speed.
            </p>
            <div className="flex items-center text-blue-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              INITIALIZE_PROTOCOL <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Python Card */}
          <div
            onClick={() => handleLanguageSelect('python')}
            className="box-retro p-8 group cursor-pointer hover:bg-amber-900/10 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="text-9xl font-black text-amber-500">PY</div>
            </div>

            <div className="h-48 flex items-center justify-center mb-6 perspective-1000">
              <div className="relative w-32 h-32 group-hover:animate-[spin_3s_linear_infinite]">
                <div className="absolute inset-0 border-4 border-yellow-500/50 rounded-full border-t-transparent rotate-45"></div>
                <div className="absolute inset-2 border-4 border-blue-500/50 rounded-full border-b-transparent -rotate-45"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-amber-500/30 rotate-45 flex items-center justify-center">
                    <div className="w-8 h-8 bg-amber-500/20"></div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-yellow-500 group-hover:text-glow">PYTHON</h3>
            <p className="text-amber-500/60 text-sm mb-6">
              Versatile and readable. Excellent for data-heavy processing and AI integration.
            </p>
            <div className="flex items-center text-yellow-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              INITIALIZE_PROTOCOL <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Node.js Card */}
          <div
            onClick={() => handleLanguageSelect('node-ts')}
            className="box-retro p-8 group cursor-pointer hover:bg-amber-900/10 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="text-9xl font-black text-amber-500">JS</div>
            </div>

            <div className="h-48 flex items-center justify-center mb-6 perspective-1000">
              <div className="relative w-32 h-32 transform-style-3d group-hover:animate-[spin_5s_linear_infinite]">
                <Hexagon className="w-32 h-32 text-green-500/50 absolute inset-0 animate-pulse" />
                <Hexagon className="w-24 h-24 text-green-500/80 absolute top-4 left-4 rotate-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-green-500 font-bold text-xl">TS</div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-green-500 group-hover:text-glow">NODE_TS</h3>
            <p className="text-amber-500/60 text-sm mb-6">
              Event-driven I/O. Perfect for real-time applications and unified JS stack.
            </p>
            <div className="flex items-center text-green-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              INITIALIZE_PROTOCOL <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
