import React from "react";

function Spinner({ message = "Loading repositories from GitHub..." }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="spinner-text">{message}</p>
    </div>
  );
}

export default Spinner;
