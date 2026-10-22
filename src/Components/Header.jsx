import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            <span>Available for New Projects</span>
          </div>

          <h3 className="hero-greeting">Hello, I'm 👋</h3>
          <h1 className="hero-title">Tirth Kadivar</h1>
          <h2 className="hero-subtitle">
            Frontend <span className="gradient-text">Developer</span>
          </h2>

          <p className="hero-description">
            Crafting responsive, high-performance web applications with clean code, intuitive user interfaces, and robust API integrations.
          </p>

          <div className="hero-buttons">
            <Link to="/projects" className="btn-link">
              <button className="primary-btn">
                View Projects
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>

            <Link to="/contact" className="btn-link">
              <button className="secondary-btn">
                Contact Me
              </button>
            </Link>
          </div>

          <div className="tech-stack-row">
            <span className="tech-stack-label">Tech Stack:</span>
            <div className="tech-tags">
              <span className="tech-pill">React</span>
              <span className="tech-pill">JavaScript</span>
              <span className="tech-pill">CSS3</span>
              <span className="tech-pill">PHP</span>
              <span className="tech-pill">MySQL</span>
              <span className="tech-pill">REST APIs</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="avatar-card">
            <div className="avatar-circle">
              <span className="avatar-initials">TK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Header;