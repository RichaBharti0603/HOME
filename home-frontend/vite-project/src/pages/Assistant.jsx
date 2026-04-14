import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, ShieldAlert, Cpu, Sparkles, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Assistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'System ready. I am your H.O.M.E Intelligence Assistant. I have direct access to local monitoring logs and can perform root-cause analysis on failures.\n\nTry asking: "Why is my website down?" or "Give me a health overview."',
      timestamp: new Date()
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.post('/ai/query', { query });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Alert: The local intelligence engine is unreachable. Ensure the backend server is operational and responding to /ai/query requests.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: 'Buffer purged. Intelligence engine re-initialized. How can I assist you?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col h-full premium-card overflow-hidden !p-0 border-accent-primary/5">
        
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-border bg-white/[0.02] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center text-white shadow-lg shadow-accent-primary/20">
                <Bot size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="font-black text-white tracking-tight leading-none mb-1">H.O.M.E Intelligence</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Local Engine v1.0.4</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Analyser</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
              title="Purge Intelligence Buffer"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-white/[0.01]">
          {messages.map((m, idx) => (
            <div key={idx} className={cn("flex w-full animate-in fade-in duration-300", m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn("flex gap-4 max-w-[85%]", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm",
                  m.role === 'user' ? 'bg-accent-secondary border-accent-secondary/20 text-white' : 'bg-white/5 border-border text-accent-primary'
                )}>
                  {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                
                <div className="space-y-1">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? 'bg-accent-primary text-white' 
                      : 'bg-white/5 border border-border text-gray-200'
                  )}>
                    {m.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className={cn("text-[10px] font-mono text-gray-600 px-1", m.role === 'user' ? 'text-right' : 'text-left')}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-border text-accent-primary flex items-center justify-center">
                  <Cpu size={18} className="animate-spin-slow" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-border flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/[0.02] border-t border-border">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-primary transition-colors">
              <MessageSquare size={20} />
            </div>
            <input 
              className="w-full bg-background border border-border rounded-2xl px-4 py-5 pl-12 pr-16 text-sm focus:outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all placeholder:text-gray-700 text-white"
              placeholder="Ask about website downtime, latency logs, or system overview..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-accent-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-accent-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-gray-700" />
              Local Data Residency
            </p>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Cpu size={12} className="text-gray-700" />
              Offline Capable Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
