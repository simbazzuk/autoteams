"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ContextMode,
  ContextualProfile,
  loadContextualProfiles,
  saveActiveContextualProfileId,
} from "@/lib/contextual-profiles";
import {
  TeamDnaInsight,
  buildTeamDnaInsight,
} from "@/lib/team-dna-insights";
import styles from "./MyAtlasProfileDashboard.module.css";

export function MyAtlasProfileDashboard() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const loaded = loadContextualProfiles();
    setProfiles(loaded);
    setSelectedId(loaded[0]?.id || "");
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

  const profilesWithInsights = useMemo(
    () =>
      profiles.map((profile) => ({
        profile,
        insight: buildTeamDnaInsight(profile.id, profile.mode),
      })),
    [profiles],
  );

  function openAtlas(profile: ContextualProfile) {
    saveActiveContextualProfileId(profile.id);
    window.location.href = "/atlas";
  }

  if (!selectedProfile || !selectedInsight) {
    return (
      <section className={styles.empty}>
        <span className={styles.emptyIcon}>✦</span>
        <h2>No Atlas Profile is available yet.</h2>
        <p>
          Create a contextual profile and complete the Atlas interview to build
          your individual collaboration profile.
        </p>
        <div className="actions">
          <Link className="button" href="/profile">
            Create Profile
          </Link>
          <Link className="button secondary" href="/atlas">
            Open Atlas Interview
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.explainer}>
        <div>
          <span className="eyebrow">Individual, not team-level</span>
          <h2>This is your Atlas Profile.</h2>
          <p>
            It describes how you may prefer to communicate, plan, collaborate
            and contribute in the selected context. A separate Team DNA view
            combines the profiles of people already selected for a team.
          </p>
        </div>
        <Link className="button secondary" href="/team-dna">
          View Team DNA
        </Link>
      </section>

      <section className={styles.overview}>
        <div>
          <span className="eyebrow">Selected contextual profile</span>
          <h2>{selectedProfile.label}</h2>
          <p>{selectedInsight.summary}</p>

          <div className="actions">
            <button
              className="button"
              onClick={() => openAtlas(selectedProfile)}
              type="button"
            >
              {selectedInsight.interviewComplete
                ? "Review or Refresh"
                : "Complete Atlas Interview"}
            </button>
            <Link className="button secondary" href="/profile">
              Manage Profiles
            </Link>
          </div>
        </div>

        <div className={styles.confidence}>
          <strong>{selectedInsight.confidence}%</strong>
          <span>Atlas confidence</span>
          <small className={styles[selectedInsight.freshnessStatus]}>
            {selectedInsight.freshnessLabel}
          </small>
        </div>
      </section>

      <section className={styles.profilePicker}>
        {profilesWithInsights.map(({ profile, insight }) => (
          <button
            className={profile.id === selectedId ? styles.activeProfile : ""}
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
          </button>
        ))}
      </section>

      <section className={styles.metrics}>
        <Metric label="Profile completion" value={`${selectedInsight.completion}%`} />
        <Metric
          label="Interview"
          value={selectedInsight.interviewComplete ? "Complete" : "In progress"}
        />
        <Metric label="Context" value={capitalise(selectedProfile.mode)} />
        <Metric
          label="Matching"
          value={selectedProfile.allowTeamMatching ? "Allowed" : "Blocked"}
        />
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <span className="eyebrow">Collaboration traits</span>
          <h2>How Atlas currently describes this profile.</h2>

          <div className={styles.traits}>
            {selectedInsight.traits.map((trait) => (
              <div key={trait.name}>
                <div>
                  <strong>{trait.name}</strong>
                  <span>{trait.score}%</span>
                </div>
                <p>{trait.description}</p>
                <div className={styles.bar}>
                  <i style={{ width: `${trait.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className={styles.panel}>
          <span className="eyebrow">Profile health</span>
          <h2>Is this ready for Atlas matching?</h2>

          <Health
            label="Interview completion"
            value={`${selectedInsight.completion}%`}
            good={selectedInsight.completion === 100}
          />
          <Health
            label="Confidence"
            value={`${selectedInsight.confidence}%`}
            good={selectedInsight.confidence >= 80}
          />
          <Health
            label="Freshness"
            value={selectedInsight.freshnessLabel}
            good={selectedInsight.freshnessStatus === "fresh"}
          />
          <Health
            label="Matching consent"
            value={selectedProfile.allowTeamMatching ? "Allowed" : "Blocked"}
            good={selectedProfile.allowTeamMatching}
          />

          <div className={styles.guidance}>
            <strong>{healthTitle(selectedInsight)}</strong>
            <p>{healthText(selectedInsight)}</p>
          </div>
        </aside>
      </section>

      <section className={styles.twoColumns}>
        <article className={styles.panel}>
          <span className="eyebrow">Strongest signals</span>
          <h2>Where this profile may contribute most.</h2>
          <div className={styles.insightList}>
            {selectedInsight.strengths.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <span className="eyebrow">Development themes</span>
          <h2>Prompts for reflection.</h2>
          <div className={styles.insightList}>
            {selectedInsight.developmentAreas.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <small className={styles.note}>
            These are not performance judgements and should not be used as such.
          </small>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function Health({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className={styles.health}>
      <span className={good ? styles.good : styles.attention} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function healthTitle(insight: TeamDnaInsight): string {
  if (!insight.interviewComplete) return "Finish the Atlas interview";
  if (insight.freshnessStatus === "stale") return "Refresh recommended";
  if (insight.freshnessStatus === "aging") return "Review this profile soon";
  return "Ready for matching";
}

function healthText(insight: TeamDnaInsight): string {
  if (!insight.interviewComplete) {
    return "Atlas needs the remaining answers before this profile should be used in a recommendation.";
  }
  if (insight.freshnessStatus === "stale") {
    return "Your circumstances may have changed since this profile was completed.";
  }
  if (insight.freshnessStatus === "aging") {
    return "The profile is usable, but it is worth checking whether it still represents you.";
  }
  return "This profile is complete and current, subject to your matching consent.";
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

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
