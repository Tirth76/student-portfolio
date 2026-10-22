import React, { useState, useEffect, useCallback } from "react";
import Spinner from "../Components/Spinner";
import ErrorMessage from "../Components/ErrorMessage";
import RepoList from "../Components/RepoList";
import TheoryQuestions from "../Components/TheoryQuestions";

function Projects() {
  // Step 1: Set up state variables for repos, loading, and error
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supplementary feature states
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState("octocat");
  const [breakUrl, setBreakUrl] = useState(false);

  // Step 2 & Supplementary: Fetch function & useEffect trigger
  const fetchRepos = useCallback(() => {
    setLoading(true);
    setError(null);

    // Step 6 / Testing: If breakUrl is true, use an invalid URL to demonstrate the error state
    const apiUrl = breakUrl
      ? "https://api.github.com/invalid_endpoint_for_error_test_12345"
      : `https://api.github.com/users/${username.trim() || "octocat"}/repos?sort=updated&per_page=30`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`GitHub user "${username}" was not found (HTTP 404).`);
          }
          throw new Error(`Failed to fetch repositories (HTTP ${res.status}: ${res.statusText}).`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          throw new Error(data.message || "Invalid response format received from server.");
        }
      })
      .catch((err) => {
        setError(err.message || "Network error occurred while fetching repositories.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username, breakUrl]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Supplementary: Filter repos by search term
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-shell section-spacer">
      <div className="section-heading">
        <p className="eyebrow">REST API Integration</p>
        <h1>GitHub Repositories</h1>
        <p className="section-copy">
          Dynamically consuming live GitHub REST API data with real-time loading, error handling, and search capabilities.
        </p>
      </div>

      {/* Control Bar: Search input, Username switcher, Error toggle */}
      <div className="controls-card">
        <div className="search-box">
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search repositories by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="user-input-group">
          <label htmlFor="github-user" className="user-label">
            GitHub User:
          </label>
          <input
            id="github-user"
            type="text"
            className="user-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div className="error-toggle-wrapper">
          <label className="toggle-label" title="Simulate invalid URL to test error component (Step 6)">
            <input
              type="checkbox"
              checked={breakUrl}
              onChange={(e) => setBreakUrl(e.target.checked)}
            />
            <span className="toggle-text">Simulate Error URL (Step 6)</span>
          </label>
        </div>
      </div>

      {/* Step 3: Conditionally render based on state */}
      <div className="api-content-area">
        {loading ? (
          <Spinner message={`Fetching repositories for "${username}"...`} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchRepos} />
        ) : (
          <>
            <div className="results-header">
              <span className="results-count">
                Showing {filteredRepos.length} of {repos.length} repositories
              </span>
              <button className="refresh-btn" onClick={fetchRepos} title="Reload Repositories">
                🔄 Refresh Data
              </button>
            </div>
            <RepoList repos={filteredRepos} searchTerm={searchTerm} />
          </>
        )}
      </div>

      {/* Theory & Key Questions Component */}
      <TheoryQuestions />
    </div>
  );
}

export default Projects;