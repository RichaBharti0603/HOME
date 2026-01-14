import React from "react";

const BookDemo = () => {
  return (
    <div className="book-demo-page section">
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header */}
        <div className="section-title text-center">
          <h1>Book a Personalized Demo</h1>
          <p>
            See how HOME helps you monitor uptime, protect sensitive data,
            and use AI securely — tailored to your use case.
          </p>
        </div>

        {/* Value bullets */}
        <div className="demo-points card" style={{ marginBottom: "32px" }}>
          <ul className="problem-list">
            <li>Live walkthrough of HOME dashboard</li>
            <li>Monitoring, AI Assistant, and security overview</li>
            <li>Q&A specific to your startup or project</li>
            <li>Clear next steps after the demo</li>
          </ul>
        </div>

        {/* Calendly Embed */}
        <div className="calendly-wrapper card">
          <iframe
            src="https://calendly.com/richab820/home-product-demo"
            width="100%"
            height="700"
            frameBorder="0"
            title="Book a Demo with HOME"
          />
        </div>

      </div>
    </div>
  );
};

export default BookDemo;
