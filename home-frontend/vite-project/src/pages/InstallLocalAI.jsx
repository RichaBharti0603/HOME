import React from 'react';
import { Terminal, Download, Shield, Cpu, Play } from 'lucide-react';

const InstallLocalAI = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Local Private AI Assistant</h1>
        <p className="text-gray-500 mt-2 text-lg">Install the H.O.M.E offline operating assistant to automate tasks directly on your machine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <Shield size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">100% Private</h3>
          <p className="text-sm text-gray-500">Your data never leaves your computer. Runs completely offline via Ollama.</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Terminal size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Task Engine</h3>
          <p className="text-sm text-gray-500">Can analyze local files, check system performance, and summarize logs.</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <Cpu size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Hardware Native</h3>
          <p className="text-sm text-gray-500">Utilizes your local CPU/GPU for instant, zero-latency inferences.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-950">
          <div className="flex items-center space-x-2">
            <Terminal size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-200">1-Click Docker Installation</h3>
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className="p-8">
          <p className="text-gray-400 mb-4 font-mono text-sm"># 1. Download the docker-compose file</p>
          <div className="bg-black rounded-lg p-4 mb-6 flex justify-between items-center group">
            <code className="text-green-400 font-mono text-sm">curl -O https://raw.githubusercontent.com/home-ai/home/main/docker-compose.local.yml</code>
            <button className="text-gray-500 hover:text-white transition-colors">Copy</button>
          </div>
          
          <p className="text-gray-400 mb-4 font-mono text-sm"># 2. Start the Local AI stack</p>
          <div className="bg-black rounded-lg p-4 flex justify-between items-center group">
            <code className="text-blue-400 font-mono text-sm">docker-compose -f docker-compose.local.yml up -d</code>
            <button className="text-gray-500 hover:text-white transition-colors">Copy</button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-8 pt-8 border-t border-gray-200">
        <a href="http://localhost:9000" target="_blank" rel="noreferrer" className="premium-button inline-flex items-center px-6 py-3">
          <Play size={18} className="mr-2" /> Open Local Assistant UI
        </a>
        <button className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors inline-flex items-center">
          <Download size={18} className="mr-2" /> Download Desktop App
        </button>
      </div>

    </div>
  );
};

export default InstallLocalAI;
