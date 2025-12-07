'use client';

import { useState, useEffect } from 'react';
import { Microservice, VerificationResult } from '@/lib/schemas';
import { FileText, Download, CheckCircle, AlertCircle, Info, Terminal, Shield, Code, ChevronRight, Cpu, Layers, Zap, Activity, Server, Database } from 'lucide-react';
import RetroHolographicDisplay from '../retro/RetroHolographicDisplay';
import RetroCyberBackground from '../retro/RetroCyberBackground';
import RetroFileStack from '../retro/RetroFileStack';

interface MicroservicePreviewProps {
  microservice: Microservice;
  verification: VerificationResult;
  downloadUrl: string;
}

export default function MicroservicePreview({
  microservice,
  verification,
  downloadUrl,
}: MicroservicePreviewProps) {
  // Default to Dockerfile or the first file
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  // Initialize selected file
  useEffect(() => {
    if (microservice.files.length > 0) {
      // Create a virtual file for Dockerfile to include it in the stack if needed, 
      // or just select the first actual file. 
      // Let's treat Dockerfile as a file in the stack for better UX.
      const dockerFileObj = { path: 'Dockerfile', content: microservice.dockerfile, description: 'Container Configuration' };
      // We'll combine them in the render, but for initial state:
      setSelectedFile(dockerFileObj);
    }
  }, [microservice]);

  // Combine Dockerfile and other files for the stack
  const allFiles = [
    { path: 'Dockerfile', content: microservice.dockerfile, description: 'Container Configuration' },
    ...microservice.files
  ];

  return (
    <div className="w-full relative font-mono overflow-hidden rounded-lg min-h-[900px] bg-black">
      {/* Immersive Background */}
      <RetroCyberBackground />

      <div className="relative z-10 p-6 flex flex-col h-full gap-6">

        {/* TOP HUD: System Identity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Identity Module */}
          <div className="lg:col-span-8 box-retro p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <Cpu className="w-32 h-32 text-amber-500 animate-spin-slow" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500/80 text-[10px] uppercase tracking-[0.3em]">System_Online</span>
                <span className="text-amber-500/30 text-[10px] uppercase tracking-widest">|</span>
                <span className="text-amber-500/50 text-[10px] uppercase tracking-widest">ID: {microservice.serviceName}</span>
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-glow mb-2">
                {microservice.serviceName.toUpperCase()}
              </h2>
              <p className="text-amber-100/60 max-w-xl text-sm leading-relaxed border-l-2 border-amber-500/30 pl-3">
                {microservice.description}
              </p>
            </div>
          </div>

          {/* Quick Actions & Key Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex-1 box-retro p-4 flex items-center justify-between group hover:bg-amber-500/10 transition-colors cursor-pointer">
              <div>
                <p className="text-[10px] uppercase text-amber-500/50 tracking-wider">Quality Index</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${verification.score >= 80 ? 'text-green-400' : 'text-amber-400'} text-glow`}>
                    {verification.score}
                  </span>
                  <span className="text-xs text-amber-500/30">/100</span>
                </div>
              </div>
              <Shield className={`w-8 h-8 ${verification.score >= 80 ? 'text-green-500' : 'text-amber-500'} opacity-50 group-hover:scale-110 transition-transform`} />
            </div>

            <a
              href={downloadUrl}
              download
              className="flex-1 btn-retro flex items-center justify-center gap-3 text-sm group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Download className="w-4 h-4 group-hover:animate-bounce" />
              <span>DOWNLOAD_SYSTEM_CORE</span>
            </a>
          </div>
        </div>

        {/* MAIN CONTENT: Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">

          {/* LEFT: Data Cartridges (File Stack) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="box-retro p-4 flex-1 bg-black/40 backdrop-blur-sm border-r-4 border-r-amber-500/20">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Data_Modules
              </h3>
              <RetroFileStack
                files={allFiles}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
              />
            </div>

            {/* Mini Tech Specs */}
            <div className="box-retro p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                <span className="text-[10px] text-amber-500/50 uppercase">Language</span>
                <span className="text-xs font-bold text-blue-400">{microservice.language.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                <span className="text-[10px] text-amber-500/50 uppercase">Port</span>
                <span className="text-xs font-bold text-purple-400">{microservice.port}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-amber-500/50 uppercase">Files</span>
                <span className="text-xs font-bold text-green-400">{microservice.files.length}</span>
              </div>
            </div>
          </div>

          {/* CENTER/RIGHT: Holographic Projector */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* Code Viewer */}
            <div className="flex-1 relative perspective-1000">
              {selectedFile ? (
                <div className="h-full transform-style-3d animate-float-delayed">
                  <RetroHolographicDisplay
                    title={selectedFile.path.toUpperCase()}
                    content={selectedFile.content}
                    language={selectedFile.path.split('.').pop() || 'text'}
                    color={
                      selectedFile.path.includes('Docker') ? 'blue' :
                        selectedFile.path.endsWith('.go') ? 'blue' :
                          selectedFile.path.endsWith('.php') ? 'purple' : 'amber'
                    }
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center box-retro border-dashed border-amber-500/20">
                  <div className="text-center opacity-50">
                    <Activity className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-amber-500 font-mono uppercase tracking-widest">Select a Data Module</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Diagnostics Panel (Collapsible or Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verification Matrix */}
              <div className="box-retro p-5 bg-black/60">
                <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Old System_Diagnostics
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500/20">
                  {verification.issues.length === 0 ? (
                    <div className="flex items-center gap-3 text-green-400/80 p-2 border border-green-500/20 bg-green-900/10 rounded">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">All systems nominal. No issues detected.</span>
                    </div>
                  ) : (
                    verification.issues.map((issue, idx) => (
                      <div key={idx} className="flex gap-3 p-2 border border-red-500/20 bg-red-900/5 rounded hover:bg-red-900/10 transition-colors">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-400 font-bold">{issue.message}</p>
                          {issue.suggestion && <p className="text-[10px] text-red-400/60 mt-1">Fix: {issue.suggestion}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Execution Protocols */}
              <div className="box-retro p-5 bg-black/60">
                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Command_Sequence
                </h3>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="group">
                    <p className="text-blue-500/50 mb-1">BUILD_TARGET</p>
                    <div className="bg-black border border-blue-500/20 p-2 text-blue-300/80 group-hover:text-blue-300 group-hover:border-blue-500/50 transition-all">
                      $ {microservice.buildInstructions[0] || 'docker build .'}
                    </div>
                  </div>
                  <div className="group">
                    <p className="text-green-500/50 mb-1">INITIATE_SEQUENCE</p>
                    <div className="bg-black border border-green-500/20 p-2 text-green-300/80 group-hover:text-green-300 group-hover:border-green-500/50 transition-all">
                      $ {microservice.runInstructions[0] || 'docker run ...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
