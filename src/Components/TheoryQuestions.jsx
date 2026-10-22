import React, { useState } from "react";

function TheoryQuestions() {
  const [isOpen, setIsOpen] = useState(false);

  const qaList = [
    {
      question: "Why is useEffect required to trigger a fetch on component mount instead of calling fetch directly in the component body?",
      answer:
        "Calling fetch directly inside the component body executes on every render. Updating state (e.g. setRepos or setLoading) causes the component to re-render, which would execute fetch again and create an infinite loop. Passing an empty dependency array [] to useEffect guarantees that the API request runs strictly once when the component mounts."
    },
    {
      question: "What is the difference between a loading state and an error state, and why must both be handled separately?",
      answer:
        "A loading state signals that an asynchronous request is in progress (pending), requiring clear UI feedback (like a Spinner) so the user knows data is loading. An error state signals that the network request failed (rejected, e.g. 404, 500, or offline), requiring clear failure messaging and optional recovery mechanisms (like a Retry button). Handling them separately prevents showing incomplete screens, infinite loading, or unhandled exceptions."
    },
    {
      question: "How would the user experience change if loading and error states were not implemented?",
      answer:
        "Without a loading state, users see a blank or frozen interface with no feedback while data travels over the network. Without an error state, network or server failures cause silent UI crashes or permanently blank elements with no guidance on how to recover or retry."
    }
  ];

  return (
    <div className="theory-box">
      <button className="theory-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? "📖 Hide Theory & Key Analysis Answers" : "📖 View Theory & Key Analysis Answers"}</span>
        <span className="chevron">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="theory-content">
          {qaList.map((item, idx) => (
            <div key={idx} className="qa-item">
              <h4 className="qa-question">
                <span className="qa-num">Q{idx + 1}.</span> {item.question}
              </h4>
              <p className="qa-answer">{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TheoryQuestions;
