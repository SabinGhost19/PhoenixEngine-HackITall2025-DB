'use client';

import { useState, useEffect, useRef } from 'react';
import {
    RefreshCw, Play, Pause, Server, Activity, Database,
    MessageSquare, CheckCircle, XCircle, AlertTriangle,
    TrendingUp, Clock, Zap
} from 'lucide-react';

interface ContainerData {
    status: string;
    logs: string[];
    metrics?: any;
}

interface SystemData {
    timestamp: string;
    gateway: ContainerData;
    arbiter: ContainerData;
    kafka: { status: string; logs: string[] };
    redis: { status: string };
    legacy: ContainerData;
    modern: ContainerData;
}

export default function SystemMonitorDashboard() {
    const [data, setData] = useState<SystemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLogTab, setActiveLogTab] = useState<'gateway' | 'arbiter' | 'legacy' | 'modern'>('gateway');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(fetchData, 2000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh]);

    useEffect(() => {
        if (autoRefresh) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [data, autoRefresh]);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/logs?service=all&tail=50');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (e) {
            setError('Failed to fetch system data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'running') {
            return (
                <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Running
                </span>
            );
        } else if (status === 'stopped') {
            return (
                <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Stopped
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Not Found
            </span>
        );
    };

    const formatLog = (log: string, idx: number) => {
        // Colorize based on content
        let className = 'text-gray-300';
        if (log.includes('ERROR') || log.includes('❌') || log.includes('FAILED')) {
            className = 'text-red-400';
        } else if (log.includes('✅') || log.includes('SUCCESS') || log.includes('MATCH')) {
            className = 'text-green-400';
        } else if (log.includes('⚠️') || log.includes('WARNING') || log.includes('MISMATCH')) {
            className = 'text-yellow-400';
        } else if (log.includes('📊') || log.includes('🔍') || log.includes('Decision')) {
            className = 'text-blue-400';
        } else if (log.includes('🚀') || log.includes('REQUEST')) {
            className = 'text-cyan-400';
        } else if (log.includes('📈') || log.includes('promote') || log.includes('weight')) {
            className = 'text-purple-400';
        }

        return (
            <div key={idx} className={`${className} font-mono text-xs py-0.5 border-b border-gray-800`}>
                {log}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Loading system data...</p>
            </div>
        );
    }

    const arbiterMetrics = data?.arbiter?.metrics?.data || data?.arbiter?.metrics;
    const gatewayMetrics = data?.gateway?.metrics;

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">System Monitor</h2>
                        {autoRefresh && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full animate-pulse">
                                ● Live
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${autoRefresh
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {autoRefresh ? 'Stop' : 'Start'} Live
                        </button>
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Services Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { name: 'Gateway', key: 'gateway', icon: Server, port: '8082' },
                    { name: 'Arbiter', key: 'arbiter', icon: Activity, port: '5000' },
                    { name: 'Kafka', key: 'kafka', icon: MessageSquare, port: '9092' },
                    { name: 'Redis', key: 'redis', icon: Database, port: '6379' },
                    { name: 'Legacy PHP', key: 'legacy', icon: Server, port: '8080' },
                    { name: 'Modern Go', key: 'modern', icon: Zap, port: '8081' },
                ].map(service => (
                    <div key={service.key} className="bg-white rounded-lg shadow p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <service.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{service.name}</span>
                        </div>
                        {getStatusBadge((data as any)?.[service.key]?.status || 'not_found')}
                        <p className="text-xs text-gray-400 mt-1">:{service.port}</p>
                    </div>
                ))}
            </div>

            {/* Arbiter Metrics */}
            {arbiterMetrics && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Migration Progress (Arbiter)
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600">
                                {(arbiterMetrics.consistency_score || 0).toFixed(1)}%
                            </div>
                            <div className="text-sm text-blue-700">Consistency Score</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-green-600">
                                {((arbiterMetrics.php_weight || 0) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-green-700">Modern Weight</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-purple-600">
                                {arbiterMetrics.matched_transactions || 0}/{arbiterMetrics.total_transactions || 0}
                            </div>
                            <div className="text-sm text-purple-700">Matched/Total</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xl font-bold text-gray-700 capitalize">
                                {arbiterMetrics.migration_status || 'pending'}
                            </div>
                            <div className="text-sm text-gray-600">Status</div>
                            {arbiterMetrics.last_decision && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Last: {arbiterMetrics.last_decision}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Migration Progress</span>
                            <span>{((arbiterMetrics.php_weight || 0) * 100).toFixed(0)}% → Modern</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                style={{ width: `${(arbiterMetrics.php_weight || 0) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Legacy (PHP)</span>
                            <span>Modern (Go)</span>
                        </div>
                    </div>

                    {/* Decision Thresholds */}
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Promote: ≥99% consistency</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>Rollback: &lt;95% consistency</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Check every 10s</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Logs */}
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-semibold">Container Logs (Real-time)</span>
                    </div>
                    <div className="flex gap-1">
                        {(['gateway', 'arbiter', 'legacy', 'modern'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveLogTab(tab)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeLogTab === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-80 overflow-y-auto p-4 bg-gray-950">
                    {data && (data as any)[activeLogTab]?.logs?.length > 0 ? (
                        <div>
                            {(data as any)[activeLogTab].logs.map(formatLog)}
                            <div ref={logsEndRef} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No logs available for {activeLogTab}</p>
                                <p className="text-xs mt-1">Container may not be running</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex justify-between text-xs text-gray-400">
                    <span>
                        {(data as any)?.[activeLogTab]?.logs?.length || 0} log lines
                    </span>
                    <span>
                        Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Never'}
                    </span>
                </div>
            </div>
        </div>
    );
}
