'use client';

import { Microservice, VerificationResult } from '@/lib/schemas';
import { FileText, Download, CheckCircle, AlertCircle, Info } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {microservice.serviceName}
            </h2>
            <p className="text-gray-600">{microservice.description}</p>
          </div>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download ZIP
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Language</p>
            <p className="text-lg font-bold text-blue-600">
              {microservice.language.toUpperCase()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Port</p>
            <p className="text-lg font-bold text-purple-600">
              {microservice.port}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Files</p>
            <p className="text-lg font-bold text-green-600">
              {microservice.files.length}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${
            verification.score >= 80 ? 'bg-green-50' :
            verification.score >= 60 ? 'bg-yellow-50' :
            'bg-red-50'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Quality Score</p>
            <p className={`text-lg font-bold ${
              verification.score >= 80 ? 'text-green-600' :
              verification.score >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {verification.score}/100
            </p>
          </div>
        </div>
      </div>

      {/* Verification Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          Verification Results
        </h3>

        {verification.issues.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Issues Found</h4>
            <div className="space-y-2">
              {verification.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 p-3 rounded ${
                    issue.severity === 'error'
                      ? 'border-red-500 bg-red-50'
                      : issue.severity === 'warning'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded mr-2 ${
                          issue.severity === 'error'
                            ? 'bg-red-200 text-red-800'
                            : issue.severity === 'warning'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-700">{issue.message}</span>
                    </div>
                  </div>
                  {issue.file && (
                    <p className="text-xs text-gray-500 mt-1">File: {issue.file}</p>
                  )}
                  {issue.suggestion && (
                    <p className="text-sm text-gray-600 mt-2">
                      💡 {issue.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {verification.optimizations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Suggested Optimizations</h4>
            <div className="space-y-2">
              {verification.optimizations.map((opt, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{opt.description}</p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        opt.impact === 'high'
                          ? 'bg-red-100 text-red-800'
                          : opt.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {opt.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {verification.finalRecommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Final Recommendations</h4>
            <ul className="space-y-2">
              {verification.finalRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          Generated Files
        </h3>
        <div className="space-y-3">
          {microservice.files.map((file, idx) => (
            <details key={idx} className="border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 hover:bg-gray-50 font-mono text-sm">
                {file.path}
                <span className="text-xs text-gray-500 ml-2">
                  ({file.content.length} chars)
                </span>
              </summary>
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                  <code>{file.content}</code>
                </pre>
              </div>
            </details>
          ))}

          {/* Dockerfile */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="cursor-pointer p-4 hover:bg-gray-50 font-mono text-sm">
              Dockerfile
            </summary>
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                <code>{microservice.dockerfile}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>

      {/* Build & Run Instructions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Build & Run Instructions
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Build</h4>
            <ol className="list-decimal list-inside space-y-1">
              {microservice.buildInstructions.map((instruction, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Run</h4>
            <ol className="list-decimal list-inside space-y-1">
              {microservice.runInstructions.map((instruction, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {microservice.testCommand && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Test</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                <code>{microservice.testCommand}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
