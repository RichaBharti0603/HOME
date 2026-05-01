import React from 'react';
import { Bell, Search, User, ShieldCheck } from 'lucide-react';

const Topbar = ({ title }) => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title || 'Overview'}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-status-up animate-pulse"></div>
          <span className="text-xs font-semibold text-status-up tracking-wide">System Online</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary rounded-full border-2 border-white"></span>
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <button className="flex items-center gap-2 p-1 pl-3 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <span className="text-sm font-medium text-gray-700 px-1">Admin</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-accent-primary shadow-sm">
              AD
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
