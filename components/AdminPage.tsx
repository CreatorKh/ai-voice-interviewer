
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { AdminSettings } from '../types';

interface AdminPageProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'logs' | 'config'>('monitor');
  const [logs, setLogs] = useState<any[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const fetchLogs = () => {
          try {
              const raw = localStorage.getItem('pipeline_logs');
              if (raw) {
                  const parsed = JSON.parse(raw);
                  // Sort by newset first for list, oldest first for console
                  setLogs(parsed.reverse());
              }
          } catch (e) {}
      };
      
      fetchLogs();
      const interval = setInterval(fetchLogs, 1000);
      return () => clearInterval(interval);
  }, []);

  const getLogColor = (type: string) => {
      switch(type) {
          case 'ERROR': return 'text-red-500';
          case 'STATE_CHANGE': return 'text-cyan-400';
          case 'LLM_CALL': return 'text-purple-400';
          case 'EVALUATION': return 'text-green-400';
          case 'INFO': return 'text-blue-300';
          default: return 'text-neutral-400';
      }
  };

  const clearLogs = () => {
      localStorage.removeItem('pipeline_logs');
      setLogs([]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight">Pipeline Admin</h1>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {(['monitor', 'config'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                        activeTab === tab ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'monitor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
              {/* Live Console */}
              <div className="lg:col-span-2 flex flex-col bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                  <div className="p-3 border-b border-white/10 bg-neutral-900/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-500">&gt;_</span>
                          <span className="text-sm font-medium text-neutral-300">Live Pipeline Logs</span>
                      </div>
                      <button onClick={clearLogs} className="text-xs text-neutral-500 hover:text-white transition-colors">Clear</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                      {logs.length === 0 && <div className="text-neutral-600 italic pt-10 text-center">Waiting for interview events...</div>}
                      {logs.map((log, i) => (
                          <div key={i} className="flex gap-3 hover:bg-white/[0.02] p-1 rounded group">
                              <span className="text-neutral-600 flex-shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}</span>
                              <span className={cn("font-bold w-24 flex-shrink-0", getLogColor(log.type))}>{log.type}</span>
                              <div className="text-neutral-300 break-all">
                                  {log.message}
                                  {log.details && (
                                      <span className="ml-2 text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                          {JSON.stringify(log.details)}
                                      </span>
                                  )}
                              </div>
                          </div>
                      ))}
                      <div ref={logEndRef} />
                  </div>
              </div>

              {/* Stats / Status */}
              <div className="flex flex-col gap-4">
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-xl">
                      <h3 className="text-sm font-medium text-neutral-400 mb-4">System Health</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-300">API Latency</span>
                              <span className="text-sm font-mono text-green-400">~450ms</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-300">Audio Stream</span>
                              <span className="text-sm font-mono text-green-400">Active</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-300">Pipeline State</span>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">READY</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-xl flex-1">
                      <h3 className="text-sm font-medium text-neutral-400 mb-4">Quick Actions</h3>
                       <div className="space-y-2">
                           <Button variant="outline" className="w-full justify-start text-xs h-9 border-white/5 bg-white/[0.01]">Export Logs as JSON</Button>
                           <Button variant="outline" className="w-full justify-start text-xs h-9 border-white/5 bg-white/[0.01]">Reset Evaluation Metrics</Button>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'config' && (
        <div className="max-w-2xl mx-auto bg-white/[0.02] border border-white/10 rounded-xl p-8">
             <div className="mb-6">
                 <h2 className="text-lg font-semibold text-white">Pipeline Configuration</h2>
                 <p className="text-sm text-neutral-400">Adjust prompts and behavioral parameters.</p>
             </div>
             
             <div className="space-y-6">
                 <div className="space-y-2">
                     <label className="text-sm font-medium text-neutral-300">System Prompt (Interviewer)</label>
                     <textarea 
                        className="w-full bg-black border border-white/10 rounded-lg p-4 font-mono text-xs text-neutral-300 min-h-[300px] focus:ring-1 focus:ring-cyan-500 outline-none leading-relaxed"
                        defaultValue={settings.interviewer.systemPrompt}
                     />
                 </div>
                 <div className="flex justify-end pt-4">
                     <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">Save Changes</Button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
