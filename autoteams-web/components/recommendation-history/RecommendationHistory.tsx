"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  listRecommendationsForWorkspace,
  type RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";
import {
  loadActiveWorkspaceId,
  loadWorkspaces,
} from "@/lib/workspaces";
import styles from "./RecommendationHistory.module.css";

export function RecommendationHistory() {
  const [
    records,
    setRecords,
  ] = useState<
    RecommendationHistoryRecord[]
  >([]);

  const [
    workspaceId,
    setWorkspaceId,
  ] = useState("");

  const [
    workspaceName,
    setWorkspaceName,
  ] = useState("");

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * v5.0.1 hydration fix:
   *
   * Do not read localStorage-backed workspace helpers during SSR render.
   * Server and browser now render the same initial state.
   */
  useEffect(() => {
    const activeId =
      loadActiveWorkspaceId();

    const workspace =
      loadWorkspaces().find(
        (item) =>
          item.id === activeId,
      );

    setWorkspaceId(
      activeId || "",
    );

    setWorkspaceName(
      workspace?.name ||
        activeId ||
        "",
    );

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    void refresh(
      workspaceId,
    );
  }, [
    mounted,
    workspaceId,
  ]);

  async function refresh(
    targetWorkspaceId =
      workspaceId,
  ) {
    setLoading(true);
    setError("");

    try {
      if (!targetWorkspaceId) {
        setRecords([]);
        return;
      }

      setRecords(
        await listRecommendationsForWorkspace(
          targetWorkspaceId,
        ),
      );
    } catch (error) {
      setRecords([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load recommendation history.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">
            Cloud history
          </span>
          <h2>
            Recommendation history.
          </h2>
          <p>
            AI and deterministic team recommendations
            are retained for audit, comparison and
            future team intelligence.
          </p>
        </div>

        <button
          className="button secondary"
          disabled={
            loading ||
            !mounted
          }
          onClick={() =>
            void refresh()
          }
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className={styles.workspace}>
        <small>
          Active workspace
        </small>
        <strong>
          {!mounted
            ? "Loading workspace…"
            : workspaceName ||
              "Not selected"}
        </strong>
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {!mounted || loading ? (
        <div className={styles.empty}>
          Loading recommendation history…
        </div>
      ) : records.length === 0 ? (
        <div className={styles.empty}>
          No cloud recommendations have been saved for
          this workspace yet. Generate a new team
          recommendation to create the first record.
        </div>
      ) : (
        <div className={styles.list}>
          {records.map(
            (record) => (
              <RecommendationCard
                key={record.id}
                record={record}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function RecommendationCard({
  record,
}: {
  record: RecommendationHistoryRecord;
}) {
  return (
    <article className={styles.recommendation}>
      <header>
        <div>
          <span
            className={
              record.source ===
              "gemini"
                ? styles.gemini
                : styles.deterministic
            }
          >
            {record.source ===
            "gemini"
              ? "Gemini"
              : "Deterministic"}
          </span>

          <h3>
            {record.requirement.name ||
              "Team Recommendation"}
          </h3>

          <small>
            {new Date(
              record.createdAtIso,
            ).toLocaleString()}
          </small>
        </div>

        <strong>
          {record.confidence}%
        </strong>
      </header>

      <p className={styles.summary}>
        {record.summary}
      </p>

      <div className={styles.metrics}>
        <span>
          <small>Team size</small>
          <strong>
            {
              record.recommendedPersonIds
                .length
            }
          </strong>
        </span>

        <span>
          <small>Candidates</small>
          <strong>
            {record.candidates.length}
          </strong>
        </span>

        <span>
          <small>Model</small>
          <strong>
            {record.model || "—"}
          </strong>
        </span>

        <span>
          <small>Tokens</small>
          <strong>
            {record.telemetry?.usage
              ?.totalTokens ?? "—"}
          </strong>
        </span>
      </div>

      <details>
        <summary>
          View recommendation evidence
        </summary>

        <div className={styles.evidence}>
          <Evidence
            title="Strengths"
            values={
              record.teamStrengths
            }
          />
          <Evidence
            title="Skill gaps"
            values={
              record.skillGaps
            }
          />
          <Evidence
            title="Risks"
            values={record.risks}
          />
        </div>
      </details>

      <footer>
        <code>
          {record.id}
        </code>
      </footer>
    </article>
  );
}

function Evidence({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <div>
      <strong>{title}</strong>
      {values.length > 0 ? (
        values.map(
          (value) => (
            <span key={value}>
              {value}
            </span>
          ),
        )
      ) : (
        <span>None identified.</span>
      )}
    </div>
  );
}
