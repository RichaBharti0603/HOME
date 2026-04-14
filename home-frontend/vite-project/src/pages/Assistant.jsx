import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, 
  Terminal, ShieldCheck, Zap, 
  Trash2, BrainCircuit, Activity,
  Maximize2
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Assistant = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "H.O.M.E Intelligence Core active. I have analyzed your 14 regional nodes. 100% data integrity confirmed via ZK-Proofs. How can I assist with your infrastructure today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/query', { query: input });
      const botMsg = { role: 'bot', content: response.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "The Intelligence Core is currently recalibrating. Connection to the local LLM cluster was interrupted. Please retry in 30s." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center text-white shadow-accent-glow relative overflow-hidden group">
              <BrainCircuit size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           </div>
           <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">AI INTELLIGENCE</h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-status-up animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase text-muted tracking-widest">Local LLM Node Alpha-01 Online</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setMessages([messages[0]])}
             className="p-3 bg-surface/50 border border-border rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
             title="Purge Context"
           >
              <Trash2 size={18} />
           </button>
           <button className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
              <Terminal size={14} />
              Logs
           </button>
        </div>
      </header>

      <div className="flex-1 glass-card !p-0 border-white/5 bg-surface/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-accent-primary" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Contextual Privacy Active</span>
           </div>
           <span className="text-[10px] font-mono text-muted">TOKEN REUSE: 14%</span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                  msg.role === 'bot' 
                  ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' 
                  : 'bg-surface border-border text-white'
                }`}>
                  {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'bot' 
                    ? 'bg-white/[0.03] border border-white/5 text-foreground' 
                    : 'bg-accent-primary text-white font-medium shadow-accent-glow'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-black text-muted/50 uppercase tracking-widest">
                    {msg.role === 'bot' ? 'H.O.M.E Core' : 'Authorized Admin'}
                  </span>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <Bot size={20} className="animate-bounce" />
                </div>
                <div className="space-y-3 pt-2">
                   <div className="w-48 h-2 bg-white/5 rounded-full animate-pulse"></div>
                   <div className="w-32 h-2 bg-white/5 rounded-full animate-pulse delay-75"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] shrink-0">
           <form onSubmit={handleSend} className="relative">
              <input 
                 type="text" 
                 placeholder="Search logs, ask for root cause, or deploy new nodes..."
                 className="premium-input w-full pl-6 pr-16 py-4 text-sm font-medium"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent-primary text-white rounded-xl shadow-accent-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
           </form>
           <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: 'Check API Latency', icon: Activity },
                { label: 'Verify ZKML Integrirty', icon: ShieldCheck },
                { label: 'Suggest Scale-up', icon: Zap }
              ].map((chip) => (
                <button 
                  key={chip.label}
                  onClick={() => setInput(chip.label)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface/50 text-[10px] font-black uppercase text-muted tracking-widest hover:text-white hover:border-accent-primary/50 transition-all flex items-center gap-2"
                >
                  <chip.icon size={12} />
                  {chip.label}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
