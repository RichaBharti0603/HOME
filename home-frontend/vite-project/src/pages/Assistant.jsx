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
    { role: 'bot', content: "Hi there! I'm your AI assistant. I'm actively monitoring your websites and I'm ready to answer any questions you have. How can I help you today?" }
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
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'bot', content: "As this is a demo, my AI processing capabilities are currently mocked. In the full version, I can analyze your site's performance logs, suggest optimizations, and explain downtime events in plain English!" }]);
          setLoading(false);
        }, 1500);
        return;
      }
      const response = await api.post('/ai/query', { query: input });
      const botMsg = { role: 'bot', content: response.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to my processing server right now. Please try again in a few moments." }]);
    } finally {
      if (localStorage.getItem('token') !== 'demo-token') {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6 py-4">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-accent-primary border border-indigo-100 shadow-sm relative overflow-hidden group">
              <Sparkles size={24} className="relative z-10" />
           </div>
           <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">AI Assistant</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Online & Ready</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setMessages([messages[0]])}
             className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
             title="Clear Chat"
           >
              <Trash2 size={18} />
           </button>
        </div>
      </header>

      <div className="flex-1 bento-card flex flex-col overflow-hidden !p-0">
        <div className="p-4 border-b border-border/80 bg-gray-50/50 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2 text-muted">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Your data is private</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border shadow-sm ${
                  msg.role === 'bot' 
                  ? 'bg-indigo-50 border-indigo-100 text-accent-primary' 
                  : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}>
                  {msg.role === 'bot' ? <Sparkles size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[80%] md:max-w-[70%] space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'bot' 
                    ? 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm' 
                    : 'bg-accent-primary text-white shadow-sm rounded-tr-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 inline-block">
                    {msg.role === 'bot' ? 'AI' : 'You'}
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
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-accent-primary shrink-0 shadow-sm">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="space-y-3 pt-3">
                   <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce delay-150"></div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 md:p-6 border-t border-border/80 bg-surface shrink-0">
           <form onSubmit={handleSend} className="relative">
              <input 
                 type="text" 
                 placeholder="Ask me to analyze your latest downtime, or summarize website performance..."
                 className="w-full pl-6 pr-14 py-4 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all placeholder:text-muted/60"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent-primary text-white rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-accent-primary"
              >
                <Send size={18} />
              </button>
           </form>
           <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: 'Explain the recent incident', icon: Activity },
                { label: 'Why was this alert delayed?', icon: Zap },
                { label: 'Show likely root cause', icon: ShieldCheck }
              ].map((chip) => (
                <button 
                  key={chip.label}
                  onClick={() => setInput(chip.label)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <chip.icon size={12} className="text-gray-400" />
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
