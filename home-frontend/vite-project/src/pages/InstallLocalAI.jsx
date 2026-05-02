import React, { useState, useEffect } from 'react';
import { 
  Terminal, Download, Shield, Cpu, Play, CheckCircle2, 
  ChevronDown, Copy, Check, Server, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallLocalAI() {
  const [os, setOs] = useState('windows');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [localAIStatus, setLocalAIStatus] = useState('unknown'); // unknown, checking, online, offline
  const [activeAccordion, setActiveAccordion] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const pingLocalAI = async () => {
    setIsChecking(true);
    setLocalAIStatus('checking');
    try {
      const res = await fetch('http://localhost:9000/health', { method: 'GET' });
      if (res.ok) {
        setLocalAIStatus('online');
      } else {
        setLocalAIStatus('offline');
      }
    } catch (e) {
      setLocalAIStatus('offline');
    }
    setIsChecking(false);
  };

  // Initial Check
  useEffect(() => {
    pingLocalAI();
  }, []);

  const commands = {
    windows: 'Set-ExecutionPolicy Bypass -Scope Process -Force; .\\install-local.ps1',
    mac: 'curl -sO https://raw.githubusercontent.com/home-ai/home/main/install-local.sh && chmod +x install-local.sh && ./install-local.sh',
    linux: 'curl -sO https://raw.githubusercontent.com/home-ai/home/main/install-local.sh && chmod +x install-local.sh && ./install-local.sh'
  };

  const faqs = [
    {
      q: "Docker daemon is not running error",
      a: "Ensure Docker Desktop is open and running in your system tray/menu bar before executing the installation script."
    },
    {
      q: "Advanced Manual Setup",
      a: "If you prefer manual setup, download the docker-compose.local.yml file and run: `docker-compose -f docker-compose.local.yml up -d` followed by `docker exec home_local_ollama ollama pull llama3`."
    },
    {
      q: "Where does the AI look for files?",
      a: "By default, the installer mounts your user home directory to the AI container. The AI cannot access files outside of this specific mounted volume."
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider mb-6 border border-blue-100 shadow-sm">
          <Shield size={14} /> 100% Private Offline Inference
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          Install Your Private Offline AI Assistant
        </h1>
        <p className="text-gray-500 text-lg md:text-xl">
          Deploy an intelligent, zero-latency diagnostic engine directly on your hardware. Your telemetry and incident data never leave your machine.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Shield size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Isolated Privacy</h3>
          <p className="text-sm text-gray-500">Incident data is analyzed completely offline. Zero external API calls.</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Cpu size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Hardware Accelerated</h3>
          <p className="text-sm text-gray-500">Native utilization of Apple Silicon, Nvidia GPUs, or Intel/AMD CPUs.</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Server size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Seamless Bridge</h3>
          <p className="text-sm text-gray-500">The cloud dashboard automatically detects and securely delegates tasks.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Step 1 */}
        <div className="relative pl-10 md:pl-0">
          <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8 items-start">
            <div className="hidden md:flex justify-end">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-gray-50">1</div>
            </div>
            <div className="absolute left-0 top-0 md:hidden w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">1</div>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Install Docker Desktop</h3>
              <p className="text-gray-500 mb-6">The AI engine requires Docker to orchestrate Ollama and the Local Bridge safely.</p>
              <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noreferrer" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors">
                <Download size={18} className="mr-2" /> Download Docker
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative pl-10 md:pl-0">
          <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8 items-start">
            <div className="hidden md:flex justify-end">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-gray-50">2</div>
            </div>
            <div className="absolute left-0 top-0 md:hidden w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">2</div>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Run the Installer</h3>
              <p className="text-gray-500 mb-6">Select your operating system and paste this command into your terminal.</p>
              
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-4">
                {['windows', 'mac', 'linux'].map(sys => (
                  <button 
                    key={sys}
                    onClick={() => setOs(sys)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${os === sys ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {sys}
                  </button>
                ))}
              </div>

              <div className="bg-[#0D1117] rounded-xl overflow-hidden border border-gray-800 shadow-inner">
                <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center bg-[#161B22]">
                  <span className="text-xs font-mono text-gray-400">Terminal</span>
                  <button 
                    onClick={() => handleCopy(commands[os])}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedScript ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className="text-sm font-mono text-green-400 whitespace-nowrap">
                    {commands[os]}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative pl-10 md:pl-0">
          <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8 items-start">
            <div className="hidden md:flex justify-end">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-gray-50">3</div>
            </div>
            <div className="absolute left-0 top-0 md:hidden w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">3</div>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Connection</h3>
                <p className="text-gray-500 text-sm">Ensure the H.O.M.E cloud can securely detect your local engine.</p>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button 
                  onClick={pingLocalAI}
                  disabled={isChecking}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all text-gray-700 shadow-sm w-full justify-center sm:w-auto"
                >
                  <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
                  Ping Local Agent
                </button>
                
                {localAIStatus === 'online' && (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    <CheckCircle2 size={16} /> Connection Established
                  </div>
                )}
                {localAIStatus === 'offline' && (
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    <Terminal size={16} /> Agent Offline or Still Starting
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Control Center Call to Action */}
      <div className="max-w-3xl mx-auto text-center mt-12 border-t border-gray-200 pt-12">
        <a href="http://localhost:9000" target="_blank" rel="noreferrer" className="premium-button inline-flex items-center px-8 py-4 text-lg shadow-xl shadow-indigo-500/20">
          <Play size={20} className="mr-2" /> Launch Local Control Center
        </a>
        <p className="text-sm text-gray-500 mt-4">Runs on http://localhost:9000</p>
      </div>

      {/* Troubleshooting Accordion */}
      <div className="max-w-3xl mx-auto mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting & Advanced</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-gray-900 text-left hover:bg-gray-50"
              >
                {faq.q}
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeAccordion === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeAccordion === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4 text-gray-600 leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
