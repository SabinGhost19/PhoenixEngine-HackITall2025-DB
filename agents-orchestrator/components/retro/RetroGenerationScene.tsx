import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, Zap, Activity, Code2, Layers, Shield, Box } from 'lucide-react';

export default function RetroGenerationScene({
    currentStep,
    steps,
    log,
    elapsedTime
}: {
    currentStep: number;
    steps: string[];
    log: string[];
    elapsedTime: number;
}) {
    const [glitchText, setGlitchText] = useState('');

    // Glitch effect for the current step
    useEffect(() => {
        const text = steps[currentStep] || 'COMPLETING_SEQUENCE...';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
        let i = 0;
        const interval = setInterval(() => {
            setGlitchText(text.split('').map((char, index) => {
                if (index < i) return char;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));
            i += 1 / 2; // Slow down the reveal
            if (i > text.length) i = 0; // Loop the glitch effect slightly
        }, 50);
        return () => clearInterval(interval);
    }, [currentStep, steps]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden font-mono">
            {/* Background Grid - Moving */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,176,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] perspective-1000 transform-style-3d">
                <div className="absolute inset-0 transform rotate-x-60 scale-150 animate-[panGrid_20s_linear_infinite]"></div>
            </div>

            {/* Vignette & Scanlines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-10"></div>
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>

            {/* Main HUD Container */}
            <div className="relative w-full h-full max-w-7xl mx-auto p-8 flex flex-col z-20">

                {/* Header HUD */}
                <div className="flex justify-between items-start border-b border-amber-500/30 pb-4">
                    <div>
                        <div className="text-xs text-amber-500/50 mb-1">OPERATION_MODE</div>
                        <div className="text-2xl font-bold text-glow text-amber-500 flex items-center gap-2">
                            <Cpu className="w-6 h-6 animate-pulse" />
                            MICROSERVICE_SYNTHESIS
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-amber-500/50 mb-1">ELAPSED_TIME</div>
                        <div className="text-3xl font-bold text-glow text-amber-500 font-mono">
                            T+{elapsedTime.toString().padStart(3, '0')}s
                        </div>
                    </div>
                </div>

                {/* Center Stage: The Hypercube Core */}
                <div className="flex-1 flex items-center justify-center relative perspective-1000">

                    {/* The Core Assembly */}
                    <div className="relative w-64 h-64 transform-style-3d animate-[float_6s_ease-in-out_infinite]">

                        {/* Outer Ring 1 */}
                        <div className="absolute inset-0 border-2 border-amber-500/30 rounded-full animate-[spin_10s_linear_infinite] border-t-transparent border-l-transparent"></div>
                        {/* Outer Ring 2 */}
                        <div className="absolute inset-4 border-2 border-amber-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-transparent border-r-transparent"></div>

                        {/* The Hypercube */}
                        <div className="absolute inset-16 transform-style-3d animate-[rotate3d_20s_linear_infinite]">
                            {/* Outer Cube */}
                            <div className="absolute inset-0 transform-style-3d">
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 translate-z-16"></div>
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 -translate-z-16"></div>
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 rotate-y-90 translate-z-16"></div>
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 rotate-y-90 -translate-z-16"></div>
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 rotate-x-90 translate-z-16"></div>
                                <div className="absolute inset-0 border-2 border-amber-500/50 bg-amber-500/10 rotate-x-90 -translate-z-16"></div>
                            </div>

                            {/* Inner Cube (Spinning Faster) */}
                            <div className="absolute inset-8 transform-style-3d animate-[spin_5s_linear_infinite_reverse]">
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 translate-z-8 shadow-[0_0_15px_blue]"></div>
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 -translate-z-8 shadow-[0_0_15px_blue]"></div>
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 rotate-y-90 translate-z-8 shadow-[0_0_15px_blue]"></div>
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 rotate-y-90 -translate-z-8 shadow-[0_0_15px_blue]"></div>
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 rotate-x-90 translate-z-8 shadow-[0_0_15px_blue]"></div>
                                <div className="absolute inset-0 bg-blue-500/40 border border-blue-400 rotate-x-90 -translate-z-8 shadow-[0_0_15px_blue]"></div>
                            </div>
                        </div>

                        {/* Energy Particles */}
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white shadow-[0_0_20px_white] animate-[ping_1s_linear_infinite]"></div>
                    </div>

                    {/* Current Action Label (Floating below core) */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full max-w-lg">
                        <div className="text-xs text-amber-500/50 mb-2 tracking-[0.5em]">CURRENT_PROCESS</div>
                        <div className="text-xl font-bold text-amber-500 bg-black/50 backdrop-blur-sm border-y border-amber-500/30 py-2 animate-pulse">
                            {glitchText}
                        </div>
                    </div>
                </div>

                {/* Bottom HUD: Terminal & Steps */}
                <div className="grid grid-cols-3 gap-8 h-48">

                    {/* Terminal Log */}
                    <div className="col-span-2 box-retro p-4 relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-amber-500/50 mb-2 border-b border-amber-500/20 pb-1">
                            <Terminal className="w-3 h-3" /> SYSTEM_LOG_STREAM
                        </div>
                        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 scrollbar-hide">
                            {log.slice().reverse().map((entry, i) => (
                                <div key={i} className="text-amber-500/80 break-all">
                                    <span className="opacity-50 mr-2">&gt;</span>
                                    {entry}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="box-retro p-4 flex flex-col justify-between">
                        <div className="text-xs text-amber-500/50 mb-2 border-b border-amber-500/20 pb-1">SEQUENCE_PROGRESS</div>
                        <div className="space-y-1">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${idx === currentStep ? 'bg-blue-500 animate-ping' : idx < currentStep ? 'bg-green-500' : 'bg-amber-900'}`}></div>
                                    <div className={`text-[10px] truncate ${idx === currentStep ? 'text-blue-400 font-bold' : idx < currentStep ? 'text-green-500/50' : 'text-amber-900'}`}>
                                        {step.split('_').join(' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-amber-900/20 h-1 mt-2">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
