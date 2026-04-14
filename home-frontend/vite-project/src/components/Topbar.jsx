import React from 'react';
import { Bell, Search, User, ShieldCheck } from 'lucide-react';

const Topbar = ({ title }) => {
  return (
    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">{title || 'Overview'}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-up/10 border border-status-up/20">
          <div className="w-2 h-2 rounded-full bg-status-up animate-pulse"></div>
          <span className="text-[10px] font-black uppercase text-status-up tracking-widest">Engine Live</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-muted hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-muted hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full border-2 border-background"></span>
          </button>
          <div className="h-8 w-px bg-border mx-2"></div>
          <button className="flex items-center gap-2 p-1 pl-3 rounded-full bg-surface border border-border hover:bg-white/5 transition-all">
            <span className="text-xs font-bold text-white px-1">Admin</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              JS
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
