import React from 'react';
import { Database, Server, Globe, Shield, Zap, Cpu, ArrowDown } from 'lucide-react';

// Helper for a 3D Block
const RetroBlock = ({
    children,
    color = "amber",
    label,
    sublabel,
    icon: Icon,
    className = ""
}: {
    children?: React.ReactNode;
    color?: "amber" | "blue" | "green" | "red";
    label: string;
    sublabel: string;
    icon: any;
    className?: string;
}) => {
    const colorMap = {
        amber: { border: 'border-amber-400', bg: 'bg-amber-500/20', text: 'text-amber-400', shadow: 'shadow-amber-400/50', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]' },
        blue: { border: 'border-blue-400', bg: 'bg-blue-500/20', text: 'text-cyan-300', shadow: 'shadow-blue-400/50', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]' },
        green: { border: 'border-green-400', bg: 'bg-green-500/20', text: 'text-green-400', shadow: 'shadow-green-400/50', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.4)]' },
        red: { border: 'border-red-400', bg: 'bg-red-500/20', text: 'text-red-400', shadow: 'shadow-red-400/50', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.4)]' },
    };

    const c = colorMap[color];

    return (
        <div className={`relative w-36 h-24 group transform-style-3d transition-transform duration-500 hover:translate-z-8 ${className}`}>
            {/* Front Face */}
            <div className={`absolute inset-0 border-[3px] ${c.border} bg-gray-900/90 flex flex-col items-center justify-center translate-z-12 backface-hidden ${c.glow}`}>
                <Icon className={`w-8 h-8 ${c.text} mb-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]`} />
                <div className={`text-xs font-bold ${c.text} tracking-wider drop-shadow-md`}>{label}</div>
                <div className={`text-[10px] ${c.text} font-mono font-semibold`}>{sublabel}</div>
                {/* Inner Glow */}
                <div className={`absolute inset-0 ${c.bg} animate-pulse`}></div>
            </div>

            {/* Back Face */}
            <div className={`absolute inset-0 border-[3px] ${c.border} bg-gray-900/90 -translate-z-12 rotate-y-180`}></div>

            {/* Top Face */}
            <div className={`absolute inset-x-0 top-0 h-24 border-[3px] ${c.border} bg-gray-900/90 origin-bottom -rotate-x-90 -translate-y-24 flex items-center justify-center overflow-hidden`}>
                <div className={`w-full h-full ${c.bg} opacity-30`}></div>
                {/* Circuit Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:12px_12px]"></div>
            </div>

            {/* Bottom Face */}
            <div className={`absolute inset-x-0 bottom-0 h-24 border-[3px] ${c.border} bg-gray-900/90 origin-top rotate-x-90 translate-y-24`}></div>

            {/* Right Face */}
            <div className={`absolute inset-y-0 right-0 w-24 border-[3px] ${c.border} bg-gray-900/90 origin-left rotate-y-90 translate-x-36`}></div>

            {/* Left Face */}
            <div className={`absolute inset-y-0 left-0 w-24 border-[3px] ${c.border} bg-gray-900/90 origin-right -rotate-y-90 -translate-x-36`}></div>
        </div>
    );
};

// Helper for 3D Pipe/Connection
const DataPipe = ({
    length = "w-32",
    vertical = false,
    active = true,
    className = ""
}: {
    length?: string;
    vertical?: boolean;
    active?: boolean;
    className?: string;
}) => {
    return (
        <div className={`absolute transform-style-3d ${className} ${vertical ? `w-4 ${length}` : `h-4 ${length}`}`}>
            <div className={`absolute inset-0 bg-amber-500/10 border border-amber-400/40 ${vertical ? 'border-x-2' : 'border-y-2'}`}>
                {active && (
                    <div className={`absolute bg-amber-300 shadow-[0_0_15px_#fcd34d] ${vertical ? 'w-full h-6 animate-[moveVertical_2s_linear_infinite]' : 'h-full w-6 animate-[moveHorizontal_2s_linear_infinite]'}`}></div>
                )}
            </div>
        </div>
    );
};

export default function RetroArchitectureDiagram() {
    return (
        <div className="w-full h-[700px] box-retro relative overflow-hidden perspective-1000 flex items-center justify-center bg-[#0a0a0a]">
            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,176,0,0.15)_0%,transparent_70%)] pointer-events-none"></div>

            {/* Background Grid Floor */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px] transform rotate-x-60 scale-150 opacity-30 pointer-events-none origin-center translate-y-40"></div>

            {/* Main Diagram Container - Rotated for Isometric View */}
            <div className="relative w-full max-w-4xl h-full transform-style-3d rotate-x-20 rotate-y-0 scale-90">

                {/* Title Overlay */}
                <div className="absolute -top-10 left-0 text-amber-400 font-mono text-sm border-b-2 border-amber-500/50 pb-2 z-50 font-bold tracking-widest bg-black/50 px-4">
                    SYSTEM_BLUEPRINT_V2.0 // ISOMETRIC_VIEW
                </div>

                {/* --- LEVEL 1: INGRESS --- */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30">
                    <RetroBlock
                        label="API_GATEWAY"
                        sublabel="TRAFFIC_CONTROLLER"
                        icon={Globe}
                        color="blue"
                    />
                    {/* Incoming Traffic */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="text-xs font-bold text-blue-400 mb-2 animate-pulse bg-black/50 px-2 rounded">HTTP/1.1 REQUESTS</div>
                        <ArrowDown className="w-8 h-8 text-blue-400 animate-bounce drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                    </div>
                </div>

                {/* Pipe: Gateway -> Arbiter */}
                <DataPipe
                    vertical
                    length="h-28"
                    className="top-32 left-1/2 -translate-x-1/2 -translate-z-10"
                />

                {/* --- LEVEL 2: ARBITER --- */}
                <div className="absolute top-60 left-1/2 -translate-x-1/2 z-20">
                    <RetroBlock
                        label="ARBITER_AI"
                        sublabel="LOGIC_ROUTER"
                        icon={Shield}
                        color="amber"
                    />
                </div>

                {/* Pipes: Split to Services */}
                {/* Left Pipe (to Legacy) */}
                <div className="absolute top-[340px] left-1/2 -translate-x-1/2 w-80 h-28 transform-style-3d -translate-z-20">
                    {/* Horizontal Left */}
                    <div className="absolute top-0 right-1/2 w-40 h-4 bg-amber-500/10 border-y-2 border-amber-400/30">
                        <div className="absolute h-full w-6 bg-red-400 shadow-[0_0_15px_red] animate-[moveHorizontal_2s_linear_infinite_reverse]"></div>
                    </div>
                    {/* Vertical Down Left */}
                    <div className="absolute top-0 left-0 w-4 h-28 bg-amber-500/10 border-x-2 border-amber-400/30">
                        <div className="absolute w-full h-6 bg-red-400 shadow-[0_0_15px_red] animate-[moveVertical_2s_linear_infinite]"></div>
                    </div>
                </div>

                {/* Right Pipe (to Modern) */}
                <div className="absolute top-[340px] left-1/2 -translate-x-1/2 w-80 h-28 transform-style-3d -translate-z-20">
                    {/* Horizontal Right */}
                    <div className="absolute top-0 left-1/2 w-40 h-4 bg-amber-500/10 border-y-2 border-amber-400/30">
                        <div className="absolute h-full w-6 bg-green-400 shadow-[0_0_15px_lime] animate-[moveHorizontal_2s_linear_infinite]"></div>
                    </div>
                    {/* Vertical Down Right */}
                    <div className="absolute top-0 right-0 w-4 h-28 bg-amber-500/10 border-x-2 border-amber-400/30">
                        <div className="absolute w-full h-6 bg-green-400 shadow-[0_0_15px_lime] animate-[moveVertical_2s_linear_infinite]"></div>
                    </div>
                </div>

                {/* --- LEVEL 3: SERVICES --- */}
                <div className="absolute top-[450px] w-full flex justify-between px-10 z-20">
                    {/* Legacy Monolith */}
                    <div className="relative">
                        <RetroBlock
                            label="MONOLITH"
                            sublabel="LEGACY_PHP"
                            icon={Server}
                            color="red"
                        />
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-xs text-red-400 font-mono rotate-90 font-bold tracking-widest">V1.0</div>
                    </div>

                    {/* Modern Microservice */}
                    <div className="relative">
                        <RetroBlock
                            label="MICROSERVICE"
                            sublabel="MODERN_GO"
                            icon={Zap}
                            color="green"
                        />
                        <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs text-green-400 font-mono -rotate-90 font-bold tracking-widest">V2.0</div>
                    </div>
                </div>

                {/* Pipes: Services -> DB */}
                {/* Left Pipe (Legacy -> DB) */}
                <div className="absolute top-[540px] left-10 w-40 h-28 transform-style-3d -translate-z-20">
                    <div className="absolute top-0 left-1/2 w-4 h-28 bg-amber-500/10 border-x-2 border-amber-400/30 skew-x-[35deg] origin-top">
                        <div className="absolute w-full h-6 bg-amber-300 shadow-[0_0_15px_orange] animate-[moveVertical_2s_linear_infinite]"></div>
                    </div>
                </div>
                {/* Right Pipe (Modern -> DB) */}
                <div className="absolute top-[540px] right-10 w-40 h-28 transform-style-3d -translate-z-20">
                    <div className="absolute top-0 right-1/2 w-4 h-28 bg-amber-500/10 border-x-2 border-amber-400/30 skew-x-[-35deg] origin-top">
                        <div className="absolute w-full h-6 bg-amber-300 shadow-[0_0_15px_orange] animate-[moveVertical_2s_linear_infinite]"></div>
                    </div>
                </div>

                {/* --- LEVEL 4: DATABASE --- */}
                <div className="absolute top-[650px] left-1/2 -translate-x-1/2 z-10">
                    <RetroBlock
                        label="SHARED_DB"
                        sublabel="POSTGRESQL"
                        icon={Database}
                        color="amber"
                        className="w-56"
                    />
                    {/* Database Rings Effect */}
                    <div className="absolute -inset-6 border-2 border-amber-400/40 rounded-full rotate-x-60 animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute -inset-10 border-2 border-amber-400/20 rounded-full rotate-x-60 animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>

            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black/90 border-2 border-amber-500/50 p-4 text-xs font-mono text-amber-400 shadow-lg rounded-lg">
                <div className="font-bold mb-2 border-b border-amber-500/30 pb-1">TRAFFIC_LEGEND</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-400 shadow-[0_0_5px_blue]"></div> INGRESS</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-400 shadow-[0_0_5px_red]"></div> LEGACY_ROUTE</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 shadow-[0_0_5px_green]"></div> MODERN_ROUTE</div>
            </div>
        </div>
    );
}
