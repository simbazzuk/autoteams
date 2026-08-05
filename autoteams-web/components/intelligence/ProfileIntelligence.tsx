"use client";

import { FormEvent, useState } from "react";
import {
  ProfileAnalysis,
  defaultDna,
} from "@/lib/team-intelligence";
import { TeamDnaChart } from "./TeamDnaChart";

const example =
  "I enjoy solving difficult problems and turning ideas into practical plans. " +
  "I work well in collaborative teams, but I also need time to think independently. " +
  "I value clear ownership, honest communication and reliable follow-through.";

export function ProfileIntelligence() {
  const [teamType, setTeamType] = useState("Business");
  const [narrative, setNarrative] = useState(example);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [mode, setMode] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function analyse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/analyse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative, teamType }),
      });

      const result = (await response.json()) as {
        analysis?: ProfileAnalysis;
        mode?: string;
        error?: string;
      };

      if (!response.ok || !result.analysis) {
        throw new Error(result.error || "Profile analysis failed.");
      }

      setAnalysis(result.analysis);
      setMode(result.mode || "");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to analyse the profile."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="v4-intelligence-workspace">
      <form className="v4-workflow-panel" onSubmit={analyse}>
        <div className="v4-panel-header">
          <div>
            <span className="eyebrow">Profile input</span>
            <h2>Describe how you contribute.</h2>
            <p>
              Use natural language. Gemini converts it into structured,
              reviewable team signals.
            </p>
          </div>
          <span className="v4-status">
            <i />
            Gemini connected
          </span>
        </div>

        <div className="v4-form-stack">
          <label>
            Team context
            <select
              value={teamType}
              onChange={(event) => setTeamType(event.target.value)}
            >
              {[
                "Friendship",
                "Business",
                "Sports",
                "Education",
                "Events",
                "Community",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            About you
            <textarea
              minLength={40}
              required
              value={narrative}
              onChange={(event) => setNarrative(event.target.value)}
            />
          </label>
        </div>

        <div className="v4-guidance">
          <span>◇</span>
          <p>
            AutoTeams should use only the information you provide and avoid
            inferring protected or highly sensitive characteristics.
          </p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="button" disabled={working} type="submit">
          {working ? "Analysing profile…" : "Generate Team DNA"}
        </button>
      </form>

      <section className="v4-results-panel">
        <div className="v4-panel-header">
          <div>
            <span className="eyebrow">
              {analysis ? "Analysis complete" : "Team DNA preview"}
            </span>
            <h2>
              {analysis
                ? "Your Team DNA profile"
                : "Your results will appear here"}
            </h2>
          </div>

          {analysis && (
            <span className="badge">
              {mode === "gemini" ? "Gemini analysis" : "Analysis"}
            </span>
          )}
        </div>

        {!analysis ? (
          <div className="v4-results-empty">
            <div className="v4-results-icon">◌</div>
            <p>
              Generate a profile to review Team DNA, preferred roles,
              strengths, watch points and the recommended team environment.
            </p>
            <div className="v4-preview-chart">
              <TeamDnaChart dna={defaultDna} />
            </div>
          </div>
        ) : (
          <>
            <p className="v4-analysis-summary">{analysis.summary}</p>

            <div className="v4-analysis-main">
              <div className="v4-analysis-dna">
                <h3>Team DNA</h3>
                <TeamDnaChart dna={analysis.teamDna} />
              </div>

              <div className="v4-analysis-profile">
                <h3>Preferred roles</h3>
                <div className="chips">
                  {analysis.preferredRoles.map((role) => (
                    <span className="chip" key={role}>
                      {role}
                    </span>
                  ))}
                </div>

                <h3>Working style</h3>
                <p>{analysis.workingStyle}</p>
              </div>
            </div>

            <div className="v4-analysis-cards">
              <article>
                <span>↑</span>
                <h3>Strengths</h3>
                <ul>
                  {analysis.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article>
                <span>△</span>
                <h3>Watch points</h3>
                <ul>
                  {analysis.potentialChallenges.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article>
                <span>◎</span>
                <h3>Best environment</h3>
                <p>{analysis.recommendedEnvironment}</p>
              </article>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
