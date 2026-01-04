// src/components/AIAssistant/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', content: 'Hello! I\'m your private AI assistant. I can help with coding, debugging, documentation, and more - all without exposing sensitive data. What can I help you with today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        content: `I understand you're asking about: "${input}". As your private AI, I'll process this request securely without any data leaving your environment. Here's what I can help you with: debugging code, generating documentation, or analyzing logs.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const quickPrompts = [
    'Debug this Python code',
    'Generate API documentation',
    'Check for security vulnerabilities',
    'Optimize database queries',
    'Create deployment checklist'
  ];

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header card">
        <div className="header-content">
          <div className="ai-avatar">
            <div className="avatar-icon">AI</div>
          </div>
          <div className="header-info">
            <h3>Private AI Assistant</h3>
            <p className="status">
              <span className="status-indicator secure"></span>
              All conversations are private and secure
            </p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Data Leaks</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">On-premise</div>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="quick-prompts">
        <h4>Quick Start Prompts:</h4>
        <div className="prompts-grid">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              className="prompt-button"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages card">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <div className="message-content">
              <div className="message-sender">
                {message.sender === 'ai' ? 'AI Assistant' : 'You'}
              </div>
              <div className="message-text">{message.content}</div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input card">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your code, documentation, or security..."
            className="message-input"
            rows="3"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="input-actions">
            <div className="input-hints">
              <span className="hint">Press Enter to send</span>
              <span className="hint">Shift+Enter for new line</span>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn btn-primary send-button"
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;