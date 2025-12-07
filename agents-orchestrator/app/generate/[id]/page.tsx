'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [progress, setProgress] = useState('');

  // Track if component is mounted to avoid setting state after unmount
  const isMountedRef = useRef(true);
  const isGeneratingRef = useRef(false);

  // Stable keys
  const resultKey = useMemo(() => `generation_result_${endpointId}`, [endpointId]);

  useEffect(() => {
    isMountedRef.current = true;

    // Check if we already have a cached result
    const cachedResultStr = sessionStorage.getItem(resultKey);
    if (cachedResultStr) {
      try {
        const cachedResult = JSON.parse(cachedResultStr);
        setResult(cachedResult);
        setLoading(false);
        console.log('✅ Using cached result');
        return;
      } catch {
        // Invalid cache, continue
      }
    }

    // Prevent duplicate execution - if already generating, just wait
    if (isGeneratingRef.current) {
      console.log('⏳ Generation already in progress, waiting...');
      return;
    }

    isGeneratingRef.current = true;

    const generateMicroservice = async () => {
      try {
        // Get data from sessionStorage
        const uploadId = sessionStorage.getItem('uploadId');
        const filesStr = sessionStorage.getItem('files');
        const endpointAnalysisStr = sessionStorage.getItem('endpointAnalysis');
        const selectedLanguage = sessionStorage.getItem('selectedLanguage');
        const endpointStr = sessionStorage.getItem('selectedEndpoint');

        if (!uploadId || !filesStr || !endpointAnalysisStr || !selectedLanguage || !endpointStr) {
          if (isMountedRef.current) {
            setError('Missing required data. Please start from the upload page.');
            setLoading(false);
          }
          return;
        }

        const files = JSON.parse(filesStr);
        const endpoint = JSON.parse(endpointStr);
        const serviceName = endpoint.path
          .replace(/[^a-zA-Z0-9]/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase();

        if (isMountedRef.current) {
          setProgress('Starting migration workflow...');
        }

        console.log('🚀 Starting API call to /api/aggregator...');

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
        });

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          console.log('⚠️ Component unmounted, ignoring response');
          return;
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Migration failed');
        }

        console.log('✅ Migration completed successfully!');

        // Cache the result
        sessionStorage.setItem(resultKey, JSON.stringify(data.data));

        if (isMountedRef.current) {
          setResult(data.data);
          setProgress('Migration complete!');
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        // ONLY set error if component is still mounted AND it's not an abort error
        if (!isMountedRef.current) {
          console.log('⚠️ Component unmounted, ignoring error');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Generation failed';

        // Ignore abort errors completely - they happen during React Strict Mode remounts
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('⚠️ Fetch aborted (likely Strict Mode), ignoring');
          return;
        }

        // For network errors, check if we got a cached result in the meantime
        if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
          const cachedResult = sessionStorage.getItem(resultKey);
          if (cachedResult) {
            try {
              setResult(JSON.parse(cachedResult));
              setLoading(false);
              console.log('✅ Using cached result after network error');
              return;
            } catch {
              // Continue with error
            }
          }
        }

        console.error('❌ Generation error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      } finally {
        isGeneratingRef.current = false;
      }
    };

    generateMicroservice();

    // Cleanup - mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [endpointId, resultKey]);

  const handleRetry = () => {
    sessionStorage.removeItem(resultKey);
    isGeneratingRef.current = false;
    setLoading(true);
    setError(null);
    setResult(null);
    // Re-run by modifying a state that triggers useEffect
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Microservice
          </h2>
          <p className="text-lg text-gray-600 mb-6">{progress || 'Initializing...'}</p>
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
            This may take 1-2 minutes... Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
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
