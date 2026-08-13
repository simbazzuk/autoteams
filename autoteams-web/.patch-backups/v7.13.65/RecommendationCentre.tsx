"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Workspace,
  WorkspacePerson,
  loadPeople,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./RecommendationCentre.module.css";

type SavedTeam = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  personIds: string[];
  createdAt: string;
  confidence: number;
};

type RecommendationStatus = "draft" | "reviewed" | "published";

type ReviewRecord = {
  teamId: string;
  status: RecommendationStatus;
  reviewedAt?: string;
  publishedAt?: string;
  reviewerNote?: string;
};

type InsightStatus = "positive" | "attention" | "neutral";

type Insight = {
  title: string;
  value: string;
  explanation: string;
  status: InsightStatus;
};

const TEAM_KEY = "autoteams-v20-saved-teams";
const REVIEW_KEY = "autoteams-v20-recommendation-reviews";

export function RecommendationCentre() {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadedTeams = loadSavedTeams();
    setTeams(loadedTeams);
    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setReviews(loadReviews());
    setSelectedId(loadedTeams[0]?.id || "");
    setReady(true);
  }, []);

  const team = teams.find((item) => item.id === selectedId);
  const workspace = workspaces.find(
    (item) => item.id === team?.workspaceId,
  );

  const teamPeople = useMemo(
    () =>
      team
        ? team.personIds
            .map((id) => people.find((person) => person.id === id))
            .filter(
              (person): person is WorkspacePerson => Boolean(person),
            )
        : [],
    [team, people],
  );

  const review =
    reviews.find((item) => item.teamId === selectedId) || {
      teamId: selectedId,
      status: "draft" as const,
    };

  const insights = team ? buildInsights(team, teamPeople) : [];

  function chooseTeam(id: string) {
    setSelectedId(id);
    const existing = reviews.find((item) => item.teamId === id);
    setReviewerNote(existing?.reviewerNote || "");
    setMessage("");
  }

  function markReviewed() {
    if (!team) return;

    const next: ReviewRecord = {
      teamId: team.id,
      status: "reviewed",
      reviewedAt: new Date().toISOString(),
      reviewerNote: reviewerNote.trim(),
    };

    const updated = upsert(reviews, next);
    saveReviews(updated);
    setReviews(updated);
    setMessage("Human review was recorded.");
  }

  function publish() {
    if (!team) return;

    const current =
      reviews.find((item) => item.teamId === team.id) || {
        teamId: team.id,
        status: "draft" as const,
      };

    const next: ReviewRecord = {
      ...current,
      status: "published",
      reviewedAt: current.reviewedAt || new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      reviewerNote: reviewerNote.trim(),
    };

    const updated = upsert(reviews, next);
    saveReviews(updated);
    setReviews(updated);
    setMessage("Recommendation was published.");
  }

  function returnToDraft() {
    if (!team) return;

    const next: ReviewRecord = {
      teamId: team.id,
      status: "draft",
      reviewerNote: reviewerNote.trim(),
    };

    const updated = upsert(reviews, next);
    saveReviews(updated);
    setReviews(updated);
    setMessage("Recommendation returned to draft.");
  }

  if (!ready) {
    return <section className={styles.loading}>Preparing recommendations…</section>;
  }

  if (teams.length === 0) {
    return (
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className="eyebrow">Recommendations</span>
            <h1>No team recommendations are available yet.</h1>
            <p>
              Build and save a team first. AutoTeams will explain the
              evidence and points to consider here.
            </p>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">
            <section className={styles.empty}>
              <ProductIcon label="Build a team" size="lg">▥</ProductIcon>
              <h2>Build your first team.</h2>
              <p>
                Complete the guided Team Builder journey to create the
                first explainable recommendation.
              </p>
              <Link className="button" href="/team-builder">
                Open Team Builder →
              </Link>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Recommendations</span>
            <h1>Understand why this team was recommended.</h1>
            <p>
              Review the evidence, strengths, constraints and confidence
              before publishing the human decision.
            </p>
          </div>

          <aside className={styles.heroCard}>
            <ProductIcon label="Explainable recommendation" size="lg">
              ✦
            </ProductIcon>
            <div>
              <small>Human-controlled AI</small>
              <strong>Recommendation, not decision</strong>
              <p>AutoTeams explains the evidence. A person approves it.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.layout}`}>
          <aside className={styles.teamList}>
            <span className="eyebrow">Saved teams</span>
            <h2>Select a recommendation.</h2>

            <div className={styles.teamCards}>
              {teams.map((item) => {
                const group = workspaces.find(
                  (candidate) => candidate.id === item.workspaceId,
                );
                const itemReview =
                  reviews.find((candidate) => candidate.teamId === item.id) || {
                    teamId: item.id,
                    status: "draft" as const,
                  };

                return (
                  <button
                    className={
                      item.id === selectedId
                        ? `${styles.teamCard} ${styles.activeTeam}`
                        : styles.teamCard
                    }
                    key={item.id}
                    onClick={() => chooseTeam(item.id)}
                    type="button"
                  >
                    <ProductIcon label={item.name} size="sm" subtle>
                      ▥
                    </ProductIcon>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {group?.name || "Unknown group"} · {item.personIds.length} people
                      </small>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <StatusBadge status={itemReview.status} />
                  </button>
                );
              })}
            </div>

            <Link className="button secondary" href="/team-builder">
              Build Another Team
            </Link>
          </aside>

          {team && (
            <section className={styles.detail}>
              {message && <div className={styles.message}>{message}</div>}

              <section className={styles.card}>
                <div className={styles.heading}>
                  <div>
                    <span className="eyebrow">Recommendation</span>
                    <h2>{team.name}</h2>
                    <p>{team.purpose}</p>
                  </div>
                  <StatusBadge status={review.status} />
                </div>

                <div className={styles.metrics}>
                  <Metric label="Confidence" value={`${team.confidence}%`} />
                  <Metric label="People" value={String(teamPeople.length)} />
                  <Metric
                    label="Positive signals"
                    value={String(
                      insights.filter((item) => item.status === "positive").length,
                    )}
                  />
                  <Metric
                    label="Points to review"
                    value={String(
                      insights.filter((item) => item.status === "attention").length,
                    )}
                  />
                </div>

                <div className={styles.groupContext}>
                  <ProductIcon label="Group" size="sm" subtle>◇</ProductIcon>
                  <div>
                    <small>Group</small>
                    <strong>{workspace?.name || "Unknown group"}</strong>
                    <span>
                      {workspace
                        ? workspaceTypeLabel(workspace.type)
                        : "Unknown type"}
                    </span>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.heading}>
                  <div>
                    <span className="eyebrow">Why this team?</span>
                    <h2>Evidence behind the recommendation.</h2>
                    <p>
                      These explanations use locally stored prototype data.
                    </p>
                  </div>
                </div>

                <div className={styles.insightGrid}>
                  {insights.map((insight) => (
                    <article
                      className={`${styles.insight} ${styles[insight.status]}`}
                      key={insight.title}
                    >
                      <header>
                        <span>
                          {insight.status === "positive"
                            ? "✓"
                            : insight.status === "attention"
                              ? "△"
                              : "○"}
                        </span>
                        <small>{insight.title}</small>
                      </header>
                      <strong>{insight.value}</strong>
                      <p>{insight.explanation}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.heading}>
                  <div>
                    <span className="eyebrow">Recommended people</span>
                    <h2>The selected team.</h2>
                    <p>
                      Review role, recorded strengths and profile readiness.
                    </p>
                  </div>
                </div>

                <div className={styles.peopleGrid}>
                  {teamPeople.map((person) => (
                    <article key={person.id}>
                      <span className={styles.avatar}>
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <small>
                          {person.jobTitle} · {person.department}
                        </small>
                        <p>
                          {person.strengths.length
                            ? person.strengths.join(" · ")
                            : "No strengths recorded"}
                        </p>
                      </div>
                      <span
                        className={
                          person.teamDnaStatus === "ready"
                            ? styles.profileReady
                            : styles.profileMissing
                        }
                      >
                        {person.teamDnaStatus === "ready"
                          ? "Profile ready"
                          : "Profile incomplete"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.heading}>
                  <div>
                    <span className="eyebrow">Human review</span>
                    <h2>Record the final decision.</h2>
                    <p>
                      Add a note, mark the recommendation reviewed, then publish.
                    </p>
                  </div>
                </div>

                <label className={styles.reviewNote}>
                  Reviewer note
                  <textarea
                    value={reviewerNote}
                    onChange={(event) => setReviewerNote(event.target.value)}
                    placeholder="Explain the decision, risks or follow-up actions."
                  />
                </label>

                <div className={styles.reviewMeta}>
                  <Metric
                    label="Reviewed"
                    value={
                      review.reviewedAt
                        ? formatDateTime(review.reviewedAt)
                        : "Not yet"
                    }
                  />
                  <Metric
                    label="Published"
                    value={
                      review.publishedAt
                        ? formatDateTime(review.publishedAt)
                        : "Not yet"
                    }
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    className="button secondary"
                    onClick={returnToDraft}
                    type="button"
                  >
                    Return to Draft
                  </button>
                  <button
                    className="button secondary"
                    onClick={markReviewed}
                    type="button"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    className="button"
                    disabled={review.status === "draft"}
                    onClick={publish}
                    type="button"
                  >
                    Publish Recommendation
                  </button>
                  <Link className="button secondary" href="/teams">
                    View Teams
                  </Link>
                </div>
              </section>

              <section className={styles.disclaimer}>
                <ProductIcon label="Important" size="sm" subtle>i</ProductIcon>
                <div>
                  <strong>Prototype recommendation logic</strong>
                  <p>
                    The confidence and explanations use locally stored
                    prototype data and are not production AI model output.
                  </p>
                </div>
              </section>
            </section>
          )}
        </div>
      </section>
    </main>
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

function StatusBadge({ status }: { status: RecommendationStatus }) {
  const text =
    status === "draft"
      ? "Draft"
      : status === "reviewed"
        ? "Human reviewed"
        : "Published";

  return (
    <span className={`${styles.status} ${styles[`status_${status}`]}`}>
      {text}
    </span>
  );
}

function buildInsights(
  team: SavedTeam,
  people: WorkspacePerson[],
): Insight[] {
  const strengths = people.flatMap((person) => person.strengths);
  const uniqueStrengths = new Set(
    strengths.map((strength) => strength.toLowerCase()),
  );
  const departments = new Set(
    people.map((person) => person.department).filter(Boolean),
  );
  const locations = new Set(
    people
      .map((person) => person.location)
      .filter((location) => location && location !== "Not specified"),
  );
  const readyCount = people.filter(
    (person) => person.teamDnaStatus === "ready",
  ).length;
  const profileCoverage =
    people.length === 0
      ? 0
      : Math.round((readyCount / people.length) * 100);
  const evidenceDepth =
    people.length === 0 ? 0 : strengths.length / people.length;

  return [
    {
      title: "Confidence",
      value: `${team.confidence}%`,
      explanation:
        team.confidence >= 80
          ? "The local score indicates a strong overall fit."
          : "The recommendation needs additional human review.",
      status: team.confidence >= 80 ? "positive" : "attention",
    },
    {
      title: "Skills and strengths",
      value: `${uniqueStrengths.size} recorded`,
      explanation:
        uniqueStrengths.size >= 5
          ? "The team contains a broad range of recorded strengths."
          : "The available strength data is limited.",
      status: uniqueStrengths.size >= 5 ? "positive" : "attention",
    },
    {
      title: "Collaboration profiles",
      value: `${profileCoverage}% ready`,
      explanation:
        profileCoverage === 100
          ? "Every selected person has a completed profile."
          : "Some selected people have incomplete profile data.",
      status: profileCoverage === 100 ? "positive" : "attention",
    },
    {
      title: "Team variety",
      value: `${departments.size} areas`,
      explanation:
        departments.size > 1
          ? "The team includes people from multiple areas."
          : "The team is concentrated in one area.",
      status: departments.size > 1 ? "positive" : "neutral",
    },
    {
      title: "Location coverage",
      value: locations.size ? `${locations.size} locations` : "Not recorded",
      explanation:
        locations.size > 1
          ? "The team is distributed across multiple locations."
          : locations.size === 1
            ? "The selected people share one recorded location."
            : "Location information is incomplete.",
      status: locations.size ? "neutral" : "attention",
    },
    {
      title: "Evidence depth",
      value: `${evidenceDepth.toFixed(1)} strengths/person`,
      explanation:
        evidenceDepth >= 2
          ? "There is reasonable recorded evidence for each person."
          : "More profile information would improve explainability.",
      status: evidenceDepth >= 2 ? "positive" : "attention",
    },
  ];
}

function upsert(
  records: ReviewRecord[],
  record: ReviewRecord,
): ReviewRecord[] {
  return records.some((item) => item.teamId === record.teamId)
    ? records.map((item) =>
        item.teamId === record.teamId ? record : item,
      )
    : [...records, record];
}

function loadSavedTeams(): SavedTeam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TEAM_KEY);
    return raw ? (JSON.parse(raw) as SavedTeam[]) : [];
  } catch {
    return [];
  }
}

function loadReviews(): ReviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REVIEW_KEY);
    return raw ? (JSON.parse(raw) as ReviewRecord[]) : [];
  } catch {
    return [];
  }
}

function saveReviews(records: ReviewRecord[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REVIEW_KEY, JSON.stringify(records));
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
