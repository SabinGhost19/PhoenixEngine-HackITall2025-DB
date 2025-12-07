'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, GitBranch, Code, Shield, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState('');
  const fullText = 'INITIALIZING SYSTEM...';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,176,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header Terminal */}
        <div className="box-retro mb-12 p-8 animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-amber-500 animate-pulse" />
              <span className="text-xl font-bold tracking-widest text-glow">AGENTS_ORCHESTRATOR_V2.0</span>
            </div>
            <div className="text-sm text-amber-500/70 font-mono">
              SYS.STATUS: <span className="text-green-500 animate-pulse">ONLINE</span>
            </div>
          </div>

          <div className="space-y-6 text-center">
            <pre className="text-[10px] md:text-xs leading-[10px] text-amber-500/50 font-mono select-none hidden md:block">
              {`
    _    ____ _____ _   _ _____ ____    ___  ____   ____ _   _ _____ ____ _____ ____      _  _____ ___  ____  
   / \\  / ___| ____| \\ | |_   _/ ___|  / _ \\|  _ \\ / ___| | | | ____/ ___|_   _|  _ \\    / \\|_   _/ _ \\|  _ \\ 
  / _ \\| |  _|  _| |  \\| | | | \\___ \\ | | | | |_) | |   | |_| |  _| \\___ \\ | | | |_) |  / _ \\ | || | | | |_) |
 / ___ \\ |_| | |___| |\\  | | |  ___) || |_| |  _ <| |___|  _  | |___ ___) || | |  _ <  / ___ \\| || |_| |  _ < 
/_/   \\_\\____|_____|_| \\_| |_| |____/  \\___/|_| \\_\\\\____|_| |_|_____|____/ |_| |_| \\_\\/_/   \\_\\_| \\___/|_| \\_\\
`}
            </pre>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow-lg tracking-tighter">
              LEGACY <span className="text-amber-500 animate-pulse">Transformation</span> SYSTEM
            </h1>

            <div className="font-mono text-xl text-amber-500/80 h-8 mb-8">
              &gt; {text}<span className="animate-blink">_</span>
            </div>

            <button
              onClick={() => router.push('/upload')}
              className="btn-retro text-xl px-12 py-4 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                INITIALIZE MIGRATION PROTOCOL
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Zap, title: "ANALYSIS_MODULE", desc: "Deep structural scanning of legacy codebases." },
            { icon: GitBranch, title: "LANG_CONVERTER", desc: "Polyglot synthesis: Go, Python, Node.js." },
            { icon: Code, title: "CODE_GEN_CORE", desc: "Production-grade microservice fabrication." },
            { icon: Shield, title: "SECURITY_LAYER", desc: "Automated vulnerability detection protocols." }
          ].map((item, idx) => (
            <div key={idx} className="box-retro p-6 hover:bg-amber-900/10 transition-colors group cursor-default">
              <div className="w-12 h-12 border border-amber-500/50 flex items-center justify-center mb-4 group-hover:border-amber-500 group-hover:shadow-[0_0_10px_rgba(255,176,0,0.4)] transition-all">
                <item.icon className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-glow">{item.title}</h3>
              <p className="text-sm text-amber-500/70 font-mono">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* System Logs / How It Works */}
        <div className="box-retro p-8">
          <h2 className="text-2xl font-bold mb-6 border-b border-amber-500/30 pb-2 flex items-center gap-2">
            <span className="animate-pulse">▶</span> EXECUTION_PIPELINE
          </h2>
          <div className="grid md:grid-cols-5 gap-4 font-mono text-sm">
            {[
              { step: "01", label: "UPLOAD_SOURCE", status: "WAITING" },
              { step: "02", label: "SCAN_ARCH", status: "PENDING" },
              { step: "03", label: "SELECT_TARGET", status: "PENDING" },
              { step: "04", label: "GENERATE_MS", status: "PENDING" },
              { step: "05", label: "DEPLOY_PKG", status: "PENDING" },
            ].map((item, idx) => (
              <div key={idx} className="border border-amber-500/20 p-4 text-center hover:border-amber-500/50 transition-colors">
                <div className="text-xs text-amber-500/50 mb-1">STEP_{item.step}</div>
                <div className="font-bold mb-2">{item.label}</div>
                <div className="text-[10px] bg-amber-900/30 inline-block px-2 py-0.5 rounded text-amber-500/70">
                  [{item.status}]
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
