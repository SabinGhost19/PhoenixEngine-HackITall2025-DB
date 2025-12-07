'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EndpointTable from '@/components/endpoint/EndpointTable';
import { Architecture, Endpoint } from '@/lib/schemas';
import { Loader2, AlertTriangle, RefreshCw, Terminal, Cpu, Database, Network } from 'lucide-react';
import RetroArchitectureDiagram from '@/components/retro/RetroArchitectureDiagram';

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
  const [scanLog, setScanLog] = useState<string[]>([]);

  // Prevent duplicate executions
  const analysisKey = `scan_started_${uploadId}`;
  const resultKey = `scan_result_${uploadId}`;

  // Simulated scan logs
  useEffect(() => {
    if (loading) {
      const logs = [
        "INITIALIZING_SCANNER...",
        "MOUNTING_FILE_SYSTEM...",
        "PARSING_PHP_AST...",
        "TRACING_DEPENDENCIES...",
        "DETECTING_ENDPOINTS...",
        "ANALYZING_COMPLEXITY...",
        "GENERATING_REPORT..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < logs.length) {
          setScanLog(prev => [...prev, logs[i]]);
          i++;
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

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
    setScanLog([]);
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="box-retro p-8 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6 border-b border-amber-500/30 pb-4">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <h2 className="text-xl font-bold text-glow">SYSTEM_SCANNING_IN_PROGRESS</h2>
          </div>

          <div className="space-y-2 font-mono text-sm h-48 overflow-hidden relative">
            {scanLog.map((log, i) => (
              <div key={i} className="text-amber-500/80">
                <span className="text-amber-500/40 mr-2">[{new Date().toLocaleTimeString()}]</span>
                &gt; {log}
              </div>
            ))}
            <div className="animate-pulse text-amber-500">_</div>

            {/* Scanline overlay for log area */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          </div>

          <div className="mt-6 w-full bg-amber-900/20 h-2 border border-amber-500/30">
            <div className="h-full bg-amber-500 animate-[width_2s_ease-in-out_infinite] w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="box-retro p-8 max-w-md w-full border-red-500/50">
          <div className={`flex items-center mb-6 ${isNetworkError ? 'text-yellow-500' : 'text-red-500'}`}>
            <AlertTriangle className="w-8 h-8 mr-3 animate-pulse" />
            <h2 className="text-xl font-bold tracking-widest">SYSTEM_ERROR</h2>
          </div>
          <p className="text-amber-500/80 mb-8 font-mono border-l-2 border-red-500/50 pl-4 py-2 bg-red-900/10">
            {error}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/upload')}
              className="flex-1 btn-retro text-sm py-2"
            >
              ABORT
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 btn-retro text-sm py-2 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RETRY
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {architecture && (
          <>
            <div className="box-retro p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-amber-500/30 pb-4 gap-4">
                <div>
                  <div className="text-xs text-amber-500/50 font-mono mb-1">PROJECT_ID: {uploadId?.split('-')[1]}</div>
                  <h1 className="text-3xl font-bold text-glow tracking-tight">
                    {architecture.projectName.toUpperCase()}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 border border-green-500/50 text-green-500 text-xs font-bold bg-green-900/10">
                    STATUS: ANALYZED
                  </span>
                </div>
              </div>

              <p className="text-amber-500/80 mb-8 font-mono max-w-3xl">
                &gt; {architecture.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-amber-500/20 p-4 bg-amber-900/5 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-amber-500/70 text-sm font-bold">
                    <Cpu className="w-4 h-4" /> TECH_STACK
                  </div>
                  <div className="text-xl font-bold text-glow">
                    {architecture.technologies.join(', ')}
                  </div>
                </div>
                <div className="border border-amber-500/20 p-4 bg-amber-900/5 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-amber-500/70 text-sm font-bold">
                    <Network className="w-4 h-4" /> ENDPOINTS_DETECTED
                  </div>
                  <div className="text-xl font-bold text-glow">
                    {architecture.endpoints.length}
                  </div>
                </div>
                <div className="border border-amber-500/20 p-4 bg-amber-900/5 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-amber-500/70 text-sm font-bold">
                    <Database className="w-4 h-4" /> CONTROLLERS
                  </div>
                  <div className="text-xl font-bold text-glow">
                    {architecture.structure.controllers.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Retro Architecture Diagram */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <RetroArchitectureDiagram />
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
    </div>}>
      <ScanContent />
    </Suspense>
  );
}
