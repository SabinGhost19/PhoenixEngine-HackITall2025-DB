'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EndpointInspector from '@/components/endpoint/EndpointInspector';
import { EndpointAnalysis, Endpoint } from '@/lib/schemas';
import { Loader2, ArrowRight } from 'lucide-react';

export default function EndpointPage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EndpointAnalysis | null>(null);

  useEffect(() => {
    const analyzeEndpoint = async () => {
      try {
        // Get data from sessionStorage
        const filesStr = sessionStorage.getItem('files');
        const endpointStr = sessionStorage.getItem('selectedEndpoint');

        if (!filesStr || !endpointStr) {
          throw new Error('Missing required data');
        }

        const files = JSON.parse(filesStr);
        const endpoint: Endpoint = JSON.parse(endpointStr);

        // Find the file containing the endpoint
        // Handle both exact matches and paths that end with the endpoint file
        const endpointFile = files.find((f: any) => 
          f.path === endpoint.file || f.path.endsWith(endpoint.file)
        );
        if (!endpointFile) {
          throw new Error(`Endpoint file not found: ${endpoint.file}`);
        }

        // Find related files (simple heuristic)
        const relatedFiles = files
          .filter((f: any) => f.path !== endpoint.file)
          .slice(0, 5);

        // Analyze endpoint
        const response = await fetch('/api/endpoint-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint,
            fileContent: endpointFile.content,
            relatedFiles,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Endpoint analysis failed');
        }

        setAnalysis(data.data);
        sessionStorage.setItem('endpointAnalysis', JSON.stringify(data.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    analyzeEndpoint();
  }, [endpointId]);

  const handleContinue = () => {
    router.push(`/select-language/${endpointId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Analyzing endpoint in detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Go Back
          </button>
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
