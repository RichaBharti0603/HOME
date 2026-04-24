import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const LogsViewer = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={16} />
          Event Stream
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-border text-gray-500 uppercase">
          Live Feed
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-border hover:bg-white/[0.05] transition-colors"
          >
            <div className={`mt-1 p-1 rounded-full ${
              log.status === 'UP' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {log.status === 'UP' ? <CheckCircle size={14} /> : <XCircle size={14} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold ${
                  log.status === 'UP' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {log.status === 'UP' ? 'System Reachable' : 'Connection Failed'}
                </span>
                <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="font-mono text-gray-600">LATENCY</span>
                  {log.response_time ? `${log.response_time}ms` : 'N/A'}
                </div>
                {log.error_message && (
                  <div className="text-xs text-red-400/80 truncate flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {log.error_message}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">
            No events recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsViewer;
