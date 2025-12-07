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
                <span className="flex items-center gap-1 text-green-500 border border-green-500/30 bg-green-900/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    ONLINE
                </span>
            );
        } else if (status === 'stopped') {
            return (
                <span className="flex items-center gap-1 text-amber-500 border border-amber-500/30 bg-amber-900/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    OFFLINE
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-gray-500 border border-gray-500/30 bg-gray-900/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                UNKNOWN
            </span>
        );
    };

    const formatLog = (log: string, idx: number) => {
        // Colorize based on content
        let className = 'text-amber-500/70';
        if (log.includes('ERROR') || log.includes('❌') || log.includes('FAILED')) {
            className = 'text-red-500';
        } else if (log.includes('✅') || log.includes('SUCCESS') || log.includes('MATCH')) {
            className = 'text-green-500';
        } else if (log.includes('⚠️') || log.includes('WARNING') || log.includes('MISMATCH')) {
            className = 'text-yellow-500';
        } else if (log.includes('📊') || log.includes('🔍') || log.includes('Decision')) {
            className = 'text-blue-400';
        } else if (log.includes('🚀') || log.includes('REQUEST')) {
            className = 'text-cyan-400';
        } else if (log.includes('📈') || log.includes('promote') || log.includes('weight')) {
            className = 'text-purple-400';
        }

        return (
            <div key={idx} className={`${className} font-mono text-xs py-0.5 border-b border-amber-500/10 hover:bg-white/5`}>
                {log}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="box-retro p-8 text-center bg-black/40">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-blue-400 font-mono text-sm animate-pulse">INITIALIZING_SYSTEM_MONITOR...</p>
            </div>
        );
    }

    const arbiterMetrics = data?.arbiter?.metrics?.data || data?.arbiter?.metrics;
    const gatewayMetrics = data?.gateway?.metrics;

    return (
        <div className="space-y-6 font-mono w-full">
            {/* Header with Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" />
                    <h2 className="text-lg font-bold text-blue-500 text-glow">SYSTEM_MONITOR</h2>
                    {autoRefresh && (
                        <span className="text-green-500 text-[10px] px-2 py-1 border border-green-500/30 bg-green-900/20 uppercase tracking-wider animate-pulse">
                            ● LIVE_FEED
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-3 py-2 font-bold text-xs uppercase tracking-wider border transition-all ${autoRefresh
                            ? 'border-red-500 text-red-500 hover:bg-red-900/20'
                            : 'border-green-500 text-green-500 hover:bg-green-900/20'
                            }`}
                    >
                        {autoRefresh ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {autoRefresh ? 'STOP_FEED' : 'START_FEED'}
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2 text-amber-500/50 hover:text-amber-500 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/30 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="border border-red-500/30 bg-red-900/10 p-4 flex items-center gap-2 text-red-500 text-sm">
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
                    <div key={service.key} className="box-retro p-3 bg-black/40 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <service.icon className="w-4 h-4 text-amber-500/50" />
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{service.name}</span>
                        </div>
                        {getStatusBadge((data as any)?.[service.key]?.status || 'not_found')}
                        <p className="text-[10px] text-amber-500/40 mt-1 font-mono">PORT:{service.port}</p>
                    </div>
                ))}
            </div>

            {/* Arbiter Metrics */}
            {arbiterMetrics && (
                <div className="box-retro p-6 bg-black/40">
                    <h3 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2 text-glow border-b border-amber-500/20 pb-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        MIGRATION_PROGRESS (ARBITER)
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-900/10 border border-blue-500/30 p-4">
                            <div className="text-3xl font-bold text-blue-400 text-glow">
                                {(arbiterMetrics.consistency_score || 0).toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-blue-500/70 uppercase tracking-wider mt-1">Consistency Score</div>
                        </div>
                        <div className="bg-green-900/10 border border-green-500/30 p-4">
                            <div className="text-3xl font-bold text-green-400 text-glow">
                                {((arbiterMetrics.php_weight || 0) * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-green-500/70 uppercase tracking-wider mt-1">Modern Weight</div>
                        </div>
                        <div className="bg-purple-900/10 border border-purple-500/30 p-4">
                            <div className="text-3xl font-bold text-purple-400 text-glow">
                                {arbiterMetrics.matched_transactions || 0}/{arbiterMetrics.total_transactions || 0}
                            </div>
                            <div className="text-[10px] text-purple-500/70 uppercase tracking-wider mt-1">Matched/Total</div>
                        </div>
                        <div className="bg-amber-900/10 border border-amber-500/30 p-4">
                            <div className="text-xl font-bold text-amber-500 uppercase tracking-wider">
                                {arbiterMetrics.migration_status || 'pending'}
                            </div>
                            <div className="text-[10px] text-amber-500/70 uppercase tracking-wider mt-1">Status</div>
                            {arbiterMetrics.last_decision && (
                                <div className="text-[10px] text-amber-500/50 mt-1 border-t border-amber-500/20 pt-1">
                                    LAST: {arbiterMetrics.last_decision}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-amber-500/70 mb-2 uppercase tracking-wider">
                            <span>Migration_Progress</span>
                            <span>{((arbiterMetrics.php_weight || 0) * 100).toFixed(0)}% &rarr; Modern</span>
                        </div>
                        <div className="h-4 bg-black border border-amber-500/30 p-0.5 relative overflow-hidden">
                            {/* Scanlines for progress bar */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-500 relative z-0"
                                style={{ width: `${(arbiterMetrics.php_weight || 0) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-amber-500/40 mt-1 uppercase">
                            <span>Legacy (PHP)</span>
                            <span>Modern (Go)</span>
                        </div>
                    </div>

                    {/* Decision Thresholds */}
                    <div className="border border-amber-500/20 bg-amber-900/5 p-3 text-xs font-mono">
                        <div className="flex items-center gap-4 text-amber-500/70">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>PROMOTE: &ge;99%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-500" />
                                <span>ROLLBACK: &lt;95%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span>INTERVAL: 10s</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Logs */}
            <div className="box-retro p-0 overflow-hidden bg-black relative">
                {/* Scanlines overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

                <div className="bg-black/80 px-4 py-3 flex items-center justify-between border-b border-amber-500/30 relative z-20">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-bold text-xs uppercase tracking-wider text-glow">Live_Container_Logs</span>
                    </div>
                    <div className="flex gap-1">
                        {(['gateway', 'arbiter', 'legacy', 'modern'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveLogTab(tab)}
                                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold transition-all border ${activeLogTab === tab
                                    ? 'border-blue-500 text-blue-500 bg-blue-900/20'
                                    : 'border-transparent text-amber-500/40 hover:text-amber-500 hover:border-amber-500/30'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-80 overflow-y-auto p-4 bg-black font-mono text-xs relative z-0">
                    {data && (data as any)[activeLogTab]?.logs?.length > 0 ? (
                        <div>
                            {(data as any)[activeLogTab].logs.map(formatLog)}
                            <div ref={logsEndRef} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-amber-500/30">
                            <div className="text-center">
                                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="uppercase tracking-widest">NO_LOGS_AVAILABLE</p>
                                <p className="text-[10px] mt-1 opacity-50">Target: {activeLogTab}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-black px-4 py-2 border-t border-amber-500/30 flex justify-between text-[10px] text-amber-500/40 uppercase tracking-wider relative z-20">
                    <span>
                        {(data as any)?.[activeLogTab]?.logs?.length || 0} LINES
                    </span>
                    <span>
                        LAST_UPDATE: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'NEVER'}
                    </span>
                </div>
            </div>
        </div>
    );
}
