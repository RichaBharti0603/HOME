import React from 'react';
import { 
  BarChart3, TrendingUp, Zap, 
  Activity, PieChart, Calendar,
  ArrowUpRight, ArrowDownRight,
  ShieldCheck, Globe
} from 'lucide-react';
import { 
  BarChart, Bar, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
  const uptimeData = [
    { day: 'Mon', uptime: 99.9 },
    { day: 'Tue', uptime: 100 },
    { day: 'Wed', uptime: 98.5 },
    { day: 'Thu', uptime: 99.98 },
    { day: 'Fri', uptime: 100 },
    { day: 'Sat', uptime: 99.2 },
    { day: 'Sun', uptime: 100 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Deep Intelligence</h1>
          <p className="text-muted font-medium">Multi-dimensional performance audit Across 14 regional nodes.</p>
        </div>
        <div className="flex gap-3">
           <button className="secondary-button !py-2.5 px-6 uppercase tracking-widest text-[10px]">Export PDF</button>
           <button className="premium-button !py-2.5 px-6 uppercase tracking-widest text-[10px]">Generate Insights</button>
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Global Availability', val: '99.982%', trend: '+0.04%', up: true, icon: Globe },
           { label: 'Mean Time to Repair', val: '4.2m', trend: '-12%', up: true, icon: Zap },
           { label: 'Anomalies Filtered', val: '1,492', trend: '+14%', up: false, icon: ShieldCheck },
         ].map((card, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass-card group"
           >
             <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-2xl text-accent-primary group-hover:scale-110 transition-transform">
                   <card.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.up ? 'text-status-up' : 'text-status-warn'}`}>
                   {card.up ? <TrendingUp size={12} /> : <Activity size={12} />}
                   {card.trend}
                </div>
             </div>
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">{card.label}</p>
             <h2 className="text-4xl font-black text-white tracking-tighter">{card.val}</h2>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* REGIONAL PERFORMANCE */}
         <div className="glass-card">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               <Activity size={16} className="text-accent-primary" />
               Regional Distribution
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uptimeData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                     <XAxis dataKey="day" hide />
                     <YAxis hide domain={[98, 100]} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                     />
                     <Bar dataKey="uptime" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 pt-6 border-t border-border">
               <div>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">Best Region</p>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">US-East (100%)</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">Weakest Link</p>
                  <p className="text-sm font-bold text-status-warn uppercase tracking-tight">EU-West (98.5%)</p>
               </div>
            </div>
         </div>

         {/* ENGINE UTILIZATION */}
         <div className="glass-card">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               <ShieldCheck size={16} className="text-accent-secondary" />
               Engine Load Factor
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uptimeData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="day" hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#A855F7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLoad)" 
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
               <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-muted font-black uppercase tracking-widest">Context</span>
                  <span className="text-sm font-bold text-white tracking-tight">1.4 TB</span>
               </div>
               <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-muted font-black uppercase tracking-widest">Nodes</span>
                  <span className="text-sm font-bold text-white tracking-tight">14 Active</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
