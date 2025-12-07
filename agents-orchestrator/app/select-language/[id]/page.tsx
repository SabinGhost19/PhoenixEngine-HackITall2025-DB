'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LanguageSelector from '@/components/generator/LanguageSelector';
import { Loader2, CheckCircle, Code2, Sparkles, XCircle } from 'lucide-react';

export default function SelectLanguagePage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const steps = [
    'Creating migration job...',
    'Analyzing monolith architecture...',
    'Processing selected endpoint...',
    'Generating microservice code...',
    'Repairing and optimizing code...',
    'Verifying generated code...',
    'Packaging microservice...',
  ];

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
            setProgress(statusData.progress);

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

            // Navigate to result page
            router.push(`/result/${endpointId}`);
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Generation Failed</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setError(null);
                setIsGenerating(false);
              }}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading/Generating state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <Code2 className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Generating Your Microservice
            </h2>
            <p className="text-gray-500 text-center mb-8">
              AI agents are working on your code...
            </p>

            {/* Progress */}
            <div className="space-y-4 mb-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  {idx < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : idx === currentStep ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${idx <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Current Status */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-blue-700 font-medium">{progress}</span>
              </div>
              <p className="text-blue-600 text-sm mt-2">
                Elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </p>
            </div>

            {/* Info */}
            <p className="text-gray-400 text-xs text-center mt-6">
              ⚡ Using async job queue - safe to wait
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Language selection
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <LanguageSelector onSelect={handleLanguageSelect} />
    </div>
  );
}
