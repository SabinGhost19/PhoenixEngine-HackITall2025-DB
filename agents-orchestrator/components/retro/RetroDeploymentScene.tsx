'use client';

import { useEffect, useState } from 'react';
import { Box, Layers, Server, Zap, Activity } from 'lucide-react';

export default function RetroDeploymentScene() {
    const [stage, setStage] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStage(s => (s + 1) % 4);
        }, 2000);

        const logInterval = setInterval(() => {
            const newLog = [
                `INITIALIZING_CONTAINER_CORE...`,
                `ALLOCATING_MEMORY_BLOCKS [0x${Math.floor(Math.random() * 10000).toString(16)}]`,
                `ESTABLISHING_NETWORK_BRIDGE...`,
                `PULLING_IMAGE_LAYERS...`,
                `VERIFYING_CHECKSUMS...`,
                `STARTING_SERVICE_DAEMON...`
            ][Math.floor(Math.random() * 6)];
            setLogs(prev => [...prev.slice(-4), `> ${newLog}`]);
        }, 800);

        return () => {
            clearInterval(interval);
            clearInterval(logInterval);
        };
    }, []);

    return (
        <div className="relative w-full h-[500px] overflow-hidden bg-black border-2 border-amber-500/30 rounded-lg perspective-1000 flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_0%,rgba(0,0,0,1)_100%)] z-10 pointer-events-none" />
            <div className="absolute inset-0 opacity-20 animate-pan-grid transform-style-3d rotate-x-60 scale-150">
                <div className="w-full h-full bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Central 3D Assembly Core */}
            <div className="relative transform-style-3d animate-spin-slow z-20">
                {/* Inner Core */}
                <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-amber-500 bg-amber-500/10 backdrop-blur-sm transform rotate-45 animate-pulse-slow shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center justify-center">
                    <Server className="w-16 h-16 text-amber-500 animate-bounce" />
                </div>

                {/* Orbiting Rings */}
                <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-blue-500 rounded-full animate-spin-reverse-slow opacity-60" />
                <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-dotted border-green-500 rounded-full animate-spin-slow opacity-40" />

                {/* Floating Satellites */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-24 w-12 h-12 bg-black border border-purple-500 flex items-center justify-center animate-float-slow">
                    <Box className="w-6 h-6 text-purple-500" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-24 w-12 h-12 bg-black border border-cyan-500 flex items-center justify-center animate-float-delayed">
                    <Layers className="w-6 h-6 text-cyan-500" />
                </div>
            </div>

            {/* Scanning Laser */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="w-full h-1 bg-green-500/50 shadow-[0_0_20px_#22c55e] animate-scanline opacity-50" />
            </div>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 z-40">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-green-500 font-mono text-xs tracking-widest">DEPLOYMENT_SEQUENCE_ACTIVE</span>
                </div>
                <div className="w-48 h-1 bg-gray-800 rounded overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress-indeterminate" />
                </div>
            </div>

            {/* Terminal Output */}
            <div className="absolute bottom-4 right-4 z-40 w-80 font-mono text-[10px] text-amber-500/80 bg-black/80 border border-amber-500/20 p-4 rounded backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2">
                    <span>SYSTEM_LOG</span>
                    <span className="animate-pulse">●</span>
                </div>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="truncate opacity-80 hover:opacity-100 transition-opacity">
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500 z-40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500 z-40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500 z-40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500 z-40" />
        </div>
    );
}
