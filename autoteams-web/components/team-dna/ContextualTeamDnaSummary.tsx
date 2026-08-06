"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ContextualProfile,
  loadContextualProfiles,
  saveActiveContextualProfileId,
} from "@/lib/contextual-profiles";
import { suggestedRoles } from "@/lib/atlas-question-packs";
import {
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";

export function ContextualTeamDnaSummary() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);

  useEffect(() => {
    setProfiles(loadContextualProfiles());
  }, []);

  if (profiles.length === 0) {
    return (
      <div className="dna125-empty">
        <h2>No contextual Team DNA profiles yet.</h2>
        <p>Create a profile and complete the Atlas interview.</p>
        <Link className="button" href="/onboarding/profile">
          Create Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="dna126-grid">
      {profiles.map((profile) => {
        const interview = loadContextInterview(profile.id, profile.mode);
        const freshness = profileFreshness(interview.completedAt);

        return (
          <article key={profile.id}>
            <div className="dna126-card-top">
              <span>{modeIcon(profile.mode)}</span>
              <em>{profile.mode}</em>
            </div>

            <h2>{profile.label}</h2>
            <p>
              A separate Team DNA profile for your {profile.mode} context.
            </p>

            <div className={`dna126-health ${freshness.status}`}>
              <div>
                <small>Updated</small>
                <strong>{freshness.label}</strong>
              </div>
              <div>
                <small>Confidence</small>
                <strong>{freshness.confidence}%</strong>
              </div>
            </div>

            {freshness.status === "stale" && (
              <div className="dna126-refresh-warning">
                This Team DNA is over a year old. Atlas recommends refreshing
                the context questions.
              </div>
            )}

            <div className="dna126-roles">
              {suggestedRoles(profile.mode)
                .slice(0, 3)
                .map((role) => (
                  <span key={role}>{role}</span>
                ))}
            </div>

            <div className="dna126-consent">
              <span>
                {profile.allowTeamMatching ? "✓" : "×"} Atlas matching
              </span>
              <span>
                {profile.allowAggregatedInsights ? "✓" : "×"} Insights
              </span>
            </div>

            <Link
              className="button secondary"
              href="/atlas"
              onClick={() => saveActiveContextualProfileId(profile.id)}
            >
              {interview.completedAt ? "Review or Refresh" : "Complete Interview"}
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function modeIcon(mode: ContextualProfile["mode"]): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}
