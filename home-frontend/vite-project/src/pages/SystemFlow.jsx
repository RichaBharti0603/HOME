import React, { useState, useEffect } from 'react';
import { 
  Play, Database, Server, BrainCircuit, Activity, Cpu, 
  ArrowDown, ShieldAlert, CheckCircle2, RotateCcw,
  Zap, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    { 
      id: 0, 
      title: 'Control Plane (Config)', 
      icon: Database, 
      desc: 'URL validated, alert policies & retry rules stored.',
      details: [
        'Stores Expected Status Code (e.g. 200)',
        'Stores Expected Keyword (e.g. "Success")',
        'Defines Max Retries (e.g. 3)',
        'Defines Cooldown Minutes (e.g. 15m)'
      ]
    },
    { 
      id: 1, 
      title: 'Scheduler Engine', 
      icon: Activity, 
      desc: 'Polls database & triggers checks at set intervals.',
      details: [
        'Iterates over active monitors',
        'Batches jobs by check frequency',
        'Dispatches async tasks to Celery'
      ]
    },
    { 
      id: 2, 
      title: 'Job Queue System', 
      icon: Server, 
      desc: 'Celery worker queue processing async tasks.',
      details: [
        'Redis-backed message broker',
        'Distributes load across worker nodes',
        'Ensures no check is missed or duplicated'
      ]
    },
    { 
      id: 3, 
      title: 'Health Check Engine', 
      icon: Cpu, 
      desc: 'Granular DNS, TCP, and HTTP validation.',
      details: [
        'Measures DNS Resolution Time',
        'Measures TCP Handshake Time',
        'Validates HTTP Status Code',
        'Validates Response Body Keyword'
      ]
    },
    { 
      id: 4, 
      title: 'Classification & Retries', 
      icon: RotateCcw, 
      desc: 'Identifies failures & applies retry suppression.',
      details: [
        'Classifies as DOWN, UP, or DEGRADED',
        'Checks consecutive failure count',
        'Suppresses alerts if below Max Retries threshold'
      ]
    },
    { 
      id: 5, 
      title: 'Alert Policy Engine', 
      icon: BellRing, 
      desc: 'Dispatches multi-channel alerts based on policies.',
      details: [
        'Checks Cooldown Policy to prevent spam',
        'Dispatches to Dashboard, Email, SMS',
        'Triggers Webhooks for integrations'
      ]
    },
    { 
      id: 6, 
      title: 'AI Explanation Engine', 
      icon: BrainCircuit, 
      desc: 'Generates human-readable context from telemetry.',
      details: [
        'Consumes Incident History & Event Store',
        'Analyzes Root Cause',
        'Provides actionable insights via Chat UI'
      ]
    },
  ];

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, steps.length]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">System Intelligence Flow</h1>
          <p className="text-muted font-medium text-sm mt-2">Visualize the end-to-end H.O.M.E monitoring pipeline architecture.</p>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`premium-button px-6 py-3 font-semibold flex items-center gap-2 transition-all shadow-md ${
            isSimulating ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-none' : ''
          }`}
        >
          <Play size={18} className={isSimulating ? 'animate-pulse' : ''} />
          <span>{isSimulating ? 'Stop Pipeline Simulation' : 'Run Pipeline Simulation'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* VISUAL PIPELINE */}
         <div className="lg:col-span-2 bento-card relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 transition-all duration-700" 
                style={{ background: `radial-gradient(circle at center ${activeStep * (100/steps.length)}%, #4F46E5 0%, transparent 50%)`}} />
                
           <div className="flex flex-col items-center space-y-2 relative z-10">
             {steps.map((step, index) => {
               const Icon = step.icon;
               const isActive = index === activeStep && isSimulating;
               const isPast = index < activeStep && isSimulating;
               const isHovered = hoveredStep === index;
               
               return (
                 <React.Fragment key={step.id}>
                   <motion.div 
                     onMouseEnter={() => setHoveredStep(index)}
                     onMouseLeave={() => setHoveredStep(null)}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className={`w-full max-w-lg p-5 rounded-2xl border transition-all duration-300 flex items-center space-x-5 cursor-help relative group shadow-sm
                       ${isActive ? 'border-accent-primary bg-white shadow-floating scale-[1.02]' : 
                         isHovered ? 'border-border/80 bg-surface shadow-md scale-[1.01]' :
                         isPast ? 'border-border/60 bg-white opacity-80' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}
                   >
                     <div className={`p-4 rounded-xl transition-colors ${isActive ? 'bg-accent-primary text-white shadow-accent-glow' : 'bg-gray-100 text-muted group-hover:bg-gray-200'}`}>
                       <Icon size={24} className={isActive ? 'animate-pulse' : ''} />
                     </div>
                     <div className="flex-1">
                       <h3 className={`font-extrabold text-lg tracking-tight ${isActive ? 'text-foreground' : 'text-gray-700'}`}>{step.title}</h3>
                       <p className="text-xs font-semibold text-muted mt-1">{step.desc}</p>
                     </div>
                     {(isPast || (!isSimulating && index === 0)) && !isActive && <CheckCircle2 className="text-emerald-500" size={24} />}

                     {/* HOVER DETAILS CARD */}
                     <AnimatePresence>
                        {isHovered && (
                           <motion.div 
                             initial={{ opacity: 0, x: 20, scale: 0.95 }}
                             animate={{ opacity: 1, x: 0, scale: 1 }}
                             exit={{ opacity: 0, x: 10, scale: 0.95 }}
                             className="absolute left-full ml-6 top-1/2 -translate-y-1/2 w-72 bg-gray-900 text-white p-5 rounded-2xl shadow-xl z-50 pointer-events-none"
                           >
                              <div className="absolute w-3 h-3 bg-gray-900 rotate-45 -left-1.5 top-1/2 -translate-y-1/2"></div>
                              <h4 className="font-bold text-sm mb-3 text-indigo-300 flex items-center gap-2">
                                <Activity size={16} /> Process Details
                              </h4>
                              <ul className="space-y-2">
                                 {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-gray-300">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                                       {detail}
                                    </li>
                                 ))}
                              </ul>
                           </motion.div>
                        )}
                     </AnimatePresence>
                   </motion.div>
                   
                   {index < steps.length - 1 && (
                     <div className={`transition-all duration-500 ${isActive ? 'text-accent-primary' : 'text-gray-200'}`}>
                       <ArrowDown size={28} className={isActive ? 'animate-bounce' : ''} />
                     </div>
                   )}
                 </React.Fragment>
               );
             })}
           </div>
         </div>

         {/* SIDE INFO CARDS */}
         <div className="space-y-6">
           <div className="bento-card">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 border border-emerald-100">
                <Activity size={24} />
             </div>
             <h3 className="font-extrabold text-lg text-foreground mb-2">Live Execution Layer</h3>
             <div className="flex items-center space-x-3 text-muted font-bold bg-background p-4 rounded-xl border border-border/80">
               <span className="relative flex h-3 w-3 shrink-0">
                 <span className={`${isSimulating ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <span className="text-xs">{isSimulating ? 'Pipeline Actively Processing' : 'System Idle'}</span>
             </div>
           </div>
           
           <div className="bento-card">
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-5 border border-amber-100">
                <ShieldAlert size={24} />
             </div>
             <h3 className="font-extrabold text-lg text-foreground mb-2">Retry Suppression Active</h3>
             <p className="text-xs font-semibold text-muted leading-relaxed mb-4">
               Transients network blips are filtered out. Alerts only fire after the consecutive failure threshold is met.
             </p>
             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full bg-amber-500 transition-all duration-1000 ${isSimulating && activeStep === 4 ? 'w-2/3' : 'w-0'}`}></div>
             </div>
             <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                <span>0/3 Fails</span>
                <span>Threshold</span>
             </div>
           </div>

           <div className="bento-card bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
             <div className="w-12 h-12 bg-white text-accent-primary rounded-xl flex items-center justify-center mb-5 shadow-sm border border-indigo-50">
                <BrainCircuit size={24} />
             </div>
             <h3 className="font-extrabold text-lg text-foreground mb-2">AI Diagnostic Output</h3>
             <p className="text-xs font-semibold text-muted italic relative z-10 leading-relaxed">
               {isSimulating && activeStep === 6 
                  ? "Analysis: Endpoint is returning HTTP 200, but required keyword 'checkout' is missing. Suspect partial application failure." 
                  : "Waiting for incident data to classify and explain..."}
             </p>
           </div>
         </div>
      </div>
    </div>
  );
}
