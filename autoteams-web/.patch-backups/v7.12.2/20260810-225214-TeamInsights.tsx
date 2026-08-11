"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./TeamInsights.module.css";

type RecordLike = Record<string, unknown>;

type CoachContext = {
  contextId?: string;
  contextName?: string;
  contextType?: string;
  peopleCount?: number;
  teamCount?: number;
};

type TeamOption = {
  id: string;
  name: string;
  contextId?: string;
  contextName?: string;
  profileType?: string;
  memberCount?: number;
};

const CONTEXT_KEY = "autoteams-coach-context-object-v7101";
const TEAM_KEY = "autoteams-team-insights-selected-team-v7121";

const DIMENSIONS = [
  ["Leadership", 72],
  ["Collaboration", 84],
  ["Analysis", 63],
  ["Delivery", 81],
  ["Creativity", 70],
  ["Communication", 78],
] as const;

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normaliseProfile(value?: string) {
  const raw = (value ?? "").toLowerCase().trim();
  if (["business", "work", "professional"].includes(raw)) return "Work";
  if (["sports", "sport"].includes(raw)) return "Sport";
  if (["friendship", "personal", "friends", "friends & family"].includes(raw))
    return "Friendship";
  if (raw === "community") return "Community";
  if (raw === "education") return "Education";
  return value?.trim() || "Relevant profile";
}

function looksLikeTeam(value: RecordLike) {
  const name = text(value.name ?? value.teamName ?? value.title ?? value.label);
  if (!name) return false;

  const personSignals = [
    "email",
    "displayName",
    "firstName",
    "lastName",
    "jobTitle",
    "profileReady",
    "teamDnaStatus",
  ];
  if (personSignals.some((key) => key in value)) return false;

  const explicitTeamSignals = [
    "teamId",
    "teamName",
    "teamType",
    "savedTeamId",
    "recommendationId",
  ];
  if (explicitTeamSignals.some((key) => key in value)) return true;

  const collections = [
    value.members,
    value.people,
    value.memberIds,
    value.personIds,
    value.players,
  ];

  return collections.some(Array.isArray);
}

function teamFromRecord(value: RecordLike, fallbackIndex: number): TeamOption | null {
  if (!looksLikeTeam(value)) return null;

  const name = text(value.name ?? value.teamName ?? value.title ?? value.label);
  if (!name) return null;

  const id =
    text(value.teamId ?? value.savedTeamId ?? value.id) ??
    `${name.toLowerCase().replace(/\W+/g, "-")}-${fallbackIndex}`;

  const members =
    value.members ??
    value.people ??
    value.memberIds ??
    value.personIds ??
    value.players;

  return {
    id,
    name,
    contextId: text(
      value.contextId ??
        value.workspaceId ??
        value.groupId ??
        value.organisationId ??
        value.organizationId,
    ),
    contextName: text(
      value.contextName ??
        value.workspaceName ??
        value.groupName ??
        value.organisationName ??
        value.organizationName,
    ),
    profileType: text(
      value.profileType ??
        value.contextType ??
        value.teamType ??
        value.workspaceType ??
        value.groupType,
    ),
    memberCount:
      Array.isArray(members)
        ? members.length
        : number(value.memberCount ?? value.peopleCount ?? value.playerCount),
  };
}

function flatten(value: unknown): RecordLike[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];

  const nested = [
    value.teams,
    value.savedTeams,
    value.recommendedTeams,
    value.items,
    value.results,
  ];

  for (const candidate of nested) {
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
  }

  return [value];
}

function discoverTeams(): TeamOption[] {
  const found: TeamOption[] = [];

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !/team|workspace|group|organisation|organization/i.test(key))
        continue;

      if (key === CONTEXT_KEY || key === TEAM_KEY) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }

      flatten(parsed).forEach((item, index) => {
        const team = teamFromRecord(item, index);
        if (team) found.push(team);
      });
    }
  } catch {}

  const unique = new Map<string, TeamOption>();
  found.forEach((team) => {
    const key = `${team.id}:${team.name}`;
    if (!unique.has(key)) unique.set(key, team);
  });

  return [...unique.values()];
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function TeamInsights() {
  const [context, setContext] = useState<CoachContext>({});
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    function load() {
      try {
        const rawContext = localStorage.getItem(CONTEXT_KEY);
        const nextContext: CoachContext = rawContext ? JSON.parse(rawContext) : {};
        const discovered = discoverTeams();

        setContext(nextContext);
        setTeams(discovered);

        const persisted = localStorage.getItem(TEAM_KEY) ?? "";
        const persistedValid = discovered.some((team) => team.id === persisted);

        if (persistedValid) {
          setSelectedId(persisted);
          return;
        }

        const contextual = discovered.filter(
          (team) =>
            !nextContext.contextId ||
            !team.contextId ||
            team.contextId === nextContext.contextId,
        );

        // UX rule: auto-select only when there is exactly one unambiguous team.
        if (contextual.length === 1) {
          setSelectedId(contextual[0].id);
          localStorage.setItem(TEAM_KEY, contextual[0].id);
        } else {
          setSelectedId("");
          localStorage.removeItem(TEAM_KEY);
        }
      } catch {
        setContext({});
        setTeams([]);
        setSelectedId("");
      }
    }

    load();
    window.addEventListener("autoteams:coach-context-changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("autoteams:coach-context-changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const contextualTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          !context.contextId ||
          !team.contextId ||
          team.contextId === context.contextId,
      ),
    [teams, context.contextId],
  );

  const selectedTeam = useMemo(
    () => contextualTeams.find((team) => team.id === selectedId),
    [contextualTeams, selectedId],
  );

  function chooseTeam(id: string) {
    setSelectedId(id);
    try {
      if (id) localStorage.setItem(TEAM_KEY, id);
      else localStorage.removeItem(TEAM_KEY);
    } catch {}
  }

  const people = selectedTeam?.memberCount ?? 0;

  const metrics = useMemo(() => {
    if (!selectedTeam) return null;

    const coverage = people > 0 ? clamp(68 + Math.min(people, 10) * 2) : 68;
    const balance = clamp(76 + Math.min(Math.max(people, 1), 8));
    const collaboration = 84;
    const skills = 68;
    const health = Math.round(
      (coverage + balance + collaboration + skills) / 4,
    );

    return { health, balance, coverage, skills, collaboration };
  }, [selectedTeam, people]);

  return (
    <main className={styles.page} data-autoteams-team-insights="v7.12.1">
      <div className={`container ${styles.container}`}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>TEAM INSIGHTS</span>
            <h1>Understand your team.</h1>
            <p>
              Select a team to see its health, Team DNA, strengths, gaps and
              Atlas recommendations.
            </p>
          </div>
          <div className={styles.atlasBadge}>✦ Powered by Atlas</div>
        </section>

        <section className={`${styles.context} ${styles.selectorPanel}`}>
          <div className={styles.selectorIntro}>
            <span>ANALYSE A TEAM</span>
            <h2>{selectedTeam?.name ?? "Choose a team"}</h2>
            <p>
              {selectedTeam
                ? `${normaliseProfile(
                    selectedTeam.profileType ?? context.contextType,
                  )} profile · ${
                    selectedTeam.contextName ??
                    context.contextName ??
                    "Current group"
                  } · ${selectedTeam.memberCount ?? "—"} people`
                : contextualTeams.length
                  ? "Choose which team Atlas should analyse."
                  : "You do not currently have a team available for analysis."}
            </p>
          </div>

          {contextualTeams.length > 0 ? (
            <label className={styles.teamSelect}>
              <span>Team</span>
              <select
                value={selectedId}
                onChange={(event) => chooseTeam(event.target.value)}
              >
                {contextualTeams.length > 1 && (
                  <option value="">Select a team…</option>
                )}
                {contextualTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Link className={styles.primaryAction} href="/team-builder">
              Create a Team →
            </Link>
          )}
        </section>

        {!selectedTeam ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <div>
              <span>NO ANALYSIS YET</span>
              <h2>
                {contextualTeams.length
                  ? "Select a team to generate insights."
                  : "Build your first team to unlock Team Insights."}
              </h2>
              <p>
                Team scores are hidden until a team is selected so that zero
                values are never mistaken for an Atlas assessment.
              </p>
            </div>
            <Link href={contextualTeams.length ? "/teams" : "/team-builder"}>
              {contextualTeams.length ? "View my teams →" : "Build a Team →"}
            </Link>
          </section>
        ) : (
          <>
            <section className={styles.metricGrid}>
              <Metric label="Team Health" value={metrics!.health} suffix="/100" />
              <Metric label="Team Balance" value={metrics!.balance} suffix="%" />
              <Metric
                label="Profile Coverage"
                value={metrics!.coverage}
                suffix="%"
              />
              <Metric label="Skills Coverage" value={metrics!.skills} suffix="%" />
              <Metric
                label="Collaboration"
                value={metrics!.collaboration}
                suffix="%"
              />
              <Metric
                label="Atlas Confidence"
                text={metrics!.coverage >= 80 ? "High" : "Medium"}
              />
            </section>

            <div className={styles.twoColumn}>
              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div>
                    <span>TEAM DNA</span>
                    <h2>How {selectedTeam.name} is balanced</h2>
                  </div>
                  <Link href="/team-dna">View Team DNA →</Link>
                </div>
                <div className={styles.dna}>
                  {DIMENSIONS.map(([label, value]) => (
                    <div className={styles.dnaRow} key={label}>
                      <div>
                        <strong>{label}</strong>
                        <span>{value}%</span>
                      </div>
                      <div className={styles.track}>
                        <i style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div>
                    <span>STRENGTHS & GAPS</span>
                    <h2>What stands out</h2>
                  </div>
                </div>
                <div className={styles.signalGroup}>
                  <Signal
                    kind="strength"
                    title="Strong collaboration"
                    text="The selected team shows a healthy mix of collaborative working styles."
                  />
                  <Signal
                    kind="strength"
                    title="Good delivery coverage"
                    text="Delivery capability is well represented across this team."
                  />
                  <Signal
                    kind="gap"
                    title="Analytical depth"
                    text="Analytical capability appears less represented than delivery and collaboration."
                  />
                  <Signal
                    kind="gap"
                    title="Profile completeness"
                    text="Completing relevant Atlas profiles will improve recommendation confidence."
                  />
                </div>
              </section>
            </div>

            <section className={styles.recommendations}>
              <div className={styles.cardHeading}>
                <div>
                  <span>ATLAS RECOMMENDATIONS</span>
                  <h2>What should you improve next?</h2>
                  <p>
                    Actions for {selectedTeam.name}, based on its current team
                    signals.
                  </p>
                </div>
              </div>
              <div className={styles.recommendationList}>
                <Recommendation
                  priority="High priority"
                  title="Strengthen analytical coverage"
                  text="The team appears stronger in collaboration and delivery than analysis."
                  href="/team-builder"
                  action="Adjust team"
                />
                <Recommendation
                  priority="Medium priority"
                  title="Build leadership depth"
                  text="Avoid concentrating coordination and leadership responsibility in too few people."
                  href="/team-dna"
                  action="Review Team DNA"
                />
                <Recommendation
                  priority="Data quality"
                  title="Complete relevant Atlas profiles"
                  text="More complete profiles improve Atlas confidence and make recommendations more useful."
                  href="/profile"
                  action="Review profiles"
                />
              </div>
            </section>

            <section className={styles.askAtlas}>
              <div>
                <span>ASK ATLAS</span>
                <h2>Explore {selectedTeam.name} further.</h2>
                <p>
                  Ask why a recommendation was made or explore how a change
                  could affect this team.
                </p>
              </div>
              <Link href="/atlas">Ask Atlas about this team →</Link>
            </section>

            <p className={styles.disclaimer}>
              v7.12.1 adds team selection and team-scoped presentation
              indicators. Authoritative Atlas/Firebase scoring remains the next
              data-integration step.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
  text: displayText,
}: {
  label: string;
  value?: number;
  suffix?: string;
  text?: string;
}) {
  return (
    <article className={styles.metric}>
      <span>{label}</span>
      <strong>
        {displayText ?? (
          <>
            {value ?? 0}
            <small>{suffix}</small>
          </>
        )}
      </strong>
    </article>
  );
}

function Signal({
  kind,
  title,
  text: description,
}: {
  kind: "strength" | "gap";
  title: string;
  text: string;
}) {
  return (
    <div className={styles.signal}>
      <div className={kind === "strength" ? styles.good : styles.warn}>
        {kind === "strength" ? "✓" : "!"}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Recommendation({
  priority,
  title,
  text: description,
  href,
  action,
}: {
  priority: string;
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <article className={styles.recommendation}>
      <div>
        <span>{priority}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link href={href}>{action} →</Link>
    </article>
  );
}
