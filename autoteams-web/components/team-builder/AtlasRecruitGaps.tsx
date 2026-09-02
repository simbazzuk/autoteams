"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AtlasRecruitGaps.module.css";

const MODE_KEY = "autoteams-build-route-v71511";
const TEAM_KEY = "autoteams-v20-saved-teams";
const ACTIVE_HYBRID_TEAM_KEY = "autoteams-active-hybrid-team-v715121";
const GAP_DRAFT_KEY = "autoteams-atlas-gap-opportunity-v71512";

type SavedTeam = {
  id: string;
  name: string;
  purpose: string;
  createdAt: string;
  profileType?: string;
  personIds?: string[];
  recommendation?: {
    summary?: string;
    skillGaps?: string[];
  };
};

type CapacityGap = {
  text: string;
  places: number;
};

function readTeams(): SavedTeam[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readBoundHybridTeam(): SavedTeam | null {
  try {
    const teamId = localStorage.getItem(ACTIVE_HYBRID_TEAM_KEY);
    if (!teamId) return null;

    const teams = readTeams();
    return teams.find(team => team.id === teamId) ?? null;
  } catch {
    return null;
  }
}

function contextFromProfile(profileType?: string) {
  const value = String(profileType || "").toLowerCase();

  if (value === "sport" || value === "sports") return "sports";
  if (value === "community") return "community";
  if (value === "education") return "education";

  return "professional";
}

function splitGaps(gaps: string[]) {
  const capabilityGaps: string[] = [];
  const capacityGaps: CapacityGap[] = [];

  for (const raw of gaps) {
    const text = String(raw || "").trim();
    if (!text) continue;

    const capacityMatch = text.match(
      /^(\d+)\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i,
    );

    if (capacityMatch) {
      capacityGaps.push({
        text,
        places: Math.max(1, Number(capacityMatch[1] || 1)),
      });
      continue;
    }

    capabilityGaps.push(text);
  }

  return {
    capabilityGaps: capabilityGaps.slice(0, 3),
    capacityGaps: capacityGaps.slice(0, 1),
  };
}

export function AtlasRecruitGaps() {
  const [mode, setMode] = useState("");
  const [team, setTeam] = useState<SavedTeam | null>(null);

  useEffect(() => {
    function refresh() {
      try {
        setMode(localStorage.getItem(MODE_KEY) || "");
      } catch {
        setMode("");
      }

      setTeam(readBoundHybridTeam());
    }

    refresh();

    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { capabilityGaps, capacityGaps } = useMemo(
    () => splitGaps(team?.recommendation?.skillGaps || []),
    [team],
  );

  if (mode !== "hybrid") return null;

  function prepareOpportunity(input: {
    label: string;
    skills: string;
    places: number;
    kind: "capability" | "capacity";
  }) {
    if (!team) return;

    const objective =
      input.kind === "capability"
        ? `Join ${team.name} to strengthen ${input.label} capability and help deliver: ${team.purpose || team.recommendation?.summary || "the team objective"}.`
        : `Join ${team.name} to help complete the team and contribute to: ${team.purpose || team.recommendation?.summary || "the team objective"}.`;

    const title =
      input.kind === "capability"
        ? `${input.label} for ${team.name}`
        : `Complete ${team.name}`;

    const draft = {
      source: input.kind === "capability" ? "atlas-gap" : "atlas-capacity",
      sourceTeamId: team.id,
      sourceTeamName: team.name,
      title,
      objective,
      context: contextFromProfile(team.profileType),
      places: input.places,
      location: "Flexible",
      workingMode: "flexible",
      skills: input.skills,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(GAP_DRAFT_KEY, JSON.stringify(draft));
    window.location.href = "/opportunities?atlasGap=1";
  }

  return (
    <section
      className={styles.shell}
      data-autoteams-atlas-recruit-gaps="v7.15.7.15.12.1"
    >
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Atlas Recruit Gaps</span>
          <h2>Complete the team by recruiting only what is missing.</h2>
          <p>
            Atlas now stays bound to the exact hybrid team you just saved.
            Capability gaps and remaining team capacity are shown separately.
          </p>
        </div>
        <span className={styles.atlasMark} aria-hidden="true">A</span>
      </div>

      {!team && (
        <div className={styles.empty}>
          <strong>Save the hybrid team you are building.</strong>
          <span>
            Recruit Gaps will then attach to that exact saved team instead of
            using another team from your history.
          </span>
        </div>
      )}

      {team && (
        <>
          <div className={styles.teamSummary}>
            <div>
              <span>Current hybrid team</span>
              <strong>{team.name}</strong>
            </div>
            <p>
              {team.recommendation?.summary ||
                team.purpose ||
                "Atlas recommendation saved for this team."}
            </p>
          </div>

          {capabilityGaps.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.subheading}>
                <span>Capability gaps</span>
                <small>Skills or capabilities Atlas believes are missing.</small>
              </div>

              <div className={styles.gapGrid}>
                {capabilityGaps.map((gap, index) => (
                  <article className={styles.gapCard} key={`${gap}-${index}`}>
                    <div className={styles.gapTop}>
                      <span>{index + 1}</span>
                      <b>Capability gap</b>
                    </div>

                    <h3>{gap}</h3>
                    <p>
                      Recruit someone who can strengthen this capability without
                      changing the rest of the team.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        prepareOpportunity({
                          label: gap,
                          skills: gap,
                          places: 1,
                          kind: "capability",
                        })
                      }
                    >
                      Recruit this capability
                      <span aria-hidden="true">→</span>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {capacityGaps.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.subheading}>
                <span>Team capacity</span>
                <small>Open places are a capacity gap, not a capability gap.</small>
              </div>

              {capacityGaps.map(gap => (
                <article className={styles.capacityCard} key={gap.text}>
                  <div>
                    <span className={styles.capacityBadge}>{gap.places}</span>
                    <div>
                      <strong>
                        {gap.places} {gap.places === 1 ? "place" : "places"} still
                        available
                      </strong>
                      <p>
                        You can publish a general Opportunity to complete the team
                        without claiming that Atlas found a missing skill.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      prepareOpportunity({
                        label: "Team member",
                        skills: "",
                        places: gap.places,
                        kind: "capacity",
                      })
                    }
                  >
                    Recruit for open places
                  </button>
                </article>
              ))}
            </div>
          )}

          {capabilityGaps.length === 0 && capacityGaps.length === 0 && (
            <div className={styles.noGaps}>
              <span aria-hidden="true">✓</span>
              <div>
                <strong>No significant gaps identified.</strong>
                <p>
                  Atlas has not highlighted a missing capability or remaining
                  team capacity in this saved recommendation.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
