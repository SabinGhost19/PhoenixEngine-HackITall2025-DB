'use client';

import { Endpoint } from '@/lib/schemas';
import { ChevronRight, Code, Terminal, AlertCircle } from 'lucide-react';

interface EndpointTableProps {
  endpoints: Endpoint[];
  onSelectEndpoint: (endpoint: Endpoint) => void;
}

export default function EndpointTable({ endpoints, onSelectEndpoint }: EndpointTableProps) {
  const complexityColors = {
    low: 'text-green-500 border-green-500/50 bg-green-900/20',
    medium: 'text-yellow-500 border-yellow-500/50 bg-yellow-900/20',
    high: 'text-red-500 border-red-500/50 bg-red-900/20',
  };

  const methodColors: Record<string, string> = {
    GET: 'text-blue-400 border-blue-400/50 bg-blue-900/20',
    POST: 'text-green-400 border-green-400/50 bg-green-900/20',
    PUT: 'text-yellow-400 border-yellow-400/50 bg-yellow-900/20',
    DELETE: 'text-red-400 border-red-400/50 bg-red-900/20',
    PATCH: 'text-purple-400 border-purple-400/50 bg-purple-900/20',
  };

  return (
    <div className="w-full box-retro">
      <div className="px-6 py-4 border-b border-amber-500/30 flex items-center justify-between bg-amber-900/10">
        <h2 className="text-xl font-bold text-glow flex items-center">
          <Terminal className="w-6 h-6 mr-2 text-amber-500" />
          DETECTED_ENDPOINTS <span className="ml-2 text-sm text-amber-500/50">[{endpoints.length}]</span>
        </h2>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50 animate-pulse delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50 animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead className="bg-amber-900/20 border-b border-amber-500/30 text-amber-500/70">
            <tr>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Path</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left uppercase tracking-wider">Complexity</th>
              <th className="px-6 py-3 text-right uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10">
            {endpoints.map((endpoint) => (
              <tr
                key={endpoint.id}
                className="hover:bg-amber-500/5 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-bold border ${methodColors[endpoint.method] || 'text-gray-400 border-gray-400/50'
                      }`}
                  >
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-amber-500 font-bold group-hover:text-glow transition-all">
                    {endpoint.path}
                  </code>
                </td>
                <td className="px-6 py-4 text-amber-500/70">
                  {endpoint.file}
                </td>
                <td className="px-6 py-4 text-amber-500/60 max-w-xs truncate">
                  {endpoint.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-bold border ${complexityColors[endpoint.complexity]
                      }`}
                  >
                    {endpoint.complexity.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onSelectEndpoint(endpoint)}
                    className="inline-flex items-center px-4 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/50 text-amber-500 text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_10px_rgba(255,176,0,0.5)]"
                  >
                    INIT_MIGRATION
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {endpoints.length === 0 && (
        <div className="px-6 py-12 text-center text-amber-500/50">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono">NO_ENDPOINTS_DETECTED_IN_SCAN</p>
        </div>
      )}
    </div>
  );
}
