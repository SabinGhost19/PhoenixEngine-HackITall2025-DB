'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface RetroHolographicDisplayProps {
    title: string;
    content: string;
    language?: string;
    color?: 'amber' | 'blue' | 'green' | 'purple';
}

export default function RetroHolographicDisplay({
    title,
    content,
    language = 'text',
    color = 'blue'
}: RetroHolographicDisplayProps) {
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const colors = {
        amber: {
            border: 'border-amber-500',
            text: 'text-amber-400',
            bg: 'bg-amber-900/10',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
            gradient: 'from-amber-500/20 to-transparent'
        },
        blue: {
            border: 'border-blue-500',
            text: 'text-blue-400',
            bg: 'bg-blue-900/10',
            glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
            gradient: 'from-blue-500/20 to-transparent'
        },
        green: {
            border: 'border-green-500',
            text: 'text-green-400',
            bg: 'bg-green-900/10',
            glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
            gradient: 'from-green-500/20 to-transparent'
        },
        purple: {
            border: 'border-purple-500',
            text: 'text-purple-400',
            bg: 'bg-purple-900/10',
            glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
            gradient: 'from-purple-500/20 to-transparent'
        }
    };

    const theme = colors[color];

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group perspective-1000 my-8">
            {/* 3D Container */}
            <div
                ref={containerRef}
                className={`
          relative transform-style-3d transition-transform duration-500 ease-out
          group-hover:rotate-x-2 group-hover:scale-[1.02]
          border-2 ${theme.border} ${theme.bg} ${theme.glow}
          backdrop-blur-sm rounded-lg overflow-hidden
        `}
            >
                {/* Holographic Scanline */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg">
                    <div className={`
            absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}
            opacity-50 animate-scanline
          `} />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20 pointer-events-none" />
                </div>

                {/* Header */}
                <div className={`
          flex items-center justify-between px-4 py-2 
          border-b ${theme.border} bg-black/40
          relative z-30
        `}>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${theme.bg.replace('/10', '')} animate-pulse`} />
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${theme.text}`}>
                            {title}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-mono uppercase">{language}</span>
                        <button
                            onClick={handleCopy}
                            className={`
                p-1.5 rounded hover:bg-white/10 transition-colors
                ${theme.text}
              `}
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                </div>

                {/* Code Content */}
                <div className="relative p-4 overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <pre className={`font-mono text-xs ${theme.text} leading-relaxed`}>
                        <code>{content}</code>
                    </pre>

                    {/* Glowing corner accents */}
                    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${theme.border} opacity-50`} />
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${theme.border} opacity-50`} />
                    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${theme.border} opacity-50`} />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${theme.border} opacity-50`} />
                </div>
            </div>

            {/* Reflection/Glow underneath */}
            <div className={`
        absolute -bottom-4 left-4 right-4 h-4 
        bg-gradient-to-b ${theme.gradient} 
        opacity-20 blur-lg transform scale-x-90
      `} />
        </div>
    );
}
