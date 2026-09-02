"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { loadPeople } from "@/lib/workspaces";
import {
  analyseTeamCapabilities,
  type AtlasCapabilityAnalysis,
} from "@/components/teams/atlas-capability-engine";
import { AtlasCapabilityPanel } from "@/components/teams/AtlasCapabilityPanel";
import styles from "./AtlasCandidateMatching.module.css";

const TEAM_KEY = "autoteams-v20-saved-teams";
const INVITE_KEY = "autoteams-atlas-candidate-invitations-v71571515";

type Candidate = {
  id: string;
  workspaceId?: string;
  status?: string;
  email?: string;
  name: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  strengths?: string[];
  teamDnaStatus?: string;
};

type Team = {
  id: string;
  name: string;
  purpose?: string;
  workspaceId?: string;
  people?: Array<{ id?: string } | string>;
  memberIds?: string[];
  personIds?: string[];
  openPlaces?: number;
  recommendation?: {
    skillGaps?: string[];
    teamStrengths?: string[];
  };
};

type Match = {
  person: Candidate;
  score: number;
  capability: number;
  workingStyle: number;
  contribution: number;
  reasons: string[];
};

function parse<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function words(values: string[]) {
  return new Set(
    values
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(word => word.length > 2),
  );
}

function teamMemberIds(team: Team) {
  const ids = new Set<string>();

  for (const value of team.memberIds || []) ids.add(String(value));
  for (const value of team.personIds || []) ids.add(String(value));

  for (const value of team.people || []) {
    if (typeof value === "string") ids.add(value);
    else if (value?.id) ids.add(String(value.id));
  }

  return ids;
}

function capacityGap(team: Team) {
  return (team.recommendation?.skillGaps || []).filter(
    gap =>
      !/^\d+\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i.test(
        String(gap || "").trim(),
      ),
  );
}

function scoreCandidate(team: Team, person: Candidate): Match {
  const gaps = capacityGap(team);
  const gapWords = words(gaps);
  const strengthWords = words(person.strengths || []);

  const roleWords = words([
    person.jobTitle || "",
    person.department || "",
  ]);

  let overlap = 0;
  for (const word of gapWords) {
    if (strengthWords.has(word) || roleWords.has(word)) overlap += 1;
  }

  const capability =
    gapWords.size > 0
      ? Math.min(100, 48 + Math.round((overlap / gapWords.size) * 52))
      : Math.min(100, 70 + Math.min((person.strengths || []).length * 4, 20));

  const workingStyle =
    person.teamDnaStatus === "ready" ? 88 : 72;

  const teamStrengths = words(team.recommendation?.teamStrengths || []);
  let duplicateStrengths = 0;
  for (const word of strengthWords) {
    if (teamStrengths.has(word)) duplicateStrengths += 1;
  }

  const contribution = Math.max(
    60,
    Math.min(
      96,
      82 + Math.min(overlap * 5, 14) - Math.min(duplicateStrengths * 2, 10),
    ),
  );

  const score = Math.round(
    capability * 0.5 +
      workingStyle * 0.2 +
      contribution * 0.3,
  );

  const reasons: string[] = [];

  if (overlap > 0 && gaps.length > 0) {
    reasons.push(`Adds capability relevant to ${gaps[0]}`);
  } else if ((person.strengths || []).length > 0) {
    reasons.push(`Adds ${(person.strengths || [])[0]} to the team`);
  } else {
    reasons.push("Adds another available perspective to the team");
  }

  if (person.teamDnaStatus === "ready") {
    reasons.push("Atlas profile is ready for team comparison");
  }

  reasons.push(
    contribution >= 84
      ? "Complements the existing team mix"
      : "Provides useful additional capacity",
  );

  return {
    person,
    score,
    capability,
    workingStyle,
    contribution,
    reasons,
  };
}

export function AtlasCandidateMatching({
  team,
  onChanged,
}: {
  team: Team;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [
    capabilityAnalysis,
    setCapabilityAnalysis,
  ] = useState<AtlasCapabilityAnalysis | null>(
    null,
  );

  const [
    capabilityLoading,
    setCapabilityLoading,
  ] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);

  const matches = useMemo(() => {
    if (!open) return [];

    const people =
      loadPeople() as Candidate[];
    const members = teamMemberIds(team);

    return people
      .filter(person => {
        if (!person?.id || !person?.name) {
          return false;
        }

        if (members.has(person.id)) {
          return false;
        }

        if (
          person.status &&
          person.status !== "active"
        ) {
          return false;
        }

        if (
          team.workspaceId &&
          person.workspaceId &&
          person.workspaceId !== team.workspaceId
        ) {
          return false;
        }

        return true;
      })
      .map(person =>
        scoreCandidate(
          capabilityAnalysis
            ? {
                ...team,
                recommendation: {
                  ...team.recommendation,
                  skillGaps:
                    capabilityAnalysis.skillGaps.length
                      ? capabilityAnalysis.skillGaps
                      : [capabilityAnalysis.strongestGap],
                },
              }
            : team,
          person,
        ),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [open, team, capabilityAnalysis]);

  const gaps = capacityGap(team);
  const openPlaces = Math.max(0, Number(team.openPlaces || 0));

  async function runCapabilityAnalysis() {
    try {
      setCapabilityLoading(true);
      setMessage("");

      const people =
        loadPeople();

      const result =
        await analyseTeamCapabilities({
          team,
          people,
        });

      setCapabilityAnalysis(result);

      setMessage(
        result.source === "gemini"
          ? `Atlas AI identified ${result.strongestGap} as the strongest capability gap.`
          : `Atlas identified ${result.strongestGap} using the available team evidence.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Atlas could not analyse capability gaps.",
      );
    } finally {
      setCapabilityLoading(false);
    }
  }
  function invite(match: Match) {
    const invitations = parse<Array<Record<string, unknown>>>(INVITE_KEY, []);

    const exists = invitations.some(
      invitation =>
        invitation.teamId === team.id &&
        invitation.personId === match.person.id &&
        invitation.status === "pending",
    );

    if (!exists) {
      invitations.unshift({
        id: `atlas-${team.id}-${match.person.id}-${Date.now()}`,
        teamId: team.id,
        teamName: team.name,
        personId: match.person.id,
        personName: match.person.name,
        personEmail: match.person.email,
        score: match.score,
        source: "atlas-candidate-matching",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(INVITE_KEY, JSON.stringify(invitations));
    }

    setInvited(current =>
      current.includes(match.person.id)
        ? current
        : [...current, match.person.id],
    );
    setMessage(`${match.person.name} has been invited to ${team.name}.`);
    onChanged?.();
  }

  return (
    <>
      <button
        className={styles.recruitButton}
        type="button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
      >
        <span className={styles.spark} aria-hidden="true">✦</span>
        Recruit with Atlas
      </button>

      {open && typeof document !== "undefined" && createPortal((
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`atlas-match-${team.id}`}
          >
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>Atlas candidate matching</span>
                <h2 id={`atlas-match-${team.id}`}>Find the missing piece.</h2>
                <p>
                  Atlas compares available people with what {team.name} needs
                  and explains who could add the most value.
                </p>
              </div>
              <button
                className={styles.close}
                type="button"
                aria-label="Close candidate matching"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            <AtlasCapabilityPanel
              analysis={capabilityAnalysis}
              loading={capabilityLoading}
              onAnalyse={runCapabilityAnalysis}
            />
            <div className={styles.needCard}>
              <div className={styles.atlasOrb}>A</div>
              <div>
                <span>What this team needs</span>
                <strong>
                  {capabilityAnalysis
                    ? capabilityAnalysis.strongestGap
                    : gaps.length > 0
                      ? gaps.slice(0, 2).join(" + ")
                    : openPlaces > 0
                      ? `${openPlaces} additional ${openPlaces === 1 ? "person" : "people"}`
                      : "Complementary capability"}
                </strong>
              </div>
              {openPlaces > 0 && (
                <em>{openPlaces} open {openPlaces === 1 ? "place" : "places"}</em>
              )}
            </div>

            {matches.length > 0 ? (
              <div className={styles.matches}>
                {matches.map((match, index) => {
                  const isInvited = invited.includes(match.person.id);
                  return (
                    <article className={styles.candidate} key={match.person.id}>
                      <div className={styles.rank}>{index + 1}</div>
                      <div className={styles.avatar}>
                        {match.person.name.charAt(0).toUpperCase()}
                      </div>

                      <div className={styles.body}>
                        <header>
                          <div>
                            <strong>{match.person.name}</strong>
                            <span>
                              {[match.person.jobTitle, match.person.department]
                                .filter(Boolean)
                                .join(" · ") || "Team candidate"}
                            </span>
                          </div>
                          <div className={styles.matchScore}>
                            <strong>{match.score}%</strong>
                            <span>Atlas match</span>
                          </div>
                        </header>

                        <div className={styles.signals}>
                          <Signal label="Capability fit" value={match.capability} />
                          <Signal label="Working style" value={match.workingStyle} />
                          <Signal label="Team contribution" value={match.contribution} />
                        </div>

                        <div className={styles.reasons}>
                          {match.reasons.map(reason => (
                            <span key={reason}>✓ {reason}</span>
                          ))}
                        </div>

                        <div className={styles.actions}>
                          <details>
                            <summary>Why this match?</summary>
                            <p>
                              Atlas has compared the evidence available in this
                              profile with the team&apos;s current gaps and strengths.
                              The score is decision support, not an automatic decision.
                            </p>
                          </details>

                          <button
                            type="button"
                            disabled={isInvited}
                            onClick={() => invite(match)}
                          >
                            {isInvited
                              ? "Invitation sent"
                              : "Send invitation"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <strong>No additional candidates are available yet.</strong>
                <p>
                  Add active people to this workspace and Atlas will compare them
                  with this team&apos;s recruitment needs.
                </p>
              </div>
            )}

            {message && <div className={styles.message} role="status">{message}</div>}

            <footer className={styles.footer}>
              <a href="/team-invitations">
                Review team invitations
              </a>
              <span>
                Atlas recommends. Membership changes only after acceptance.
              </span>
            </footer>
          </section>
        </div>
      ), document.body)}
    </>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}%</strong>
      <i><b style={{ width: `${value}%` }} /></i>
    </div>
  );
}
