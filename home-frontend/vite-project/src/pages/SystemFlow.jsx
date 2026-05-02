import React, { useState, useEffect } from 'react';
import { Play, Database, Server, BrainCircuit, Activity, Cpu, ArrowDown, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SystemFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const steps = [
    { id: 0, title: 'Website Registration', icon: Database, desc: 'URL validated and stored.' },
    { id: 1, title: 'Scheduler Engine', icon: Activity, desc: 'Triggers checks at set intervals.' },
    { id: 2, title: 'Job Queue System', icon: Server, desc: 'Celery worker queue.' },
    { id: 3, title: 'Health Check Engine', icon: Cpu, desc: 'DNS, TCP, and HTTP validation.' },
    { id: 4, title: 'Failure Classification', icon: ShieldAlert, desc: 'Categorizes failures.' },
    { id: 5, title: 'AI Explanation Engine', icon: BrainCircuit, desc: 'Generates human-readable context.' },
  ];

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, steps.length]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Intelligence Flow</h1>
          <p className="text-muted-foreground mt-2">Visualize the end-to-end AI monitoring pipeline.</p>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all ${isSimulating ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
        >
          <Play size={18} className={isSimulating ? 'animate-pulse' : ''} />
          <span>{isSimulating ? 'Stop Simulation' : 'Run Simulation'}</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
        {/* Glow effect for active step */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 transition-all duration-700" 
             style={{ background: `radial-gradient(circle at center ${activeStep * (100/steps.length)}%, var(--primary) 0%, transparent 50%)`}} />
             
        <div className="flex flex-col items-center space-y-4 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`w-full max-w-md p-4 rounded-xl border transition-all duration-500 flex items-center space-x-4
                    ${isActive ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)] scale-105' : 
                      isPast ? 'border-border bg-card opacity-70' : 'border-border bg-card opacity-50'}`}
                >
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                  {isPast && !isActive && <CheckCircle2 className="text-green-500" size={20} />}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`transition-all duration-500 ${isActive ? 'text-primary' : 'text-border'}`}>
                    <ArrowDown size={24} className={isActive ? 'animate-bounce' : ''} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-2">Live Monitoring Pulse</h3>
          <div className="flex items-center space-x-3 text-muted-foreground">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span>System Operational</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-2">AI Insight Panel</h3>
          <p className="text-sm text-muted-foreground italic">
            {isSimulating ? "Analyzing telemetry stream..." : "Waiting for active incidents to classify."}
          </p>
        </div>
      </div>
    </div>
  );
}
