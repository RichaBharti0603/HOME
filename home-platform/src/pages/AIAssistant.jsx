// src/pages/AIAssistant.jsx
import React from 'react';
import ChatInterface from '../components/AIAssistant/ChatInterface';

const AIAssistant = () => {
  return (
    <div className="ai-assistant-page">
      <div className="container">
        <div className="page-header">
          <h1>Private AI Assistant</h1>
          <p>Secure AI for coding, debugging, and documentation without data leaks</p>
        </div>
        
        <div className="ai-features">
          <div className="ai-description card">
            <h2>Your Data Stays Private</h2>
            <p>Unlike public AI tools, HOME keeps all your prompts and responses within your secure environment. No sensitive data leaves your infrastructure.</p>
          </div>
          
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;