'use client';

import { File, FileCode, FileJson, FileType, Database, Server } from 'lucide-react';

interface RetroFileStackProps {
    files: { path: string; content: string; description?: string }[];
    selectedFile: { path: string; content: string } | null;
    onSelect: (file: any) => void;
}

export default function RetroFileStack({ files, selectedFile, onSelect }: RetroFileStackProps) {

    const getIcon = (path: string) => {
        if (path.endsWith('.json')) return FileJson;
        if (path.endsWith('.go') || path.endsWith('.ts') || path.endsWith('.js') || path.endsWith('.php')) return FileCode;
        if (path.includes('docker') || path.includes('Dockerfile')) return Server;
        if (path.includes('sql')) return Database;
        return File;
    };

    return (
        <div className="relative w-full perspective-1000 min-h-[400px] flex flex-col items-center justify-start pt-10 group">
            {/* The Stack Container */}
            <div className="relative w-full max-w-xs transform-style-3d transition-transform duration-500 group-hover:rotate-x-12">
                {files.map((file, index) => {
                    const Icon = getIcon(file.path);
                    const isSelected = selectedFile?.path === file.path;

                    // Calculate dynamic styles for the stack effect
                    // When not hovering: tight stack
                    // When hovering: fan out vertically

                    return (
                        <div
                            key={`${file.path}-${index}`}
                            onClick={() => onSelect(file)}
                            onMouseEnter={() => onSelect(file)}
                            className={`
                absolute left-0 right-0 h-24
                border-2 backdrop-blur-md transition-all duration-300 ease-out cursor-pointer
                flex items-center px-4 gap-4 overflow-hidden
                hover:translate-x-4 hover:scale-105 hover:z-50 hover:bg-amber-500/20 hover:border-amber-400
                ${isSelected
                                    ? 'bg-amber-900/40 border-amber-500 z-40 translate-x-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                    : 'bg-black/80 border-amber-500/20 z-0'
                                }
              `}
                            style={{
                                top: `${index * 60}px`, // Base spacing
                                transform: `translateZ(-${index * 10}px)`,
                                zIndex: files.length - index,
                                // The group-hover effect needs to be handled via CSS or inline logic if we want complex fanning
                                // For now, a fixed spacing that looks like a stack is good, and the hover effect on individual cards makes them pop
                            }}
                        >
                            {/* Card Spine (Left) */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSelected ? 'bg-amber-500' : 'bg-amber-900/50'}`} />

                            {/* Icon */}
                            <div className={`
                p-2 rounded-lg border 
                ${isSelected ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-amber-500/10 bg-black text-amber-500/40'}
              `}>
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-mono text-xs font-bold truncate ${isSelected ? 'text-amber-400 text-glow' : 'text-amber-500/60'}`}>
                                    {file.path}
                                </p>
                                <p className="font-mono text-[10px] text-amber-500/30 truncate mt-0.5">
                                    {file.content.length} bytes
                                </p>
                            </div>

                            {/* Active Indicator */}
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500 animate-pulse' : 'bg-transparent'}`} />
                        </div>
                    );
                })}
            </div>

            {/* Decorative Base */}
            <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-sm" />
        </div>
    );
}
