'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EndpointTable from '@/components/endpoint/EndpointTable';
import { Architecture, Endpoint } from '@/lib/schemas';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Prevent duplicate executions
  const analysisKey = `scan_started_${uploadId}`;
  const resultKey = `scan_result_${uploadId}`;

  useEffect(() => {
    if (!uploadId) {
      setError('Upload ID missing');
      setLoading(false);
      return;
    }

    // Check for cached result first
    const cachedResult = sessionStorage.getItem(resultKey);
    if (cachedResult && retryCount === 0) {
      try {
        const parsed = JSON.parse(cachedResult);
        setArchitecture(parsed.architecture);
        setFiles(parsed.files);
        setLoading(false);
        return;
      } catch {
        // Invalid cache, continue
      }
    }

    // Prevent duplicate execution
    const alreadyStarted = sessionStorage.getItem(analysisKey);
    if (alreadyStarted && retryCount === 0) {
      console.log('Analysis already in progress, waiting...');
      return;
    }

    sessionStorage.setItem(analysisKey, 'true');

    const analyzeArchitecture = async () => {
      try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min

        // Get uploaded files
        const filesResponse = await fetch(`/api/upload?uploadId=${uploadId}`, {
          signal: controller.signal
        });
        const filesData = await filesResponse.json();

        if (!filesData.success) {
          throw new Error('Failed to retrieve files');
        }

        setFiles(filesData.files);

        // Analyze architecture
        const response = await fetch('/api/architecture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uploadId,
            files: filesData.files,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Architecture analysis failed');
        }

        setArchitecture(data.data);
        setError(null);
        setIsNetworkError(false);

        // Cache result
        sessionStorage.setItem(resultKey, JSON.stringify({
          architecture: data.data,
          files: filesData.files
        }));
        sessionStorage.removeItem(analysisKey);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed';

        // Check for network errors
        if (err instanceof Error && (
          err.name === 'AbortError' ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network')
        )) {
          setIsNetworkError(true);
          setError('Network connection issue. Please check your connection and try again.');
        } else {
          setIsNetworkError(false);
          setError(errorMessage);
        }
        sessionStorage.removeItem(analysisKey);
      } finally {
        setLoading(false);
      }
    };

    analyzeArchitecture();
  }, [uploadId, retryCount, analysisKey, resultKey]);

  const handleRetry = () => {
    sessionStorage.removeItem(analysisKey);
    sessionStorage.removeItem(resultKey);
    setLoading(true);
    setError(null);
    setIsNetworkError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    // Store necessary data in sessionStorage
    sessionStorage.setItem('uploadId', uploadId || '');
    sessionStorage.setItem('files', JSON.stringify(files));
    sessionStorage.setItem('architecture', JSON.stringify(architecture));
    sessionStorage.setItem('selectedEndpoint', JSON.stringify(endpoint));

    router.push(`/endpoint/${endpoint.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Analyzing architecture...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a minute...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className={`flex items-center mb-4 ${isNetworkError ? 'text-yellow-600' : 'text-red-600'}`}>
            {isNetworkError ? (
              <AlertTriangle className="w-8 h-8 mr-3" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <span className="text-red-600 font-bold">!</span>
              </div>
            )}
            <h2 className="text-xl font-bold">{isNetworkError ? 'Connection Issue' : 'Error'}</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/upload')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Start Over
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {architecture && (
          <>
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {architecture.projectName}
              </h1>
              <p className="text-gray-600 mb-4">{architecture.description}</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded p-4">
                  <p className="text-sm text-gray-600">Technologies</p>
                  <p className="text-lg font-bold text-blue-600">
                    {architecture.technologies.join(', ')}
                  </p>
                </div>
                <div className="bg-green-50 rounded p-4">
                  <p className="text-sm text-gray-600">Endpoints</p>
                  <p className="text-lg font-bold text-green-600">
                    {architecture.endpoints.length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded p-4">
                  <p className="text-sm text-gray-600">Controllers</p>
                  <p className="text-lg font-bold text-purple-600">
                    {architecture.structure.controllers.length}
                  </p>
                </div>
              </div>
            </div>

            <EndpointTable
              endpoints={architecture.endpoints}
              onSelectEndpoint={handleSelectEndpoint}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>}>
      <ScanContent />
    </Suspense>
  );
}
