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
  const base = Math.max(55, Math.min(96, team.confidence));
  const activeMembers = members.filter((person) => person.status === "active").length;
  const readyMembers = members.filter((person) => person.teamDnaStatus === "ready").length;
  const departments = new Set(members.map((person) => person.department)).size;
  const strengths = new Set(members.flatMap((person) => person.strengths)).size;

  const readiness =
    members.length > 0 ? Math.round((readyMembers / members.length) * 100) : 0;
  const availability =
    members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;
  const diversity = Math.min(96, 58 + departments * 8);
  const capability = Math.min(96, 56 + strengths * 3);

  return [
    {
      key: "communication",
      label: "Communication",
      value: clamp(base - 3),
      description: "How effectively the combined profile may share information and decisions.",
    },
    {
      key: "leadership",
      label: "Leadership",
      value: clamp(base - 7 + departments * 2),
      description: "The mix of direction, ownership and support available across the team.",
    },
    {
      key: "delivery",
      label: "Delivery",
      value: clamp(Math.round((base + availability) / 2)),
      description: "The team's collective readiness, reliability and ability to follow through.",
    },
    {
      key: "innovation",
      label: "Innovation",
      value: clamp(Math.round((base + capability) / 2)),
      description: "The variety of skills and perspectives available for problem solving.",
    },
    {
      key: "collaboration",
      label: "Collaboration",
      value: clamp(Math.round((base + readiness) / 2)),
      description: "The extent to which member profiles are ready and complementary.",
    },
    {
      key: "balance",
      label: "Role balance",
      value: clamp(Math.round((diversity + capability) / 2)),
      description: "The spread of departments, roles and strengths represented in the team.",
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
