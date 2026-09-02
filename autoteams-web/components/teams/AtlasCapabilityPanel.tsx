"use client";

import type { AtlasCapabilityAnalysis } from "./atlas-capability-engine";
import styles from "./AtlasCapabilityPanel.module.css";

export function AtlasCapabilityPanel({
  analysis,
  loading,
  onAnalyse,
}: {
  analysis: AtlasCapabilityAnalysis | null;
  loading: boolean;
  onAnalyse: () => void;
}) {
  if (!analysis) {
    return (
      <section className={styles.start}>
        <div>
          <span>Atlas AI capability analysis</span>
          <strong>
            What capability does this team need next?
          </strong>
          <p>
            Gemini interprets the team objective and derives the capabilities
            required to achieve it. TeamScience then measures current coverage
            and turns the AI output into explainable gap scores.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onAnalyse}
        >
          {loading
            ? "Asking Gemini..."
            : "Analyse with Gemini"}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header>
        <div>
          <span>
            Atlas capability engine ·{" "}
            {analysis.source === "gemini"
              ? `Gemini AI${analysis.model ? ` · ${analysis.model}` : ""}`
              : "fallback evidence"}
          </span>
          <h3>
            Strongest gap: {analysis.strongestGap}
          </h3>
          <p>{analysis.summary}</p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onAnalyse}
        >
          {loading
            ? "Asking Gemini..."
            : "Refresh with Gemini"}
        </button>
      </header>

      <div className={styles.capabilities}>
        {analysis.capabilities.map(capability => (
          <article key={capability.name}>
            <div className={styles.title}>
              <strong>{capability.name}</strong>
              <em>
                Gap {capability.gap}
              </em>
            </div>

            <div className={styles.metrics}>
              <div>
                <span>AI importance</span>
                <strong>{capability.importance}%</strong>
              </div>
              <div>
                <span>Team coverage</span>
                <strong>{capability.coverage}%</strong>
              </div>
            </div>

            <div className={styles.bar}>
              <i
                style={{
                  width: `${capability.coverage}%`,
                }}
              />
            </div>

            <p>{capability.reason}</p>
          </article>
        ))}
      </div>

      <footer>
        <strong>How Atlas reached this:</strong>{" "}
        Gemini derives the capabilities and their importance from the objective.
        TeamScience calculates coverage and gap scores from the current team
        evidence. Atlas uses those gaps to rank candidates; a person still makes
        the recruitment decision.
      </footer>
    </section>
  );
}
