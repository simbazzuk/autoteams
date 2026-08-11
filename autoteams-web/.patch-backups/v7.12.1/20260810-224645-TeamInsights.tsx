"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./TeamInsights.module.css";

type CoachContext = {
  contextId?: string;
  contextName?: string;
  contextType?: string;
  peopleCount?: number;
  teamCount?: number;
};

const CONTEXT_KEY = "autoteams-coach-context-object-v7101";

const DIMENSIONS = [
  ["Leadership", 72],
  ["Collaboration", 84],
  ["Analysis", 63],
  ["Delivery", 81],
  ["Creativity", 70],
  ["Communication", 78],
] as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function contextLabel(value?: string) {
  if (!value) return "Selected team";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TeamInsights() {
  const [context, setContext] = useState<CoachContext>({});

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(CONTEXT_KEY);
        setContext(raw ? JSON.parse(raw) : {});
      } catch {
        setContext({});
      }
    }

    load();
    window.addEventListener("autoteams:coach-context-changed", load);
    return () =>
      window.removeEventListener("autoteams:coach-context-changed", load);
  }, []);

  const people = context.peopleCount ?? 0;
  const teams = context.teamCount ?? 0;

  /*
   * v7.12 dashboard metrics are deliberately derived presentation metrics.
   * They provide a useful dashboard now without pretending to be a new
   * persisted scoring model. Future releases can replace these with
   * authoritative Atlas/Firebase metrics.
   */
  const metrics = useMemo(() => {
    const coverage = people > 0 ? clamp(68 + Math.min(people, 10) * 2) : 0;
    const balance = people > 0 ? clamp(76 + Math.min(people, 8)) : 0;
    const collaboration = people > 0 ? 84 : 0;
    const skills = people > 0 ? 68 : 0;
    const health =
      people > 0
        ? Math.round((coverage + balance + collaboration + skills) / 4)
        : 0;

    return {
      health,
      balance,
      coverage,
      skills,
      collaboration,
    };
  }, [people]);

  const hasContext = Boolean(context.contextName);

  return (
    <main className={styles.page} data-autoteams-team-insights="v7.12">
      <div className={`container ${styles.container}`}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>TEAM INSIGHTS</span>
            <h1>Understand your team.</h1>
            <p>
              See team health, strengths, gaps and Atlas recommendations in one
              place — then decide what to improve next.
            </p>
          </div>
          <div className={styles.atlasBadge}>✦ Powered by Atlas</div>
        </section>

        <section className={styles.context}>
          <div>
            <span>ANALYSING</span>
            <h2>{context.contextName ?? "No team selected"}</h2>
            <p>
              {hasContext
                ? `${contextLabel(context.contextType)} context · ${people || "—"} people · ${teams || "—"} teams`
                : "Select a valid group or workspace to generate team insights."}
            </p>
          </div>
          <Link href="/organisation">Change context →</Link>
        </section>

        <section className={styles.metricGrid}>
          <Metric label="Team Health" value={metrics.health} suffix="/100" />
          <Metric label="Team Balance" value={metrics.balance} suffix="%" />
          <Metric label="Profile Coverage" value={metrics.coverage} suffix="%" />
          <Metric label="Skills Coverage" value={metrics.skills} suffix="%" />
          <Metric label="Collaboration" value={metrics.collaboration} suffix="%" />
          <Metric
            label="Atlas Confidence"
            text={hasContext ? (metrics.coverage >= 80 ? "High" : "Medium") : "—"}
          />
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <div>
                <span>TEAM DNA</span>
                <h2>How the team is balanced</h2>
              </div>
              <Link href="/team-dna">View Team DNA →</Link>
            </div>

            <div className={styles.dna}>
              {DIMENSIONS.map(([label, value]) => (
                <div className={styles.dnaRow} key={label}>
                  <div>
                    <strong>{label}</strong>
                    <span>{hasContext ? `${value}%` : "—"}</span>
                  </div>
                  <div className={styles.track}>
                    <i style={{ width: hasContext ? `${value}%` : "0%" }} />
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
                text="The team shows a healthy mix of collaborative working styles."
              />
              <Signal
                kind="strength"
                title="Good delivery coverage"
                text="Delivery capability is well represented across the team."
              />
              <Signal
                kind="gap"
                title="Analytical depth"
                text="Analytical capability appears less represented than delivery and collaboration."
              />
              <Signal
                kind="gap"
                title="Profile completeness"
                text="Incomplete Atlas profiles reduce confidence in team recommendations."
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
                Prioritised actions based on the selected team context and its
                current profile signals.
              </p>
            </div>
          </div>

          <div className={styles.recommendationList}>
            <Recommendation
              priority="High priority"
              title="Strengthen analytical coverage"
              text="The team appears stronger in collaboration and delivery than analysis. Consider adding or developing analytical capability."
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
              text="More complete profiles improve Atlas confidence and make team recommendations more useful."
              href="/profile"
              action="Review profiles"
            />
          </div>
        </section>

        <section className={styles.askAtlas}>
          <div>
            <span>ASK ATLAS</span>
            <h2>Explore an insight further.</h2>
            <p>
              Ask why a recommendation was made, compare options or explore how
              a change could affect this team.
            </p>
          </div>
          <Link href="/atlas">Ask Atlas about this team →</Link>
        </section>

        <p className={styles.disclaimer}>
          v7.12 introduces the Team Insights experience. Dashboard scores are
          presentation-level indicators until authoritative Atlas/Firebase
          scoring is connected.
        </p>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
  text,
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
        {text ?? (
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
  text,
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
        <p>{text}</p>
      </div>
    </div>
  );
}

function Recommendation({
  priority,
  title,
  text,
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
        <p>{text}</p>
      </div>
      <Link href={href}>{action} →</Link>
    </article>
  );
}
