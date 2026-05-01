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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Analytics & Reporting</h1>
          <p className="text-gray-500 font-medium">Detailed performance metrics across all monitored websites.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm">Export PDF</button>
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
             className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
           >
             <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-accent-primary">
                   <card.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {card.up ? <TrendingUp size={14} /> : <Activity size={14} />}
                   {card.trend}
                </div>
             </div>
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{card.val}</h2>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* REGIONAL PERFORMANCE */}
         <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2">
               <Activity size={18} className="text-accent-primary" />
               Weekly Availability
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uptimeData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                     <XAxis dataKey="day" stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                     <YAxis hide domain={[98, 100]} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ color: '#111827', fontWeight: '600' }}
                       cursor={{fill: '#F3F4F6'}}
                     />
                     <Bar dataKey="uptime" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
               <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Best Day</p>
                  <p className="text-sm font-bold text-gray-900">Tuesday (100%)</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Lowest Day</p>
                  <p className="text-sm font-bold text-amber-500">Wednesday (98.5%)</p>
               </div>
            </div>
         </div>

         {/* ENGINE UTILIZATION */}
         <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-500" />
               Performance Index
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uptimeData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="day" stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ color: '#111827', fontWeight: '600' }}
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
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
               <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-semibold mb-1">Data Processed</span>
                  <span className="text-base font-bold text-gray-900">1.4 GB</span>
               </div>
               <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-semibold mb-1">Active Monitors</span>
                  <span className="text-base font-bold text-gray-900">3 Total</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
