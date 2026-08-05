"use client";

import { useMemo, useState } from "react";
import { candidates } from "@/data/candidates";
import {
  MatchExplanation,
  TeamDna,
  defaultDna,
  scoreCandidate,
} from "@/lib/team-intelligence";

const dnaPresets: Record<string, TeamDna> = {
  Balanced: defaultDna,
  Leader: {
    leadership: 88,
    collaboration: 72,
    communication: 78,
    planning: 76,
    creativity: 68,
    adaptability: 70,
    socialEnergy: 72,
    reliability: 84,
  },
  Creative: {
    leadership: 62,
    collaboration: 78,
    communication: 74,
    planning: 52,
    creativity: 94,
    adaptability: 88,
    socialEnergy: 70,
    reliability: 68,
  },
  Planner: {
    leadership: 66,
    collaboration: 76,
    communication: 68,
    planning: 94,
    creativity: 58,
    adaptability: 62,
    socialEnergy: 48,
    reliability: 96,
  },
};

export function MatchExplorer() {
  const [teamType, setTeamType] = useState("Business");
  const [city, setCity] = useState("Leeds");
  const [dnaPreset, setDnaPreset] = useState("Balanced");

  const results = useMemo(() => {
    const person =
      teamType === "Friendship"
        ? {
            city,
            teamType,
            interests: ["technology", "football", "restaurants", "travel"],
            availability: ["Weekends", "Weekday evenings"],
            goals: ["Genuine local friendships", "Regular activities"],
            trustLevel: 3,
            dna: dnaPresets[dnaPreset],
          }
        : {
            city,
            teamType,
            interests: ["AI", "cloud", "engineering", "innovation"],
            availability: ["Weekday evenings", "Friday afternoons"],
            goals: ["Balanced project team", "Build useful products"],
            trustLevel: 4,
            dna: dnaPresets[dnaPreset],
          };

    return candidates
      .filter((candidate) => candidate.teamType === teamType)
      .map((candidate) => scoreCandidate(person, candidate))
      .sort((left, right) => right.score - left.score);
  }, [city, dnaPreset, teamType]);

  const teamConfidence = results.length
    ? Math.round(
        results
          .slice(0, 4)
          .reduce((sum, result) => sum + result.score, 0) /
          Math.min(results.length, 4)
      )
    : 0;

  return (
    <>
      <div className="card match-controls">
        <div>
          <span className="eyebrow">Matching scenario</span>
          <h2>Configure the recommendation.</h2>
        </div>
        <label>
          Team type
          <select
            value={teamType}
            onChange={(event) => setTeamType(event.target.value)}
          >
            <option>Business</option>
            <option>Friendship</option>
          </select>
        </label>
        <label>
          Location
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option>Leeds</option>
            <option>Bradford</option>
          </select>
        </label>
        <label>
          Team DNA preset
          <select
            value={dnaPreset}
            onChange={(event) => setDnaPreset(event.target.value)}
          >
            {Object.keys(dnaPresets).map((preset) => (
              <option key={preset}>{preset}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="team-recommendation">
        <div className="dark-panel team-summary">
          <span className="dark-badge">Recommended AutoTeam</span>
          <h2>{teamType === "Business" ? "Project Atlas" : "Leeds Social Circle"}</h2>
          <div className="confidence-score">{teamConfidence}%</div>
          <p>Overall team confidence</p>
          <div className="chips">
            <span className="chip">{results.length} candidates</span>
            <span className="chip">Explainable scoring</span>
            <span className="chip">Trust level applied</span>
          </div>
        </div>

        <div className="match-list">
          {results.map((result) => (
            <CandidateMatch result={result} key={result.candidate.id} />
          ))}
        </div>
      </div>
    </>
  );
}

function CandidateMatch({ result }: { result: MatchExplanation }) {
  const { candidate, dimensions } = result;

  return (
    <article className="card candidate-match">
      <div className="candidate-heading">
        <div className="persona-id">
          <span className="avatar">{candidate.name.charAt(0)}</span>
          <span>
            <strong>{candidate.name}</strong>
            <small>
              {candidate.role} • {candidate.city}
            </small>
          </span>
        </div>
        <span className="match-score">{result.score}% match</span>
      </div>

      <div className="dimension-grid">
        {Object.entries(dimensions).map(([label, score]) => (
          <div key={label}>
            <span>{label.replace(/([A-Z])/g, " $1")}</span>
            <strong>{score}%</strong>
          </div>
        ))}
      </div>

      <div className="explanation-columns">
        <div>
          <h3>Why this match</h3>
          <ul>
            {result.reasons.map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Points to consider</h3>
          {result.cautions.length ? (
            <ul>
              {result.cautions.map((caution) => (
                <li key={caution}>△ {caution}</li>
              ))}
            </ul>
          ) : (
            <p>No significant matching concerns identified.</p>
          )}
        </div>
      </div>
    </article>
  );
}
