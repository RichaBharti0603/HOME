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
      desc: 'Instant alerts when your website goes down or slows down.',
      icon: Activity,
    },
    {
      title: 'Smart AI Assistant',
      desc: 'Get friendly explanations for any issues your site faces.',
      icon: MessageSquare,
    },
    {
      title: 'Private & Secure',
      desc: 'Your data stays private. We do not sell or share it.',
      icon: Shield,
    },
    {
      title: 'Global Checks',
      desc: 'We check your website from multiple locations worldwide.',
      icon: Globe,
    },
    {
      title: 'Easy Alerts',
      desc: 'Get notified via Email or Slack the moment something breaks.',
      icon: Zap,
    },
    {
      title: 'Clear Reports',
      desc: 'Understand your uptime and performance with simple charts.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-background text-foreground selection:bg-accent-primary/20 min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-border bg-white/80 backdrop-blur-md px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold">H</div>
          <span className="text-xl font-bold tracking-tight text-gray-900">H.O.M.E</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
           <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
           <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
           <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</button>
          <button onClick={() => navigate('/register')} className="premium-button px-6 py-2.5">Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white pt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 w-full">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full border border-indigo-100 bg-white text-accent-primary text-xs font-semibold tracking-wide shadow-sm inline-flex"
            >
              The New Standard in Monitoring
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]"
            >
              Monitor your sites.<br />
              <span className="text-accent-primary">
                Beautifully.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed"
            >
              Real-time uptime tracking, instant intelligent alerts, and a stunning dashboard. Experience infrastructure monitoring built for teams that care about design and reliability.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-2"
            >
              <button onClick={() => navigate('/register')} className="premium-button px-6 py-3 md:px-8 md:py-4 text-base md:text-lg">Start for free</button>
              <button onClick={() => navigate('/login')} className="secondary-button px-6 py-3 md:px-8 md:py-4 text-base md:text-lg group bg-white hover:bg-gray-50">
                Explore demo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-gray-400" />
              </button>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group w-full max-w-xl lg:max-w-none mx-auto mt-4 lg:mt-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-500"></div>
            <img 
              src="/images/hero.jpg" 
              alt="H.O.M.E Dashboard Interface" 
              className="relative rounded-2xl md:rounded-3xl border border-gray-200/50 shadow-2xl object-cover w-full h-auto max-h-[50vh] lg:max-h-[60vh] object-contain lg:object-cover bg-white transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-32 px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Everything You Need</h2>
             <p className="text-gray-500 text-lg max-w-2xl mx-auto">Simple, reliable, and intelligent monitoring for your digital business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-accent-primary mb-6 shadow-sm">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-20 pb-10 px-12 border-t border-border bg-gray-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold">H</div>
                 <span className="text-xl font-bold text-gray-900 tracking-tight">H.O.M.E</span>
               </div>
               <p className="text-gray-500 max-w-sm">The friendly, reliable monitoring platform for businesses that care about their uptime.</p>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-gray-900 font-semibold text-sm">Product</h4>
               <nav className="flex flex-col gap-3 text-sm text-gray-500">
                  <a href="#" className="hover:text-gray-900 transition-colors">Features</a>
                  <a href="#" className="hover:text-gray-900 transition-colors">Pricing</a>
                  <a href="#" className="hover:text-gray-900 transition-colors">Help Center</a>
               </nav>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-gray-900 font-semibold text-sm">Company</h4>
               <nav className="flex flex-col gap-3 text-sm text-gray-500">
                  <button onClick={() => alert('Terms of Deployment UI would open here')} className="text-left hover:text-gray-900 transition-colors">Terms of Deployment</button>
                  <button onClick={() => alert('Privacy Consensus UI would open here')} className="text-left hover:text-gray-900 transition-colors">Privacy Consensus</button>
                  <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
               </nav>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
            <span>© 2026 H.O.M.E Labs</span>
            <span>Made with care</span>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
