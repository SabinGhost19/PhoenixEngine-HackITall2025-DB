'use client';

import { Endpoint } from '@/lib/schemas';
import { ChevronRight, Code, Database, AlertCircle } from 'lucide-react';

interface EndpointTableProps {
  endpoints: Endpoint[];
  onSelectEndpoint: (endpoint: Endpoint) => void;
}

export default function EndpointTable({ endpoints, onSelectEndpoint }: EndpointTableProps) {
  const complexityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Code className="w-6 h-6 mr-2 text-blue-600" />
            Detected Endpoints ({endpoints.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complexity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpoints.map((endpoint) => (
                <tr
                  key={endpoint.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        methodColors[endpoint.method] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-900 font-mono">
                      {endpoint.path}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {endpoint.file}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {endpoint.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        complexityColors[endpoint.complexity]
                      }`}
                    >
                      {endpoint.complexity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectEndpoint(endpoint)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Migrate
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {endpoints.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No endpoints detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
