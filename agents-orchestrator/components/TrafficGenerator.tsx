'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Terminal, Loader2, Activity } from 'lucide-react';
import { EndpointAnalysis } from '@/lib/schemas';

interface TrafficGeneratorProps {
    endpointAnalysis: EndpointAnalysis;
    migrationId: string;
}

export default function TrafficGenerator({ endpointAnalysis, migrationId }: TrafficGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [script, setScript] = useState<string | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleStartTraffic = async () => {
        try {
            setIsGenerating(true);
            setLogs(['Initializing Traffic Agent...', 'Analyzing endpoints...']);

            // 1. Generate Script (if not already generated)
            let currentScript = script;
            if (!currentScript) {
                const response = await fetch('/api/traffic/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpointAnalysis,
                        serviceUrl: `http://localhost:8080`, // Assuming default port for now, ideally passed from deployment
                    }),
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error);
                }

                currentScript = data.data.scriptContent;
                setScript(currentScript);
                setLogs(prev => [...prev, '✅ Traffic script generated successfully!', '🚀 Starting traffic generation...']);
            } else {
                setLogs(prev => [...prev, '🚀 Restarting traffic generation...']);
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
            setLogs(prev => [...prev, '🏁 Traffic generation stopped.']);

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
            setLogs(prev => [...prev, '🛑 Stopping traffic...']);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Traffic Generation Agent</h3>
                        <p className="text-sm text-gray-500">AI-powered traffic simulation based on endpoint analysis</p>
                    </div>
                </div>

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
                                Generating Agent...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Traffic Agent
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleStopTraffic}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Square className="w-4 h-4 mr-2" />
                        Stop Traffic
                    </button>
                )}
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto flex flex-col">
                <div className="flex items-center text-gray-400 mb-2 border-b border-gray-800 pb-2">
                    <Terminal className="w-4 h-4 mr-2" />
                    <span>Agent Terminal Output</span>
                </div>

                <div className="flex-1 space-y-1">
                    {logs.length === 0 && (
                        <div className="text-gray-500 italic">Ready to generate traffic...</div>
                    )}
                    {logs.map((log, index) => (
                        <div key={index} className={`${log.includes('ERROR') || log.includes('❌') ? 'text-red-400' :
                                log.includes('SUCCESS') || log.includes('✅') ? 'text-green-400' :
                                    log.includes('INFO') || log.includes('🚀') ? 'text-blue-400' :
                                        'text-gray-300'
                            }`}>
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}
