"use client";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useMemo, useState } from "react";
import {
  DemoTeam,
  loadDemoTeams,
} from "@/lib/demo-environment";
import {
  WorkspacePerson,
  loadPeople,
} from "@/lib/workspaces";
import styles from "./TeamDnaOverview.module.css";

type TeamMetric = {
  key: string;
  label: string;
  value: number;
  description: string;
  evidence: string[];
};

// AUTOTEAMS_V71357_AS_STRING_ARRAY
function asStringArray(
  value: unknown,
): string[] {
  return Array.isArray(value)
    ? value.filter(
        (
          item,
        ): item is string =>
          typeof item === "string" &&
          Boolean(item.trim()),
      )
    : [];
}

function asOptionalString(
  value: unknown,
): string | undefined {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

type BuilderSavedTeam = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  personIds: string[];
  createdAt: string;
  confidence: number;
};

const BUILDER_TEAM_KEY =
  "autoteams-v20-saved-teams";

export function TeamDnaOverview() {
  const [teams, setTeams] = useState<DemoTeam[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const demoTeams = loadDemoTeams();

    let builderTeams: DemoTeam[] = [];

    try {
      const raw =
        window.localStorage.getItem(
          BUILDER_TEAM_KEY,
        );

      const saved = raw
        ? (JSON.parse(raw) as BuilderSavedTeam[])
        : [];

      builderTeams = saved.map(
        (team) =>
          ({
            id: team.id,
            workspaceId: team.workspaceId,
            name: team.name,
            purpose: team.purpose,
            memberIds: team.personIds,
            confidence: team.confidence,
            status: "active",
            createdAt: team.createdAt,
          }) as unknown as DemoTeam,
      );
    } catch {
      builderTeams = [];
    }

    const merged = new Map<string, DemoTeam>();

    demoTeams.forEach((team) =>
      merged.set(team.id, team),
    );

    builderTeams.forEach((team) =>
      merged.set(team.id, team),
    );

    const loadedTeams =
      Array.from(merged.values());

    setTeams(loadedTeams);
    setPeople(loadPeople());

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const requestedId =
      params.get("teamId")?.trim() || "";

    const requestedName =
      params.get("teamName")?.trim() || "";

    const byId =
      requestedId
        ? loadedTeams.find(
            (team) =>
              team.id === requestedId,
          )
        : undefined;

    const byName =
      !byId && requestedName
        ? loadedTeams.find(
            (team) =>
              team.name
                .trim()
                .toLowerCase() ===
              requestedName
                .trim()
                .toLowerCase(),
          )
        : undefined;

    setSelectedId(
      byId?.id ||
        byName?.id ||
        loadedTeams[0]?.id ||
        "",
    );
  }, []);

  // AUTOTEAMS_V71357_DIRECT_FIRESTORE
  useEffect(() => {
    let cancelled = false;

    async function loadRequestedTeam() {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      const requestedId =
        params.get("teamId")?.trim() || "";

      if (!requestedId) {
        return;
      }

      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              "teams",
              requestedId,
            ),
          );

        if (
          cancelled ||
          !snapshot.exists()
        ) {
          return;
        }

        const data =
          snapshot.data();

        const ownerId =
          asOptionalString(
            data.ownerId,
          );

        const memberIds =
          asStringArray(
            data.memberIds,
          );

        const personIds =
          asStringArray(
            data.personIds,
          );

        const selectedPeople =
          personIds.length
            ? personIds
            : memberIds.filter(
                (id) =>
                  id !== ownerId,
              );

        const firebaseTeam =
          ({
            id: snapshot.id,
            workspaceId:
              asOptionalString(
                data.workspaceId,
              ) || "",
            name:
              asOptionalString(
                data.name,
              ) ||
              params.get("teamName") ||
              "Saved team",
            purpose:
              asOptionalString(
                data.purpose,
              ) ||
              "Saved AutoTeams team",
            memberIds:
              selectedPeople,
            confidence:
              typeof data.confidence ===
              "number"
                ? data.confidence
                : 85,
            status:
              asOptionalString(
                data.status,
              ) ||
              "active",
            createdAt:
              asOptionalString(
                data.createdAt,
              ) ||
              new Date().toISOString(),
          }) as unknown as DemoTeam;

        setTeams((current) => {
          const merged =
            new Map<string, DemoTeam>();

          current.forEach(
            (team) =>
              merged.set(
                team.id,
                team,
              ),
          );

          merged.set(
            firebaseTeam.id,
            firebaseTeam,
          );

          return Array.from(
            merged.values(),
          );
        });

        setPeople(loadPeople());

        setSelectedId(
          firebaseTeam.id,
        );
      } catch (error) {
        console.warn(
          "[AutoTeams] Team DNA could not load requested Firebase team",
          error,
        );
      }
    }

    void loadRequestedTeam();

    return () => {
      cancelled = true;
    };
  }, []);
  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedId) || null,
    [teams, selectedId],
  );

  const members = useMemo(
    () =>
      selectedTeam
        ? people.filter((person) => selectedTeam.memberIds.includes(person.id))
        : [],
    [people, selectedTeam],
  );

  const metrics = useMemo(
    () => (selectedTeam ? buildMetrics(selectedTeam, members) : []),
    [selectedTeam, members],
  );

  if (!selectedTeam) {
    return (
      <section className={styles.empty}>
        <span>▥</span>
        <h2>No team is available for Team DNA analysis.</h2>
        <p>
          Load a demo dataset or create a team first. Team DNA only exists once
          several people have been combined into a real or proposed team.
        </p>
        <div className="actions">
          <Link className="button" href="/demo">
            Load Demo Data
          </Link>
          <Link className="button secondary" href="/team-builder">
            Build a Team
          </Link>
        </div>
      </section>
    );
  }

  const overall = Math.round(
    metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length,
  );

  const strengths = [...metrics]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const gaps = [...metrics]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);

  return (
    <div className={styles.dashboard}>
      <section className={styles.explainer}>
        <div>
          <span className="eyebrow">Collective, not individual</span>
          <h2>This is the combined DNA of a team.</h2>
          <p>
            Team DNA summarises how the selected members may work together. It
            is created from the mix of members, their available profile signals
            and the recommendation context.
          </p>
        </div>
        <Link className="button secondary" href="/my-atlas-profile">
          View My Atlas Profile
        </Link>
      </section>

      <section className={styles.teamPicker}>
        {teams.map((team) => (
          <button
            className={team.id === selectedId ? styles.active : ""}
            key={team.id}
            onClick={() => setSelectedId(team.id)}
            type="button"
          >
            <span>▥</span>
            <div>
              <strong>{team.name}</strong>
              <small>{team.memberIds.length} members · {team.status}</small>
            </div>
          </button>
        ))}
      </section>

      <section className={styles.overview}>
        <div>
          <span className="eyebrow">Selected team</span>
          <h2>{selectedTeam.name}</h2>
          <p>{selectedTeam.purpose}</p>

          <div className={styles.memberChips}>
            {members.map((person) => (
              <span key={person.id}>{person.name}</span>
            ))}
          </div>
        </div>

        <div className={styles.score}>
          <strong>{overall}%</strong>
          <span>Overall Team DNA</span>
          <small>{balanceLabel(overall)}</small>
        </div>
      </section>

      <section className={styles.metrics}>
        {metrics.map((metric) => (
          <article key={metric.key}>
            <div>
              <strong>{metric.label}</strong>
              <span>{metric.value}%</span>
            </div>
            <p>{metric.description}</p>
            <div className={styles.bar}>
              <i style={{ width: `${metric.value}%` }} />
            </div>

            <details className={styles.explanation}>
              <summary>Why this score?</summary>
              <div className={styles.explanationBody}>
                {metric.evidence.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </details>
          </article>
        ))}
      </section>

      <section className={styles.twoColumns}>
        <article className={styles.panel}>
          <span className="eyebrow">Collective strengths</span>
          <h2>Where this team appears strongest.</h2>
          <div className={styles.insightList}>
            {strengths.map((item, index) => (
              <div key={item.key}>
                <span>{index + 1}</span>
                <p>
                  <strong>{item.label}</strong> is currently the strongest
                  collective signal at {item.value}%.
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <span className="eyebrow">Potential gaps</span>
          <h2>Areas worth reviewing.</h2>
          <div className={styles.insightList}>
            {gaps.map((item, index) => (
              <div key={item.key}>
                <span>{index + 1}</span>
                <p>
                  <strong>{item.label}</strong> is the lowest current signal at
                  {item.value}%. Consider whether the team needs more coverage.
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.guidance}>
        <div>
          <span className="eyebrow">Atlas guidance</span>
          <h2>{guidanceTitle(overall)}</h2>
          <p>{guidanceText(overall, gaps)}</p>
        </div>
        <div className="actions">
          <Link className="button" href="/matches">
            Review Recommendations
          </Link>
          <Link className="button secondary" href="/team-builder">
            Adjust Team
          </Link>
        </div>
      </section>

      <small className={styles.prototypeNote}>
        Prototype note: this view uses the locally available team and profile
        data. Production Team DNA should be calculated by the governed Atlas
        scoring service and should retain an audit trail.
      </small>
    </div>
  );
}

function buildMetrics(
  team: DemoTeam,
  members: WorkspacePerson[],
): TeamMetric[] {
  // v7.13.58:
  // Team DNA is calculated from the actual selected members rather than
  // generic presentation-only values.
  const clamp = (
    value: number,
    minimum = 0,
    maximum = 100,
  ) =>
    Math.max(
      minimum,
      Math.min(
        maximum,
        Math.round(value),
      ),
    );

  const total =
    Math.max(
      members.length,
      1,
    );

  const activeMembers =
    members.filter(
      (person) =>
        person.status === "active",
    );

  const readyMembers =
    activeMembers.filter(
      (person) =>
        person.teamDnaStatus ===
        "ready",
    );

  const readyCoverage =
    activeMembers.length
      ? readyMembers.length /
        activeMembers.length
      : 0;

  const uniqueRatio = (
    values: Array<
      string | undefined
    >,
  ) => {
    if (!activeMembers.length) {
      return 0;
    }

    const unique =
      new Set(
        values
          .map((value) =>
            (value ?? "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      ).size;

    return Math.min(
      unique /
        activeMembers.length,
      1,
    );
  };

  const departmentDiversity =
    uniqueRatio(
      activeMembers.map(
        (person) =>
          person.department,
      ),
    );

  const roleDiversity =
    uniqueRatio(
      activeMembers.map(
        (person) =>
          person.jobTitle,
      ),
    );

  const locationDiversity =
    uniqueRatio(
      activeMembers.map(
        (person) =>
          person.location,
      ),
    );

  const normalisedStrengths =
    activeMembers.map(
      (person) =>
        person.strengths.map(
          (strength) =>
            strength
              .trim()
              .toLowerCase(),
        ),
    );

  const coverageFor = (
    signals: string[],
  ) => {
    if (!activeMembers.length) {
      return 0;
    }

    const matchingMembers =
      normalisedStrengths.filter(
        (strengths) =>
          strengths.some(
            (strength) =>
              signals.some(
                (signal) =>
                  strength.includes(
                    signal,
                  ),
              ),
          ),
      ).length;

    return (
      matchingMembers /
      activeMembers.length
    );
  };

  const breadthFor = (
    signals: string[],
  ) => {
    const matchedSignals =
      new Set<string>();

    normalisedStrengths
      .flat()
      .forEach((strength) => {
        signals.forEach(
          (signal) => {
            if (
              strength.includes(
                signal,
              )
            ) {
              matchedSignals.add(
                signal,
              );
            }
          },
        );
      });

    return signals.length
      ? matchedSignals.size /
          signals.length
      : 0;
  };

  // AUTOTEAMS_V71359_EXPLAINABILITY
  const matchingMemberCount = (
    signals: string[],
  ) =>
    normalisedStrengths.filter(
      (strengths) =>
        strengths.some(
          (strength) =>
            signals.some(
              (signal) =>
                strength.includes(
                  signal,
                ),
            ),
        ),
    ).length;

  const strengthExamples = (
    signals: string[],
  ) => {
    const matches =
      new Set<string>();

    activeMembers.forEach(
      (person) => {
        person.strengths.forEach(
          (strength) => {
            const normalised =
              strength
                .trim()
                .toLowerCase();

            if (
              signals.some(
                (signal) =>
                  normalised.includes(
                    signal,
                  ),
              )
            ) {
              matches.add(
                strength.trim(),
              );
            }
          },
        );
      },
    );

    return Array.from(matches)
      .slice(0, 4);
  };

  const evidenceFor = (
    label: string,
    signals: string[],
  ) => {
    const matching =
      matchingMemberCount(
        signals,
      );

    const examples =
      strengthExamples(
        signals,
      );

    return [
      `${matching} of ${activeMembers.length} active members show ${label.toLowerCase()} signals.`,
      `${readyMembers.length} of ${activeMembers.length} active members have Team DNA-ready profiles.`,
      examples.length
        ? `Evidence includes ${examples.join(", ")}.`
        : `No strong ${label.toLowerCase()} keyword evidence is currently present in member strengths.`,
    ];
  };
  const scoreSignal = (
    signals: string[],
    diversityWeight = 0,
  ) => {
    if (!activeMembers.length) {
      return 0;
    }

    const memberCoverage =
      coverageFor(signals);

    const signalBreadth =
      breadthFor(signals);

    const diversity =
      (
        departmentDiversity +
        roleDiversity
      ) /
      2;

    return clamp(
      42 +
        memberCoverage * 34 +
        signalBreadth * 10 +
        readyCoverage * 9 +
        diversity *
          diversityWeight,
      45,
      96,
    );
  };

  const communicationSignals = [
    "communication",
    "present",
    "writing",
    "listening",
    "stakeholder",
    "outreach",
    "conversation",
  ];

  const communication =
    scoreSignal(
      communicationSignals,
      5,
    );

  const leadershipSignals = [
    "leadership",
    "mentor",
    "facilitation",
    "initiative",
    "ownership",
    "strategy",
    "coordination",
  ];

  const leadership =
    scoreSignal(
      leadershipSignals,
      6,
    );

  const deliverySignals = [
    "delivery",
    "planning",
    "organisation",
    "reliability",
    "logistics",
    "execution",
    "project",
    "operations",
  ];

  const delivery =
    scoreSignal(
      deliverySignals,
      5,
    );

  const innovationSignals = [
    "creativity",
    "design",
    "ai",
    "problem solving",
    "analysis",
    "research",
    "prototype",
    "strategy",
  ];

  const innovation =
    scoreSignal(
      innovationSignals,
      5,
    );

  const collaborationSignals = [
    "collaboration",
    "teamwork",
    "empathy",
    "support",
    "facilitation",
    "community",
    "communication",
    "adaptability",
  ];

  const collaboration =
    scoreSignal(
      collaborationSignals,
      7,
    );

  const roleBalance =
    activeMembers.length
      ? clamp(
          48 +
            departmentDiversity *
              20 +
            roleDiversity * 20 +
            locationDiversity *
              4 +
            readyCoverage * 4,
          50,
          96,
        )
      : 0;

  return [
    {
      key: "communication",
      label: "Communication",
      value: communication,
      description:
        "How effectively the combined profile may share information and decisions.",
      evidence:
        evidenceFor(
          "Communication",
          communicationSignals,
        ),
    },
    {
      key: "leadership",
      label: "Leadership",
      value: leadership,
      description:
        "The mix of direction, ownership and support available across the team.",
      evidence:
        evidenceFor(
          "Leadership",
          leadershipSignals,
        ),
    },
    {
      key: "delivery",
      label: "Delivery",
      value: delivery,
      description:
        "The team's collective readiness, reliability and ability to follow through.",
      evidence:
        evidenceFor(
          "Delivery",
          deliverySignals,
        ),
    },
    {
      key: "innovation",
      label: "Innovation",
      value: innovation,
      description:
        "The variety of skills and perspectives available for problem solving.",
      evidence:
        evidenceFor(
          "Innovation",
          innovationSignals,
        ),
    },
    {
      key: "collaboration",
      label: "Collaboration",
      value: collaboration,
      description:
        "The extent to which member profiles are ready and complementary.",
      evidence:
        evidenceFor(
          "Collaboration",
          collaborationSignals,
        ),
    },
    {
      key: "role-balance",
      label: "Role balance",
      value: roleBalance,
      description:
        "The spread of departments, roles and strengths represented in the team.",
      evidence: [
        `${new Set(activeMembers.map((person) => person.department).filter(Boolean)).size} departments are represented across ${activeMembers.length} active members.`,
        `${new Set(activeMembers.map((person) => person.jobTitle).filter(Boolean)).size} distinct roles are represented.`,
        `${readyMembers.length} of ${activeMembers.length} active members have Team DNA-ready profiles.`,
      ],
    },
  ];
}

function clamp(value: number): number {
  return Math.max(40, Math.min(98, value));
}

function balanceLabel(score: number): string {
  if (score >= 88) return "Strong balance";
  if (score >= 75) return "Promising balance";
  if (score >= 60) return "Review recommended";
  return "Significant gaps";
}

function guidanceTitle(score: number): string {
  if (score >= 88) return "This team has a strong overall balance.";
  if (score >= 75) return "This team is promising, with a few areas to review.";
  return "Review the team mix before confirming it.";
}

function guidanceText(score: number, gaps: TeamMetric[]): string {
  const gapNames = gaps.map((gap) => gap.label.toLowerCase()).join(" and ");
  if (score >= 88) {
    return `Atlas sees strong collective coverage. Continue to review ${gapNames}, which remain the lowest relative signals.`;
  }
  return `The team may benefit from additional ${gapNames} coverage. Review candidate alternatives before making the final decision.`;
}
