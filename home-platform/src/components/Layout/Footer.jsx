// src/components/Layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', path: '/#features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'API', path: '/api' },
      { name: 'Status', path: '/status' },
    ],
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
    ],
    Resources: [
      { name: 'Documentation', path: '/docs' },
      { name: 'Help Center', path: '/help' },
      { name: 'Community', path: '/community' },
      { name: 'Partners', path: '/partners' },
    ],
    Legal: [
      { name: 'Privacy', path: '/privacy' },
      { name: 'Terms', path: '/terms' },
      { name: 'Security', path: '/security' },
      { name: 'GDPR', path: '/gdpr' },
    ],
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">H</span>
              <span className="logo-text">HOME</span>
            </div>
            <p className="footer-tagline">
              Enterprise-grade monitoring and private AI for startups.
            </p>
            <div className="social-links">
              <a href="https://twitter.com" className="social-link">Twitter</a>
              <a href="https://linkedin.com" className="social-link">LinkedIn</a>
              <a href="https://github.com" className="social-link">GitHub</a>
            </div>
          </div>

          <div className="footer-links">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="link-category">
                <h4 className="category-title">{category}</h4>
                <ul className="link-list">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} HOME Platform. All rights reserved.
          </div>
          <div className="compliance-badges">
            <span className="badge">GDPR Compliant</span>
            <span className="badge">SOC 2 Type II</span>
            <span className="badge">HIPAA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;