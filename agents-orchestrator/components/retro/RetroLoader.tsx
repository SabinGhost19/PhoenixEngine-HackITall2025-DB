import React from 'react';

export default function RetroLoader({ text = "ANALYZING_DATA_STREAM..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 perspective-1000">
            {/* 3D Cube Container */}
            <div className="relative w-24 h-24 transform-style-3d animate-[spin_4s_linear_infinite]">
                {/* Front Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 translate-z-12 flex items-center justify-center">
                    <div className="w-16 h-16 border border-amber-500/30 rounded-full animate-pulse"></div>
                </div>
                {/* Back Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 -translate-z-12 rotate-y-180 flex items-center justify-center">
                    <div className="w-12 h-12 border border-amber-500/30 rotate-45"></div>
                </div>
                {/* Right Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 translate-x-12 rotate-y-90 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-amber-500/50"></div>
                </div>
                {/* Left Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 -translate-x-12 -rotate-y-90 flex items-center justify-center">
                    <div className="h-full w-[1px] bg-amber-500/50"></div>
                </div>
                {/* Top Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 -translate-y-12 rotate-x-90 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-500/50 rounded-full"></div>
                </div>
                {/* Bottom Face */}
                <div className="absolute inset-0 border-2 border-amber-500/80 bg-amber-500/10 translate-y-12 -rotate-x-90 flex items-center justify-center">
                    <div className="w-4 h-4 bg-amber-500/50 animate-ping"></div>
                </div>
            </div>

            {/* Loading Text */}
            <div className="mt-16 text-center">
                <div className="text-amber-500 font-bold tracking-widest text-glow animate-pulse mb-2">
                    {text}
                </div>
                <div className="w-48 h-1 bg-amber-900/30 mx-auto overflow-hidden border border-amber-500/30">
                    <div className="h-full bg-amber-500 w-1/2 animate-[width_2s_ease-in-out_infinite]"></div>
                </div>
            </div>

            {/* Floor Grid Effect */}
            <div className="absolute bottom-0 w-64 h-64 bg-[radial-gradient(circle,rgba(255,176,0,0.1)_0%,transparent_70%)] transform rotate-x-90 translate-y-32 pointer-events-none"></div>
        </div>
    );
}
