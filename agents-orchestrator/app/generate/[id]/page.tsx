'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MicroservicePreview from '@/components/generator/MicroservicePreview';
import DeploymentPanel from '@/components/DeploymentPanel';
import { MigrationResult } from '@/lib/schemas';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [progress, setProgress] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Use a stable key based on endpoint ID to prevent duplicate executions
  const generationKey = `generation_started_${endpointId}`;
  const resultKey = `generation_result_${endpointId}`;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Check if we already have a result for this endpoint
    const cachedResultStr = sessionStorage.getItem(resultKey);
    if (cachedResultStr && retryCount === 0) {
      try {
        const cachedResult = JSON.parse(cachedResultStr);
        setResult(cachedResult);
        setLoading(false);
        return;
      } catch {
        // Invalid cache, continue with generation
      }
    }

    // Check if generation already started (prevents React Strict Mode double execution)
    const alreadyStarted = sessionStorage.getItem(generationKey);
    if (alreadyStarted && retryCount === 0) {
      console.log('Generation already in progress, skipping duplicate execution');
      return;
    }

    // Mark generation as started
    sessionStorage.setItem(generationKey, 'true');

    const generateMicroservice = async () => {
      try {
        // Get data from sessionStorage
        const uploadId = sessionStorage.getItem('uploadId');
        const filesStr = sessionStorage.getItem('files');
        const endpointAnalysisStr = sessionStorage.getItem('endpointAnalysis');
        const selectedLanguage = sessionStorage.getItem('selectedLanguage');
        const endpointStr = sessionStorage.getItem('selectedEndpoint');

        if (!uploadId || !filesStr || !endpointAnalysisStr || !selectedLanguage || !endpointStr) {
          throw new Error('Missing required data. Please start from the upload page.');
        }

        const files = JSON.parse(filesStr);
        const endpoint = JSON.parse(endpointStr);
        const serviceName = endpoint.path
          .replace(/[^a-zA-Z0-9]/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase();

        setProgress('Starting migration workflow...');

        // Call aggregator to run full workflow with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min timeout

        const response = await fetch('/api/aggregator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uploadId,
            files,
            selectedEndpointId: endpointId,
            targetLanguage: selectedLanguage,
            serviceName,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Migration failed');
        }

        setResult(data.data);
        setProgress('Migration complete!');
        setError(null);
        setIsNetworkError(false);

        // Cache the result to prevent duplicate generations
        sessionStorage.setItem(resultKey, JSON.stringify(data.data));
        sessionStorage.removeItem(generationKey);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Generation failed';

        // Check if it's a network/abort error - these are non-blocking
        if (err instanceof Error && (
          err.name === 'AbortError' ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network')
        )) {
          setIsNetworkError(true);
          setError('Network connection interrupted. The operation may still be running in the background.');
        } else {
          setIsNetworkError(false);
          setError(errorMessage);
        }
        // Clear generation flag on error so retry works
        sessionStorage.removeItem(generationKey);
      } finally {
        setLoading(false);
      }
    };

    generateMicroservice();
  }, [endpointId, retryCount, generationKey, resultKey]);

  const handleRetry = () => {
    // Clear cached result and generation flag
    sessionStorage.removeItem(generationKey);
    sessionStorage.removeItem(resultKey);

    setLoading(true);
    setError(null);
    setIsNetworkError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleDismissError = () => {
    setError(null);
    setIsNetworkError(false);
  };


  // Network error banner component (non-blocking warning)
  const NetworkErrorBanner = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <p className="text-yellow-800 font-medium">Network Issue Detected</p>
            <p className="text-yellow-600 text-sm">{error}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismissError}
            className="px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Microservice
          </h2>
          <p className="text-lg text-gray-600 mb-6">{progress}</p>
          <div className="bg-white rounded-lg shadow-lg p-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Architecture Analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Endpoint Analysis</span>
              </div>
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                <span className="text-sm text-gray-700">Generating Code...</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                <span className="text-sm text-gray-400">Verification</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                <span className="text-sm text-gray-400">Packaging</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            This may take 1-2 minutes...
          </p>
        </div>
      </div>
    );
  }

  // Fatal error state (not network errors)
  if (error && !isNetworkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="flex items-center mb-4">
            <XCircle className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Go Back
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (with optional network error banner)
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Show network error banner if needed (non-blocking) */}
        {isNetworkError && error && <NetworkErrorBanner />}

        {result && (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Migration Complete!
              </h1>
              <p className="text-gray-600">
                Your microservice has been successfully generated and verified.
              </p>
            </div>

            <MicroservicePreview
              microservice={result.microservice}
              verification={result.verification}
              downloadUrl={result.downloadUrl}
            />

            <div className="max-w-6xl mx-auto mt-8">
              <DeploymentPanel
                migrationId={result.downloadUrl.split('/').pop()!}
                endpointAnalysis={result.endpointAnalysis}
              />
            </div>

            <div className="max-w-6xl mx-auto mt-8 flex gap-4">
              <button
                onClick={() => router.push('/upload')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Migrate Another Endpoint
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}

        {/* Fallback if no result but also no error */}
        {!result && !loading && !error && (
          <div className="text-center">
            <p className="text-gray-600">No result available. Try refreshing or going back.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
