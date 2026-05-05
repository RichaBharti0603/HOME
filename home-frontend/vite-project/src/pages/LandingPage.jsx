import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      title: 'Real-time Monitoring',
      desc: 'Instant alerts when your website goes down or slows down.',
      image: '/images/1.png',
    },
    {
      title: 'Smart AI Assistant',
      desc: 'Get friendly explanations for any issues your site faces.',
      image: '/images/2.png',
    },
    {
      title: 'Private & Secure',
      desc: 'Your data stays private. We do not sell or share it.',
      image: '/images/3.jpg',
    },
    {
      title: 'Global Checks',
      desc: 'We check your website from multiple locations worldwide.',
      image: '/images/4.jpg',
    },
    {
      title: 'Easy Alerts',
      desc: 'Get notified via Email or Slack the moment something breaks.',
      image: '/images/5.jpg',
    },
    {
      title: 'Clear Reports',
      desc: 'Understand your uptime and performance with simple charts.',
      image: '/images/6.jpg',
    },
  ];

  const faqs = [
    {
      question: 'How quickly will I know if my website goes down?',
      answer: 'H.O.M.E checks your endpoints at your configured interval and sends alerts as soon as a failure threshold is reached.',
    },
    {
      question: 'Can I monitor multiple websites and APIs?',
      answer: 'Yes. You can create multiple monitors, each with its own URL, frequency, retry policy, and alert rules.',
    },
    {
      question: 'Is my monitoring data private?',
      answer: 'Yes. Your account data stays scoped to your workspace, and local AI analysis can run without sending sensitive logs externally.',
    },
    {
      question: 'Do I need Stripe to test locally?',
      answer: 'No. In local development, billing can fall back to a test activation flow so you can validate onboarding end-to-end.',
    },
  ];

  const targetGroups = [
    {
      badge: 'For Founders',
      title: 'Startups',
      desc: 'Stay ahead of outages with instant visibility into uptime, SSL health, and latency trends.',
      image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80',
    },
    {
      badge: 'For Teams',
      title: 'Engineering Teams',
      desc: 'Track APIs and production services in one place, then move from alert to action quickly.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    },
    {
      badge: 'For Agencies',
      title: 'Client Operations',
      desc: 'Monitor multiple client properties with clean reports and dependable incident timelines.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    },
    {
      badge: 'For Personal Use',
      title: 'Personal Projects',
      desc: 'Keep your portfolio, side projects, and personal websites reliable with simple uptime alerts.',
      image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1400&q=80',
    },
  ];

  return (
    <>
      {/* Logo first under root scroll-smooth (DOM order); fixed so it still aligns with the nav bar */}
      <img
        src="/images/logo.jpg"
        alt="Logo"
        className="pointer-events-auto fixed left-12 top-2 z-[101] h-20 w-auto object-contain rounded-lg shadow-sm"
      />
      <div className="bg-background text-foreground selection:bg-accent-primary/20 min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-border bg-white/80 backdrop-blur-md px-12 h-24 flex items-center justify-between">
          <div className="flex items-center" aria-hidden>
            <img src="/images/logo.jpg" alt="" className="invisible pointer-events-none h-20 w-auto object-contain rounded-lg shadow-sm" />
          </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
           <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
           <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
           <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
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

      {/* WHO WE SERVE */}
      <section id="audience" className="py-28 px-6 md:px-12 bg-[#f2f7fc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Built for every stage of growth.</h2>
            <p className="text-gray-500 text-lg">Whoever you are, there is a monitoring workflow designed for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {targetGroups.map((group) => (
              <motion.div
                key={group.title}
                whileHover={{ y: -6 }}
                className="relative min-h-[420px] rounded-3xl overflow-hidden shadow-xl group"
              >
                <img
                  src={group.image}
                  alt={group.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="inline-flex text-xs font-semibold tracking-wide bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    {group.badge}
                  </span>
                  <h3 className="text-3xl font-bold mt-4">{group.title}</h3>
                  <p className="text-white/85 mt-3 leading-relaxed">{group.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
                <div className="w-12 h-12 rounded-xl border border-gray-200 mb-6 shadow-sm overflow-hidden bg-white">
                  <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 px-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know before getting started.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="text-base md:text-lg font-semibold text-gray-900">{item.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
                      <p className="pt-4">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-20 pb-10 px-12 border-t border-border bg-gray-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center mb-6 md:mb-0">
                 <img src="/images/logo.jpg" alt="Logo" className="h-20 w-auto object-contain rounded-lg shadow-sm" />
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
            <span>© 2026 Labs</span>
            <span>Made with care</span>
         </div>
      </footer>
      </div>
    </>
  );
};

export default LandingPage;
