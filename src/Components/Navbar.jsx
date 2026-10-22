import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar({ darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <NavLink to="/" className="logo" onClick={closeMobileMenu}>
        <span className="logo-icon">⚡</span>
        <span className="logo-text">Tirth Kadivar</span>
      </NavLink>

      <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onClick={closeMobileMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onClick={closeMobileMenu}
        >
          Projects
        </NavLink>
        <NavLink
          to="/task-manager"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onClick={closeMobileMenu}
        >
          Task API
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onClick={closeMobileMenu}
        >
          Contact
        </NavLink>
      </div>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle light or dark theme"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;