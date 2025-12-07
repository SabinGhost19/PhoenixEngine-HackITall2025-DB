'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EndpointInspector from '@/components/endpoint/EndpointInspector';
import { EndpointAnalysis, Endpoint } from '@/lib/schemas';
import { ArrowRight, AlertTriangle, RefreshCw, Terminal, FileCode, Activity, Layers, ChevronLeft, Box } from 'lucide-react';
import RetroLoader from '@/components/retro/RetroLoader';
import RetroDockerContainer from '@/components/retro/RetroDockerContainer';

export default function EndpointPage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [analysis, setAnalysis] = useState<EndpointAnalysis | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [typingText, setTypingText] = useState('');

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

  // Typing effect for summary
  useEffect(() => {
    if (analysis?.businessLogic.summary) {
      let i = 0;
      const text = analysis.businessLogic.summary;
      const interval = setInterval(() => {
        setTypingText(text.substring(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 10); // Fast typing
      return () => clearInterval(interval);
    }
  }, [analysis]);

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <RetroLoader text="DECRYPTING_ENDPOINT_LOGIC..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="box-retro p-8 max-w-md w-full border-red-500/50">
          <div className={`flex items-center mb-6 ${isNetworkError ? 'text-yellow-500' : 'text-red-500'}`}>
            <AlertTriangle className="w-8 h-8 mr-3 animate-pulse" />
            <h2 className="text-xl font-bold tracking-widest">ANALYSIS_FAILURE</h2>
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
              onClick={handleRetry}
              className="flex-1 btn-retro text-sm py-2 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RETRY_SEQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-amber-500/20 rounded-full transition-colors text-amber-500"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="text-xs text-amber-500/50 mb-1">TARGET_ENDPOINT</div>
              <h1 className="text-2xl font-bold text-glow flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                {endpointId.toUpperCase()}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-amber-500/50">SYSTEM_STATUS</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-blink"></div>
                <div className="text-green-500 font-bold">ANALYSIS_COMPLETE</div>
              </div>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Metrics & Info */}
            <div className="space-y-6">
              <div className="box-retro p-6 animate-in slide-in-from-left-4 duration-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <Activity className="w-5 h-5" /> VITAL_STATISTICS
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500/70">COMPLEXITY_LEVEL</span>
                    <span className="text-xl font-bold text-glow uppercase">{analysis.businessLogic.complexity}</span>
                  </div>
                  <div className="w-full bg-amber-900/20 h-2 rounded-full overflow-hidden border border-amber-500/30">
                    <div
                      className="h-full bg-amber-500 transition-all duration-[2000ms] ease-out w-0 animate-[width_2s_ease-out_forwards]"
                      style={{
                        width: analysis.businessLogic.complexity === 'high' ? '90%' :
                          analysis.businessLogic.complexity === 'medium' ? '60%' : '30%'
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-amber-900/10 p-3 border border-amber-500/20 hover:bg-amber-900/30 transition-colors group">
                      <div className="text-xs text-amber-500/50 group-hover:text-amber-400">DEPENDENCIES</div>
                      <div className="text-lg font-bold group-hover:text-glow">{analysis.dependencies.length}</div>
                    </div>
                    <div className="bg-amber-900/10 p-3 border border-amber-500/20 hover:bg-amber-900/30 transition-colors group">
                      <div className="text-xs text-amber-500/50 group-hover:text-amber-400">DB_OPS</div>
                      <div className="text-lg font-bold group-hover:text-glow">{analysis.databaseOperations.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="box-retro p-6 animate-in slide-in-from-left-4 duration-700 delay-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <Layers className="w-5 h-5" /> DEPENDENCY_GRAPH
                </h3>
                <ul className="space-y-2 text-sm">
                  {analysis.dependencies.map((dep, i) => (
                    <li key={i} className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 transition-colors cursor-default">
                      <span className={`w-1.5 h-1.5 rounded-full ${dep.critical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <span className="font-bold">[{dep.type.toUpperCase()}]</span> {dep.name}
                    </li>
                  ))}
                  {analysis.dependencies.length === 0 && (
                    <li className="text-amber-500/40 italic">NO_EXTERNAL_DEPENDENCIES</li>
                  )}
                </ul>
              </div>

              {/* Retro Docker Container Placement */}
              <div className="flex justify-center pt-24 pb-8 animate-in fade-in duration-1000 delay-500">
                <RetroDockerContainer />
              </div>
            </div>

            {/* Right Column: Source & Logic */}
            <div className="lg:col-span-2 space-y-6">
              <div className="box-retro p-6 min-h-[400px] animate-in slide-in-from-right-4 duration-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <FileCode className="w-5 h-5" /> LOGIC_EXTRACTION
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-amber-500/70 mb-2">[BUSINESS_LOGIC_SUMMARY]</h4>
                    <p className="text-amber-500/90 leading-relaxed border-l-2 border-amber-500/30 pl-4 min-h-[80px]">
                      {typingText}
                      <span className="animate-pulse">_</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-amber-500/70 mb-2">[EXECUTION_STEPS]</h4>
                    <div className="grid gap-3">
                      {analysis.businessLogic.steps.map((step, i) => (
                        <div
                          key={i}
                          className="bg-amber-900/10 p-3 border border-amber-500/20 flex items-start gap-2 hover:bg-amber-900/20 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <span className="text-amber-500/50 font-mono min-w-[24px]">0{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full btn-retro text-xl py-6 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  INITIATE_GENERATION_SEQUENCE
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
