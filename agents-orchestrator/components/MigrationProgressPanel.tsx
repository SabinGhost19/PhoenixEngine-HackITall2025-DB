'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, Clock, TrendingUp, RefreshCw, PartyPopper } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(true);
    const [failureCount, setFailureCount] = useState(0);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

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
                    setFailureCount(0); // Reset on success
                } else {
                    // Don't show error immediately, just increment failure count
                    setFailureCount(prev => prev + 1);
                    if (failureCount >= 5) {
                        setError(data.error || 'Failed to fetch status');
                    }
                }
            } catch (err) {
                // Silently handle network errors - just increment failure count
                // Don't overwrite existing status data
                setFailureCount(prev => prev + 1);

                // Only show error after 5 consecutive failures
                if (failureCount >= 5) {
                    setError('Unable to connect to Arbiter service');
                }
                console.log('Arbiter polling failed (attempt', failureCount + 1, '):', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        if (isPolling) {
            intervalId = setInterval(fetchStatus, 2000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPolling, failureCount]);


    const handleReset = async () => {
        try {
            const response = await fetch('/api/arbiter/reset', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                // Refresh status
                const statusResponse = await fetch('/api/arbiter/status');
                const statusData = await statusResponse.json();
                if (statusData.success) {
                    setStatus(statusData.data);
                }
            }
        } catch (err) {
            console.error('Reset failed:', err);
        }
    };

    const weight = serviceType === 'php' ? (status?.php_weight || 0) : (status?.python_weight || 0);
    const weightPercent = weight * 100;
    const isComplete = weightPercent >= 100;
    const isInProgress = weightPercent > 0 && weightPercent < 100;

    const getStatusColor = () => {
        if (isComplete) return 'bg-green-500';
        if (status?.migration_status === 'rollback') return 'bg-red-500';
        if (isInProgress) return 'bg-blue-500';
        return 'bg-gray-400';
    };

    const getScoreColor = (score: number) => {
        if (score >= 99) return 'text-green-600 bg-green-100';
        if (score >= 95) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${isComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isComplete ? (
                            <PartyPopper className="w-6 h-6 text-green-600" />
                        ) : (
                            <Activity className="w-6 h-6 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Migration Progress - {serviceType.toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isComplete
                                ? '✅ Migration Complete!'
                                : isInProgress
                                    ? 'Canary deployment in progress...'
                                    : 'Waiting for traffic verification...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPolling(!isPolling)}
                        className={`p-2 rounded-lg transition-colors ${isPolling ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        title={isPolling ? 'Pause auto-refresh' : 'Resume auto-refresh'}
                    >
                        <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Migration Complete Banner */}
            {isComplete && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <PartyPopper className="w-8 h-8 text-green-600" />
                        <div>
                            <h4 className="text-lg font-bold text-green-800">
                                🎉 Migration Complete!
                            </h4>
                            <p className="text-sm text-green-600">
                                100% of traffic is now routed to the modern {serviceType.toUpperCase()} microservice.
                                You can now proceed to migrate another endpoint.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Traffic to Modern Service</span>
                    <span className="text-lg font-bold text-gray-900">{weightPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
                        style={{ width: `${weightPercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0% - Legacy Only</span>
                    <span>100% - Modern Only</span>
                </div>
            </div>

            {/* Stats Grid */}
            {status && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Consistency Score */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Consistency</span>
                        </div>
                        <div className={`text-xl font-bold px-2 py-1 rounded ${getScoreColor(status.consistency_score)}`}>
                            {status.consistency_score.toFixed(2)}%
                        </div>
                    </div>

                    {/* Total Transactions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Samples</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {status.total_transactions}
                        </div>
                    </div>

                    {/* Matched */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500">Matched</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                            {status.matched_transactions}
                        </div>
                    </div>

                    {/* Last Decision */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Last Action</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate" title={status.last_decision}>
                            {status.last_decision === 'none' ? '—' : status.last_decision.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status?.migration_status === 'complete' ? 'bg-green-100 text-green-800' :
                    status?.migration_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        status?.migration_status === 'rollback' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    Status: {status?.migration_status || 'pending'}
                </span>

                {status?.last_decision_time && status.last_decision !== 'none' && (
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                        Updated: {status.last_decision_time}
                    </span>
                )}
            </div>
        </div>
    );
}
