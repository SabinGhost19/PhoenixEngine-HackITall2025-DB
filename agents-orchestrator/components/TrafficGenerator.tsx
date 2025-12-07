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
    const logsEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Traffic Generation Agent</h3>
                        <p className="text-sm text-gray-500">
                            Sends requests through Gateway (Shadowing Mode)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {script && !isRunning && (
                        <button
                            onClick={handleRegenerateScript}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Regenerate script"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}

                    {!isRunning ? (
                        <button
                            onClick={handleStartTraffic}
                            disabled={isGenerating}
                            className={`flex items-center px-4 py-2 rounded-lg font-semibold text-white transition-colors ${isGenerating
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Generate Traffic
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleStopTraffic}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            {(isRunning || requestCount > 0) && (
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600 font-medium">Requests Sent</div>
                        <div className="text-2xl font-bold text-blue-700">{requestCount}</div>
                    </div>
                    <div className="flex-1 bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium">Successful</div>
                        <div className="text-2xl font-bold text-green-700">{successCount}</div>
                    </div>
                    <div className="flex-1 bg-purple-50 rounded-lg p-3">
                        <div className="text-xs text-purple-600 font-medium">Service</div>
                        <div className="text-2xl font-bold text-purple-700">{serviceType.toUpperCase()}</div>
                    </div>
                </div>
            )}

            {/* Terminal */}
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-80 overflow-y-auto flex flex-col">
                <div className="flex items-center text-gray-400 mb-2 border-b border-gray-800 pb-2">
                    <Terminal className="w-4 h-4 mr-2" />
                    <span>Agent Terminal Output</span>
                    {isRunning && (
                        <span className="ml-auto flex items-center text-green-400 text-xs">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                            Running
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-1">
                    {logs.length === 0 && (
                        <div className="text-gray-500 italic">
                            Click "Generate Traffic" to start sending requests through the Gateway...
                        </div>
                    )}
                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className={`${log.includes('ERROR') || log.includes('❌') ? 'text-red-400' :
                                    log.includes('SUCCESS') || log.includes('✅') || log.includes('200') || log.includes('201') ? 'text-green-400' :
                                        log.includes('REQUEST') || log.includes('🚀') ? 'text-blue-400' :
                                            log.includes('RESPONSE') || log.includes('📥') ? 'text-yellow-400' :
                                                log.includes('📤') ? 'text-cyan-400' :
                                                    log.includes('─') ? 'text-gray-600' :
                                                        'text-gray-300'
                                }`}
                        >
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>💡 How it works:</strong> Traffic is sent to the Gateway at <code className="bg-blue-100 px-1 rounded">localhost:8082/{serviceType}/transfer</code>.
                    The Gateway forwards each request to both Legacy and Modern services, compares responses,
                    and the Arbiter uses this data to gradually shift traffic (canary deployment).
                </p>
            </div>
        </div>
    );
}
