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
    <div className="space-y-8 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Analytics & Reporting</h1>
          <p className="text-muted font-medium text-sm">Detailed performance metrics across all monitored websites.</p>
        </div>
        <div className="flex gap-3">
           <button className="secondary-button">Export PDF</button>
           <button className="premium-button px-5 py-2.5 text-sm">Generate Insights</button>
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Global Availability', val: '99.982%', trend: '+0.04%', up: true, icon: Globe },
           { label: 'Mean Time to Repair', val: '4.2m', trend: '-12%', up: true, icon: Zap },
           { label: 'Total Checks', val: '14,290', trend: '+14%', up: false, icon: ShieldCheck },
         ].map((card, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bento-card"
           >
             <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-accent-primary">
                   <card.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {card.up ? <TrendingUp size={14} /> : <Activity size={14} />}
                   {card.trend}
                </div>
             </div>
             <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{card.label}</p>
             <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{card.val}</h2>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* REGIONAL PERFORMANCE */}
         <div className="bento-card">
            <h3 className="text-sm font-extrabold text-foreground mb-8 flex items-center gap-2">
               <Activity size={18} className="text-accent-primary" />
               Weekly Availability
            </h3>
            <div className="h-[300px] w-full -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uptimeData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                     <XAxis dataKey="day" stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                     <YAxis hide domain={[98, 100]} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                       cursor={{fill: '#F1F5F9'}}
                     />
                     <Bar dataKey="uptime" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 pt-6 border-t border-border/60">
               <div>
                  <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Best Day</p>
                  <p className="text-sm font-extrabold text-foreground">Tuesday (100%)</p>
               </div>
               <div className="text-right">
                  <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Lowest Day</p>
                  <p className="text-sm font-extrabold text-amber-500">Wednesday (98.5%)</p>
               </div>
            </div>
         </div>

         {/* ENGINE UTILIZATION */}
         <div className="bento-card">
            <h3 className="text-sm font-extrabold text-foreground mb-8 flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-500" />
               Performance Index
            </h3>
            <div className="h-[300px] w-full -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uptimeData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="day" stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLoad)" 
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/60">
               <div className="flex-1 p-4 bg-background rounded-xl border border-border/80 flex flex-col items-center">
                  <span className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Data Processed</span>
                  <span className="text-base font-extrabold text-foreground">1.4 GB</span>
               </div>
               <div className="flex-1 p-4 bg-background rounded-xl border border-border/80 flex flex-col items-center">
                  <span className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Active Monitors</span>
                  <span className="text-base font-extrabold text-foreground">3 Total</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
