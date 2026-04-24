import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Shield, Activity, 
  ArrowRight, CheckCircle2, Globe, 
  MessageSquare, BarChart3, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Real-time Monitoring',
      desc: 'Sub-3s resolution health checks across your entire global stack.',
      icon: Activity,
    },
    {
      title: 'Smart Anomaly Detection',
      desc: 'AI-driven failure analysis that identifies root causes automatically.',
      icon: Zap,
    },
    {
      title: 'ZKML Privacy Engine',
      desc: 'Zero-knowledge proofs for anomaly validation without exposing data.',
      icon: Shield,
    },
    {
      title: 'Global Mesh Infrastructure',
      desc: 'Multi-region checks that simulate real user traffic from the edge.',
      icon: Globe,
    },
    {
      title: 'Privacy-First Alerts',
      desc: 'Secure, encrypted notification pipelines to Slack, Email, and PagerDuty.',
      icon: Lock,
    },
    {
      title: 'Advanced Analytics',
      desc: 'Predictive maintenance and capacity planning for evolving loads.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-background text-foreground selection:bg-accent-primary/30 min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-border bg-background/50 backdrop-blur-xl px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-black">H</div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">H.O.M.E</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted uppercase tracking-widest">
           <a href="#features" className="hover:text-white transition-colors">Features</a>
           <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
           <a href="#docs" className="hover:text-white transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:opacity-80 transition-opacity">Login</button>
          <button onClick={() => navigate('/register')} className="premium-button px-6 py-2.5">Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-48 pb-32 px-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Privacy-First System Observability
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white max-w-4xl"
          >
            Monitor Everything. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
              Miss Nothing.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted max-w-xl leading-relaxed"
          >
            H.O.M.E combines ultra-low latency monitoring with local AI failure analysis and ZK-powered data integrity. Built for the modern edge.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <button onClick={() => navigate('/register')} className="premium-button px-10 py-4 text-lg">Deploy Engine Free</button>
            <button className="secondary-button px-10 py-4 text-lg group">
              View Interactive Demo
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 max-w-6xl mx-auto glass-card h-[400px] !p-0 border-white/10 relative overflow-hidden group shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 z-10"></div>
          <div className="p-8 grid grid-cols-4 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
             <div className="h-32 bg-white/5 rounded-xl border border-white/5 animate-pulse"></div>
             <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
             <div className="h-32 bg-white/5 rounded-xl border border-white/5 animate-pulse"></div>
             <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
             <div className="col-span-3 h-48 bg-white/5 rounded-2xl border border-white/5"></div>
             <div className="h-48 bg-white/5 rounded-2xl border border-white/5 animate-pulse"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="px-6 py-3 glass rounded-full flex items-center gap-3 border-accent-primary/50 animate-bounce">
                <div className="w-3 h-3 rounded-full bg-status-up shadow-[0_0_15px_#22C55E]"></div>
                <span className="text-sm font-bold text-white tracking-widest uppercase">Nodes Operational</span>
             </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-32 px-12 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-4xl font-black text-white tracking-tight">Enterprise Visibility</h2>
             <p className="text-muted text-lg max-w-2xl mx-auto">Everything you need to observe, trace, and scale your digital core.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass-card p-10 border-white/5 hover:border-accent-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-32 pb-16 px-12 border-t border-border">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-black">H</div>
                 <span className="text-xl font-black text-white tracking-tighter uppercase">H.O.M.E</span>
               </div>
               <p className="text-muted max-w-sm">The privacy-first monitoring engine for high-stakes infrastructure. Zero tracking. Total visibility.</p>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Product</h4>
               <nav className="flex flex-col gap-2 text-sm text-muted">
                  <a href="#" className="hover:text-white transition-colors">Features</a>
                  <a href="#" className="hover:text-white transition-colors">ZK-Integrity</a>
                  <a href="#" className="hover:text-white transition-colors">Enterprise</a>
               </nav>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Company</h4>
               <nav className="flex flex-col gap-2 text-sm text-muted">
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Changelog</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
               </nav>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-8 border-t border-border flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-[0.2em]">
            <span>© 2026 Hyper-Optimized Monitoring Engine</span>
            <span>Built by H.O.M.E Labs</span>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
