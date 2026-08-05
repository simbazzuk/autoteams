"use client";

import { useMemo, useState } from "react";
import { candidates } from "@/data/candidates";

const roleTemplates: Record<string, string[]> = {
  "AI Product Team": [
    "Technical Lead",
    "Product Connector",
    "Delivery Builder",
    "Analytical Challenger",
  ],
  "Innovation Squad": [
    "Vision Lead",
    "Creative Explorer",
    "Delivery Builder",
    "Customer Advocate",
  ],
  "Friendship Circle": [
    "Social Organiser",
    "Conversation Starter",
    "Activity Motivator",
    "Reliable Connector",
  ],
  "Community Project": [
    "Community Lead",
    "Organiser",
    "Data & Insight",
    "Volunteer Coordinator",
  ],
};

export function TeamDesigner() {
  const [template, setTemplate] = useState("AI Product Team");
  const [purpose, setPurpose] = useState(
    "Design and launch an AI-powered platform with strong delivery, customer focus and responsible governance."
  );
  const [teamSize, setTeamSize] = useState(4);
  const [priority, setPriority] = useState("Balanced delivery");
  const [designed, setDesigned] = useState(false);

  const members = useMemo(() => {
    const roles = roleTemplates[template];
    const pool =
      template === "Friendship Circle"
        ? candidates.filter((candidate) => candidate.teamType === "Friendship")
        : candidates.filter((candidate) => candidate.teamType === "Business");

    return Array.from({ length: teamSize }, (_, index) => {
      const candidate = pool[index % Math.max(pool.length, 1)];
      return {
        name: candidate?.name || `Candidate ${index + 1}`,
        role: roles[index % roles.length],
        rationale: [
          "Provides direction and keeps the team aligned to the purpose.",
          "Connects people, goals and stakeholder needs.",
          "Adds delivery discipline and reliable follow-through.",
          "Challenges assumptions and improves decision quality.",
        ][index % 4],
      };
    });
  }, [teamSize, template]);

  const confidence = Math.min(96, 78 + teamSize * 3);

  return (
    <div className="v4-designer-workspace">
      <section className="v4-workflow-panel">
        <div className="v4-panel-header">
          <div>
            <span className="eyebrow">Team requirements</span>
            <h2>Describe the team you need.</h2>
            <p>
              Set the purpose and practical constraints before generating the
              team design.
            </p>
          </div>
        </div>

        <div className="v4-form-stack">
          <label>
            Team template
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
            >
              {Object.keys(roleTemplates).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Purpose
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </label>

          <label>
            Team size
            <div className="v4-range-row">
              <input
                type="range"
                min="3"
                max="6"
                value={teamSize}
                onChange={(event) => setTeamSize(Number(event.target.value))}
              />
              <strong>{teamSize}</strong>
            </div>
          </label>

          <label>
            Design priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Balanced delivery</option>
              <option>Maximum innovation</option>
              <option>Low conflict risk</option>
              <option>Strong leadership</option>
              <option>High social connection</option>
            </select>
          </label>
        </div>

        <div className="v4-guidance">
          <span>◇</span>
          <p>
            This prototype uses an explainable design model and a sample
            candidate pool.
          </p>
        </div>

        <button
          className="button"
          onClick={() => setDesigned(true)}
          type="button"
        >
          Build my team
        </button>
      </section>

      <section className="v4-designer-results">
        {!designed ? (
          <div className="v4-designer-empty">
            <div className="v4-results-icon">◎</div>
            <h2>Your recommended team</h2>
            <p>
              AutoTeams will combine role coverage, Team DNA, practical
              constraints and your selected priority.
            </p>

            <div className="v4-empty-checklist">
              <span>Role coverage</span>
              <span>Compatibility score</span>
              <span>Strengths and risks</span>
              <span>Explainable recommendations</span>
            </div>
          </div>
        ) : (
          <>
            <div className="v4-team-summary">
              <div>
                <span className="eyebrow">Recommended team</span>
                <h2>{template}</h2>
                <p>{purpose}</p>
              </div>

              <div className="v4-confidence">
                <strong>{confidence}%</strong>
                <span>Design confidence</span>
              </div>
            </div>

            <div className="v4-team-members">
              {members.map((member, index) => (
                <article key={`${member.name}-${index}`}>
                  <span className="avatar">{member.name.charAt(0)}</span>
                  <div>
                    <small>{member.role}</small>
                    <h3>{member.name}</h3>
                    <p>{member.rationale}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="v4-design-explanation">
              <div>
                <span className="eyebrow">Why this design?</span>
                <h3>{priority}</h3>
              </div>
              <ul>
                <li>Roles cover direction, connection, delivery and challenge.</li>
                <li>The team size supports practical collaboration.</li>
                <li>The selected priority influences the final balance.</li>
                <li>Each member has a clear contribution to the purpose.</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
