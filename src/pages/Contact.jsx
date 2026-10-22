import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [showHelp, setShowHelp] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-shell contact-layout section-spacer">
      <div className="section-heading">
        <p className="eyebrow">Let’s Connect</p>
        <h1>Contact Me</h1>
        <p className="section-copy">
          Share your idea, project brief, or collaboration opportunity.
        </p>
      </div>

      <div className="contact-card">
        <form onSubmit={handleSubmit}>
          <div className="contact-grid">
            <label>
              <span className="input-label">Name</span>
              <input
                type="text"
                name="name"
                className="message-input"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
            </label>

            <label>
              <span className="input-label">Email</span>
              <input
                type="email"
                name="email"
                className="message-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            <span className="input-label">Subject</span>
            <input
              type="text"
              name="subject"
              className="message-input"
              placeholder="Project / collaboration"
              value={formData.subject}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="input-label">Message</span>
            <textarea
              className="message-input"
              name="message"
              placeholder="Write your message..."
              value={formData.message}
              onChange={handleChange}
            />
          </label>

          <div className="contact-actions">
            <button type="submit">Send Message</button>
            <button type="button" onClick={() => setShowHelp(!showHelp)}>
              {showHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>
        </form>

        {showHelp && (
          <div className="help-box">
            Fill in your details and send the message to start a conversation.
          </div>
        )}

        {submitted && (
          <div className="help-box">
            Thanks, your message is ready to be sent.
          </div>
        )}
      </div>
    </div>
  );
}

export default Contact;