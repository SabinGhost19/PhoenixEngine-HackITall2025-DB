'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Server,
  Play,
  Square,
  RefreshCw,
  Terminal,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [containerLogs, setContainerLogs] = useState<string>('');
  const [selectedContainer, setSelectedContainer] = useState('gateway');
  const [logType, setLogType] = useState<'anomalies' | 'container'>('container');
  const [loading, setLoading] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const containers = [
    "gateway",
    "arbiter",
    "orchestrator",
    "legacy_python",
    "modern_python",
    "legacy_php",
    "modern_go",
    "kafka",
    "redis",
    "postgres"
  ];

  // Poll Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll Logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (logType === 'anomalies') {
          const res = await fetch('/api/logs?type=anomalies');
          const data = await res.json();
          setLogs(data.logs || []);
        } else {
          const res = await fetch(`/api/logs?type=container&container=${selectedContainer}`);
          const data = await res.json();
          setContainerLogs(data.logs || '');
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [logType, selectedContainer, activeTab]);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [containerLogs, activeTab]);

  const handleControl = async (action: 'start' | 'stop') => {
    await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, system: 'python' })
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white font-mono">Initializing Phoenix Engine...</div>;

  const chartData = [
    { name: 'Legacy (Monolith)', value: (1 - stats.weightPython) * 100, fill: '#ef4444' },
    { name: 'Modern (K8s)', value: stats.weightPython * 100, fill: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg shadow-lg shadow-orange-900/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Phoenix Engine
              </h1>
              <p className="text-gray-400 text-xs tracking-wider">AUTONOMOUS MIGRATION SYSTEM</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'logs'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <FileText className="w-4 h-4" />
              System Logs
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Consistency Score</h3>
                  <Server className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 font-mono">
                  {stats.consistencyScore.toFixed(2)}%
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${stats.consistencyScore >= 99.9 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                  {stats.consistencyScore >= 99.9 ? 'SYSTEM STABLE' : 'CALIBRATING...'}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Modern Traffic</h3>
                  <RefreshCw className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 font-mono">
                  {(stats.weightPython * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${stats.weightPython * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Transactions</h3>
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 font-mono">
                  {stats.totalTx.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Processed in real-time</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Traffic Distribution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        cursor={{ fill: '#374151', opacity: 0.4 }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-500" />
                  Mission Control
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => handleControl('start')}
                    disabled={stats.migrationActivePython}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold transition-all transform active:scale-95 ${stats.migrationActivePython
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 border border-green-500'
                      }`}
                  >
                    <Play className="w-5 h-5" />
                    {stats.migrationActivePython ? 'MIGRATION ACTIVE' : 'INITIATE MIGRATION'}
                  </button>

                  <button
                    onClick={() => handleControl('stop')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 border border-red-500 transition-all transform active:scale-95"
                  >
                    <Square className="w-5 h-5" />
                    EMERGENCY ROLLBACK
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Logs Toolbar */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setLogType('container')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${logType === 'container' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Container Logs
                  </button>
                  <button
                    onClick={() => setLogType('anomalies')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${logType === 'anomalies' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Anomalies
                  </button>
                </div>

                {logType === 'container' && (
                  <select
                    value={selectedContainer}
                    onChange={(e) => setSelectedContainer(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {containers.map(c => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                LIVE STREAM
              </div>
            </div>

            {/* Logs Content */}
            <div className="flex-1 bg-black p-4 overflow-y-auto font-mono text-xs md:text-sm">
              {logType === 'anomalies' ? (
                logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={i} className="mb-2 border-b border-gray-900 pb-2 last:border-0 font-mono">
                      <span className="text-red-500 font-bold mr-2">[ALERT]</span>
                      <span className="text-gray-300">{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                    <p>No anomalies detected in the system.</p>
                  </div>
                )
              ) : (
                <pre className="whitespace-pre-wrap text-green-400 leading-relaxed">
                  {containerLogs || <span className="text-gray-600 italic">Waiting for logs...</span>}
                  <div ref={logsEndRef} />
                </pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
