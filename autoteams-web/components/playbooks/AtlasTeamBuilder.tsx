"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./AtlasTeamBuilder.module.css";

type ScenarioId =
  | "business"
  | "community"
  | "sports"
  | "education"
  | "friendship";

type Scenario = {
  id: ScenarioId;
  icon: string;
  label: string;
  title: string;
  summary: string;
  bestFor: string;
  duration: string;
  example: string;
  route: string;
  outputs: string[];
  signals: string[];
};

type RecentBuild = {
  id: string;
  scenario: ScenarioId;
  name: string;
  detail: string;
  updated: string;
};

const scenarios: Scenario[] = [
  {
    id: "business",
    icon: "⌂",
    label: "Business",
    title: "Build a Business Team",
    summary:
      "Create a balanced delivery team for a project, programme or operational outcome.",
    bestFor: "Team Leaders and Delivery Managers",
    duration: "10–15 minutes",
    example: "Five-person cloud migration team",
    route: "/team-builder?scenario=business",
    outputs: [
      "Ranked candidates",
      "Explainable recommendations",
      "Skills coverage",
      "Team DNA summary",
      "Confidence score",
    ],
    signals: [
      "Required skills",
      "Availability",
      "Location",
      "Leadership",
      "Communication",
      "Planning",
    ],
  },
  {
    id: "community",
    icon: "♙",
    label: "Community",
    title: "Organise Community Volunteers",
    summary:
      "Build a dependable volunteer group around an event, service or local initiative.",
    bestFor: "Volunteer Coordinators",
    duration: "8–12 minutes",
    example: "Community food-bank event",
    route: "/team-builder?scenario=community",
    outputs: [
      "Volunteer shortlist",
      "Availability fit",
      "Role coverage",
      "Community profile balance",
      "Participation risks",
    ],
    signals: [
      "Availability",
      "Reliability",
      "Community interests",
      "Communication",
      "Location",
      "Experience",
    ],
  },
  {
    id: "sports",
    icon: "◎",
    label: "Sports",
    title: "Build a Sports Squad",
    summary:
      "Select a squad or activity group with the right roles, availability and team balance.",
    bestFor: "Captains and Coaches",
    duration: "8–10 minutes",
    example: "Weekend tournament squad",
    route: "/team-builder?scenario=sports",
    outputs: [
      "Suggested squad",
      "Role coverage",
      "Availability view",
      "Sports profile balance",
      "Potential gaps",
    ],
    signals: [
      "Playing roles",
      "Availability",
      "Experience",
      "Leadership",
      "Adaptability",
      "Team support",
    ],
  },
  {
    id: "education",
    icon: "▤",
    label: "Education",
    title: "Create an Education Team",
    summary:
      "Form a study, project or learning group with complementary strengths and working styles.",
    bestFor: "Students, Tutors and Programme Leads",
    duration: "8–12 minutes",
    example: "University group assignment",
    route: "/team-builder?scenario=education",
    outputs: [
      "Recommended study group",
      "Learning-style balance",
      "Skill coverage",
      "Collaboration guidance",
      "Confidence score",
    ],
    signals: [
      "Subject skills",
      "Learning preferences",
      "Availability",
      "Communication",
      "Planning",
      "Support style",
    ],
  },
  {
    id: "friendship",
    icon: "♡",
    label: "Friendship",
    title: "Create a Friendship Group",
    summary:
      "Bring together people for an activity, trip or shared interest using relevant preferences.",
    bestFor: "Group Organisers",
    duration: "5–8 minutes",
    example: "Weekend walking group",
    route: "/team-builder?scenario=friendship",
    outputs: [
      "Suggested group",
      "Shared-interest fit",
      "Availability match",
      "Location fit",
      "Group balance",
    ],
    signals: [
      "Interests",
      "Availability",
      "Location",
      "Activity preferences",
      "Group size",
      "Social style",
    ],
  },
];

const recentFallback: RecentBuild[] = [
  {
    id: "recent-1",
    scenario: "business",
    name: "Cloud Migration Team",
    detail: "5 people · 88% confidence",
    updated: "Yesterday",
  },
  {
    id: "recent-2",
    scenario: "community",
    name: "Community Event Volunteers",
    detail: "8 people · availability confirmed",
    updated: "2 days ago",
  },
  {
    id: "recent-3",
    scenario: "sports",
    name: "Weekend Tournament Squad",
    detail: "11 people · roles balanced",
    updated: "Last week",
  },
];

const RECENT_KEY = "autoteams-v181-recent-team-builds";

export function AtlasTeamBuilder() {
  const [activeId, setActiveId] = useState<ScenarioId>("business");
  const [recent, setRecent] = useState<RecentBuild[]>([]);
  const [showSignals, setShowSignals] = useState(false);

  useEffect(() => {
    setRecent(loadRecentBuilds());
  }, []);

  const active = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeId) || scenarios[0],
    [activeId],
  );

  function loadSampleData() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "autoteams-demo-selected-scenario",
        active.id,
      );
      window.localStorage.setItem(
        "autoteams-demo-team-requirement",
        active.example,
      );
    }

    window.location.href = active.route;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Atlas Team Builder</span>
            <h1>What would you like Atlas to help you build?</h1>
            <p>
              Choose a team-building scenario, understand what you will receive
              and follow one guided journey from requirement to recommendation.
            </p>
          </div>

          <aside className={styles.heroCard}>
            <span className={styles.orb}>✦</span>
            <div>
              <small>Guided by Atlas</small>
              <strong>One clear workflow</strong>
              <p>
                Select a scenario, define the requirement, review the evidence
                and make the final decision.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.scenarioSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Choose a scenario</span>
                <h2>Start with the outcome you need.</h2>
                <p>
                  You can change the details later. The scenario simply gives
                  Atlas the right starting point and profile context.
                </p>
              </div>
            </div>

            <div className={styles.scenarioGrid}>
              {scenarios.map((scenario) => (
                <button
                  className={
                    scenario.id === activeId
                      ? `${styles.scenarioCard} ${styles.activeScenario}`
                      : styles.scenarioCard
                  }
                  key={scenario.id}
                  onClick={() => {
                    setActiveId(scenario.id);
                    setShowSignals(false);
                  }}
                  type="button"
                >
                  <span className={styles.iconBox}>{scenario.icon}</span>
                  <strong>{scenario.label}</strong>
                  <p>{scenario.summary}</p>
                  <small>{scenario.duration}</small>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.focusPanel}>
            <div className={styles.focusMain}>
              <div className={styles.focusHeader}>
                <span className={styles.largeIcon}>{active.icon}</span>
                <div>
                  <span className="eyebrow">{active.label} scenario</span>
                  <h2>{active.title}</h2>
                  <p>{active.summary}</p>
                </div>
              </div>

              <div className={styles.storyCard}>
                <span>Example request</span>
                <strong>{active.example}</strong>
              </div>

              <div className={styles.facts}>
                <article>
                  <small>Best for</small>
                  <strong>{active.bestFor}</strong>
                </article>
                <article>
                  <small>Estimated time</small>
                  <strong>{active.duration}</strong>
                </article>
                <article>
                  <small>Decision model</small>
                  <strong>Human reviewed</strong>
                </article>
              </div>

              <div className={styles.primaryActions}>
                <button className="button" onClick={loadSampleData} type="button">
                  Start Building →
                </button>
                <button
                  className="button secondary"
                  onClick={() => setShowSignals((value) => !value)}
                  type="button"
                >
                  {showSignals ? "Hide Evaluation Signals" : "See What Atlas Evaluates"}
                </button>
              </div>

              {showSignals && (
                <div className={styles.signalPanel}>
                  <div>
                    <span className="eyebrow">Atlas evaluates</span>
                    <h3>Signals relevant to this scenario.</h3>
                    <p>
                      These inputs support a recommendation. They do not replace
                      human judgement or approval.
                    </p>
                  </div>
                  <div className={styles.signalGrid}>
                    {active.signals.map((signal) => (
                      <span key={signal}>✓ {signal}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className={styles.outputs}>
              <span className="eyebrow">You will receive</span>
              <h3>A decision-ready team recommendation.</h3>
              <div>
                {active.outputs.map((output) => (
                  <article key={output}>
                    <span>✓</span>
                    <strong>{output}</strong>
                  </article>
                ))}
              </div>
              <p>
                Atlas explains the evidence, constraints and confidence behind
                the recommendation so the final decision remains reviewable.
              </p>
            </aside>
          </section>

          <section className={styles.journey}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">How it works</span>
                <h2>One journey from requirement to team.</h2>
              </div>
            </div>

            <div className={styles.steps}>
              <Step
                number="01"
                title="Define the need"
                text="Confirm the goal, team size, skills, location and availability."
              />
              <Step
                number="02"
                title="Select the population"
                text="Choose the workspace and Talent Pool Atlas is allowed to consider."
              />
              <Step
                number="03"
                title="Review recommendations"
                text="Understand ranking, confidence, strengths and points to consider."
              />
              <Step
                number="04"
                title="Confirm the team"
                text="Compare, adjust and save the final human-reviewed decision."
              />
            </div>
          </section>

          <section className={styles.recentSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Recent activity</span>
                <h2>Continue a recent team build.</h2>
              </div>
              <Link href="/teams">View all teams →</Link>
            </div>

            <div className={styles.recentGrid}>
              {recent.map((build) => {
                const scenario =
                  scenarios.find((item) => item.id === build.scenario) ||
                  scenarios[0];

                return (
                  <Link href="/teams" key={build.id}>
                    <span className={styles.iconBox}>{scenario.icon}</span>
                    <div>
                      <strong>{build.name}</strong>
                      <small>{build.detail}</small>
                    </div>
                    <em>{build.updated}</em>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={styles.help}>
            <div>
              <span className="eyebrow">Not sure where to start?</span>
              <h2>Learn the complete AutoTeams journey first.</h2>
              <p>
                The Learning Centre explains profiles, workspaces, Talent Pools,
                Atlas recommendations and Team DNA in the order users encounter
                them.
              </p>
            </div>
            <Link className="button secondary" href="/learning-centre">
              Open Learning Centre
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article>
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function loadRecentBuilds(): RecentBuild[] {
  if (typeof window === "undefined") return recentFallback;

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      window.localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(recentFallback),
      );
      return recentFallback;
    }

    const parsed = JSON.parse(raw) as RecentBuild[];
    return parsed.length ? parsed.slice(0, 3) : recentFallback;
  } catch {
    return recentFallback;
  }
}
