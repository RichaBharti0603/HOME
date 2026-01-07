// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Real-time Monitoring',
      description: '24/7 uptime monitoring with instant alerts via Slack, Email, or SMS.',
      image: '/images/monitoring.png'
    },
    {
      title: 'Website Health Report',
      description: 'Complete dashboard showing uptime, SSL validity, performance metrics.',
      image: '/images/dashboard-preview.png'
    },
    {
      title: 'Private AI Assistant',
      description: 'Secure AI for coding, debugging, and documentation without data leaks.',
      image: '/images/ai-assistant.png'
    },
    {
      title: 'Compliance Ready',
      description: 'Built-in compliance for GDPR, DPDP, HIPAA requirements.',
      image: '/images/compliance.png'
    },
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'CTO at PaySwift',
      content: 'HOME saved us from a major downtime incident. The instant alerts gave us time to respond before users noticed.',
      avatar: '/images/founders/founder1.jpg'
    },
    {
      name: 'Sarah Johnson',
      role: 'CEO at FinSecure',
      content: 'The private AI assistant helps our team code faster without worrying about data privacy.',
      avatar: '/images/founders/founder2.jpg'
    },
  ];

  const metrics = [
    { value: '99.99%', label: 'Average Uptime' },
    { value: '<60s', label: 'Alert Response Time' },
    { value: '0', label: 'Data Leaks' },
    { value: '24/7', label: 'Monitoring' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="hero-content">
              <h1 className="hero-title">
                Stop Refreshing.<br />
                Start <span className="text-gradient">Confidently</span>.
              </h1>
              <p className="hero-description">
                Enterprise-grade monitoring and private AI for startups that can't afford downtime, 
                data leaks, or compliance risks.
              </p>
              <div className="hero-actions">
                <Link to="/onboarding" className="btn btn-primary">
  Start Free Trial
</Link>

                <Link to="/contact" className="btn btn-secondary btn-lg">
                  Book Demo
                </Link>
              </div>
              <div className="hero-metrics">
                {metrics.map((metric, index) => (
                  <div key={index} className="metric-item">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="/images/hero-bg.jpg" 
                alt="HOME Dashboard Preview" 
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section bg-gray-100">
        <div className="container">
          <div className="section-title">
            <h2>The 2 AM Problem</h2>
            <p>That small uncertainty? That's where the real trouble begins.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="problem-card card">
              <h3>For SaaS & FinTech Startups</h3>
              <ul className="problem-list">
                <li>Website isn't just a website - it's your business</li>
                <li>Payments depend on uptime</li>
                <li>Credibility is everything</li>
                <li>Minutes of downtime cost thousands</li>
              </ul>
            </div>
            <div className="problem-card card">
              <h3>The AI Dilemma</h3>
              <ul className="problem-list">
                <li>Public AI tools expose sensitive data</li>
                <li>Every prompt could leak business secrets</li>
                <li>Compliance risks with GDPR, DPDP, HIPAA</li>
                <li>No full-time security team</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Everything You Need in HOME</h2>
            <p>Monitor your website and use AI securely - all in one platform</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-image">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="feature-img"
                  />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gray-100">
        <div className="container">
          <div className="section-title">
            <h2>Trusted by Founders Who Get It</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="cta-card card text-center">
            <h2>Ready to Sleep Soundly?</h2>
            <p className="cta-description">
              Join hundreds of startups who trust HOME with their business-critical operations.
            </p>
            <div className="cta-actions">
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Start 14-Day Free Trial
              </Link>
              <p className="cta-note">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;