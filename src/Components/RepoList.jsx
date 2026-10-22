import React from "react";

function RepoList({ repos, searchTerm }) {
  if (repos.length === 0) {
    return (
      <div className="empty-state">
        <svg
          className="empty-icon"
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
        <h3>No Repositories Found</h3>
        <p>
          {searchTerm
            ? `No repositories matched "${searchTerm}". Try clearing your search.`
            : "No repositories available for this account."}
        </p>
      </div>
    );
  }

  return (
    <div className="repo-grid">
      {repos.map((repo) => (
        <article className="repo-card" key={repo.id}>
          <div className="repo-header">
            <div className="repo-title-wrapper">
              <svg
                className="repo-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                ></path>
              </svg>
              <h3 className="repo-name">{repo.name}</h3>
            </div>
            <div className="repo-stars-badge" title={`${repo.stargazers_count || 0} stars`}>
              <span className="star-icon">⭐</span>
              <span className="star-count">{repo.stargazers_count || 0}</span>
            </div>
          </div>

          <p className="repo-description">
            {repo.description || "No description provided for this repository."}
          </p>

          <div className="repo-meta">
            {repo.language && (
              <span className="repo-lang-chip">
                <span className="lang-dot"></span>
                {repo.language}
              </span>
            )}

            {repo.forks_count !== undefined && (
              <span className="repo-fork-chip" title="Forks">
                <svg
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  className="fork-icon"
                >
                  <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5A2.25 2.25 0 0012.5 6.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-.878zM11 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.25 12.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"></path>
                </svg>
                {repo.forks_count}
              </span>
            )}
          </div>

          <div className="repo-footer">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-link-btn"
            >
              View Repository
              <svg
                className="external-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default RepoList;
