'use client';

import { useState } from 'react';
import { Code2, CheckCircle } from 'lucide-react';

interface LanguageSelectorProps {
  onSelect: (language: 'go' | 'python' | 'node-ts') => void;
}

type Language = 'go' | 'python' | 'node-ts';

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selected, setSelected] = useState<Language | null>(null);

  const languages = [
    {
      id: 'go' as const,
      name: 'Go',
      description: 'High-performance, compiled language. Great for microservices.',
      features: ['Fast execution', 'Low memory usage', 'Built-in concurrency', 'Static typing'],
      color: 'blue',
    },
    {
      id: 'python' as const,
      name: 'Python (FastAPI)',
      description: 'Modern, fast Python framework with automatic API documentation.',
      features: ['Easy to read', 'Rich ecosystem', 'Async support', 'Auto-validation'],
      color: 'green',
    },
    {
      id: 'node-ts' as const,
      name: 'Node.js + TypeScript',
      description: 'JavaScript runtime with TypeScript for type safety.',
      features: ['Large ecosystem', 'Fast development', 'Type safety', 'Event-driven'],
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
  };

  const handleSelect = (lang: Language) => {
    setSelected(lang);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-8">
          <Code2 className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select Target Language
            </h2>
            <p className="text-gray-600">
              Choose the programming language for your new microservice
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {languages.map((lang) => {
            const colors = colorClasses[lang.color as keyof typeof colorClasses];
            const isSelected = selected === lang.id;

            return (
              <div
                key={lang.id}
                onClick={() => handleSelect(lang.id)}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className={`w-6 h-6 ${colors.text}`} />
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {lang.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {lang.description}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase">
                    Key Features
                  </p>
                  <ul className="space-y-1">
                    {lang.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          {selected ? `Generate ${languages.find(l => l.id === selected)?.name} Microservice` : 'Select a Language'}
        </button>
      </div>
    </div>
  );
}
