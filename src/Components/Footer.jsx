import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              ⚡ Tirth Kadivar
            </Link>
            <p className="footer-tagline">
              Frontend Developer passionate about creating beautiful, functional, and accessible web experiences.
            </p>
          </div>

          <div className="footer-nav">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/projects">Projects & REST API</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Info</h4>
            <p>📧 tirth.kadivar@example.com</p>
            <p>📍 Gujarat, India</p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">Twitter</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tirth Kadivar. Built with React & CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;