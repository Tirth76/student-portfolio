import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";

// Lazy-loaded routes
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const TaskManager = lazy(() => import("./pages/TaskManager"));

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("portfolio_theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("portfolio_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
  }, [darkMode]);

  return (
    <div className={`app-shell ${darkMode ? "dark-theme" : "light-theme"}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                color: "var(--text-muted)"
              }}
            >
              <div className="spinner-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p style={{ fontWeight: 600 }}>Loading page...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/task-manager" element={<TaskManager />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;