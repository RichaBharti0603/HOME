// src/pages/Pricing.jsx
import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Startup',
      price: '$49',
      period: '/month',
      description: 'Perfect for early-stage startups',
      features: [
        'Up to 5 websites',
        'Basic monitoring',
        'Email alerts',
        '7-day data retention',
        'Community support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Growth',
      price: '$149',
      period: '/month',
      description: 'For growing SaaS companies',
      features: [
        'Up to 20 websites',
        'Advanced monitoring',
        'Slack & SMS alerts',
        'AI Assistant',
        '30-day data retention',
        'Priority support',
        'Compliance reports'
      ],
      cta: 'Most Popular',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For high-volume businesses',
      features: [
        'Unlimited websites',
        'Enterprise monitoring',
        'Custom integrations',
        'Advanced AI Assistant',
        'Unlimited data retention',
        '24/7 phone support',
        'Dedicated account manager',
        'Custom compliance'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="pricing-page">
      <div className="container">
        <div className="section-title">
          <h1>Simple, Transparent Pricing</h1>
          <p>Start with a 14-day free trial. No credit card required.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} plan-button`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="faq-section">
          <h2 className="section-subtitle">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h4>Can I switch plans later?</h4>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-card">
              <h4>Is there a free trial?</h4>
              <p>Yes! All plans include a 14-day free trial. No credit card required.</p>
            </div>
            <div className="faq-card">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div className="faq-card">
              <h4>Do you offer discounts for non-profits?</h4>
              <p>Yes, we offer 50% off for registered non-profit organizations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 