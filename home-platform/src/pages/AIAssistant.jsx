// src/pages/AIAssistant.jsx
import React from 'react';
import ChatInterface from '../components/AIAssistant/ChatInterface';

const AIAssistant = () => {
  return (
    <div className="ai-assistant-page">
      <div className="container">
        {/* Header Card */}
        <div className="page-header card">
          <h1>Private AI Assistant</h1>
          <p>Secure AI for coding, debugging, and documentation without data leaks</p>
        </div>

        {/* Image Card */}
        <div className="ai-image card">
          <img 
            src="/images/ai-assistant.jpg" 
            alt="AI Assistant" 
            style={{ width: '100%', borderRadius: '12px' }}
          />
        </div>

        {/* Features and Chat Card */}
        <div className="ai-features-chat">
          <div className="ai-description card">
            <h2>Your Data Stays Private</h2>
            <p>
              Unlike public AI tools, HOME keeps all your prompts and responses within your secure environment.
              No sensitive data leaves your infrastructure.
            </p>
          </div>

          {/* ChatInterface Card */}
          <div className="chat-card card">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
