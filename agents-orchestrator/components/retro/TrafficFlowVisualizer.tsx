'use client';

import { useEffect, useState } from 'react';
import { Server, Shield, Database, Zap, Activity } from 'lucide-react';

interface TrafficFlowProps {
    metrics: {
        php_weight: number;
        modern_weight: number;
        total_requests: number;
        consistency: number;
    };
}

export default function TrafficFlowVisualizer({ metrics }: TrafficFlowProps) {
    const [packets, setPackets] = useState<{ id: number; path: 'legacy' | 'modern' }[]>([]);

    // Simulate traffic packets based on metrics
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.3) { // Random traffic generation
                const isModern = Math.random() < metrics.modern_weight;
                const id = Date.now();
                setPackets(prev => [...prev.slice(-10), { id, path: isModern ? 'modern' : 'legacy' }]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [metrics.modern_weight]);

    return (
        <div className="w-full h-[300px] relative perspective-1000 overflow-hidden bg-black/40 border border-amber-500/20 rounded-lg mb-6">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20 pointer-events-none" />

            {/* 3D Scene Container */}
            <div className="absolute inset-0 transform-style-3d rotate-x-20 flex items-center justify-center">

                {/* Nodes */}
                <div className="relative w-full max-w-3xl flex justify-between items-center px-12">

                    {/* Gateway Node */}
                    <div className="flex flex-col items-center gap-2 transform-style-3d z-20">
                        <div className="w-16 h-16 bg-blue-900/20 border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transform rotate-y-12 transition-transform hover:scale-110">
                            <Server className="w-8 h-8 text-blue-400 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 tracking-widest bg-black/50 px-2 py-1 rounded">GATEWAY</span>
                    </div>

                    {/* Connection: Gateway -> Arbiter */}
                    <div className="flex-1 h-1 bg-blue-900/30 relative mx-4">
                        <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                        {/* Packets */}
                        {packets.map(p => (
                            <div key={p.id} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-flow-horizontal" />
                        ))}
                    </div>

                    {/* Arbiter Node (The Brain) */}
                    <div className="flex flex-col items-center gap-2 transform-style-3d z-20">
                        <div className="w-20 h-20 bg-amber-900/20 border-2 border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-float-slow">
                            <Activity className="w-10 h-10 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-amber-500 tracking-widest bg-black/50 px-2 py-1 rounded">ARBITER</span>
                        <div className="text-[10px] text-amber-300/70 font-mono">
                            {Math.round(metrics.modern_weight * 100)}% MODERN
                        </div>
                    </div>

                    {/* Split Paths */}
                    <div className="flex-1 relative mx-4 h-32 flex flex-col justify-between py-4">
                        {/* Path to Legacy */}
                        <div className="absolute top-0 left-0 w-full h-1/2 border-l-2 border-b-2 border-amber-900/30 rounded-bl-3xl transform -translate-y-2">
                            {/* Legacy Packets */}
                            {packets.filter(p => p.path === 'legacy').map(p => (
                                <div key={p.id} className="absolute w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_5px_orange] animate-flow-path-legacy offset-path-legacy" />
                            ))}
                        </div>

                        {/* Path to Modern */}
                        <div className="absolute bottom-0 left-0 w-full h-1/2 border-l-2 border-t-2 border-green-900/30 rounded-tl-3xl transform translate-y-2">
                            {/* Modern Packets */}
                            {packets.filter(p => p.path === 'modern').map(p => (
                                <div key={p.id} className="absolute w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_lime] animate-flow-path-modern offset-path-modern" />
                            ))}
                        </div>
                    </div>

                    {/* Destination Nodes */}
                    <div className="flex flex-col gap-12 z-20">
                        {/* Legacy Node */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-amber-900/10 border border-amber-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                <Database className="w-6 h-6 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-500 tracking-widest">LEGACY</span>
                        </div>

                        {/* Modern Node */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-green-900/10 border border-green-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                <Zap className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-[10px] font-bold text-green-500 tracking-widest">MODERN</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Overlay Stats */}
            <div className="absolute bottom-4 left-4 font-mono text-xs text-white/50">
                <div>ACTIVE_TRANSACTIONS: {metrics.total_requests}</div>
                <div>CONSISTENCY_CHECK: {metrics.consistency.toFixed(1)}%</div>
            </div>
        </div>
    );
}
