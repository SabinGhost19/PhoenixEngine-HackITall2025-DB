'use client';

import { useEffect, useRef } from 'react';

export default function RetroCyberBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Moving Grid Floor */}
            <div className="absolute inset-0 perspective-1000">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_0%,rgba(0,0,0,1)_100%)] z-10" />
                <div className="w-[200%] h-[200%] absolute -left-[50%] -top-[50%] animate-pan-grid opacity-20 transform-style-3d rotate-x-60">
                    <div className="w-full h-full bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            </div>

            {/* Floating Geometric Shapes */}
            <div className="absolute top-20 right-20 w-32 h-32 opacity-20 animate-float-slow">
                <div className="w-full h-full border-2 border-blue-500 rotate-45 transform transition-transform duration-[10s] animate-spin-slow" />
            </div>

            <div className="absolute bottom-40 left-20 w-24 h-24 opacity-10 animate-float-delayed">
                <div className="w-full h-full border border-purple-500 rounded-full border-dashed animate-spin-reverse-slow" />
            </div>

            <div className="absolute top-1/3 left-1/3 w-16 h-16 opacity-30 animate-pulse-slow">
                <div className="w-full h-full bg-green-500/20 blur-xl rounded-full" />
            </div>

            {/* Digital Rain / Particles Effect (Simplified CSS version) */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-[10%] w-px h-20 bg-gradient-to-b from-transparent via-green-500 to-transparent animate-rain-drop" style={{ animationDelay: '0s' }} />
                <div className="absolute top-0 left-[30%] w-px h-32 bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-rain-drop" style={{ animationDelay: '2s' }} />
                <div className="absolute top-0 left-[60%] w-px h-24 bg-gradient-to-b from-transparent via-amber-500 to-transparent animate-rain-drop" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-0 left-[85%] w-px h-28 bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-rain-drop" style={{ animationDelay: '3s' }} />
            </div>
        </div>
    );
}
