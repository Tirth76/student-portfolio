import React from "react";

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend Engineering",
      skills: [
        { name: "React JS", level: "88%", color: "#38bdf8" },
        { name: "JavaScript (ES6+)", level: "90%", color: "#facc15" },
        { name: "HTML5 & Semantic Markup", level: "95%", color: "#f97316" },
        { name: "CSS3 & Modern Flex/Grid", level: "92%", color: "#3b82f6" },
      ]
    },
    {
      title: "Backend & Database",
      skills: [
        { name: "PHP Core & OOP", level: "80%", color: "#818cf8" },
        { name: "MySQL & Relational Data", level: "82%", color: "#06b6d4" },
        { name: "REST APIs & JSON Parsing", level: "88%", color: "#10b981" },
      ]
    }
  ];

  return (
    <section id="skills" className="skills-section">
      <div className="section-heading">
        <p className="eyebrow">Core Competencies</p>
        <h1>Technical Skills</h1>
        <p className="section-copy">
          A continuous learning journey focusing on scalable frontend architectures and modern web technologies.
        </p>
      </div>

      <div className="skills-container">
        {skillCategories.map((category, catIdx) => (
          <div key={catIdx} className="skill-category-card">
            <h3 className="category-title">{category.title}</h3>
            <div className="skills-list">
              {category.skills.map((skill, idx) => (
                <div key={idx} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percent">{skill.level}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill-bar"
                      style={{
                        width: skill.level,
                        background: `linear-gradient(90deg, #2563eb, ${skill.color})`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;