'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EndpointTable from '@/components/endpoint/EndpointTable';
import { Architecture, Endpoint } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!uploadId) {
      setError('Upload ID missing');
      setLoading(false);
      return;
    }

    const analyzeArchitecture = async () => {
      try {
        // Get uploaded files
        const filesResponse = await fetch(`/api/upload?uploadId=${uploadId}`);
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
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Architecture analysis failed');
        }

        setArchitecture(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    analyzeArchitecture();
  }, [uploadId]);

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
            onClick={() => router.push('/upload')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Try Again
          </button>
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
