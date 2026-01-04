// src/pages/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent! We\'ll get back to you soon.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1>Contact Us</h1>
          <p>Get in touch with our team</p>
        </div>

        <div className="contact-content">
          <div className="contact-form card">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info card">
            <h2>Contact Information</h2>
            <div className="info-item">
              <h4>Email</h4>
              <p>support@homeplatform.ai</p>
            </div>
            <div className="info-item">
              <h4>Sales</h4>
              <p>sales@homeplatform.ai</p>
            </div>
            <div className="info-item">
              <h4>Emergency Support</h4>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <h4>Office Hours</h4>
              <p>24/7 Emergency Support</p>
              <p>Business: Mon-Fri 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;