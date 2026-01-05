import React from 'react';
import ChatInterface from '../components/AIAssistant/ChatInterface';

const AIAssistant = () => {
  return (
    <div className="ai-assistant-page">
      <div className="container">
        {/* Hero Card */}
        <div className="page-header card">
          <div className="header-content">
            <img 
              src="/images/ai-assistant.jpg" 
              alt="AI Assistant" 
              className="header-image"
            />
            <div className="header-text">
              <h1>Private AI Assistant</h1>
              <p>Secure AI for coding, debugging, and documentation without data leaks</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="ai-features">
          <div className="ai-description card">
            <h2>Your Data Stays Private</h2>
            <p>
              Unlike public AI tools, HOME keeps all your prompts and responses within your secure environment.
              No sensitive data leaves your infrastructure.
            </p>
          </div>
        </div>

        {/* Chat Card */}
        <div className="chat-card card">
          <ChatInterface />
        </div>
      </div>

      {/* Floating AI Button */}
      <button className="floating-ai-btn">
        AI Assistant
      </button>
    </div>
  );
};

export default AIAssistant;
