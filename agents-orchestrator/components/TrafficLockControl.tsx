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
            <div className="box-retro p-6 bg-black/40 flex items-center justify-center h-full">
                <div className="flex items-center justify-center gap-2 text-amber-500/50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-mono text-sm">INITIALIZING_TRAFFIC_CONTROL...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-mono">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2 text-glow">
                    <Server className="w-5 h-5 text-amber-500" />
                    TRAFFIC_CONTROL_SYSTEM
                </h3>
                <button
                    onClick={fetchStatus}
                    disabled={updating}
                    className="text-amber-500/50 hover:text-amber-500 text-xs uppercase tracking-wider transition-colors"
                >
                    [REFRESH_STATUS]
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 border border-red-500/30 bg-red-900/10 rounded-none flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Current State Display */}
            <div className={`p-6 border-2 mb-6 transition-all duration-500 ${isLocked
                ? 'bg-amber-900/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-green-900/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                }`}>
                <div className="flex items-center gap-4">
                    {isLocked ? (
                        <>
                            <div className="p-3 border border-amber-500/30 bg-amber-900/20 rounded-full">
                                <Lock className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <p className="font-bold text-amber-500 text-lg tracking-wider text-glow">TRAFFIC_LOCKED</p>
                                <p className="text-xs text-amber-500/60 uppercase mt-1">
                                    Routing: 100% Legacy | Modern: Inactive
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-3 border border-green-500/30 bg-green-900/20 rounded-full">
                                <Unlock className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <p className="font-bold text-green-500 text-lg tracking-wider text-glow">TRAFFIC_UNLOCKED</p>
                                <p className="text-xs text-green-500/60 uppercase mt-1">
                                    Routing: Shadowing Active | Arbiter: Online
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mode Explanation */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 border transition-colors ${isLocked
                    ? 'bg-amber-900/20 border-amber-500 text-amber-500'
                    : 'bg-transparent border-gray-800 text-gray-600 opacity-50'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-3 h-3" />
                        <span className="font-bold text-xs uppercase tracking-wider">Locked_Mode</span>
                    </div>
                    <ul className="text-[10px] space-y-1 font-mono opacity-80">
                        <li>&gt; 100% traffic to Legacy</li>
                        <li>&gt; Modern service inactive</li>
                        <li>&gt; Safe, production-like</li>
                    </ul>
                </div>
                <div className={`p-4 border transition-colors ${!isLocked
                    ? 'bg-green-900/20 border-green-500 text-green-500'
                    : 'bg-transparent border-gray-800 text-gray-600 opacity-50'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3 h-3" />
                        <span className="font-bold text-xs uppercase tracking-wider">Shadow_Mode</span>
                    </div>
                    <ul className="text-[10px] space-y-1 font-mono opacity-80">
                        <li>&gt; Traffic to both services</li>
                        <li>&gt; Arbiter compares outputs</li>
                        <li>&gt; Auto weight adjustment</li>
                    </ul>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleLock}
                disabled={updating || isLocked === null}
                className={`w-full py-4 px-4 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${updating
                    ? 'border-gray-700 text-gray-700 bg-gray-900/50 cursor-not-allowed'
                    : isLocked
                        ? 'border-green-500 text-green-500 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    }`}
            >
                {updating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        UPDATING_SYSTEM...
                    </>
                ) : isLocked ? (
                    <>
                        <Unlock className="w-4 h-4" />
                        UNLOCK_TRAFFIC_FLOW
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" />
                        LOCK_TRAFFIC_FLOW
                    </>
                )}
            </button>

            {/* Info */}
            <div className="mt-6 p-4 border border-blue-500/30 bg-blue-900/10 text-xs text-blue-400/80">
                <strong className="text-blue-400 uppercase block mb-2">System_Logic:</strong>
                <ol className="list-decimal ml-4 space-y-1 font-mono">
                    <li><span className="text-blue-300">Unlock</span> - Traffic routed to Legacy & Modern</li>
                    <li><span className="text-blue-300">Arbiter</span> - Analyzes response consistency</li>
                    <li><span className="text-blue-300">Auto-Promote</span> - If &ge;99% match, weight +10%</li>
                    <li><span className="text-blue-300">Complete</span> - When weight reaches 100%</li>
                </ol>
            </div>
        </div>
    );
}
