'use client';

import { useEffect, useState } from 'react';
import { Gamepad2, Coins, Rocket, Zap } from 'lucide-react';

export default function RetroArcadeDeployment() {
    const [stage, setStage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [hyperdrive, setHyperdrive] = useState(false);

    const stages = [
        { name: 'STAGE 1: PULLING IMAGE', color: 'bg-blue-500' },
        { name: 'STAGE 2: BUILDING ENV', color: 'bg-amber-500' },
        { name: 'STAGE 3: HEALTH CHECKS', color: 'bg-green-500' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (stage < 2) {
                        setStage(s => s + 1);
                        return 0;
                    } else {
                        setIsReady(true);
                        return 100;
                    }
                }
                // Speed up progress for effect
                return prev + (hyperdrive ? 5 : 1);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [stage, hyperdrive]);

    // Trigger hyperdrive effect randomly
    useEffect(() => {
        const timeout = setTimeout(() => setHyperdrive(true), 2000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-[#050510] border-4 border-black rounded-lg perspective-1000 flex flex-col items-center justify-center font-mono shadow-[0_0_50px_rgba(0,0,0,0.5)]">

            {/* CRT Effects */}
            <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 z-50 pointer-events-none animate-scanline bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 opacity-30" />
            <div className="absolute inset-0 z-50 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

            {/* 3D Space Environment */}
            <div className={`absolute inset-0 transform-style-3d transition-transform duration-1000 ${hyperdrive ? 'scale-110' : 'scale-100'}`}>

                {/* Starfield - Parallax Layers */}
                <div className="absolute inset-0 bg-black">
                    {/* Distant Stars */}
                    <div className={`absolute inset-0 animate-pan-grid opacity-40 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:50px_50px] ${hyperdrive ? 'duration-[0.5s]' : 'duration-[10s]'}`} />
                    {/* Passing Stars (Streaks) */}
                    <div className={`absolute inset-0 ${hyperdrive ? 'opacity-80' : 'opacity-0'} transition-opacity duration-1000`}>
                        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-rain-drop rotate-90" style={{ animationDuration: '0.2s' }} />
                        <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-rain-drop rotate-90" style={{ animationDuration: '0.3s', animationDelay: '0.1s' }} />
                    </div>
                </div>

                {/* Grid Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_bottom,rgba(6,182,212,0.2)_1px,transparent_1px),linear-gradient(to_right,rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:40px_40px] transform-style-3d rotate-x-60 origin-bottom animate-pan-grid" style={{ animationDuration: hyperdrive ? '0.5s' : '2s' }} />

                {/* 3D High-Fidelity Ship */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transform-style-3d animate-float-slow z-30">
                    <div className="relative transform-style-3d rotate-x-10 rotate-y-10 transition-transform duration-500">
                        {/* Main Fuselage */}
                        <div className="w-24 h-32 bg-gradient-to-b from-gray-200 to-gray-400 relative transform-style-3d shadow-2xl rounded-lg">
                            {/* Cockpit Glass */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-cyan-200 rounded-t-full translate-z-12 opacity-90 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.6)]" />

                            {/* Engine Glows */}
                            <div className="absolute bottom-0 left-2 w-6 h-6 bg-orange-500 blur-md animate-pulse translate-z-4" />
                            <div className="absolute bottom-0 right-2 w-6 h-6 bg-orange-500 blur-md animate-pulse translate-z-4" />

                            {/* Thruster Trails */}
                            <div className={`absolute top-full left-2 w-4 h-24 bg-gradient-to-b from-orange-500 to-transparent blur-md ${hyperdrive ? 'h-48 opacity-100' : 'h-12 opacity-60'} transition-all duration-300`} />
                            <div className={`absolute top-full right-2 w-4 h-24 bg-gradient-to-b from-orange-500 to-transparent blur-md ${hyperdrive ? 'h-48 opacity-100' : 'h-12 opacity-60'} transition-all duration-300`} />
                        </div>

                        {/* Wings */}
                        <div className="absolute top-12 -left-12 w-12 h-20 bg-gray-300 transform skew-y-12 border-l-4 border-red-500 shadow-lg" />
                        <div className="absolute top-12 -right-12 w-12 h-20 bg-gray-300 transform -skew-y-12 border-r-4 border-red-500 shadow-lg" />

                        {/* Weapon Pods */}
                        <div className="absolute top-16 -left-14 w-4 h-12 bg-gray-800 translate-z-4" />
                        <div className="absolute top-16 -right-14 w-4 h-12 bg-gray-800 translate-z-4" />
                    </div>
                </div>
            </div>

            {/* Arcade HUD Interface */}
            <div className="absolute inset-0 z-40 p-8 flex flex-col justify-between pointer-events-none">
                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-black/80 border-2 border-yellow-500 p-2 rounded shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                                <Gamepad2 className="w-6 h-6" />
                                <span className="text-xl font-bold tracking-widest">P1</span>
                            </div>
                        </div>
                        <div className="text-white font-bold text-shadow-sm">
                            <div className="text-xs text-gray-400">SCORE</div>
                            <div className="text-2xl tracking-widest">{Math.floor(progress * (stage + 1) * 123.5).toString().padStart(6, '0')}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="text-red-500 font-bold text-shadow-sm animate-pulse">HIGH SCORE</div>
                        <div className="text-2xl text-white tracking-widest font-bold">999999</div>
                    </div>
                </div>

                {/* Center Status */}
                {isReady && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-50">
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 mb-4 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-bounce">
                            READY!
                        </h2>
                        <div className="bg-black/80 border-2 border-yellow-500 px-6 py-3 rounded-full animate-pulse flex items-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                            <Coins className="w-6 h-6 text-yellow-400" />
                            <span className="text-xl font-bold text-yellow-400 tracking-widest">INSERT COIN</span>
                        </div>
                    </div>
                )}

                {/* Bottom Progress Bars */}
                <div className="w-full max-w-md mx-auto space-y-3 bg-black/80 p-4 border-2 border-blue-500/50 rounded-lg backdrop-blur-sm">
                    {stages.map((s, idx) => (
                        <div key={idx} className={`transition-all duration-500 ${idx > stage ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                            <div className="flex justify-between text-xs mb-1 text-cyan-300 font-bold tracking-wider">
                                <span className="flex items-center gap-2">
                                    {idx === stage && <Rocket className="w-3 h-3 animate-spin" />}
                                    {s.name}
                                </span>
                                <span className="font-mono">{idx < stage ? '100%' : idx === stage ? `${Math.min(progress, 100)}%` : '0%'}</span>
                            </div>

                            {/* High-Fidelity Progress Bar */}
                            <div className="h-4 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden relative">
                                <div
                                    className={`h-full ${s.color} transition-all duration-200 relative`}
                                    style={{ width: `${idx < stage ? 100 : idx === stage ? progress : 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                    <div className="absolute top-0 right-0 h-full w-1 bg-white/50 shadow-[0_0_10px_white]" />
                                </div>
                                {/* Grid lines on bar */}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(0,0,0,0.5)_20%)] bg-[size:4px_100%] opacity-30" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
