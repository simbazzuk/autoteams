"use client";

import { FormEvent, useState } from "react";
import {
  ProfileAnalysis,
  defaultDna,
} from "@/lib/team-intelligence";
import { TeamDnaChart } from "./TeamDnaChart";

const example =
  "I enjoy solving difficult problems and turning ideas into practical plans. " +
  "I work well in small collaborative teams, but I also need time to think " +
  "independently. I value clear ownership, honest communication and reliable " +
  "follow-through. I enjoy helping others, challenging assumptions constructively " +
  "and exploring new technology.";

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
    <div className="intelligence-layout">
      <form className="card intelligence-form" onSubmit={analyse}>
        <span className="eyebrow">AI conversation input</span>
        <h2>Tell TeamGuide about yourself.</h2>
        <p>
          Describe how you work with others, what energises you and what helps
          a team succeed.
        </p>

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

        <div className="privacy-note">
          AutoTeams should not infer sensitive personal characteristics from
          this conversation.
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="button" disabled={working} type="submit">
          {working ? "Analysing…" : "Create my Team DNA"}
        </button>
      </form>

      <div className="card intelligence-result">
        {!analysis ? (
          <>
            <span className="icon">🧠</span>
            <h2>Your Team DNA will appear here.</h2>
            <p>
              The analysis converts natural language into structured,
              explainable team attributes.
            </p>
            <TeamDnaChart dna={defaultDna} />
          </>
        ) : (
          <>
            <div className="result-heading">
              <div>
                <span className="eyebrow">Team DNA created</span>
                <h2>Your collaboration profile.</h2>
              </div>
              <span className="badge">
                {mode === "gemini" ? "Gemini analysis" : "Demo analysis"}
              </span>
            </div>

            <p className="analysis-summary">{analysis.summary}</p>
            <TeamDnaChart dna={analysis.teamDna} />

            <div className="analysis-grid">
              <div>
                <h3>Preferred roles</h3>
                <div className="chips">
                  {analysis.preferredRoles.map((role) => (
                    <span className="chip" key={role}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3>Working style</h3>
                <p>{analysis.workingStyle}</p>
              </div>
              <div>
                <h3>Strengths</h3>
                <ul>
                  {analysis.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Potential challenges</h3>
                <ul>
                  {analysis.potentialChallenges.map((challenge) => (
                    <li key={challenge}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="notice">
              <strong>Recommended environment:</strong>{" "}
              {analysis.recommendedEnvironment}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
