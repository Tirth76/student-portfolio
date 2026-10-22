import React from "react";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="section-heading">
        <p className="eyebrow">Biography & Vision</p>
        <h1>About Me</h1>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-text-content">
            <h3>Turning complex problems into elegant user experiences</h3>
            <p>
              I’m Tirth Kadivar, a passionate web developer focused on building clean, responsive, and accessible digital solutions.
            </p>
            <p>
              My expertise spans frontend state management, modern UI design systems, API consumption, and modular application architecture.
            </p>

            <div className="highlight-list">
              <div className="highlight-item">
                <span className="check-icon">✓</span>
                <span>Responsive & Mobile-First Layouts</span>
              </div>
              <div className="highlight-item">
                <span className="check-icon">✓</span>
                <span>Frontend State & React Hooks</span>
              </div>
              <div className="highlight-item">
                <span className="check-icon">✓</span>
                <span>REST API Integration & Async UX</span>
              </div>
              <div className="highlight-item">
                <span className="check-icon">✓</span>
                <span>High Contrast & Accessible Design</span>
              </div>
            </div>

            <div className="about-actions">
              <button
                className="primary-btn"
                onClick={() => alert("Resume download trigger clicked! Replace link with actual PDF path.")}
              >
                📄 Download Resume
              </button>
            </div>
          </div>
        </div>

        <div className="stats-column">
          <div className="stat-box">
            <span className="stat-num">10+</span>
            <span className="stat-label">Projects Built</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">100%</span>
            <span className="stat-label">Responsive Design</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">REST</span>
            <span className="stat-label">API Integrations</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">⚡</span>
            <span className="stat-label">Fast Performance</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;