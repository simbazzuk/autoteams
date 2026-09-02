"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { persistSavedTeamForInsights } from "@/components/team-insights/TeamPersistenceBridge";
import { TeamLifecycleControl } from "@/components/teams/TeamLifecycleControl";
import { AtlasCandidateMatching } from "@/components/teams/AtlasCandidateMatching";
import { RecruitmentSpotlight } from "@/components/teams/RecruitmentSpotlight";
import styles from "./MyTeamsHub.module.css";

const TEAM_KEY = "autoteams-v20-saved-teams";
const ACTIVE_HYBRID_TEAM_KEY = "autoteams-active-hybrid-team-v715121";
const MODE_KEY = "autoteams-build-route-v71511";

type SavedTeam = {
  id: string;
  workspaceId?: string;
  profileType?: string;
  name: string;
  purpose?: string;
  personIds?: string[];
  memberIds?: string[];
  memberCount?: number;
  createdAt?: string;
  confidence?: number;
  opportunityId?: string;
  source?: string;
  recommendation?: {
    source?: string;
    model?: string;
    summary?: string;
    teamStrengths?: string[];
    skillGaps?: string[];
    risks?: string[];
  };
};

type RouteKind = "people" | "opportunity" | "hybrid";

function readTeams(): SavedTeam[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as SavedTeam[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function uniqueTeams(items: SavedTeam[]) {
  const seen = new Set<string>();

  return items.filter(team => {
    if (!team?.id || seen.has(team.id)) return false;
    seen.add(team.id);
    return true;
  });
}

function memberCount(team: SavedTeam) {
  if (Array.isArray(team.memberIds)) return new Set(team.memberIds).size;
  if (typeof team.memberCount === "number") return team.memberCount;
  if (Array.isArray(team.personIds)) return new Set(team.personIds).size;
  return 0;
}

function routeFor(team: SavedTeam, hybridTeamId: string): RouteKind {
  if (team.id === hybridTeamId) return "hybrid";

  const source = String(team.source || "").toLowerCase();

  if (
    source.includes("opportunity") ||
    Boolean(team.opportunityId)
  ) {
    return "opportunity";
  }

  if (source.includes("hybrid")) return "hybrid";

  return "people";
}

function routeLabel(route: RouteKind) {
  if (route === "opportunity") return "Opportunity";
  if (route === "hybrid") return "Hybrid";
  return "My people";
}

function insightsProfileType(value?: string) {
  const raw = String(value || "").trim().toLowerCase();

  if (["work", "business", "professional"].includes(raw)) {
    return "work";
  }

  if (["sport", "sports"].includes(raw)) {
    return "sport";
  }

  if (["friendship", "friends", "friends_family", "personal"].includes(raw)) {
    return "friendship";
  }

  if (raw === "community") {
    return "community";
  }

  if (raw === "education") {
    return "education";
  }

  return "work";
}
function profileLabel(value?: string) {
  const raw = String(value || "").toLowerCase();

  if (raw === "sport" || raw === "sports") return "Sport";
  if (raw === "friendship" || raw === "friends_family") return "Friendship";
  if (raw === "community") return "Community";
  if (raw === "education") return "Education";

  return "Work";
}

function realCapabilityGaps(team: SavedTeam) {
  return (team.recommendation?.skillGaps || []).filter(item => {
    const text = String(item || "").trim();
    if (!text) return false;

    return !/^\d+\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i.test(
      text,
    );
  });
}

export function MyTeamsHub() {
  const auth = useAuth() as unknown as {
    user?: {
      uid?: string;
    } | null;
  };

  const uid = auth.user?.uid;
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [hybridTeamId, setHybridTeamId] = useState("");

  useEffect(() => {
    function refresh() {
      setTeams(uniqueTeams(readTeams()));

      try {
        setHybridTeamId(
          localStorage.getItem(ACTIVE_HYBRID_TEAM_KEY) || "",
        );
      } catch {
        setHybridTeamId("");
      }
    }

    refresh();

    const timer = window.setInterval(refresh, 1200);

    window.addEventListener(
      "autoteams:team-lifecycle-changed",
      refresh,
    );
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(
        "autoteams:team-lifecycle-changed",
        refresh,
      );
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...teams].sort((a, b) =>
        String(b.createdAt || "").localeCompare(
          String(a.createdAt || ""),
        ),
      ),
    [teams],
  );

  const stats = useMemo(() => {
    const routes = sorted.map(team => routeFor(team, hybridTeamId));

    return {
      total: sorted.length,
      people: routes.filter(route => route === "people").length,
      opportunity: routes.filter(route => route === "opportunity").length,
      hybrid: routes.filter(route => route === "hybrid").length,
    };
  }, [sorted, hybridTeamId]);

  async function openInsights(team: SavedTeam) {
    if (!uid) {
      window.alert("Please sign in before opening Team Insights.");
      return;
    }

    try {
      await persistSavedTeamForInsights(
        team as unknown as Record<string, unknown>,
        uid,
      );

      localStorage.setItem(
        "autoteams-team-insights-selected-team-v7121",
        team.id,
      );

      localStorage.setItem(
        "autoteams-team-insights-direct-team-v715136",
        team.id,
      );

      localStorage.setItem(
        "autoteams-team-insights-selected-profile-v7122",
        insightsProfileType(team.profileType),
      );

      /*
       * Direct navigation from My Teams makes the clicked team authoritative.
       * Team Insights also applies the older Coach context filter, which can
       * otherwise exclude this team when that context points at another group.
       */
      localStorage.removeItem(
        "autoteams-coach-context-object-v7101",
      );

      window.location.href =
        `/gemini-team-coach?teamId=${encodeURIComponent(team.id)}&teamName=${encodeURIComponent(team.name)}&workspaceId=${encodeURIComponent(team.workspaceId || "")}`;
    } catch (error) {
      console.error(
        "[AutoTeams] Could not prepare team for Team Insights",
        error,
      );

      window.alert(
        "TeamScience.ai could not prepare this team for Team Insights. Please try again.",
      );
    }
  }

  function recruitGaps(team: SavedTeam) {
    try {
      localStorage.setItem(MODE_KEY, "hybrid");
      localStorage.setItem(ACTIVE_HYBRID_TEAM_KEY, team.id);
    } catch {}

    window.location.href = "/team-builder#atlas-recruit-gaps";
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>TeamScience.ai Teams</span>
          <h1>My Teams</h1>
          <p>
            One place for the teams you have built, recruited and shaped with
            Atlas.
          </p>
        </div>

        <Link className={styles.createButton} href="/team-builder">
          <span aria-hidden="true">+</span>
          Build a team
        </Link>
      </section>

      <section className={styles.stats}>
        <article>
          <span>All teams</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>My people</span>
          <strong>{stats.people}</strong>
        </article>
        <article>
          <span>Opportunity</span>
          <strong>{stats.opportunity}</strong>
        </article>
        <article>
          <span>Hybrid</span>
          <strong>{stats.hybrid}</strong>
        </article>
      </section>

            <RecruitmentSpotlight />

      {sorted.length === 0 ? (
        <section className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            +
          </div>
          <span className={styles.eyebrow}>No teams yet</span>
          <h2>Build your first team.</h2>
          <p>
            Start with people you know, publish an Opportunity, or let Atlas
            help you identify and recruit the gaps.
          </p>
          <Link className={styles.createButton} href="/team-builder">
            Open Team Builder
          </Link>
        </section>
      ) : (
        <section className={styles.grid}>
          {sorted.map((team, index) => {
            const route = routeFor(team, hybridTeamId);
            const count = memberCount(team);
            const confidence =
              typeof team.confidence === "number"
                ? Math.round(team.confidence)
                : null;
            const gaps = realCapabilityGaps(team);
            const strengths =
              team.recommendation?.teamStrengths?.slice(0, 3) || [];

            return (
              <article
                className={`${styles.card} ${styles[`route${route}`]}`}
                key={team.id}
                data-team-status={String((team as { status?: string }).status || "active").toLowerCase()}
              >
                <div className={styles.topline}>
                  <div className={styles.routeBadge}>
                    <span aria-hidden="true">
                      {route === "people"
                        ? "1"
                        : route === "opportunity"
                          ? "2"
                          : "3"}
                    </span>
                    {routeLabel(route)}
                  </div>

                  <span className={styles.profileBadge}>
                    {profileLabel(team.profileType)}
                  </span>
                </div>

                <div className={styles.teamIcon} aria-hidden="true">
                  {team.name?.charAt(0).toUpperCase() || "T"}
                </div>

                <h2>{team.name}</h2>

                <p className={styles.purpose}>
                  {team.purpose ||
                    team.recommendation?.summary ||
                    "Team objective not recorded."}
                </p>

                <div className={styles.metrics}>
                  <div>
                    <span>Members</span>
                    <strong>{count}</strong>
                  </div>

                  <div>
                    <span>Atlas confidence</span>
                    <strong>
                      {confidence === null ? "—" : `${confidence}%`}
                    </strong>
                  </div>
                </div>

                {confidence !== null && (
                  <div
                    className={styles.confidenceBar}
                    aria-label={`${confidence}% Atlas confidence`}
                  >
                    <span style={{ width: `${Math.min(100, confidence)}%` }} />
                  </div>
                )}

                <div className={styles.atlasBlock}>
                  <span className={styles.atlasLabel}>Atlas view</span>
                  <p>
                    {team.recommendation?.summary ||
                      (strengths.length
                        ? strengths.join(" · ")
                        : "Team saved and ready for further analysis.")}
                  </p>
                </div>

                <div className={styles.signalRow}>
                  {strengths.slice(0, 2).map(item => (
                    <span key={item}>{item}</span>
                  ))}

                  {gaps.length > 0 && (
                    <span className={styles.gapSignal}>
                      {gaps.length} {gaps.length === 1 ? "gap" : "gaps"}
                    </span>
                  )}
                </div>

                                                <AtlasCandidateMatching
                  team={team}
                  onChanged={() =>
                    setTeams(
                      uniqueTeams(
                        readTeams(),
                      ),
                    )
                  }
                />
<TeamLifecycleControl
                  team={team}
                  onChanged={() =>
                    setTeams(
                      uniqueTeams(
                        readTeams(),
                      ),
                    )
                  }
                />
<div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => void openInsights(team)}
                  >
                    Team Insights
                  </button>

                  {gaps.length > 0 || route === "hybrid" ? (
                    <button
                      className={styles.secondaryAction}
                      type="button"
                      onClick={() => recruitGaps(team)}
                    >
                      Recruit gaps
                    </button>
                  ) : (
                    <Link
                      className={styles.secondaryAction}
                      href="/team-builder"
                    >
                      Build another
                    </Link>
                  )}
                </div>

                <small className={styles.created}>
                  {team.createdAt
                    ? `Created ${new Date(team.createdAt).toLocaleDateString()}`
                    : `Team ${index + 1}`}
                </small>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
