'use client';

import { useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, Clock, TrendingUp, RefreshCw, PartyPopper, Play, Pause, Power } from 'lucide-react';

interface ArbiterStatus {
    php_weight: number;
    python_weight: number;
    consistency_score: number;
    total_transactions: number;
    matched_transactions: number;
    migration_status: string;
    last_decision: string;
    last_decision_time: string;
}

interface MigrationProgressPanelProps {
    serviceType?: 'php' | 'python';
}

export default function MigrationProgressPanel({ serviceType = 'php' }: MigrationProgressPanelProps) {
    const [status, setStatus] = useState<ArbiterStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const fetchStatus = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/api/arbiter/status', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                setStatus(data.data);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch status');
            }
        } catch (err) {
            // Silently ignore - arbiter might not be running
            console.log('Arbiter not available:', err);
        } finally {
            setLoading(false);
        }
    };

    const startMonitoring = () => {
        setIsMonitoring(true);
        setLoading(true);
        fetchStatus();

        const id = setInterval(fetchStatus, 3000);
        setIntervalId(id);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const handleReset = async () => {
        try {
            await fetch('/api/arbiter/reset', { method: 'POST' });
            fetchStatus();
        } catch (err) {
            console.error('Reset failed:', err);
        }
    };

    const weight = serviceType === 'php' ? (status?.php_weight ?? 0) : (status?.python_weight ?? 0);
    const consistency = status?.consistency_score ?? 0;
    const consistencyPercent = (consistency * 100).toFixed(1);
    const isMigrationComplete = weight >= 100;

    // Not monitoring yet - show start button
    if (!isMonitoring) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Migration Progress Monitor</h3>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Power className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                        Monitor the autonomous migration progress in real-time.
                        <br />
                        <span className="text-sm text-gray-500">
                            Requires: Arbiter, Gateway, and Kafka running
                        </span>
                    </p>
                    <button
                        onClick={startMonitoring}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto"
                    >
                        <Play className="w-4 h-4" />
                        Start Monitoring
                    </button>
                </div>
            </div>
        );
    }

    // Migration complete celebration
    if (isMigrationComplete && status) {
        return (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <PartyPopper className="w-8 h-8" />
                        <h3 className="text-xl font-bold">Migration Complete!</h3>
                    </div>
                    <button
                        onClick={stopMonitoring}
                        className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
                    >
                        <Pause className="w-4 h-4" />
                        Stop
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/20 rounded-lg p-4 text-center">
                        <p className="text-white/80 text-sm">Modern Weight</p>
                        <p className="text-3xl font-bold">100%</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center">
                        <p className="text-white/80 text-sm">Consistency</p>
                        <p className="text-3xl font-bold">{consistencyPercent}%</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center">
                        <p className="text-white/80 text-sm">Transactions</p>
                        <p className="text-3xl font-bold">{status.total_transactions}</p>
                    </div>
                </div>

                <p className="text-white/90 text-center">
                    ✅ All traffic is now routed to the modern microservice!
                </p>
            </div>
        );
    }

    // Monitoring active
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Migration Progress</h3>
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        title="Reset counters"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={stopMonitoring}
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm px-2 py-1 hover:bg-gray-100 rounded"
                    >
                        <Pause className="w-4 h-4" />
                        Stop
                    </button>
                </div>
            </div>

            {!status ? (
                <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Connecting to Arbiter...</p>
                    <p className="text-gray-400 text-sm mt-1">Make sure docker-compose is running</p>
                </div>
            ) : (
                <>
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Legacy</span>
                            <span>{weight.toFixed(0)}% Modern</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                style={{ width: `${weight}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Modern Weight</p>
                            <p className="text-lg font-bold text-blue-600">{weight.toFixed(0)}%</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Consistency</p>
                            <p className="text-lg font-bold text-green-600">{consistencyPercent}%</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <Activity className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Transactions</p>
                            <p className="text-lg font-bold text-purple-600">{status.total_transactions}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                            <CheckCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Matched</p>
                            <p className="text-lg font-bold text-amber-600">{status.matched_transactions}</p>
                        </div>
                    </div>

                    {/* Status and Decision */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="text-sm font-medium text-gray-900">{status.migration_status}</span>
                            </div>
                            {status.last_decision && (
                                <span className="text-xs text-gray-500">
                                    Last: {status.last_decision}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Decision Engine Info */}
                    <div className="mt-4 text-xs text-gray-400 text-center">
                        Auto-promote: ≥99% consistency | Rollback: &lt;95% | Step: 10%
                    </div>
                </>
            )}
        </div>
    );
}
