'use client';

import { Microservice, VerificationResult } from '@/lib/schemas';
import { FileText, Download, CheckCircle, AlertCircle, Info, Terminal, Shield, Code, ChevronRight } from 'lucide-react';

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
  return (
    <div className="w-full space-y-8 font-mono">
      {/* Header */}
      <div className="box-retro p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Code className="w-32 h-32 text-amber-500" />
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-amber-500 text-glow mb-2">
              {microservice.serviceName}
            </h2>
            <p className="text-amber-500/60 max-w-2xl">{microservice.description}</p>
          </div>
          <a
            href={downloadUrl}
            download
            className="btn-retro px-6 py-3 flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD_ZIP
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded">
            <p className="text-xs text-blue-500/70 mb-1 uppercase">Language</p>
            <p className="text-xl font-bold text-blue-400 text-glow">
              {microservice.language.toUpperCase()}
            </p>
          </div>
          <div className="bg-purple-900/10 border border-purple-500/30 p-4 rounded">
            <p className="text-xs text-purple-500/70 mb-1 uppercase">Port</p>
            <p className="text-xl font-bold text-purple-400 text-glow">
              {microservice.port}
            </p>
          </div>
          <div className="bg-green-900/10 border border-green-500/30 p-4 rounded">
            <p className="text-xs text-green-500/70 mb-1 uppercase">Files</p>
            <p className="text-xl font-bold text-green-400 text-glow">
              {microservice.files.length}
            </p>
          </div>
          <div className={`p-4 rounded border ${verification.score >= 80 ? 'bg-green-900/10 border-green-500/30' :
              verification.score >= 60 ? 'bg-yellow-900/10 border-yellow-500/30' :
                'bg-red-900/10 border-red-500/30'
            }`}>
            <p className={`text-xs mb-1 uppercase ${verification.score >= 80 ? 'text-green-500/70' :
                verification.score >= 60 ? 'text-yellow-500/70' :
                  'text-red-500/70'
              }`}>Quality Score</p>
            <p className={`text-xl font-bold text-glow ${verification.score >= 80 ? 'text-green-400' :
                verification.score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
              }`}>
              {verification.score}/100
            </p>
          </div>
        </div>
      </div>

      {/* Verification Results */}
      <div className="box-retro p-6">
        <h3 className="text-xl font-bold text-green-500 mb-6 flex items-center gap-2 border-b border-green-500/30 pb-2">
          <Shield className="w-5 h-5" />
          VERIFICATION_RESULTS
        </h3>

        {verification.issues.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-amber-500/70 mb-4 uppercase tracking-wider">Issues Detected</h4>
            <div className="space-y-3">
              {verification.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`border-l-2 p-4 bg-black/40 ${issue.severity === 'error'
                      ? 'border-red-500'
                      : issue.severity === 'warning'
                        ? 'border-yellow-500'
                        : 'border-blue-500'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${issue.severity === 'error'
                            ? 'bg-red-900/20 text-red-500 border-red-500/30'
                            : issue.severity === 'warning'
                              ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/30'
                              : 'bg-blue-900/20 text-blue-500 border-blue-500/30'
                          }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-amber-500/90 text-sm">{issue.message}</span>
                    </div>
                  </div>
                  {issue.file && (
                    <div className="text-xs text-amber-500/40 mb-2 font-mono pl-1">File: {issue.file}</div>
                  )}
                  {issue.suggestion && (
                    <div className="text-xs text-green-500/70 pl-1 flex items-start gap-2">
                      <span className="mt-0.5">💡</span> {issue.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {verification.optimizations.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-amber-500/70 mb-4 uppercase tracking-wider">Optimizations Applied</h4>
            <div className="space-y-2">
              {verification.optimizations.map((opt, idx) => (
                <div
                  key={idx}
                  className="border border-green-500/20 bg-green-900/5 p-3 flex items-center justify-between"
                >
                  <p className="text-sm text-green-500/80">{opt.description}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${opt.impact === 'high'
                        ? 'bg-red-900/20 text-red-400 border-red-500/30'
                        : opt.impact === 'medium'
                          ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-green-900/20 text-green-400 border-green-500/30'
                      }`}
                  >
                    {opt.impact.toUpperCase()}_IMPACT
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {verification.finalRecommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-amber-500/70 mb-4 uppercase tracking-wider">System Recommendations</h4>
            <ul className="space-y-2">
              {verification.finalRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-500/80">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="box-retro p-6">
        <h3 className="text-xl font-bold text-blue-500 mb-6 flex items-center gap-2 border-b border-blue-500/30 pb-2">
          <FileText className="w-5 h-5" />
          GENERATED_ARTIFACTS
        </h3>
        <div className="space-y-3">
          {microservice.files.map((file, idx) => (
            <details key={idx} className="group border border-amber-500/20 bg-black/40 open:bg-black/60 transition-colors">
              <summary className="cursor-pointer p-4 hover:bg-amber-500/5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  {file.path}
                </div>
                <span className="text-xs text-amber-500/30 font-mono">
                  {file.content.length} bytes
                </span>
              </summary>
              <div className="border-t border-amber-500/20 p-4">
                <p className="text-xs text-amber-500/50 mb-3 italic">// {file.description}</p>
                <div className="relative">
                  <div className="absolute top-0 right-0 px-2 py-1 text-[10px] text-amber-500/30 border border-amber-500/20 rounded-bl bg-black">
                    {file.path.split('.').pop()?.toUpperCase()}
                  </div>
                  <pre className="bg-black border border-amber-500/10 p-4 overflow-x-auto text-xs text-green-400/90 font-mono scrollbar-hide max-h-96">
                    <code>{file.content}</code>
                  </pre>
                </div>
              </div>
            </details>
          ))}

          {/* Dockerfile */}
          <details className="group border border-blue-500/20 bg-black/40 open:bg-black/60 transition-colors">
            <summary className="cursor-pointer p-4 hover:bg-blue-500/5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                Dockerfile
              </div>
              <span className="text-xs text-blue-500/30 font-mono">
                CONTAINER_CONFIG
              </span>
            </summary>
            <div className="border-t border-blue-500/20 p-4">
              <pre className="bg-black border border-blue-500/10 p-4 overflow-x-auto text-xs text-blue-300/90 font-mono scrollbar-hide">
                <code>{microservice.dockerfile}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>

      {/* Build & Run Instructions */}
      <div className="box-retro p-6">
        <h3 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2 border-b border-amber-500/30 pb-2">
          <Terminal className="w-5 h-5" />
          EXECUTION_PROTOCOLS
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-amber-500/70 mb-3 uppercase">Build Sequence</h4>
            <div className="bg-black border border-amber-500/20 p-4 font-mono text-xs space-y-2">
              {microservice.buildInstructions.map((instruction, idx) => (
                <div key={idx} className="flex gap-2 text-amber-500/80">
                  <span className="text-amber-500/30 select-none">$</span>
                  {instruction}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-amber-500/70 mb-3 uppercase">Run Sequence</h4>
            <div className="bg-black border border-amber-500/20 p-4 font-mono text-xs space-y-2">
              {microservice.runInstructions.map((instruction, idx) => (
                <div key={idx} className="flex gap-2 text-amber-500/80">
                  <span className="text-amber-500/30 select-none">$</span>
                  {instruction}
                </div>
              ))}
            </div>
          </div>
        </div>

        {microservice.testCommand && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-amber-500/70 mb-3 uppercase">Verification Test</h4>
            <div className="bg-black border border-green-500/20 p-4 font-mono text-xs flex gap-2 text-green-400/80">
              <span className="text-green-500/30 select-none">$</span>
              {microservice.testCommand}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
