'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, Server, Zap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface TrafficLockControlProps {
    onLockChange?: (locked: boolean) => void;
}

export default function TrafficLockControl({ onLockChange }: TrafficLockControlProps) {
    const [isLocked, setIsLocked] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch current lock status
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/gateway/status');
            const data = await response.json();
            if (data.success) {
                setIsLocked(data.trafficLocked);
                setError(null);
            }
        } catch {
            // Gateway might not be running
            setError('Cannot connect to Gateway');
        } finally {
            setLoading(false);
        }
    };

    const toggleLock = async () => {
        const newState = !isLocked;
        setUpdating(true);
        setError(null);

        try {
            const response = await fetch('/api/gateway/traffic-lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locked: newState }),
            });

            const data = await response.json();

            if (data.success) {
                setIsLocked(newState);
                onLockChange?.(newState);
            } else {
                setError(data.error || 'Failed to update traffic lock');
            }
        } catch {
            setError('Failed to connect to Gateway');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading traffic control...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Traffic Control
                </h3>
                <button
                    onClick={fetchStatus}
                    disabled={updating}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Current State Display */}
            <div className={`p-4 rounded-lg mb-4 ${isLocked
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                <div className="flex items-center gap-3">
                    {isLocked ? (
                        <>
                            <Lock className="w-8 h-8 text-amber-600" />
                            <div>
                                <p className="font-semibold text-amber-800">Traffic LOCKED</p>
                                <p className="text-sm text-amber-600">
                                    All requests go to Legacy only. Modern service receives no traffic.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Unlock className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-800">Traffic UNLOCKED - Shadowing Active</p>
                                <p className="text-sm text-green-600">
                                    Requests go to both services. Arbiter analyzes and adjusts weights.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mode Explanation */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-3 rounded-lg border ${isLocked ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-gray-800">Locked Mode</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 100% traffic to Legacy</li>
                        <li>• Modern service inactive</li>
                        <li>• Safe, production-like</li>
                    </ul>
                </div>
                <div className={`p-3 rounded-lg border ${!isLocked ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-800">Unlocked (Shadowing)</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Traffic to both services</li>
                        <li>• Arbiter compares outputs</li>
                        <li>• Auto weight adjustment</li>
                    </ul>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleLock}
                disabled={updating || isLocked === null}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${updating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isLocked
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
            >
                {updating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                    </>
                ) : isLocked ? (
                    <>
                        <Unlock className="w-5 h-5" />
                        Unlock Traffic - Start Autonomous Migration
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        Lock Traffic - Stop Migration
                    </>
                )}
            </button>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>How it works:</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li><strong>Unlock</strong> - Traffic goes to both Legacy & Modern (shadowing)</li>
                    <li><strong>Arbiter analyzes</strong> - Compares responses for consistency</li>
                    <li><strong>Auto-promotion</strong> - If ≥99% match, weight increases by 10%</li>
                    <li><strong>Migration complete</strong> - When weight reaches 100%</li>
                </ol>
            </div>
        </div>
    );
}
