import React from 'react';
import { Box } from 'lucide-react';

export default function RetroDockerContainer({ className = "" }: { className?: string }) {
    return (
        <div className={`relative w-40 h-40 group perspective-1000 ${className}`}>
            <div className="relative w-full h-full transform-style-3d animate-[float_6s_ease-in-out_infinite]">
                <div className="absolute inset-0 transform-style-3d rotate-x-[-20deg] rotate-y-[30deg] group-hover:rotate-y-[180deg] transition-transform duration-[2s]">

                    {/* Front Face */}
                    <div className="absolute inset-0 w-32 h-32 bg-blue-900/80 border-2 border-blue-400 translate-z-16 flex items-center justify-center overflow-hidden backface-hidden">
                        {/* Corrugated Texture */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_12px)] opacity-50"></div>
                        {/* Logo */}
                        <div className="relative z-10 flex flex-col items-center">
                            <Box className="w-12 h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                            <div className="text-[10px] font-bold text-blue-400 mt-1 tracking-widest bg-black/50 px-1">CONTAINER_ID</div>
                            <div className="text-[8px] text-blue-300 font-mono">#8X-92</div>
                        </div>
                        {/* Border Glow */}
                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(59,130,246,0.5)]"></div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-32 h-32 bg-blue-900/80 border-2 border-blue-400 -translate-z-16 rotate-y-180 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_12px)] opacity-50"></div>
                        <div className="relative z-10 text-blue-400 font-mono text-xs font-bold rotate-y-180">READY_TO_DEPLOY</div>
                    </div>

                    {/* Right Face */}
                    <div className="absolute inset-y-0 right-0 w-32 h-32 bg-blue-800/80 border-2 border-blue-400 origin-right rotate-y-90 translate-x-16 overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_12px)] opacity-50"></div>
                        {/* Shipping Label */}
                        <div className="absolute top-2 right-2 w-16 h-8 border border-white/20 bg-white/5 p-1">
                            <div className="w-full h-[2px] bg-white/30 mb-1"></div>
                            <div className="w-2/3 h-[2px] bg-white/30 mb-1"></div>
                            <div className="w-full h-[2px] bg-white/30"></div>
                        </div>
                    </div>

                    {/* Left Face */}
                    <div className="absolute inset-y-0 left-0 w-32 h-32 bg-blue-800/80 border-2 border-blue-400 origin-left -rotate-y-90 -translate-x-16 overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_12px)] opacity-50"></div>
                    </div>

                    {/* Top Face */}
                    <div className="absolute inset-x-0 top-0 w-32 h-32 bg-blue-700/80 border-2 border-blue-400 origin-top -rotate-x-90 -translate-y-16 overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_12px)] opacity-50"></div>
                    </div>

                    {/* Bottom Face */}
                    <div className="absolute inset-x-0 bottom-0 w-32 h-32 bg-blue-900/90 border-2 border-blue-400 origin-bottom rotate-x-90 translate-y-16 shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>

                </div>

                {/* Holographic Projection Base */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] transform rotate-x-70 pointer-events-none animate-pulse"></div>
            </div>
        </div>
    );
}
