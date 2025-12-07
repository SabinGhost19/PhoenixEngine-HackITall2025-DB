'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Trash2, Play, Pause, Server } from 'lucide-react';

interface GatewayLogsProps {
    refreshInterval?: number;
}

interface LogEntry {
    timestamp: string;
    type: 'request' | 'response' | 'info' | 'error' | 'decision';
    message: string;
}

export default function GatewayLogsPanel({ refreshInterval = 2000 }: GatewayLogsProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [gatewayStatus, setGatewayStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const logsEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isStreaming) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isStreaming]);

    // Check gateway status
    useEffect(() => {
        checkGatewayStatus();
    }, []);

    const checkGatewayStatus = async () => {
        try {
            const response = await fetch('/api/gateway/status');
            const data = await response.json();
            if (data.success) {
                setGatewayStatus('connected');
                addLog('info', `Gateway connected - PHP weight: ${(data.phpWeight * 100).toFixed(0)}%, Traffic locked: ${data.trafficLocked}`);
            } else {
                setGatewayStatus('disconnected');
            }
        } catch {
            setGatewayStatus('disconnected');
            addLog('error', 'Cannot connect to Gateway');
        }
    };

    const addLog = (type: LogEntry['type'], message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-100), { timestamp, type, message }]); // Keep last 100
    };

    const startStreaming = () => {
        setIsStreaming(true);
        addLog('info', '🔄 Started streaming Gateway status...');

        intervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('/api/gateway/status');
                const data = await response.json();

                if (data.success) {
                    setGatewayStatus('connected');

                    // Log weight changes
                    addLog('info', `📊 PHP: ${(data.phpWeight * 100).toFixed(0)}% | Python: ${(data.pythonWeight * 100).toFixed(0)}% | Locked: ${data.trafficLocked}`);
                }
            } catch {
                setGatewayStatus('disconnected');
            }
        }, refreshInterval);
    };

    const stopStreaming = () => {
        setIsStreaming(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        addLog('info', '⏹️ Stopped streaming');
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'request': return 'text-blue-400';
            case 'response': return 'text-green-400';
            case 'info': return 'text-gray-400';
            case 'error': return 'text-red-400';
            case 'decision': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getLogIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'request': return '🚀';
            case 'response': return '📥';
            case 'info': return 'ℹ️';
            case 'error': return '❌';
            case 'decision': return '🧠';
            default: return '•';
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Gateway Monitor</h3>
                    <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${gatewayStatus === 'connected'
                            ? 'bg-green-500/20 text-green-400'
                            : gatewayStatus === 'disconnected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                        }
                    `}>
                        {gatewayStatus === 'connected' ? '● Connected' :
                            gatewayStatus === 'disconnected' ? '○ Disconnected' :
                                '◐ Checking...'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isStreaming ? (
                        <button
                            onClick={stopStreaming}
                            className="p-2 text-yellow-400 hover:bg-gray-700 rounded"
                            title="Stop streaming"
                        >
                            <Pause className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={startStreaming}
                            className="p-2 text-green-400 hover:bg-gray-700 rounded"
                            title="Start streaming"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={checkGatewayStatus}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Refresh status"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={clearLogs}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Clear logs"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="h-64 overflow-y-auto p-4 font-mono text-sm">
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No logs yet. Click Play to start streaming.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, idx) => (
                            <div key={idx} className={`${getLogColor(log.type)}`}>
                                <span className="text-gray-600">[{log.timestamp}]</span>{' '}
                                <span>{getLogIcon(log.type)}</span>{' '}
                                <span>{log.message}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
                <span>
                    {logs.length} log entries
                    {isStreaming && <span className="ml-2 text-green-400">● Live</span>}
                </span>
                <span>Gateway: localhost:8082</span>
            </div>
        </div>
    );
}
