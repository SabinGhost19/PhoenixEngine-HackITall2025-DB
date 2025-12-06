'use client';

import { EndpointAnalysis } from '@/lib/schemas';
import { Info, Database, GitBranch, Shield, AlertTriangle } from 'lucide-react';

interface EndpointInspectorProps {
  analysis: EndpointAnalysis;
}

export default function EndpointInspector({ analysis }: EndpointInspectorProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Endpoint Analysis
            </h2>
            <code className="text-lg text-blue-600 font-mono">
              {analysis.method} {analysis.endpointPath}
            </code>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Migration Effort</span>
            <div className={`text-lg font-bold ${
              analysis.estimatedMigrationEffort === 'low' ? 'text-green-600' :
              analysis.estimatedMigrationEffort === 'medium' ? 'text-yellow-600' :
              analysis.estimatedMigrationEffort === 'high' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {analysis.estimatedMigrationEffort.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Business Logic */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Business Logic</h3>
        </div>
        <p className="text-gray-700 mb-4">{analysis.businessLogic.summary}</p>
        <div className="space-y-2">
          {analysis.businessLogic.steps.map((step, idx) => (
            <div key={idx} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                {idx + 1}
              </span>
              <p className="text-gray-600">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Input Parameters</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Source</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Required</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analysis.inputParameters.map((param, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-mono text-sm">{param.name}</td>
                  <td className="px-4 py-2 text-sm">{param.type}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {param.source}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {param.required ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Operations */}
      {analysis.databaseOperations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Database Operations</h3>
          </div>
          <div className="space-y-4">
            {analysis.databaseOperations.map((op, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    op.type === 'SELECT' ? 'bg-blue-100 text-blue-800' :
                    op.type === 'INSERT' ? 'bg-green-100 text-green-800' :
                    op.type === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {op.type}
                  </span>
                  <div className="flex gap-2">
                    {op.tables.map((table, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{op.description}</p>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  <code>{op.query}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {analysis.dependencies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <GitBranch className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Dependencies</h3>
          </div>
          <div className="grid gap-3">
            {analysis.dependencies.map((dep, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  dep.critical ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{dep.name}</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {dep.type}
                    </span>
                    {dep.critical && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-semibold">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{dep.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Considerations */}
      {analysis.securityConsiderations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Security Considerations</h3>
          </div>
          <div className="space-y-2">
            {analysis.securityConsiderations.map((concern, idx) => (
              <div key={idx} className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{concern}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
