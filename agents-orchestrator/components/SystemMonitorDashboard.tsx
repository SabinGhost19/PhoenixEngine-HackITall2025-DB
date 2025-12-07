'use client';

import { useState, useEffect, useRef } from 'react';
import {
    RefreshCw, Play, Pause, Server, Activity, Database,
    MessageSquare, CheckCircle, XCircle, AlertTriangle,
    TrendingUp, Clock, Zap, Grid, Layout, Terminal, Shield
} from 'lucide-react';
import TrafficFlowVisualizer from './retro/TrafficFlowVisualizer';

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
    const [viewMode, setViewMode] = useState<'tabbed' | 'grid'>('grid'); // Default to Grid
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
        if (autoRefresh && viewMode === 'tabbed') {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [data, autoRefresh, viewMode]);

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
                <span className="flex items-center gap-1 text-green-400 font-bold text-[10px] uppercase tracking-wider">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime]" />
                    ONLINE
                </span>
            );
        } else if (status === 'stopped') {
            return (
                <span className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    OFFLINE
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                <span className="w-2 h-2 bg-gray-500 rounded-full" />
                UNKNOWN
            </span>
        );
    };

    const formatLog = (log: string, idx: number) => {
        let className = 'text-gray-400';
        if (log.includes('ERROR') || log.includes('❌') || log.includes('FAILED')) className = 'text-red-400 font-bold';
        else if (log.includes('✅') || log.includes('SUCCESS') || log.includes('MATCH')) className = 'text-green-400';
        else if (log.includes('⚠️') || log.includes('WARNING') || log.includes('MISMATCH')) className = 'text-yellow-400';
        else if (log.includes('📊') || log.includes('🔍') || log.includes('Decision')) className = 'text-blue-400';
        else if (log.includes('🚀') || log.includes('REQUEST')) className = 'text-cyan-400';
        else if (log.includes('📈') || log.includes('promote') || log.includes('weight')) className = 'text-purple-400';

        return (
            <div key={idx} className={`${className} font-mono text-[10px] py-0.5 border-b border-white/5 hover:bg-white/5 whitespace-pre-wrap break-all`}>
                <span className="opacity-30 mr-2">{idx.toString().padStart(3, '0')}</span>
                {log}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="box-retro p-12 text-center bg-black/80 backdrop-blur-md">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-blue-400 font-mono text-lg animate-pulse tracking-widest">INITIALIZING_COMMAND_CENTER...</p>
            </div>
        );
    }

    const arbiterMetrics = data?.arbiter?.metrics?.data || data?.arbiter?.metrics;

    return (
        <div className="w-full font-mono relative min-h-screen bg-[#050505]">
            {/* Background "Granular Graph" Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-900/10 to-transparent" />
                {/* SVG Graph Pattern */}
                <svg className="absolute bottom-0 left-0 w-full h-48 opacity-20" preserveAspectRatio="none">
                    <path d="M0,100 Q200,50 400,100 T800,100 T1200,50 V200 H0 Z" fill="url(#grad1)" className="animate-pulse" style={{ animationDuration: '5s' }} />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="relative z-10 p-6 max-w-[1600px] mx-auto">

                {/* Header / Command Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                            <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">TRAFFIC_&_MONITORING</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                SYSTEM_OPERATIONAL
                                <span className="mx-2">|</span>
                                UPTIME: 99.9%
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setViewMode(viewMode === 'tabbed' ? 'grid' : 'tabbed')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded transition-all ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                            GRID_VIEW
                        </button>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded transition-all ${autoRefresh
                                ? 'bg-red-900/20 text-red-400 border-red-500/50 hover:bg-red-900/40'
                                : 'bg-green-900/20 text-green-400 border-green-500/50 hover:bg-green-900/40'
                                }`}
                        >
                            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {autoRefresh ? 'PAUSE_FEED' : 'RESUME_FEED'}
                        </button>
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded hover:bg-white/5 transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Top Section: Visualization & Metrics */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* 3D Traffic Visualizer (Takes up 2 cols) */}
                    <div className="lg:col-span-2">
                        <TrafficFlowVisualizer metrics={{
                            php_weight: 1 - (arbiterMetrics?.php_weight || 1), // Invert for modern weight
                            modern_weight: arbiterMetrics?.php_weight || 0,
                            total_requests: arbiterMetrics?.total_transactions || 0,
                            consistency: arbiterMetrics?.consistency_score || 100
                        }} />
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="space-y-4">
                        {/* Consistency Score Card */}
                        <div className="bg-black/40 border border-blue-500/30 rounded-lg p-5 relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="w-16 h-16 text-blue-500" />
                            </div>
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Consistency Score</h3>
                            <div className="text-4xl font-bold text-white mb-2">
                                {(arbiterMetrics?.consistency_score || 0).toFixed(1)}<span className="text-lg text-gray-500">%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${arbiterMetrics?.consistency_score || 0}%` }} />
                            </div>
                        </div>

                        {/* Traffic Split Card */}
                        <div className="bg-black/40 border border-green-500/30 rounded-lg p-5 relative overflow-hidden group hover:border-green-500/60 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Traffic Distribution</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <div className="text-4xl font-bold text-white">
                                    {((arbiterMetrics?.php_weight || 0) * 100).toFixed(0)}<span className="text-lg text-gray-500">%</span>
                                </div>
                                <span className="text-xs text-gray-400 mb-1">MODERN</span>
                            </div>
                            <div className="flex gap-1 h-1 w-full">
                                <div className="bg-amber-500" style={{ width: `${(1 - (arbiterMetrics?.php_weight || 0)) * 100}%` }} />
                                <div className="bg-green-500" style={{ width: `${(arbiterMetrics?.php_weight || 0) * 100}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>LEGACY</span>
                                <span>MODERN</span>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-black/40 border border-amber-500/30 rounded-lg p-5 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">System Status</h3>
                            <div className="flex items-center gap-2 text-sm text-white font-mono">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                {arbiterMetrics?.migration_status?.toUpperCase() || 'IDLE'}
                            </div>
                            <div className="mt-2 text-[10px] text-gray-500 border-t border-white/5 pt-2">
                                LAST DECISION: {arbiterMetrics?.last_decision || 'NONE'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Terminal Grid */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">LIVE_TERMINAL_FEEDS</h2>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(['gateway', 'arbiter', 'legacy', 'modern'] as const).map(service => (
                                <div key={service} className="bg-black border border-gray-800 rounded-lg overflow-hidden flex flex-col h-[300px] shadow-lg hover:border-gray-600 transition-colors">
                                    {/* Terminal Header */}
                                    <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${(data as any)?.[service]?.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{service}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            {(data as any)?.[service]?.logs?.length || 0} LINES
                                        </span>
                                    </div>

                                    {/* Terminal Body */}
                                    <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] bg-black/90 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                        {data && (data as any)[service]?.logs?.length > 0 ? (
                                            (data as any)[service].logs.map(formatLog)
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-700">
                                                <span className="uppercase tracking-widest text-[10px]">AWAITING_DATA...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Tabbed View (Legacy)
                        <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
                            <div className="flex border-b border-gray-800">
                                {(['gateway', 'arbiter', 'legacy', 'modern'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveLogTab(tab)}
                                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeLogTab === tab
                                            ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="h-[500px] overflow-y-auto p-4 font-mono text-xs bg-black/90">
                                {data && (data as any)[activeLogTab]?.logs?.length > 0 ? (
                                    <div>
                                        {(data as any)[activeLogTab].logs.map(formatLog)}
                                        <div ref={logsEndRef} />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-700">
                                        <span className="uppercase tracking-widest">NO_LOGS_AVAILABLE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
