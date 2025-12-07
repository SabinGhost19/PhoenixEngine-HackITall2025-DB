'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Terminal, Loader2, Activity, Zap, RefreshCw } from 'lucide-react';
import { EndpointAnalysis } from '@/lib/schemas';

interface TrafficGeneratorProps {
    endpointAnalysis: EndpointAnalysis;
    migrationId: string;
    serviceType?: 'php' | 'python';
}

export default function TrafficGenerator({
    endpointAnalysis,
    migrationId,
    serviceType = 'php'
}: TrafficGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [script, setScript] = useState<string | null>(null);
    const [requestCount, setRequestCount] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const terminalRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom of logs (internal scroll only)
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Parse logs to count requests
    useEffect(() => {
        const requestLogs = logs.filter(log => log.includes('REQUEST #') || log.includes('🚀 REQUEST'));
        const successLogs = logs.filter(log => log.includes('200') || log.includes('201'));
        setRequestCount(requestLogs.length);
        setSuccessCount(successLogs.length);
    }, [logs]);

    const handleStartTraffic = async () => {
        try {
            setIsGenerating(true);
            setLogs([
                '🔧 Initializing Traffic Generation Agent...',
                `📍 Target: Gateway → ${serviceType.toUpperCase()} service`,
                '🔄 Mode: Shadowing (requests go to both Legacy & Modern)',
                '⏳ Generating AI-powered traffic script...'
            ]);

            // 1. Generate Script (if not already generated)
            let currentScript = script;
            if (!currentScript) {
                const response = await fetch('/api/traffic/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpointAnalysis,
                        serviceType,
                        mode: 'shadowing'
                    }),
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error);
                }

                currentScript = data.data.scriptContent;
                setScript(currentScript);
                setLogs(prev => [...prev,
                    '✅ Traffic script generated successfully!',
                    '📊 Will send 20 requests through Gateway',
                    '🚀 Starting traffic generation...',
                '─'.repeat(50)
                ]);
            } else {
                setLogs(prev => [...prev, '🔄 Reusing existing script...', '🚀 Restarting traffic...']);
            }

            setIsGenerating(false);
            setIsRunning(true);

            // 2. Run Script and Stream Logs
            abortControllerRef.current = new AbortController();

            const runResponse = await fetch('/api/traffic/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptContent: currentScript }),
                signal: abortControllerRef.current.signal,
            });

            if (!runResponse.body) return;

            const reader = runResponse.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n').filter(line => line.trim());
                setLogs(prev => [...prev, ...lines]);
            }

            setIsRunning(false);
            setLogs(prev => [...prev,
            '─'.repeat(50),
                '🏁 Traffic generation completed!',
                '📈 Check Migration Progress Panel for Arbiter decisions'
            ]);

        } catch (error) {
            console.error('Traffic generation error:', error);
            setLogs(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : String(error)}`]);
            setIsGenerating(false);
            setIsRunning(false);
        }
    };

    const handleStopTraffic = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsRunning(false);
            setLogs(prev => [...prev, '🛑 Traffic generation stopped by user.']);
        }
    };

    const handleRegenerateScript = () => {
        setScript(null);
        setLogs([]);
        setRequestCount(0);
        setSuccessCount(0);
    };

    return (
        <div className="w-full font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="p-2 border border-purple-500/30 bg-purple-900/20 rounded mr-3">
                        <Activity className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-purple-500 text-glow">TRAFFIC_GENERATION_AGENT</h3>
                        <p className="text-xs text-purple-500/60 uppercase tracking-wider">
                            Shadowing Mode Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {script && !isRunning && (
                        <button
                            onClick={handleRegenerateScript}
                            className="p-2 text-amber-500/50 hover:text-amber-500 hover:bg-amber-900/20 rounded transition-colors"
                            title="Regenerate script"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}

                    {!isRunning ? (
                        <button
                            onClick={handleStartTraffic}
                            disabled={isGenerating}
                            className={`flex items-center px-4 py-2 font-bold text-sm transition-all border ${isGenerating
                                ? 'border-gray-700 text-gray-700 bg-gray-900/50 cursor-not-allowed'
                                : 'btn-retro border-purple-500 text-purple-500 hover:bg-purple-500/10'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    INITIALIZING...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    GENERATE_TRAFFIC
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleStopTraffic}
                            className="flex items-center px-4 py-2 border border-red-500 text-red-500 hover:bg-red-900/20 font-bold text-sm transition-colors"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            ABORT_SEQUENCE
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            {(isRunning || requestCount > 0) && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-900/10 border border-blue-500/30 p-3">
                        <div className="text-[10px] text-blue-500/70 uppercase mb-1">Requests Sent</div>
                        <div className="text-2xl font-bold text-blue-400 text-glow">{requestCount}</div>
                    </div>
                    <div className="bg-green-900/10 border border-green-500/30 p-3">
                        <div className="text-[10px] text-green-500/70 uppercase mb-1">Successful</div>
                        <div className="text-2xl font-bold text-green-400 text-glow">{successCount}</div>
                    </div>
                    <div className="bg-purple-900/10 border border-purple-500/30 p-3">
                        <div className="text-[10px] text-purple-500/70 uppercase mb-1">Service</div>
                        <div className="text-2xl font-bold text-purple-400 text-glow">{serviceType.toUpperCase()}</div>
                    </div>
                </div>
            )}

            {/* Terminal */}
            <div
                ref={terminalRef}
                className="bg-black border border-amber-500/20 p-4 font-mono text-xs h-80 overflow-y-auto flex flex-col relative"
            >
                {/* Scanlines overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

                <div className="flex items-center text-amber-500/50 mb-2 border-b border-amber-500/20 pb-2 sticky top-0 bg-black z-20">
                    <Terminal className="w-3 h-3 mr-2" />
                    <span className="uppercase tracking-widest">Agent_Terminal_Output</span>
                    {isRunning && (
                        <span className="ml-auto flex items-center text-green-500 text-[10px]">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
                            LIVE_FEED
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-1 relative z-0">
                    {logs.length === 0 && (
                        <div className="text-amber-500/30 italic mt-4 text-center">
                            // AWAITING_TRAFFIC_INITIATION...
                        </div>
                    )}
                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className={`${log.includes('ERROR') || log.includes('❌') ? 'text-red-500' :
                                log.includes('SUCCESS') || log.includes('✅') || log.includes('200') || log.includes('201') ? 'text-green-500' :
                                    log.includes('REQUEST') || log.includes('🚀') ? 'text-blue-400' :
                                        log.includes('RESPONSE') || log.includes('📥') ? 'text-yellow-500' :
                                            log.includes('📤') ? 'text-cyan-400' :
                                                log.includes('─') ? 'text-amber-500/20' :
                                                    'text-amber-500/80'
                                }`}
                        >
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 border border-blue-500/30 bg-blue-900/10 text-xs text-blue-400/80 font-mono">
                <strong className="text-blue-400 uppercase mr-2">System_Note:</strong>
                Traffic is routed via Gateway (<code className="bg-blue-900/30 px-1 text-blue-300">localhost:8082/{serviceType}/transfer</code>).
                Requests are shadowed to both Legacy & Modern services for real-time comparison by the Arbiter.
            </div>
        </div>
    );
}
