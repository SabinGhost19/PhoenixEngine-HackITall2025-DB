'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, GitBranch, Code, Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Monolith to Microservices
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              AI-Powered Migration
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your legacy PHP monolith into modern microservices with our
            intelligent multi-agent system. Choose your target language and get
            production-ready code in minutes.
          </p>
          <button
            onClick={() => router.push('/upload')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
          >
            Start Migration
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Fast Analysis
            </h3>
            <p className="text-gray-600">
              AI-powered architecture analysis detects all endpoints and dependencies
              in seconds.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Multi-Language
            </h3>
            <p className="text-gray-600">
              Generate microservices in Go, Python (FastAPI), or Node.js +
              TypeScript.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Production Ready
            </h3>
            <p className="text-gray-600">
              Complete with Dockerfile, tests, error handling, and API
              documentation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Security First
            </h3>
            <p className="text-gray-600">
              Automated security checks and validation for safe, reliable code.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { num: '1', title: 'Upload', desc: 'Upload your monolith code' },
              { num: '2', title: 'Analyze', desc: 'AI detects endpoints' },
              { num: '3', title: 'Select', desc: 'Choose endpoint & language' },
              { num: '4', title: 'Generate', desc: 'AI creates microservice' },
              { num: '5', title: 'Download', desc: 'Get production-ready code' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {step.num}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
