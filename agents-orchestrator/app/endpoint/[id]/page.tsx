'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EndpointInspector from '@/components/endpoint/EndpointInspector';
import { EndpointAnalysis, Endpoint } from '@/lib/schemas';
import { Loader2, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';

export default function EndpointPage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [analysis, setAnalysis] = useState<EndpointAnalysis | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Keys for preventing duplicate execution
  const analysisKey = `endpoint_started_${endpointId}`;
  const resultKey = `endpoint_result_${endpointId}`;

  useEffect(() => {
    // Check for cached result
    const cachedResult = sessionStorage.getItem(resultKey);
    if (cachedResult && retryCount === 0) {
      try {
        const parsed = JSON.parse(cachedResult);
        setAnalysis(parsed);
        setLoading(false);
        return;
      } catch {
        // Invalid cache
      }
    }

    // Prevent duplicate execution
    const alreadyStarted = sessionStorage.getItem(analysisKey);
    if (alreadyStarted && retryCount === 0) {
      console.log('Endpoint analysis already in progress');
      return;
    }

    sessionStorage.setItem(analysisKey, 'true');

    const analyzeEndpoint = async () => {
      try {
        // Get data from sessionStorage
        const filesStr = sessionStorage.getItem('files');
        const endpointStr = sessionStorage.getItem('selectedEndpoint');

        if (!filesStr || !endpointStr) {
          throw new Error('Missing required data. Please go back and select an endpoint.');
        }

        const files = JSON.parse(filesStr);
        const endpoint: Endpoint = JSON.parse(endpointStr);

        // Find the file containing the endpoint
        const endpointFile = files.find((f: any) =>
          f.path === endpoint.file || f.path.endsWith(endpoint.file)
        );
        if (!endpointFile) {
          throw new Error(`Endpoint file not found: ${endpoint.file}`);
        }

        // Find related files
        const relatedFiles = files
          .filter((f: any) => f.path !== endpoint.file)
          .slice(0, 5);

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        // Analyze endpoint
        const response = await fetch('/api/endpoint-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint,
            fileContent: endpointFile.content,
            relatedFiles,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Endpoint analysis failed');
        }

        setAnalysis(data.data);
        setError(null);
        setIsNetworkError(false);

        // Cache result
        sessionStorage.setItem('endpointAnalysis', JSON.stringify(data.data));
        sessionStorage.setItem(resultKey, JSON.stringify(data.data));
        sessionStorage.removeItem(analysisKey);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed';

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

    analyzeEndpoint();
  }, [endpointId, retryCount, analysisKey, resultKey]);

  const handleRetry = () => {
    sessionStorage.removeItem(analysisKey);
    sessionStorage.removeItem(resultKey);
    setLoading(true);
    setError(null);
    setIsNetworkError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleContinue = () => {
    router.push(`/select-language/${endpointId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Analyzing endpoint in detail...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment...</p>
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
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Go Back
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
        {analysis && (
          <>
            <EndpointInspector analysis={analysis} />

            <div className="max-w-6xl mx-auto mt-8">
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
              >
                Continue to Language Selection
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
