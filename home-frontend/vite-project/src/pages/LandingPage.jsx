import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown, 
  Check, 
  Star, 
  Shield, 
  Activity, 
  Cpu, 
  Globe, 
  Bell, 
  BarChart3, 
  Search, 
  Zap, 
  Users, 
  Target,
  Twitter,
  Github,
  Linkedin,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');

  useEffect(() => {
    // Phase 4: Warm-up backend to handle cold starts on Render free tier
    const warmup = async () => {
      try {
        console.log("Warming up backend...");
        await api.get('/health');
      } catch (err) {
        console.warn("Warmup failed (expected if backend cold starting):", err);
      }
    };
    warmup();
  }, []);

  const features = [
    {
      title: 'Real-time Monitoring',
      desc: 'Instant alerts the moment your site goes down or experiences latency spikes.',
      icon: Activity,
    },
    {
      title: 'Smart AI Assistant',
      desc: 'Get friendly, intelligent insights and troubleshooting steps for any issues.',
      icon: Cpu,
    },
    {
      title: 'Private & Secure',
      desc: 'Your data is fully encrypted, private, and hosted securely on your terms.',
      icon: Shield,
    },
    {
      title: 'Global Checks',
      desc: 'Verify accessibility from multiple locations worldwide to catch regional outages.',
      icon: Globe,
    },
    {
      title: 'Easy Alerts',
      desc: 'Get notified via Email, Slack, Discord, or Webhooks the moment a check fails.',
      icon: Bell,
    },
    {
      title: 'Clear Reports',
      desc: 'Analyze trends and SLA metrics with beautiful, high-contrast performance charts.',
      icon: BarChart3,
    },
  ];

  const faqs = [
    {
      question: 'How quickly will I know if my website goes down?',
      answer: 'H.O.M.E checks your endpoints at your configured interval (down to 1 minute) and sends alerts immediately when a failure threshold is met.',
    },
    {
      question: 'Can I monitor multiple websites and APIs?',
      answer: 'Yes. You can configure multiple monitors, each with its own URL, frequency, check types, retry policy, and alert channels.',
    },
    {
      question: 'Is my monitoring data private?',
      answer: 'Absolutely. Your data is isolated to your workspace. We offer local AI processing options to review logs without transmitting them externally.',
    },
    {
      question: 'Do I need Stripe to test locally?',
      answer: 'No. In local development environments, billing operates in a sandbox test mode so you can validate signup and onboarding end-to-end.',
    },
    {
      question: 'What integrations are supported?',
      answer: 'We support Slack, Discord, Telegram, custom Webhooks, and direct Email notifications out of the box.',
    },
  ];

  const targetGroups = [
    {
      title: 'Monitor APIs',
      desc: 'Track latency trends, response payloads, and API status codes from global servers.',
      image: '/images/engineering%20teams.jpg',
      objectPosition: '50% 58%',
    },
    {
      title: 'Track Uptime',
      desc: 'Ensure your static and dynamic websites stay continuously available to visitors.',
      image: '/images/startup.jpg',
      objectPosition: '50% 45%',
    },
    {
      title: 'Get Instant Alerts',
      desc: 'Configure multi-channel notifications to pager systems, chat platforms, or webhooks.',
      image: '/images/client%20operations.jpg',
      objectPosition: '50% 52%',
    },
    {
      title: 'Monitor Deployments',
      desc: 'Connect to CI/CD pipelines to verify health instantly after new versions roll out.',
      image: '/images/personal.jpg',
      objectPosition: '50% 45%',
    },
  ];

  // FAQ Filtering Logic
  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [faqSearch]);

  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-blue-500/20 min-h-screen font-sans antialiased scroll-smooth">
      {/* NAVBAR */}
      <nav className="sticky top-0 w-full z-[100] border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 md:px-12 h-20 flex items-center justify-between transition-shadow duration-300">
        <div className="flex items-center gap-3">
          <img src="/images/logo.jpg" alt="H.O.M.E Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">H.O.M.E.</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 outline-none transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 outline-none transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 outline-none transition-colors">FAQ</a>
          <a href="#about" className="hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 outline-none transition-colors">About</a>
          <a href="/cloud-status" className="hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 outline-none transition-colors flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Status
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-3 py-2 outline-none min-h-[44px] transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="premium-button text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none min-h-[44px] px-5 py-2.5 rounded-full transition-all"
          >
            Start Monitoring Free
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex flex-col justify-center px-6 md:px-12 py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold tracking-wider shadow-sm border border-blue-200 inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              THE NEW STANDARD IN MONITORING
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Know the moment your website goes down.
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Reliable uptime monitoring for websites, APIs, and servers. Get notified instantly via Slack or Email. Troubleshoot with clear, actionable insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-2">
              <button 
                onClick={() => navigate('/register')} 
                className="premium-button bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none min-h-[48px] px-8 py-3.5 rounded-full transition-all"
              >
                Start Monitoring Free
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="secondary-button bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-base shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 outline-none min-h-[48px] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all"
              >
                View Live Dashboard
                <ArrowRight size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Social Proof Badges */}
            <div className="pt-6 border-t border-slate-200 w-full flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <Check size={16} className="text-emerald-600 stroke-[3]" />
                </div>
                <span>Trusted by 1,200+ teams</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <Shield size={16} className="text-emerald-600 stroke-[2]" />
                </div>
                <span>99.99% uptime accuracy</span>
              </div>
            </div>
          </div>

          {/* Right Image / Mockup Dashboard */}
          <div className="relative w-full max-w-xl lg:max-w-none mx-auto mt-4 lg:mt-0">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-floating p-5 md:p-6 lg:p-8">
              {/* Browser window header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                  <span className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                  <span className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                  <span className="ml-2 text-xs text-slate-400 font-mono tracking-wide">dashboard.uptimehome.io</span>
                </div>
                <span className="rounded-full bg-emerald-50 text-[10px] sm:text-xs font-bold text-emerald-700 px-3 py-1 border border-emerald-200 inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational
                </span>
              </div>

              {/* Mock Dashboard Body */}
              <div className="space-y-6">
                {/* Latency / Uptime Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Global Uptime (30d)</span>
                    <span className="text-3xl font-extrabold text-slate-900 block mt-1">99.991%</span>
                    {/* Simulated uptime bar */}
                    <div className="flex gap-0.5 mt-3 h-4">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`h-full flex-1 rounded-sm ${i === 18 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                          title={`Day ${i+1}: ${i === 18 ? '99.85%' : '100%'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg Response Latency</span>
                    <span className="text-3xl font-extrabold text-slate-900 block mt-1">42 ms</span>
                    {/* Simulated latency sparkline */}
                    <div className="flex items-end gap-1 mt-3 h-4">
                      {Array.from({ length: 15 }).map((_, i) => {
                        const heights = ['h-2', 'h-3', 'h-1.5', 'h-2', 'h-4', 'h-3', 'h-2', 'h-1', 'h-3', 'h-4', 'h-2', 'h-3', 'h-1.5', 'h-2.5', 'h-2'];
                        return (
                          <span key={i} className={`w-full bg-blue-500/80 rounded-sm ${heights[i]}`} />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monitors list mockup */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>MONITORED ENDPOINTS</span>
                    <span>STATUS</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                          <Globe size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Production API Gateway</span>
                          <span className="text-xs text-slate-500 block">Tokyo, JP • checked 1m ago</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">Operational</span>
                    </div>

                    <div className="px-4 py-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                          <Activity size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Main Web Application</span>
                          <span className="text-xs text-slate-500 block">Oregon, US • checked 30s ago</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">Operational</span>
                    </div>

                    <div className="px-4 py-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                          <Shield size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Auth Service (OAuth)</span>
                          <span className="text-xs text-slate-500 block">Frankfurt, DE • checked 2m ago</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Soft decorative background circles */}
            <div className="absolute -z-10 -left-6 -top-6 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute -z-10 -right-6 -bottom-6 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERY STAGE (USE CASES) */}
      <section id="audience" className="py-24 px-6 md:px-12 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Built for Every Stage of Growth</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Tailored monitoring tools designed for your specific deployment needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetGroups.map((group, index) => (
              <div
                key={index}
                className="relative h-[380px] rounded-3xl overflow-hidden shadow-premium group focus-within:ring-2 focus-within:ring-blue-500 outline-none"
                tabIndex={0}
              >
                <img
                  src={group.image}
                  alt={group.title}
                  style={{ objectPosition: group.objectPosition }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Strong dark gradient overlay for high contrast readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end h-full">
                  <h3 className="text-2xl font-bold text-white mb-2">{group.title}</h3>
                  <p className="text-slate-200 text-sm leading-relaxed">{group.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Everything You Need to Stay Online</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Simple, reliable, and intelligent monitoring built to keep your sites running smoothly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const IconComponent = f.icon;
              return (
                <div 
                  key={i}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-floating group focus-within:ring-2 focus-within:ring-blue-500 outline-none"
                  tabIndex={0}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-6 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Choose a Plan</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Simple pricing that scales with your growth. Get started for free today.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="rounded-3xl border border-slate-200 p-8 bg-white shadow-sm flex flex-col justify-between focus-within:ring-2 focus-within:ring-blue-500 outline-none" tabIndex={0}>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starter</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-slate-900">$10</span>
                  <span className="text-slate-500 ml-1 text-lg">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">Basic checks for personal projects.</p>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>5 Monitors</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>5 Minute checks</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Email Alerts</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Basic Reports (7d history)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => navigate('/register')} 
                className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold min-h-[44px] py-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Select Starter
              </button>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="relative rounded-3xl border-2 border-blue-600 p-8 bg-white shadow-floating flex flex-col justify-between transform lg:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 outline-none" tabIndex={0}>
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pro</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-slate-900">$29</span>
                  <span className="text-slate-500 ml-1 text-lg">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">Comprehensive tracking for professional teams.</p>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span className="font-semibold text-slate-800">50 Monitors</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span className="font-semibold text-slate-800">1 Minute checks</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Email, Slack, & Telegram Alerts</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Advanced Analytics (30d history)</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>API & Webhook Access</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Priority Support</span>
                    </li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => navigate('/register')} 
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold min-h-[44px] py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Select Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-3xl border border-slate-200 p-8 bg-white shadow-sm flex flex-col justify-between focus-within:ring-2 focus-within:ring-blue-500 outline-none" tabIndex={0}>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enterprise</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-slate-900">$99</span>
                  <span className="text-slate-500 ml-1 text-lg">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">Custom rules for large deployments.</p>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Unlimited Monitors</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Custom Interval checks</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Custom Integrations</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Full History Retention</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <Check size={18} className="text-emerald-500 stroke-[3] shrink-0" />
                      <span>Dedicated SLA Guarantee</span>
                    </li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => navigate('/register')} 
                className="mt-8 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold min-h-[44px] py-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                Select Enterprise
              </button>
            </div>
          </div>

          {/* Pricing Trust Text */}
          <p className="text-center text-slate-500 text-sm mt-12">
            No credit card required. 14-day free trial on all plans. Cancel or upgrade anytime.
          </p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-lg">Find answers to common questions about H.O.M.E monitoring.</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              aria-label="Search FAQs"
            />
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.question} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base sm:text-lg font-bold text-slate-800">{item.question}</span>
                      <ChevronDown
                        size={20}
                        className={`text-slate-500 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-200/55 pt-4 bg-white">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center justify-center gap-3">
                <HelpCircle size={36} className="text-slate-350" />
                <span>No matching questions found. Try searching for something else!</span>
              </div>
            )}
          </div>

          {/* Bottom Support CTA */}
          <div className="mt-16 text-center bg-blue-50/50 border border-blue-100 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
            <p className="text-slate-600 text-sm mt-2 mb-6">Our team is here to help you get the most out of your monitoring dashboard.</p>
            <button 
              onClick={() => navigate('/register')} 
              className="premium-button bg-blue-600 hover:bg-blue-700 text-white font-bold min-h-[44px] px-6 py-2.5 rounded-full inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">About H.O.M.E</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                We build reliable checks, responsive dashboards, and actionable alerts to take the stress out of website outages. H.O.M.E is built by engineers, for engineers who value design, transparency, and uptime.
              </p>
              
              {/* Uptime Guarantee Highlight */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0">
                  <Shield size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Uptime Guarantee</h4>
                  <p className="text-slate-500 text-sm mt-1">If our monitoring agent experiences degradation, we credit your account. We stand by our metrics.</p>
                </div>
              </div>
            </div>

            {/* Metrics & 3-Column Layout */}
            <div className="lg:col-span-6 space-y-8">
              {/* Numeric Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 block">10M+</span>
                  <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mt-1">Checks / Day</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 block">&lt; 30s</span>
                  <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mt-1">Avg Alert Time</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 block">99.99%</span>
                  <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mt-1">Accuracy</span>
                </div>
              </div>

              {/* Three detailed sub columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-850 font-bold text-sm">
                    <Target size={16} className="text-blue-500" />
                    <span>What we focus on</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">Continuous verification, ultra-low latency, and alert routing integrity.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-850 font-bold text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span>Who we build for</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">SaaS founders, DevOps engineers, agencies, and self-hosted creators.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-850 font-bold text-sm">
                    <Zap size={16} className="text-blue-500" />
                    <span>How we work</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">Fast open-source integrations, modern designs, and continuous iteration.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="pt-20 pb-10 px-6 md:px-12 border-t border-slate-250 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-slate-200">
            {/* Logo/Description */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/images/logo.jpg" alt="Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">H.O.M.E.</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                The designer-centric uptime monitoring platform. Built to keep your websites secure, fast, and constantly available.
              </p>
              {/* Integration Badge Indicators */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-450 uppercase tracking-widest block mb-2">INTEGRATES WITH</span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">Slack</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">Discord</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">Webhooks</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">Email</span>
                </div>
              </div>
            </div>

            {/* Links Column 1: Product */}
            <div className="space-y-4">
              <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase">Product</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
                <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
                <a href="/cloud-status" className="hover:text-slate-950 transition-colors">System Status</a>
                <a href="/queue-health" className="hover:text-slate-950 transition-colors">Queue Health</a>
              </nav>
            </div>

            {/* Links Column 2: Resources */}
            <div className="space-y-4">
              <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase">Resources</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
                <a href="/install-local-ai" className="hover:text-slate-950 transition-colors">Local AI Setup</a>
                <a href="/settings" className="hover:text-slate-950 transition-colors">Settings API</a>
                <a href="/analytics" className="hover:text-slate-950 transition-colors">Analytics Details</a>
                <a href="/system-flow" className="hover:text-slate-950 transition-colors">System Flowchart</a>
              </nav>
            </div>

            {/* Links Column 3: Legal & Company */}
            <div className="space-y-4">
              <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase">Company</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
                <button onClick={() => alert('Terms of Deployment details')} className="text-left hover:text-slate-950 transition-colors">Terms of Deployment</button>
                <button onClick={() => alert('Privacy Consensus details')} className="text-left hover:text-slate-950 transition-colors">Privacy Consensus</button>
                <a href="#about" className="hover:text-slate-950 transition-colors">About Us</a>
              </nav>
            </div>
          </div>

          {/* Social Row & Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <span>© 2026 Labs. All rights reserved.</span>
            {/* Social Icons with Focus Rings */}
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1.5 outline-none transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1.5 outline-none transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1.5 outline-none transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
