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

const dimensionLabels: Record<string, string> = {
  goals: "Purpose alignment",
  availability: "Availability",
  interests: "Shared skills",
  location: "Location",
  dnaBalance: "Team DNA balance",
  trust: "Trust",
};

const dnaLabels: Record<keyof TeamDna, string> = {
  leadership: "Leadership",
  collaboration: "Collaboration",
  communication: "Communication",
  planning: "Planning",
  creativity: "Innovation",
  adaptability: "Adaptability",
  socialEnergy: "Social energy",
  reliability: "Reliability",
};

export function MatchExplorer() {
  const [teamType, setTeamType] = useState("Business");
  const [city, setCity] = useState("Leeds");
  const [dnaPreset, setDnaPreset] = useState("Balanced");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const selectedResults = results.filter((result) =>
    selectedIds.includes(result.candidate.id),
  );

  const suggestedResults =
    selectedResults.length > 0 ? selectedResults : results.slice(0, 3);

  const teamConfidence = suggestedResults.length
    ? Math.round(
        suggestedResults.reduce((sum, result) => sum + result.score, 0) /
          suggestedResults.length,
      )
    : 0;

  const teamDna = useMemo(() => {
    if (!suggestedResults.length) return defaultDna;

    const keys = Object.keys(defaultDna) as (keyof TeamDna)[];
    return keys.reduce<TeamDna>(
      (summary, key) => {
        summary[key] = Math.round(
          suggestedResults.reduce(
            (total, result) => total + result.candidate.dna[key],
            0,
          ) / suggestedResults.length,
        );
        return summary;
      },
      { ...defaultDna },
    );
  }, [suggestedResults]);

  function toggleCandidate(candidateId: string) {
    setSelectedIds((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  }

  return (
    <div className="studio14">
      <section className="studio14-controls">
        <div>
          <span className="eyebrow">Recommendation scenario</span>
          <h2>Configure the team Atlas should design.</h2>
          <p>
            Define the context, location and Team DNA balance. Atlas then
            explains every recommendation rather than presenting a hidden score.
          </p>
        </div>

        <div className="studio14-control-fields">
          <label>
            Team type
            <select
              value={teamType}
              onChange={(event) => {
                setTeamType(event.target.value);
                setSelectedIds([]);
              }}
            >
              <option>Business</option>
              <option>Friendship</option>
            </select>
          </label>

          <label>
            Location
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
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
      </section>

      <div className="studio14-layout">
        <main className="studio14-results">
          <div className="studio14-results-heading">
            <div>
              <span className="eyebrow">Atlas recommendations</span>
              <h2>People who strengthen the team.</h2>
              <p>
                Candidates are ranked using purpose, availability, skills,
                location, Team DNA complementarity and trust.
              </p>
            </div>
            <span>{results.length} eligible candidates</span>
          </div>

          <div className="studio14-candidate-list">
            {results.map((result, index) => (
              <CandidateMatch
                key={result.candidate.id}
                result={result}
                rank={index + 1}
                selected={selectedIds.includes(result.candidate.id)}
                onToggle={() => toggleCandidate(result.candidate.id)}
              />
            ))}
          </div>
        </main>

        <aside className="studio14-team-panel">
          <span className="eyebrow">Current recommendation</span>
          <h2>
            {teamType === "Business"
              ? "Project Atlas"
              : "Leeds Social Circle"}
          </h2>

          <div className="studio14-confidence">
            <strong>{teamConfidence}%</strong>
            <span>Overall team confidence</span>
          </div>

          <div className="studio14-selected">
            <div>
              <strong>Selected people</strong>
              <span>
                {selectedIds.length
                  ? `${selectedIds.length} manually selected`
                  : "Top three recommended"}
              </span>
            </div>

            {suggestedResults.map((result) => (
              <div className="studio14-selected-person" key={result.candidate.id}>
                <span>{result.candidate.name.charAt(0)}</span>
                <div>
                  <strong>{result.candidate.name}</strong>
                  <small>{result.candidate.role}</small>
                </div>
                <em>{result.score}%</em>
              </div>
            ))}
          </div>

          <div className="studio14-team-dna">
            <div className="studio14-section-label">
              <strong>Current Team DNA</strong>
              <span>{dnaPreset} target</span>
            </div>

            {(Object.keys(teamDna) as (keyof TeamDna)[])
              .slice(0, 5)
              .map((key) => (
                <ProgressMetric
                  key={key}
                  label={dnaLabels[key]}
                  score={teamDna[key]}
                />
              ))}
          </div>

          <div className="studio14-team-guidance">
            <strong>
              {teamConfidence >= 85
                ? "Strong recommendation"
                : teamConfidence >= 70
                  ? "Promising team"
                  : "Review the balance"}
            </strong>
            <p>
              {teamConfidence >= 85
                ? "The selected people provide a strong balance of compatible purpose, complementary Team DNA and trust."
                : "Atlas recommends reviewing the lower-scoring dimensions before confirming this team."}
            </p>
          </div>

          <button className="button studio14-primary-action" type="button">
            Create Recommended Team
          </button>
          <button
            className="button secondary studio14-secondary-action"
            onClick={() => setSelectedIds([])}
            type="button"
          >
            Reset to Atlas Recommendation
          </button>
        </aside>
      </div>
    </div>
  );
}

function CandidateMatch({
  result,
  rank,
  selected,
  onToggle,
}: {
  result: MatchExplanation;
  rank: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const { candidate, dimensions } = result;
  const strongestDimension = Object.entries(dimensions).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const weakestDimension = Object.entries(dimensions).sort(
    (left, right) => left[1] - right[1],
  )[0];

  return (
    <article className={selected ? "studio14-candidate selected" : "studio14-candidate"}>
      <div className="studio14-candidate-header">
        <div className="studio14-rank">{String(rank).padStart(2, "0")}</div>

        <div className="studio14-person">
          <span className="studio14-avatar">{candidate.name.charAt(0)}</span>
          <div>
            <h3>{candidate.name}</h3>
            <p>
              {candidate.role} <span>•</span> {candidate.city}
            </p>
          </div>
        </div>

        <div className="studio14-match-score">
          <strong>{result.score}%</strong>
          <span>Atlas match</span>
        </div>

        <button
          className={selected ? "button studio14-add selected" : "button studio14-add"}
          onClick={onToggle}
          type="button"
        >
          {selected ? "Added to Team" : "Add to Team"}
        </button>
      </div>

      <div className="studio14-candidate-summary">
        <span className="eyebrow">Atlas explanation</span>
        <p>
          {candidate.name} is recommended because{" "}
          {result.reasons[0]?.toLowerCase() || "the overall profile is balanced"}.
          The strongest matching signal is{" "}
          <strong>
            {dimensionLabels[strongestDimension[0]]} at {strongestDimension[1]}%
          </strong>
          .
        </p>
      </div>

      <div className="studio14-dimensions">
        {Object.entries(dimensions).map(([label, score]) => (
          <ProgressMetric
            key={label}
            label={dimensionLabels[label]}
            score={score}
          />
        ))}
      </div>

      <div className="studio14-explanation-grid">
        <section>
          <span className="studio14-explanation-icon good">✓</span>
          <div>
            <h4>Why Atlas recommends this person</h4>
            <ul>
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <span className="studio14-explanation-icon caution">△</span>
          <div>
            <h4>Points to consider</h4>
            {result.cautions.length ? (
              <ul>
                {result.cautions.map((caution) => (
                  <li key={caution}>{caution}</li>
                ))}
              </ul>
            ) : (
              <p>
                No significant matching concerns were identified. The lowest
                current dimension is {dimensionLabels[weakestDimension[0]]} at{" "}
                {weakestDimension[1]}%.
              </p>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function ProgressMetric({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="studio14-progress">
      <div>
        <span>{label}</span>
        <strong>{score}%</strong>
      </div>
      <div className="studio14-progress-track">
        <i style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
