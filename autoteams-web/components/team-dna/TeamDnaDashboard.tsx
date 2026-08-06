"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ContextMode,
  ContextualProfile,
  loadContextualProfiles,
  saveActiveContextualProfileId,
} from "@/lib/contextual-profiles";
import { buildTeamDnaInsight, TeamDnaInsight } from "@/lib/team-dna-insights";

export function TeamDnaDashboard() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const loaded = loadContextualProfiles();
    setProfiles(loaded);
    setSelectedId(loaded[0]?.id || "");
    setCompareIds(loaded.slice(0, 2).map((profile) => profile.id));
  }, []);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) || null,
    [profiles, selectedId],
  );

  const selectedInsight = useMemo(
    () =>
      selectedProfile
        ? buildTeamDnaInsight(selectedProfile.id, selectedProfile.mode)
        : null,
    [selectedProfile],
  );

  const insights = useMemo(
    () =>
      profiles.map((profile) => ({
        profile,
        insight: buildTeamDnaInsight(profile.id, profile.mode),
      })),
    [profiles],
  );

  const compare = insights.filter(({ profile }) =>
    compareIds.includes(profile.id),
  );

  function openAtlas(profile: ContextualProfile) {
    saveActiveContextualProfileId(profile.id);
    window.location.href = "/atlas";
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 2) {
        return [current[1], id];
      }
      return [...current, id];
    });
  }

  if (!selectedProfile || !selectedInsight) {
    return (
      <div className="dna130c-empty">
        <h2>No Team DNA profiles are available.</h2>
        <p>Create a contextual profile and complete the Atlas interview.</p>
        <Link className="button" href="/profile">
          Open My Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="dna130c-dashboard">
      <section className="dna130c-overview">
        <div className="dna130c-overview-copy">
          <span className="eyebrow">My Team DNA</span>
          <h2>{selectedProfile.label}</h2>
          <p>{selectedInsight.summary}</p>

          <div className="dna130c-overview-actions">
            <button
              className="button"
              onClick={() => openAtlas(selectedProfile)}
              type="button"
            >
              {selectedInsight.interviewComplete
                ? "Refresh with Atlas"
                : "Complete Atlas Interview"}
            </button>
            <Link className="button secondary" href="/profile">
              Manage Profiles
            </Link>
          </div>
        </div>

        <div className="dna130c-health-ring">
          <div
            style={{
              background: `conic-gradient(currentColor ${selectedInsight.confidence * 3.6}deg, #293246 0deg)`,
            }}
          >
            <span>
              <strong>{selectedInsight.confidence}%</strong>
              <small>Confidence</small>
            </span>
          </div>
          <p className={selectedInsight.freshnessStatus}>
            {selectedInsight.freshnessLabel}
          </p>
        </div>
      </section>

      <section className="dna130c-profile-strip">
        {insights.map(({ profile, insight }) => (
          <button
            className={profile.id === selectedId ? "active" : ""}
            key={profile.id}
            onClick={() => setSelectedId(profile.id)}
            type="button"
          >
            <span>{modeIcon(profile.mode)}</span>
            <div>
              <strong>{profile.label}</strong>
              <small>
                {insight.interviewComplete
                  ? `${insight.confidence}% confidence`
                  : `${insight.completion}% complete`}
              </small>
            </div>
            <em className={insight.freshnessStatus}>
              {insight.freshnessStatus}
            </em>
          </button>
        ))}
      </section>

      <section className="dna130c-summary-grid">
        <article>
          <small>Profile completion</small>
          <strong>{selectedInsight.completion}%</strong>
        </article>
        <article>
          <small>Interview status</small>
          <strong>
            {selectedInsight.interviewComplete ? "Complete" : "In progress"}
          </strong>
        </article>
        <article>
          <small>Context</small>
          <strong>{selectedProfile.mode}</strong>
        </article>
        <article>
          <small>Refresh status</small>
          <strong>{refreshStatus(selectedInsight)}</strong>
        </article>
      </section>

      <section className="dna130c-main-grid">
        <article className="dna130c-panel">
          <div className="dna130c-panel-heading">
            <div>
              <span className="eyebrow">Trait profile</span>
              <h2>How this Team DNA is balanced.</h2>
            </div>
          </div>

          <div className="dna130c-traits">
            {selectedInsight.traits.map((trait) => (
              <div key={trait.name}>
                <div>
                  <strong>{trait.name}</strong>
                  <span>{trait.score}%</span>
                </div>
                <p>{trait.description}</p>
                <div className="bar">
                  <i style={{ width: `${trait.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="dna130c-panel dna130c-atlas-health">
          <span className="eyebrow">Atlas Health</span>
          <h2>Is this profile ready to use?</h2>

          <HealthItem
            title="Interview completion"
            value={`${selectedInsight.completion}%`}
            status={
              selectedInsight.completion === 100 ? "good" : "attention"
            }
          />
          <HealthItem
            title="Confidence"
            value={`${selectedInsight.confidence}%`}
            status={
              selectedInsight.confidence >= 85
                ? "good"
                : selectedInsight.confidence >= 65
                  ? "attention"
                  : "risk"
            }
          />
          <HealthItem
            title="Freshness"
            value={selectedInsight.freshnessLabel}
            status={
              selectedInsight.freshnessStatus === "fresh"
                ? "good"
                : selectedInsight.freshnessStatus === "aging"
                  ? "attention"
                  : "risk"
            }
          />
          <HealthItem
            title="Atlas matching"
            value={selectedProfile.allowTeamMatching ? "Allowed" : "Blocked"}
            status={selectedProfile.allowTeamMatching ? "good" : "attention"}
          />

          <div className="dna130c-health-guidance">
            <strong>{healthTitle(selectedInsight)}</strong>
            <p>{healthGuidance(selectedInsight)}</p>
          </div>

          <button
            className="button"
            onClick={() => openAtlas(selectedProfile)}
            type="button"
          >
            {selectedInsight.interviewComplete
              ? "Review or Refresh"
              : "Continue Interview"}
          </button>
        </aside>
      </section>

      <section className="dna130c-two-column">
        <article className="dna130c-panel">
          <span className="eyebrow">Strengths</span>
          <h2>Signals Atlas sees most strongly.</h2>

          <div className="dna130c-insight-list strengths">
            {selectedInsight.strengths.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dna130c-panel">
          <span className="eyebrow">Development themes</span>
          <h2>Areas worth exploring.</h2>

          <div className="dna130c-insight-list development">
            {selectedInsight.developmentAreas.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="dna130c-development-note">
            Development themes are prompts for reflection, not performance
            judgements.
          </div>
        </article>
      </section>

      <section className="dna130c-compare-section">
        <div className="dna130c-panel-heading">
          <div>
            <span className="eyebrow">Compare contexts</span>
            <h2>See how your Team DNA changes by setting.</h2>
            <p>
              Choose up to two profiles. Contextual differences are expected and
              do not indicate inconsistency.
            </p>
          </div>
        </div>

        <div className="dna130c-compare-picker">
          {profiles.map((profile) => (
            <label key={profile.id}>
              <input
                type="checkbox"
                checked={compareIds.includes(profile.id)}
                onChange={() => toggleCompare(profile.id)}
              />
              <span>{modeIcon(profile.mode)}</span>
              <strong>{profile.label}</strong>
            </label>
          ))}
        </div>

        {compare.length === 2 ? (
          <div className="dna130c-comparison">
            <ComparisonColumn
              profile={compare[0].profile}
              insight={compare[0].insight}
            />
            <div className="dna130c-comparison-divider">
              <span>VS</span>
            </div>
            <ComparisonColumn
              profile={compare[1].profile}
              insight={compare[1].insight}
            />
          </div>
        ) : (
          <div className="dna130c-compare-empty">
            Select two profiles to compare.
          </div>
        )}
      </section>
    </div>
  );
}

function HealthItem({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status: "good" | "attention" | "risk";
}) {
  return (
    <div className={`dna130c-health-item ${status}`}>
      <span />
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ComparisonColumn({
  profile,
  insight,
}: {
  profile: ContextualProfile;
  insight: TeamDnaInsight;
}) {
  return (
    <article>
      <div className="dna130c-comparison-title">
        <span>{modeIcon(profile.mode)}</span>
        <div>
          <h3>{profile.label}</h3>
          <small>{insight.confidence}% confidence</small>
        </div>
      </div>

      <div className="dna130c-comparison-traits">
        {insight.traits.slice(0, 5).map((trait) => (
          <div key={trait.name}>
            <span>{trait.name}</span>
            <strong>{trait.score}%</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function refreshStatus(insight: TeamDnaInsight): string {
  if (!insight.interviewComplete) return "Complete interview";
  if (insight.freshnessStatus === "stale") return "Refresh recommended";
  if (insight.freshnessStatus === "aging") return "Review soon";
  return "No refresh needed";
}

function healthTitle(insight: TeamDnaInsight): string {
  if (!insight.interviewComplete) return "Finish the Atlas interview";
  if (insight.freshnessStatus === "stale") return "Refresh recommended";
  if (insight.freshnessStatus === "aging") return "Profile is beginning to age";
  return "Profile is ready";
}

function healthGuidance(insight: TeamDnaInsight): string {
  if (!insight.interviewComplete) {
    return "Atlas needs the remaining answers before this Team DNA should be used for recommendations.";
  }
  if (insight.freshnessStatus === "stale") {
    return "Refresh the contextual questions before relying on this profile for an important decision.";
  }
  if (insight.freshnessStatus === "aging") {
    return "The profile remains usable, but review whether your circumstances or preferences have changed.";
  }
  return "The profile is complete, current and suitable for Atlas matching where consent permits.";
}

function modeIcon(mode: ContextMode): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}
