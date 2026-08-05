"use client";

import { useMemo, useState } from "react";
import { candidates } from "@/data/candidates";

type CanvasMember = {
  id: string;
  name: string;
  role: string;
  type: string;
};

const roleLabels = [
  "Strategic Lead",
  "Delivery Builder",
  "Product Connector",
  "Analytical Challenger",
  "Creative Explorer",
  "Team Facilitator",
];

export function TeamCanvas() {
  const [teamName, setTeamName] = useState("Project Atlas");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    candidates.slice(0, 4).map((candidate) => candidate.id)
  );
  const [priority, setPriority] = useState("Balanced performance");

  const selected = useMemo<CanvasMember[]>(
    () =>
      selectedIds
        .map((id, index) => {
          const candidate = candidates.find((item) => item.id === id);
          if (!candidate) return null;
          return {
            id: candidate.id,
            name: candidate.name,
            role: roleLabels[index % roleLabels.length],
            type: candidate.teamType,
          };
        })
        .filter((member): member is CanvasMember => Boolean(member)),
    [selectedIds]
  );

  const score = Math.min(97, 72 + selected.length * 5);
  const balance = selected.length >= 4 ? "Excellent" : "Developing";
  const conflictRisk = selected.length >= 5 ? "Medium" : "Low";

  function toggleCandidate(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 6
          ? [...current, id]
          : current
    );
  }

  return (
    <div className="canvas-workspace">
      <aside className="canvas-library">
        <div className="canvas-panel-heading">
          <div>
            <span className="eyebrow">Candidate Library</span>
            <h2>Build your team</h2>
          </div>
          <span className="badge">{selected.length}/6 selected</span>
        </div>

        <label>
          Team name
          <input value={teamName} onChange={(event) => setTeamName(event.target.value)} />
        </label>

        <label>
          Optimisation priority
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option>Balanced performance</option>
            <option>Maximum innovation</option>
            <option>Low conflict risk</option>
            <option>Strong leadership</option>
            <option>High social connection</option>
          </select>
        </label>

        <div className="candidate-library-list">
          {candidates.map((candidate) => {
            const active = selectedIds.includes(candidate.id);
            return (
              <button
                className={`candidate-library-card ${active ? "active" : ""}`}
                key={candidate.id}
                onClick={() => toggleCandidate(candidate.id)}
                type="button"
              >
                <span className="avatar">{candidate.name.charAt(0)}</span>
                <span>
                  <strong>{candidate.name}</strong>
                  <small>{candidate.role} • {candidate.city}</small>
                </span>
                <em>{active ? "Remove" : "Add"}</em>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="canvas-stage">
        <div className="canvas-stage-header">
          <div>
            <span className="eyebrow">Interactive Team Canvas</span>
            <h1>{teamName || "Untitled Team"}</h1>
            <p>Arrange the team, review its balance and refine the composition.</p>
          </div>
          <div className="canvas-score">
            <strong>{score}%</strong>
            <span>Team confidence</span>
          </div>
        </div>

        <div className="canvas-board">
          <div className="canvas-grid-lines" />
          {selected.map((member, index) => (
            <article
              className={`canvas-person canvas-position-${index + 1}`}
              key={member.id}
            >
              <span className="canvas-person-avatar">{member.name.charAt(0)}</span>
              <strong>{member.name}</strong>
              <small>{member.role}</small>
              <button onClick={() => toggleCandidate(member.id)} type="button">×</button>
            </article>
          ))}
          {selected.length === 0 && (
            <div className="canvas-empty">
              <span>＋</span>
              <h3>Add candidates from the library</h3>
              <p>The live team assessment will update automatically.</p>
            </div>
          )}
        </div>

        <div className="canvas-insight-grid">
          <Insight title="Overall balance" value={balance} score={score} />
          <Insight title="Leadership" value="Strong" score={88} />
          <Insight title="Collaboration" value="Very good" score={91} />
          <Insight title="Conflict risk" value={conflictRisk} score={selected.length >= 5 ? 68 : 86} />
        </div>

        <div className="canvas-recommendation">
          <div>
            <span className="eyebrow">AI recommendation</span>
            <h3>{priority}</h3>
            <p>
              This composition has strong delivery and collaboration coverage.
              Consider adding a creative specialist when innovation is the primary outcome.
            </p>
          </div>
          <button className="button" type="button">Save Team Design</button>
        </div>
      </section>
    </div>
  );
}

function Insight({ title, value, score }: { title: string; value: string; score: number }) {
  return (
    <article className="canvas-insight-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <div className="bar"><i style={{ width: `${score}%` }} /></div>
      <small>{score}% confidence</small>
    </article>
  );
}
